import apiClient from "../config/apiclient";
import loggers from "../config/logger";
import { prisma } from "../config/primsaConfig";
import pLimit from "p-limit";

const THIRTY_MIN = 30 * 60 * 1000;


const tenantLimitConcurrency = pLimit(2);
const appLimitConcurrency = pLimit(5);
const deviceLimitConcurrency = pLimit(10);

export const activeInactiveJobs = async () => {
  loggers.info("🚀 Job started at:", new Date());

  const tenantLimit = 10;
  let tenantOffset = 0;

  try {
    while (true) {
      const tenantRes = await apiClient.get("/api/tenants", {
        params: { limit: tenantLimit, offset: tenantOffset },
      });

      const tenants = tenantRes?.data?.result;
      if (!tenants || tenants.length === 0) break;

      // 🔥 Parallel tenants (limited)
      await Promise.all(
        tenants.map((tenantItem: any) =>
          tenantLimitConcurrency(async () => {
            console.log(`🏢 Processing Tenant: ${tenantItem.id}`);

            try {
              await processApplications(tenantItem);
            } catch (err) {
              console.error(`❌ Tenant failed: ${tenantItem.id}`, err);
            }
          })
        )
      );

      tenantOffset += tenantLimit;
    }

    console.log("✅ Job completed at:", new Date());
  } catch (err) {
    console.error("🔥 Job crashed:", err);
  }
};

const processApplications = async (tenantItem: any) => {
  let appOffset = 0;
  const appLimit = 100;

  while (true) {
    const appRes = await apiClient.get("/api/applications", {
      params: {
        tenantId: tenantItem.id,
        limit: appLimit,
        offset: appOffset,
      },
    });

    const applications = appRes?.data?.result;
    if (!applications || applications.length === 0) break;

    // 🔥 Parallel apps (limited)
    await Promise.all(
      applications.map((app: any) =>
        appLimitConcurrency(async () => {
          console.log(`📦 App: ${app.id} (Tenant: ${tenantItem.id})`);

          try {
            await processDevices(app, tenantItem.id);
          } catch (err) {
            console.error(`❌ App failed: ${app.id}`, err);
          }
        })
      )
    );

    appOffset += appLimit;
  }
};

const processDevices = async (app: any, tenantId: string) => {
  let deviceOffset = 0;
  const deviceLimit = 100;

  let activeCount = 0;
  let inactiveCount = 0;

  while (true) {
    const deviceRes = await apiClient.get("/api/devices", {
      params: {
        applicationId: app.id,
        limit: deviceLimit,
        offset: deviceOffset,
      },
    });

    const devices = deviceRes?.data?.result;
    if (!devices || devices.length === 0) break;

    // 🔥 Parallel device processing (optional but safe)
    await Promise.all(
      devices.map((device: any) =>
        deviceLimitConcurrency(async () => {
          try {
            if (
              device.lastSeenAt &&
              new Date(device.lastSeenAt) >
                new Date(Date.now() - THIRTY_MIN)
            ) {
              activeCount++;
            } else {
              inactiveCount++;
            }
          } catch (err) {
            console.error(`⚠️ Device error: ${device.devEui}`, err);
          }
        })
      )
    );

    deviceOffset += deviceLimit;
  }

  loggers.info(
    `📊 App Summary → ${app.id} | Active: ${activeCount}, Inactive: ${inactiveCount}`
  );

  try {
    await prisma.activeDeviceCount.findFirst({
      where: { applicationId: app.id },
    }).then((existing) => {
      if (existing) {
        return prisma.activeDeviceCount.update({
            where: { id: existing.id },
            data: {
              activeCount,
              inactiveCount,
              updatedAt: new Date(),
            },
        });
      }
        return prisma.activeDeviceCount.create({
            data: {
              applicationId: app.id,
              tenantId,
                activeCount,
                inactiveCount,
                updatedAt: new Date(),
            },
        });

    });
  } catch (err) {
    console.error(`💾 DB Error (App: ${app.id})`, err);
  }
};
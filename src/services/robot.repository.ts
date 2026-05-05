import { prisma } from "../config/primsaConfig";
import { calculatePanelsCleaned } from "../utils/Pc.Math";


class RobotRepository {

    // 🔹 Strict number parsing
    static parseNumber(value: any, field: string): number {
        const parsed = Number(value);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number for ${field}`);
        }
        return parsed;
    }

    static extractDeviceInfo(data: any) {
        const deviceInfo = data.deviceInfo || {};

        const { devEui, applicationId, deviceName, tenantId } = deviceInfo;

        if (!devEui || !applicationId || !deviceName || !tenantId) {
            throw new Error("Missing required device fields");
        }

        return {
            deviceId: devEui,
            deviceName,
            applicationId,
            tenantId,
        };
    }

    // 🔹 Core ingestion logic
    static async createNewData(
        data: any,
        block: string,
        previousOdometer?: number
    ) {
        try {
            const device = this.extractDeviceInfo(data);

            const odometer = this.parseNumber(data.object?.CH10, "odometer");
            const autoCount = this.parseNumber(data.object?.CH15, "autoCount");
            const manualCount = this.parseNumber(data.object?.CH16, "manualCount");
            const batteryVoltage = this.parseNumber(data.object?.CH5, "batteryVoltage");
            const batteryDischarge = this.parseNumber(data.object?.CH6, "batteryDischarge");

            let panelsCleaned: number | null = null;

            // 🔹 Distance calculation
            if (previousOdometer !== undefined) {
                const distance = odometer - previousOdometer;

                if (distance < 0) {
                    throw new Error("Negative distance detected without reset handling");
                }

                panelsCleaned = await calculatePanelsCleaned(
                    device.applicationId,
                    distance
                );
            } else {
                panelsCleaned = await calculatePanelsCleaned(
                    device.applicationId,
                    odometer
                );
            }

            // 🔒 Critical guard: skip invalid processing
            if (panelsCleaned === null) {
                console.warn(
                    `[SKIP] Panels not calculated for app=${device.applicationId} (config missing or invalid)`
                );
                return null;
            }

            // ✅ Safe DB write
            return await prisma.robotData.create({
                data: {
                    ...device,
                    panelsCleaned,
                    rawOdometerValue: odometer,
                    batteryVoltage,
                    batteryDischargeCycle: batteryDischarge,
                },
            });

        } catch (error: any) {
            throw new Error(`Failed to create robot data: ${error.message}`);
        }
    }

   
    static async handleOdometerReset(
        data: any,
        block: string,
        previousOdometer: number
    ) {
        try {
            const odometer = this.parseNumber(data.object?.CH10, "odometer");

            const drop = previousOdometer - odometer;

           
            if (drop > 0 && drop < 10) {
                console.warn("[IGNORE] Minor odometer fluctuation detected");
                return null;
            }

            return await this.createNewData(data, block);

        } catch (error: any) {
            throw new Error(`Odometer reset handling failed: ${error.message}`);
        }
    }


    static async handleOdometerNormal(
        data: any,
        block: string,
        previousOdometer: number
    ) {
        try {
            return await this.createNewData(data, block, previousOdometer);
        } catch (error: any) {
            throw new Error(`Odometer processing failed: ${error.message}`);
        }
    }
}

export default RobotRepository;
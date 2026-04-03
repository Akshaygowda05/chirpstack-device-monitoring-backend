import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";

export async function syncChirpstackData() {
    try {
        const limit = 100;
        let offset = 0;

        const allTenants: any[] = [];

    
        while (true) {
            const response = await apiClient.get(
                `/api/tenants?limit=${limit}&offset=${offset}`
            );

            const tenants = response.data?.result || [];

            allTenants.push(...tenants);

            if (tenants.length < limit) break;

            offset += limit;
        }

        console.log(`Fetched ${allTenants.length} tenants`);

       
        await Promise.all(
            allTenants.map((tenant) =>
                prisma.chirpstackTenant.upsert({
                    where: { chirpstackId: tenant.id },
                    update: {
                        name: tenant.name,
                        description: tenant.description,
                        lastSyncedAt: new Date()
                    },
                    create: {
                        chirpstackId: tenant.id,
                        name: tenant.name,
                        description: tenant.description,
                        lastSyncedAt: new Date()
                    }
                })
            )
        );

        
        const dbTenants = await prisma.chirpstackTenant.findMany({
            where: {
                chirpstackId: {
                    in: allTenants.map(t => t.id)
                }
            }
        });

       
        const tenantMap = new Map(
            dbTenants.map(t => [t.chirpstackId, t.id])  
        );

      
        for (const tenant of allTenants) {
            const dbTenantId = tenantMap.get(tenant.id);

            if (!dbTenantId) continue;

            let appOffset = 0;

            while (true) {
                
                const appResponse = await apiClient.get(
                    `/api/applications?tenantId=${tenant.id}&limit=${limit}&offset=${appOffset}`
                );

                const applications = appResponse.data?.result || [];

                console.log(
                    `Tenant ${tenant.name} → fetched ${applications.length} apps`
                );

                
                await Promise.all(
                    applications.map((app: any) =>
                        prisma.chirpstackApplication.upsert({
                            where: { chirpstackId: app.id },
                            update: {
                                name: app.name,
                                description: app.description,
                                tenantId: dbTenantId,
                                updatedAt: new Date()
                            },
                            create: {
                                chirpstackId: app.id,
                                name: app.name,
                                description: app.description,
                                tenantId: dbTenantId
                            }
                        })
                    )
                );

                if (applications.length < limit) break;

                appOffset += limit;
            }
        }

        console.log("✅ Sync completed successfully");

    } catch (error) {
        console.error("❌ Sync failed:", error);
        throw error;
    }
}
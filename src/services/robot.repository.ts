import { prisma } from "../config/primsaConfig";
import { calculatePannelsCleand } from "../utils/Pc.Math";

class RobotRepository {
    
    static parseNumber(value: any, field: string): number {
        const parsed = Number(value);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number for ${field}`);
        }
        return parsed;
    }

    static extractDeviceInfo(data: any) {
       // console.log("i am in extract device info and this is the data i got ",data);
        const deviceInfo = data.deviceInfo || {};

         const { devEui, applicationId, deviceName, tenantId } = deviceInfo;
      

        if (!devEui || !applicationId || !deviceName || !tenantId) {
            throw new Error("Missing required device fields");
        }

        //console.log("Extracted device info:", { devEui, applicationId, deviceName, tenantId });

        return {
            deviceId: devEui,
            deviceName: deviceName,
            applicationId,
            tenantId,
        };
    }

    static async createNewData(
        data: any,
        block: string,
        previousOdometer?: number
    ) {
        try {
            const device = this.extractDeviceInfo(data);
          //  console.log("Device info extracted successfully:", device);

            const odometer = this.parseNumber(data.object?.CH10, "odometer");
            const autoCount = this.parseNumber(data.object?.CH15, "autoCount");
            const manualCount = this.parseNumber(data.object?.CH16, "manualCount");
            const batteryVoltage = this.parseNumber(data.object?.CH5, "batteryVoltage");
            const batteryDischarge = this.parseNumber(data.object?.CH6, "batteryDischarge");

            let panelsCleaned = 0;

            if (previousOdometer !== undefined) {
                const distance = odometer - previousOdometer;

                if (distance < 0) {
                    throw new Error("Negative distance detected without reset handling");
                }

                panelsCleaned = await calculatePannelsCleand(
                    device.applicationId,
                    distance
                );
            } else {
                panelsCleaned = await calculatePannelsCleand(
                    device.applicationId,
                    odometer
                );
            }

            return await prisma.robotData.create({
                data: {
                    ...device,
                    panelsCleaned,
                    rawOdometerValue: odometer,
                    autoCount,
                    manualCount,
                    batteryVoltage,
                    batteryDischargeCycle: batteryDischarge,
                    block,
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
                return;
            }
            return await this.createNewData(data, block);

        } catch (error: any) {
            throw new Error(`Odometer reset handling failed: ${error.message}`);
        }
    }


    // this is for if odometer resest happens
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
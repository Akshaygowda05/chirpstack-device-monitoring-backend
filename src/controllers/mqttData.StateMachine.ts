import ValidateOdometerValue from "../utils/odomter.value";
import { prisma } from "../config/primsaConfig";
import RobotRepository from "../services/robot.repository";
import loggers from "../config/logger";

export async function processMqttData(topic: string, payload: any) {
    try {
        const devEui = payload?.deviceInfo?.devEui;
       // console.log(" ☠️Processing MQTT data for device:", devEui);
        const currentOdometer = Number(payload?.object?.CH10);
      //  console.log("👾Current odometer value:", currentOdometer);
        let block = payload?.tags?.loc  || "unknown";

        if (!devEui) {
            throw new Error("devEui is missing in payload");
        }

        if (isNaN(currentOdometer)) {
            throw new Error("Invalid odometer value");
        }

        const previousData = await prisma.robotData.findFirst({
            where: { deviceId: devEui },
            orderBy: { createdAt: "desc" },
            select: {
                rawOdometerValue: true,
            },
        });

        const previousOdometerValue =
            previousData?.rawOdometerValue !== undefined
                ? Number(previousData.rawOdometerValue)
                : undefined;

  // console.log("📊 idu ale robot battery test madana:", previousOdometerValue);

       

        const validationResult =
            ValidateOdometerValue.processOdometerValue(
                previousOdometerValue,
                currentOdometer
            );

        switch (validationResult.type) {
            case "IGNORE":
               loggers.info(`Ignored duplicate/invalid data for ${devEui}`);
                return;

            case "FIRST_ENTRY":
              //  loggers.info(`First entry for device ${devEui}`);
                return await RobotRepository.createNewData(payload, block);

            case "RESET":
                loggers.warn(`Odometer reset detected for ${devEui}`);
                return await RobotRepository.handleOdometerReset(
                    payload,
                    block,
                    previousOdometerValue!
                );

            case "VALID":
                return await RobotRepository.handleOdometerNormal(
                    payload,
                    block,
                    previousOdometerValue!
                );

            case "ANOMALY":
                loggers.warn(
                    `Odometer anomaly for ${devEui}: ${validationResult.reason}`
                );
                return;

            default:
                throw new Error("Unknown validation result");
        }

    } catch (error: any) {
        loggers.error("MQTT processing failed", {
            error: error.message,
            stack: error.stack,
            topic,
            payload,
        });

        throw error; 
    }
}
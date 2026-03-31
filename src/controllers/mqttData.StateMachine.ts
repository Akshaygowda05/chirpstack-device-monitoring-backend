import ValidateOdometerValue from "../rules/odomter.value";
import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";
import RobotRepository from "../services/robot.repository";
import loggers from "../config/logger";

export async function processMqttData(topic: string, payload: any) {
    try {
        const devEui = payload?.deviceInfo?.devEui;
        const currentOdometer = Number(payload?.object?.CH10); // ✅ consistent path

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
                block: true,
            },
        });

        const previousOdometerValue =
            previousData?.rawOdometerValue !== undefined
                ? Number(previousData.rawOdometerValue)
                : undefined;

        let block = previousData?.block;

        
        if (!block) {
            try {
                const res = await apiClient.get(
                    `api/devices/${devEui}/blocks?limit=1`
                );
                block = res.data?.device?.description || null;
            } catch (err) {
                loggers.error(`Failed to fetch block for ${devEui}`, err);
                block = null;
            }
        }

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
                loggers.info(`First entry for device ${devEui}`);
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
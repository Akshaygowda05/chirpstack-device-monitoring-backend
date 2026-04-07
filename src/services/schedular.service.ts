import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import AppError from "../utils/AppError";


type CreateSchedulerDTO = {
  time: string;
  data: any;
  groups: { id: string; name: string }[];
};

class SchedulerService {
  
  async createScheduler(applicationId: string, data: CreateSchedulerDTO) {

    if (!data.groups || !Array.isArray(data.groups)) {
      throw new AppError("Invalid groups data", StatusCodes.BAD_REQUEST);
    }

    const groupName = data.groups.map(g => g.name);
    const groupId = data.groups.map(g => g.id);

    return prisma.schedularData.create({
      data: {
        applicationId,
        time: data.time,
        data: data.data,
        groupName,
        groupId,
      },
    });
  }

  async getScheduler(applicationId: string) {
    const result = await prisma.chirpstackApplication.findUnique({
      where: { chirpstackId: applicationId },
      include: { SchedularData: true },
    });

    if (!result) {
      throw new AppError(
        "No scheduling data found",
        StatusCodes.NOT_FOUND
      );
    }

    return result.SchedularData;
  }

  async deleteScheduler(id: number) {
    const existing = await prisma.schedularData.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("Scheduler not found", StatusCodes.NOT_FOUND);
    }

    return prisma.schedularData.delete({
      where: { id },
    });
  }
}

export default SchedulerService;
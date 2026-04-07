// services/jobScheduler.service.ts
import { schedulerQueue } from "../queues/scheduler.queue";
import { prisma } from "../config/primsaConfig";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";

class JobSchedulerService {

  async syncJob(id: string) {
    const data = await prisma.schedularData.findUnique({
      where: { id: Number(id) }
    });

    if (!data) {
      throw new AppError("Scheduler not found", StatusCodes.NOT_FOUND);
    }

    await schedulerQueue.upsertJobScheduler(
      id,
      {
        pattern: data.time, // cron
      },
      {
        name: "device-scheduler",
        data: {
          schedulerId: data.id,
          payload: data.data,
          groupIds: data.groupId
        },
        opts: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          }
        }
      }
    );
  }

  async removeJob(id: string) {
    await schedulerQueue.removeJobScheduler(id);
  }
}

export default new JobSchedulerService();
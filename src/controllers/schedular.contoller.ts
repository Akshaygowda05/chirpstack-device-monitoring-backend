
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import SchedulerService from "../services/schedular.service";

export class SchedulerController {
  constructor(
    private schedulerService: SchedulerService,
    private jobSchedulerService: any 
  ) {}

  async createScheduler(req: Request, res: Response) {
    const applicationId = req.applicationId;
    const data = req.body;

    if (!applicationId) {
      throw new AppError("Session expired", StatusCodes.BAD_REQUEST);
    }

    if (!data.time || !data.groups) {
      throw new AppError("Invalid request body", StatusCodes.BAD_REQUEST);
    }

    const result = await this.schedulerService.createScheduler(applicationId, data);

    await this.jobSchedulerService.syncJob(String(result.id));

    res.status(StatusCodes.CREATED).json({
      message: "Scheduler created successfully",
      data: result,
    });
  }

  async deleteScheduler(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid scheduler ID", StatusCodes.BAD_REQUEST);
    }

    await this.schedulerService.deleteScheduler(id);

   
    await this.jobSchedulerService.removeJob(String(id));

    res.status(StatusCodes.OK).json({
      message: "Scheduler deleted successfully",
    });
  }
}
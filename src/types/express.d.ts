import { Role } from "../generated/prisma/enums";

declare module "express"{
    interface Request{
        userId?:string,
        role?:Role,
        applicationId?:string
    }
}

export {}
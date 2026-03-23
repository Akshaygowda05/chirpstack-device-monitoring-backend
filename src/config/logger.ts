import { createLogger, format,  transports } from "winston";

const logfromate = format.combine(
    format.timestamp({format : "YYYY-MM-DD  HH:MM:SS"}),
    format.errors({stack:true}),
    format.splat(),
    format.json()
)


const loggers = createLogger({
    level:process.env.NODE_ENV === 'production'?"info":"debug",
    format: logfromate,
    defaultMeta: {service: "user-management-service"},
    transports:[
    new transports.Console({ format: format.combine(format.colorize(), format.simple()) }), 
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    ]
        
})

export default loggers;
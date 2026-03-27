class AppError extends Error{
    statusCode: number;
    isOperational: boolean;


    constructor(message:string,statusCode:number,isOperational:boolean = true){
        super(message);
        this.statusCode = statusCode;
       this.isOperational = isOperational;
    }
}

export default AppError;
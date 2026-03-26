export function globalErrorHandler(err:any){
const errorData = {
    message:err.message,
    status:err.statusCode || 500,
    isOperational:err.isOperational || false // this is for the critical thing 
}


}


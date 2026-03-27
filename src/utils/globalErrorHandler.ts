export function globalErrorHandler(err:any){

    let errorData ;
    if(err instanceof Error){
 errorData = {
    message:err.message,
    status:(err as any).statusCode ,
    isOperational:(err as any).isOperational || false // this is for the critical thing 
}
    } else{
        errorData = {
            message:'An unexpected error occurred',
            status:500,
            isOperational:false
        }
    }


return errorData;


}


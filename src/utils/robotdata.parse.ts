import loggers from "../config/logger";

// here i need to check wheather data is valid or no t


   export const validateZeroOrNot = async(data:any) =>{
        try {

            const objectValue =data?.object;

             if (!data || typeof data !== 'object') {
    throw new Error('Invalid input: expected object');
  }

            const isAllValueisZero = Object.entries(objectValue).every(([_,value])=>value == 0)

            if(isAllValueisZero){
                return true;
            }else{
                return false;
            }
            
        } catch (error) {

            loggers.error('Error validating data:', error);
            return false;
            
        }
    }





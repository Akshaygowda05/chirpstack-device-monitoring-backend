import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '../generated/prisma/enums';
import { prisma } from '../config/primsaConfig';
import envconfig from '../config/envConfig';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import apiClient from '../config/apiclient';
import { syncChirpstackData } from '../seed/applicationAndTenantId.repo';




interface userData{
    name: string;
    email: string;
    site: string;
    password: string;
    role: Role;
    applicationId: number | undefined
    
}




export class UserService{

      static async CreateUser(data: userData): Promise<userData> {
    try {

        console.log('Creating user with data:', data);


        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) throw new AppError('User already exists', StatusCodes.BAD_REQUEST);

       
        const appId = data.role === Role.USER 
            ? await (async () => {
              
                const dbApp = await prisma.chirpstackApplication.findUnique({
                    where: { chirpstackId: String(data.applicationId) },
                    select: { id: true,chirpstackId: true }
                });

                if (dbApp) return dbApp.chirpstackId;

             
                const result = await apiClient.get(`/api/applications/${data.applicationId}`);
                if (!result?.data?.application) 
                    throw new AppError('Invalid application ID', StatusCodes.BAD_REQUEST);

                 await syncChirpstackData();
                return result.data.application.id;
            })()
            : null;

        const hashPassword = await bycrypt.hash(data.password, 10);

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                siteName: data.site,
                password: hashPassword,
                role: data.role,
                applicationId: appId
            }
        });

        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}  
 
    static async deletUser(id:number):Promise<void>{
        try {
        const user =   await prisma.user.findUnique({
            where:{
                id: id
            }
           })

           if (!user) {
            throw new Error('User not found');

              }
            await prisma.user.update({
                where:{
                    id: id
                },
                data:{
                    isActive:false
                }
            })

            
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }


    static async userLogin(email:string,password:string){
        try {
            const user = await prisma.user.findUnique({
                where:{
                    email: email
                },select:{
                    password: true,
                    id: true,
                    role: true,
                    name: true,
                    siteName: true,
                    applicationId: true,
                    isActive: true
                }
            })

        

            if(!user || !user.isActive){
                throw new Error('User not found or inactive');
            }

           const isPasswordValid = await bycrypt.compare(password,user.password);

           if(!isPasswordValid){
            throw new Error('Invalid password');
           }

           const toke  = jwt.sign({
            userId: user.id,
            role: user.role,
            applicationId: user.applicationId,
    
           }, envconfig.getTokenSecret(), { expiresIn: '2h' });


           return {
            token: toke,
            name: user.name,
            role: user.role,
            siteName: user.siteName,
           };
        } catch (error) {
            console.error('Error during user login:', error);
            return false;
        }
    }


    
    static async  updateUser(userid:number,data: any){
        try {
            const { name, role, email, isActive } = data;
         await prisma.user.update({
            where:{
                id: userid
            },
           data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),

           }
         })   
        } catch (error) {
            
        }

    }

    static async updateuserPassword(userid:number,newPassword:string):Promise<void>{
        try {
            const hashpassword = await bycrypt.hash(newPassword,10);

            await prisma.user.update({
                where:{
                    id: userid
                },
                data:{
                    password: hashpassword
                }
            })

        } catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    }


    static async getAllUsers(){
        try {
            const users = await prisma.user.findMany({
                where:{
                     isActive: true
                },
                include:{
                    application: {
                        select:{
                            chirpstackId: true,
                            name: true
                        }
                    }
                }
            });
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
}








    export const userService = UserService;
import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '../generated/prisma/enums';
import { prisma } from '../config/primsaConfig';
import envconfig from '../config/envConfig';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import apiClient from '../config/apiclient';
import { syncChirpstackData } from '../seed/applicationAndTenantId.repo';
import { hash } from 'crypto';




interface userData{
    name: string;
    email: string;
    siteName: string;
    password: string;
    role: Role;
    applicationId: number | undefined
    
}




export class UserService{

  static async CreateUser(data: userData) {
  try {
 
    if (!data.email || !data.password) {
      throw new AppError('Missing required fields', StatusCodes.BAD_REQUEST);
    }


    const email = data.email.trim().toLowerCase();
    const applicationIdInput = data.applicationId
      ? String(data.applicationId).trim()
      : null;

    
    console.log('Creating user:', { email, role: data.role });

 
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });


    console.log('Existing user check:', existingUser ? 'User exists' : 'No user found');

    
    let appId: string | null = null;

    if (data.role === Role.USER) {
      if (!applicationIdInput) {
        throw new AppError('Application ID is required', StatusCodes.BAD_REQUEST);
      }

     
      const dbApp = await prisma.chirpstackApplication.findUnique({
        where: { chirpstackId: applicationIdInput },
        select: { chirpstackId: true },
      });


      console.log('Database application check:', dbApp ? 'Application found in DB' : 'No application in DB');
      if (dbApp) {
        appId = dbApp.chirpstackId;
      } else {
        
        const result = await apiClient.get(
          `/api/applications/${applicationIdInput}`
        );

        console.log('Chirpstack API response:', result);
        
        if (!result?.data?.application) {
          throw new AppError('Invalid application ID', StatusCodes.BAD_REQUEST);
        }

        await syncChirpstackData();

        appId = String(result.data.application.id).trim();
      }
    }

    const hashedPassword = await bycrypt.hash(data.password, 10);

  
    if (existingUser) {
      if (existingUser.isActive) {
        throw new AppError('User already exists', StatusCodes.BAD_REQUEST);
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: data.name?.trim(),
          password: hashedPassword,
          role: data.role,
          isActive: true,
          applicationId: appId,
          siteName: data.siteName?.trim(),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        applicationId: updatedUser.applicationId,
      };
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name?.trim(),
        email,
        siteName: data.siteName?.trim(),
        password: hashedPassword,
        role: data.role,
        applicationId: appId,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      applicationId: newUser.applicationId,
    };

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


    static async getAllUsers(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc', // newest first
        },
        include: {
          application: {
            select: {
              chirpstackId: true,
              name: true,
            },
          },
        },
      }),

      prisma.user.count(), 
    ]);

    return {
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        application: user.application,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
}








    export const userService = UserService;
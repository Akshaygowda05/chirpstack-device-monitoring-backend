import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '../generated/prisma/enums';
import { prisma } from '../config/primsaConfig';




interface userData{
    name: string;
    email: string;
    password: string;
    role: Role;
    applicationId: number | undefined
    
}




export class UserService{

    static async CreateUser(data:userData):Promise<userData>{
        try {

            const existingUser = await prisma.user.findUnique({
                where:{
                    email: data.email
                }
            })

            if(existingUser){
                throw new Error('User with this email already exists');
            }

            const hashpassword = await bycrypt.hash(data.password,10);

            await prisma.user.create({
                data:{
                    name: data.name,
                    email: data.email,
                    password: hashpassword,
                    role: data.role,
                    ...(data.applicationId && { applicationId: data.applicationId })
                    
                }
            })
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
            applicationId: user.applicationId
           }, process.env.JWT_SECRET as string, { expiresIn: '1h' });


           return {
            token: toke,
            name: user.name,
            role: user.role
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
                select:{
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
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
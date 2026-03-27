import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";

export class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body;
            if (!userData) {
                res.status(400).json({ error: 'Request body is required' });
                return;
            }
            const user = await userService.CreateUser(userData);
            res.status(201).json(user);
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            await userService.deletUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const updateData = req.body;
            const updatedUser = await userService.updateUser(userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }

    }

    static async userlogin(req: Request, res: Response,next: NextFunction) {
        try {
            const { email, password } = req.body;
            const loginResult = await userService.userLogin(email, password);
            if (loginResult) {
                res.status(200).json(loginResult);
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            next(error);// this will pass the error to the global error handler
        }

    }

    static async updateUserPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const { newPassword } = req.body;
            await userService.updateuserPassword(userId, newPassword);
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
      next
        }

    }

    static async getAllUsers(req: Request, res: Response,next: NextFunction) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
         next(error);// this will pass the error to the global error handler
        }
    }
}

export default UserController;
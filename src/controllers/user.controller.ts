import { Request, Response } from "express";
import { userService } from "../services/user.service";

export class UserController {
    static async createUser(req: Request, res: Response) {
        try {
            const userData = req.body;
            if (!userData) {
                res.status(400).json({ error: 'Request body is required' });
                return;
            }
            const user = await userService.CreateUser(userData);
            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            await userService.deletUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const updateData = req.body;
            const updatedUser = await userService.updateUser(userId, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }

    }

    static async userlogin(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const loginResult = await userService.userLogin(email, password);
            if (loginResult) {
                res.status(200).json(loginResult);
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Error during user login:', error);
            res.status(500).json({ error: 'Login failed' });
        }

    }

    static async updateUserPassword(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id as string, 10);
            const { newPassword } = req.body;
            await userService.updateuserPassword(userId, newPassword);
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ error: 'Failed to update password' });
        }

    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}

export default UserController;
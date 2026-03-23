import express from "express";
import UserController from "../controllers/user.controller";

const userRoutes = express.Router();


userRoutes.post('/v1/users/create',UserController.createUser);
userRoutes.delete('/v1/users/:id',UserController.deleteUser);
userRoutes.put('/v1/users/:id',UserController.updateUser);
userRoutes.post('/v1/users/login',UserController.userlogin);
userRoutes.put('/v1/users/:id/password',UserController.updateUserPassword);
userRoutes.get('/v1/users',UserController.getAllUsers);


export default userRoutes;
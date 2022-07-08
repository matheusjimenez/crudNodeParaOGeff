import { Router } from "express";
import UserController from "../../../controller/UserController.js";

const userController = new UserController();
const userRoutes = Router();

userRoutes.get('/', userController.getUsers);
userRoutes.post('/', userController.createUser);
userRoutes.get('/:id', userController.getOneUser);

export { userRoutes }
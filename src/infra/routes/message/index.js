import { Router } from "express";
import MessageController from "../../../controller/MessageController.js";

const messageController = new MessageController();
const messageRoutes = Router();

messageRoutes.get('/sent', messageController.getSentMessages);
messageRoutes.get('/received', messageController.getReceivedMessages);
messageRoutes.post('/', messageController.sendOneMessage);
messageRoutes.patch('/:id', messageController.deleteOneMessage);

export { messageRoutes }
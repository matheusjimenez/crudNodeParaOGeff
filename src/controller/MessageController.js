import { db_connection as db } from '../infra/knexfile.js';

export default class MessageController {
    async getReceivedMessages(request, response) {
        const { user } = request;

        const messages = await db('user_message')
            .where({
                receiver_identifier: Number(user.id),
                deleted_by_receiver_at: null,
                deleted_by_sender_at: null
            })
            .select()
            .orderBy('createdAt', 'ASC');

        return response.status(200).json(messages);
    }

    async getSentMessages(request, response) {
        const { user } = request;

        const messages = await db('user_message')
            .where({
                sender_identifier: Number(user.id),
                deleted_by_sender_at: null
            })
            .select()
            .orderBy('createdAt', 'ASC');

        return response.status(200).json(messages);
    }

    async deleteOneMessage(request, response) {
        const { user } = request;
        const { id: messageId } = request.params;

        const [message] = await db('user_message').where({ id: Number(messageId) }).select();

        if (!message) return response.status(400).send();

        if (message.sender_identifier === user.id)
            await db('user_message')
                .where({
                    id: Number(messageId)
                }).update({
                    deleted_by_sender_at: new Date()
                });
        else if (message.receiver_identifier === user.id)
            await db('user_message')
                .where({
                    id: Number(messageId)
                }).update({
                    deleted_by_receiver_at: new Date()
                });

        return response.status(202).send();
    }

    async sendOneMessage(request, response) {
        const { user } = request;
        const { message, receiverId } = request.body;

        const [userExits] = await db('users').where({ id: Number(receiverId) }).select();
        if (!userExits) return response.status(400).json({ error: 'user does not exists' });

        await db('user_message').insert({
            sender_identifier: Number(user.id),
            message: message,
            createdAt: new Date(),
            receiver_identifier: Number(receiverId)
        });

        return response.status(200).send();
    }
}

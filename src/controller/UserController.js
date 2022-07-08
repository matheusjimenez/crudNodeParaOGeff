import { db_connection as db } from '../infra/knexfile.js';

export default class UserController {
    async createUser(request, response) {
        const { name, password, email, birthDate } = request.body;

        const [dbresponse] = await db('users').insert({
            name: name,
            password: password,
            email: email,
            birthDate: birthDate
        }).returning('*');

        return response.status(201).json({ user_id: dbresponse.id });
    }

    async getUsers(request, response) {
        const dbResponse = await db('users').select('*');

        return response.status(200).json(dbResponse);
    }

    async getOneUser(request, response) {
        const { id } = request.params;
        const dbResponse = await db('users').where({ id: Number(id) }).select('*');

        return response.status(200).json(dbResponse);
    }

}

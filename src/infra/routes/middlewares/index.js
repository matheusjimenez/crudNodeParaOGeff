import { db_connection as db } from '../../knexfile.js';

async function authenticationMiddleware(request, response, next) {
    const { useridentifier } = request.headers;

    if (!useridentifier) return response.status(401).json({ error: 'Invalid User' });

    const [user] = await db('users').where({ id: Number(useridentifier) }).select();

    if (!user) return response.status(403).json({ error: 'Forbidden user!' })

    request.user = user;
    return next();
}

export { authenticationMiddleware }
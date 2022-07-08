const express = require('express');
const cors = require("cors")
const { db_connection: db } = require('./infra/knexfile');

const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

const app = express();
app.use(cors(corsOptions))
app.use(express.json());

async function authenticationMiddleware(request, response, next) {
    const { useridentifier } = request.headers;//boa pratica seria utilizar um JWT com passport

    if (!useridentifier) return response.status(401).json({ error: 'Invalid User' });

    const [user] = await db('users').where({ id: Number(useridentifier) }).select();

    if (!user) return response.status(403).json({ error: 'Forbidden user!' })

    request.user = user;
    return next();
}

app.post('/user', async function (request, response) {
    const { name, password, email, birthDate } = request.body;

    const [dbresponse] = await db('users').insert({
        name: name,
        password: password,
        email: email,
        birthDate: birthDate
    }).returning('*');

    return response.status(201).json({ user_id: dbresponse.id });
});

app.get('/user', authenticationMiddleware, async function (request, response) {
    const dbResponse = await db('users').select('*');

    return response.status(200).json(dbResponse)
});

app.get('/user/:id', async function (request, response) {
    const { id } = request.params;
    const dbResponse = await db('users').where({id: Number(id)}).select('*');

    return response.status(200).json(dbResponse);
});

app.patch('/message/:id', authenticationMiddleware, async (request, response) => {
    const { user } = request;
    const { id: messageId } = request.params;

    const [message] = await db('user_message').where({ id: Number(messageId) }).select();

    if(!message) return response.status(400).send();

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
})

app.get('/messages/sent', authenticationMiddleware, async (request, response) => {
    const { user } = request;

    const messages = await db('user_message')
        .where({ 
            sender_identifier: Number(user.id),
            deleted_by_sender_at: null
        })
        .select()
        .orderBy('createdAt', 'desc');

    return response.status(200).json(messages);
});

app.get('/messages/received', authenticationMiddleware, async (request, response) => {
    const { user } = request;

    const messages = await db('user_message')
        .where({ 
            receiver_identifier: Number(user.id),
            deleted_by_receiver_at: null,
            deleted_by_sender_at: null
         })
        .select()
        .orderBy('createdAt', 'desc');

    return response.status(200).json(messages);
});

app.post('/message', authenticationMiddleware, async function (request, response) {
    const { user } = request;
    const { message, receiverId } = request.body;

    const [userExits] = await db('users').where({id: Number(receiverId)}).select();
    if(!userExits) return response.status(400).json({error: 'user does not exists'});

    await db('user_message').insert({
        sender_identifier: Number(user.id),
        message: message,
        createdAt: new Date(),
        receiver_identifier: Number(receiverId)
    });

    return response.status(200).send();
});

app.post('/login', async function (request, response) {
    const { email, password } = request.body;

    if (!email || !password) return response.status(400).json({ error: 'Missing Parameters' });

    const user = await db('users').where({ email: email, password: password }).select();

    if (!user.length) return response.status(204).send();

    return response.status(200).json({
        server: 'Sucessfull Login!',
        useridentifier: user[0].id
    });
});

app.listen(5000, function () {
    console.log("Server is running!");
})

module.exports = { app };
import express, { json } from 'express';
import cors from "cors";
import { db_connection as db } from './infra/knexfile.js';
import { authenticationMiddleware } from './infra/routes/middlewares/index.js';
import { userRoutes } from './infra/routes/user/index.js';
import { messageRoutes } from './infra/routes/message/index.js';

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
app.use(json());

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

app.use(authenticationMiddleware)

app.use('/user', userRoutes);
app.use('/messages', messageRoutes);

app.listen(5000, function () {
    console.log("Server is running!");
})

export default { app };
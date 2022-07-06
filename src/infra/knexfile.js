require('dotenv').config({path:'../.env'});

const username = 'postgres';
const password = '1234';
const host = '127.0.0.1';
const port = 5432;
const db = 'postgres';

const knex = require('knex')({
    client: 'pg',
    connection: `postgresql://${username}:${password}@${host}:${port}/${db}`,
    searchPath: ['knex', 'public'],
});

module.exports = {db_connection: knex}
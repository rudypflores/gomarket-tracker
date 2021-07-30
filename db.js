const Pool = require('pg').Pool;
// const path = require('path');
// require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const DB_USER='postgres';
const DB_PASSWORD='2375';
const DB_HOST='127.0.0.1';
const DB_PORT='5432';
const DB_DATABASE='gomarket';
const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
    ssl:false
});

module.exports = pool;
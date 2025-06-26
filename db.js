// db.js
import pg from 'pg';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
    console.error('Error connecting to the database:', err.message);
    // In a production environment, you might want to exit the process
    // process.exit(1);
});

export default pool;

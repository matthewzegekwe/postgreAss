import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres', // Your PostgreSQL username
    host: 'localhost', // Hostname or IP address of your PostgreSQL server
    database: 'zegemath-user', // Your database name
    password: 'Zegemath1*', // Your PostgreSQL password
    port: 5432, // PostgreSQL default port
});

// Test the database connection
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
        console.error('Database connection failed:', err.stack);
    });

export default pool;

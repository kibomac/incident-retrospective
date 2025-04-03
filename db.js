import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test the database connection
(async () => {
    try {
        await db.getConnection();
        console.log('Connected to the database.');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

export default db;
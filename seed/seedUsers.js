import bcrypt from 'bcrypt';
import db from '../db.js';

const seedUsers = async () => {
    const users = [
        { username: 'admin', password: 'admin123', role: 'admin_user' },
        { username: 'engineer1', password: 'engineer123', role: 'engineer' },
        { username: 'business1', password: 'business123', role: 'business_user' },
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
            user.username,
            hashedPassword,
            user.role,
        ]);
    }

    console.log('Users seeded successfully');
    process.exit();
};

seedUsers();
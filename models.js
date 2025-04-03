import db from './db.js';

export async function getAllIncidents() {
    const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents');
    return rows;
}

export async function createNewIncident({ title, description, root_cause }) {
    await db.query('INSERT INTO incidents (title, description, root_cause) VALUES (?, ?, ?)', [title, description, root_cause]);
}
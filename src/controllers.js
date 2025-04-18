import db from '../db.js';

export const getIncidents = async () => {
    const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents');
    return rows;
};

export const createIncident = async (data) => {
    const { title, description, root_cause } = data;

    const [result] = await db.query(
        'INSERT INTO incidents (title, description, root_cause) VALUES (?, ?, ?)',
        [title, description, root_cause]
    );

    return result.insertId;
};

export const getIncidentById = async (id) => {
    const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents WHERE id = ?', [id]);
    return rows[0];
};

export const updateIncident = async (id, { title, description, root_cause }) => {
    const query = `
        UPDATE incidents
        SET title = ?, description = ?, root_cause = ?
        WHERE id = ?
    `;
    const values = [title, description, root_cause, id];
    await db.query(query, values);
};

export const getIncidentsByMonth = async () => {
    const [rows] = await db.query(`
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') AS month, 
            COUNT(*) AS count 
        FROM incidents 
        GROUP BY month 
        ORDER BY month
    `);
    return rows;
};

export const getIncidentsByRootCause = async () => {
    const [rows] = await db.query(`
        SELECT root_cause, COUNT(*) AS count
        FROM incidents
        GROUP BY root_cause
        ORDER BY count DESC
    `);
    return rows;
};

export const getIncidentsByStatus = async () => {
    const [rows] = await db.query(`
        SELECT status, COUNT(*) AS count
        FROM action_items
        GROUP BY status
    `);
    return rows;
};

export const getIncidentsByAssignee = async () => {
    const [rows] = await db.query(`
        SELECT assigned_to AS assignee, COUNT(*) AS count
        FROM action_items
        GROUP BY assigned_to
        ORDER BY count DESC
    `);
    return rows;
};

export const getActionItems = async () => {
    const [rows] = await db.query(`
        SELECT 
            id, 
            incident_id AS incidentId, 
            action_item AS actionItem, 
            assigned_to AS assignedTo, 
            due_date AS dueDate, 
            created_at AS createdAt, 
            updated_at AS updatedAt 
        FROM action_items
    `);
    return rows;
};

export const createActionItem = async (data) => {
    const { incident_id, action_item, assigned_to, due_date, status } = data;

    const [rows] = await db.query(
        'CALL CreateActionItem(?, ?, ?, ?, ?)',
        [incident_id, action_item, assigned_to, due_date, status]
    );

    return rows[0][0];
};

export const getActionItemById = async (id) => {
    const [rows] = await db.query(`
        SELECT 
            ai.id, 
            ai.incident_id AS incidentId, 
            ai.action_item AS actionItem, 
            ai.assigned_to AS assignedTo, 
            ai.due_date AS dueDate, 
            ai.status AS status, 
            ai.created_at AS createdAt, 
            ai.updated_at AS updatedAt 
        FROM action_items ai
        WHERE ai.id = ?
    `, [id]);
    return rows[0]; 
};

export const updateActionItem = async (id, updatedFields) => {
    try {
        const { action_item, assigned_to, due_date, status } = updatedFields;

        await db.query(
            `
            UPDATE action_items
            SET action_item = ?, assigned_to = ?, due_date = ?, status = ?
            WHERE id = ?
            `,
            [action_item, assigned_to, due_date, status, id]
        );
    } catch (error) {
        throw error;
    }
};

export const deleteActionItem = async (id) => {
    await db.query('DELETE FROM action_items WHERE id = ?', [id]);
};

export const getUserByUsername = async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

export const fetchFilteredIncidents = async (filters) => {
    const { startDate, endDate, rootCause, status, assignee } = filters;

    const [incidents] = await db.query(
        'CALL FetchFilteredIncidents(?, ?, ?, ?, ?)',
        [startDate || null, endDate || null, rootCause || null, status || null, assignee || null]
    );

    return incidents[0];
};

export const fetchFilteredActionItems = async (filters) => {
    const { assignedTo, incidentId, dueDate, status } = filters;

    const [actionItems] = await db.query(
        'CALL FetchFilteredActionItems(?, ?, ?, ?)',
        [assignedTo || null, incidentId || null, dueDate || null, status || null]
    );

    return actionItems[0];
};

export const fetchActionItemsByIncidentId = async (incidentId) => {
    const [rows] = await db.query('SELECT * FROM action_items WHERE incident_id = ?', [incidentId]);
    return rows;
};

export const createUser = async (username, hashedPassword, role) => {
    try {
        const [result] = await db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        return result.insertId; 
    } catch (error) {
        throw error; 
    }
};
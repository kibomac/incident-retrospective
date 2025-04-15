import db from '../db.js';

export const getIncidents = async () => {
    const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents');
    return rows;
};

export const createIncident = async (data) => {
    const { title, description, root_cause } = data;
    await db.query('INSERT INTO incidents (title, description, root_cause) VALUES (?, ?, ?)', [title, description, root_cause]);
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
    const { title, description, incidentId } = data;
    await db.query('INSERT INTO action_items (title, description, incidentId) VALUES (?, ?, ?)', [title, description, incidentId]);
};

export const getActionItemById = async (id) => {
    const [rows] = await db.query(`
        SELECT 
            ai.id, 
            ai.incident_id AS incidentId, 
            ai.action_item AS actionItem, 
            ai.assigned_to AS assignedTo, 
            ai.due_date AS dueDate, 
            ai.created_at AS createdAt, 
            ai.updated_at AS updatedAt, 
            i.title AS incidentTitle
        FROM action_items ai
        LEFT JOIN incidents i ON ai.incident_id = i.id
        WHERE ai.id = ?
    `, [id]);
    return rows[0];
};

export const updateActionItem = async (id, data) => {
    const { title, description, incidentId } = data;
    await db.query('UPDATE action_items SET title = ?, description = ?, incidentId = ? WHERE id = ?', [title, description, incidentId, id]);
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

    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params = [];

    if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
    }
    if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
    }
    if (rootCause) {
        query += ' AND root_cause = ?';
        params.push(rootCause);
    }
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (assignee) {
        query += ' AND assignee LIKE ?';
        params.push(`%${assignee}%`);
    }

    const [incidents] = await db.query(query, params);
    return incidents;
};

export const fetchFilteredActionItems = async (filters) => {
    const { assignedTo, incidentId, dueDate } = filters;

    let query = 'SELECT * FROM action_items WHERE 1=1';
    const params = [];

    if (assignedTo) {
        query += ' AND assigned_to LIKE ?';
        params.push(`%${assignedTo}%`);
    }
    if (incidentId) {
        query += ' AND incident_id = ?';
        params.push(incidentId);
    }
    if (dueDate) {
        query += ' AND due_date = ?';
        params.push(dueDate);
    }

    const [actionItems] = await db.query(query, params);
    return actionItems;
};
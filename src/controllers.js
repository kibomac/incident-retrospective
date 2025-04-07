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
    try {
        const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents WHERE id = ?', [id]);
        return rows[0]; // Return the first row (incident) or undefined if not found
    } catch (error) {
        console.error('Error fetching incident by ID:', error);
        throw error;
    }
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
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month, 
                COUNT(*) AS count 
            FROM incidents 
            GROUP BY month 
            ORDER BY month
        `);
        return rows; // Return the grouped data
    } catch (error) {
        console.error('Error fetching incidents by month:', error);
        throw error;
    }
};

export const getIncidentsByRootCause = async () => {
    try {
        const [rows] = await db.query(`
            SELECT root_cause, COUNT(*) AS count
            FROM incidents
            GROUP BY root_cause
            ORDER BY count DESC
        `);
        return rows; // Return the grouped data
    } catch (error) {
        console.error('Error fetching incidents by root cause:', error);
        throw error;
    }
};

export const getIncidentsByStatus = async () => {
    try {
        const [rows] = await db.query(`
            SELECT status, COUNT(*) AS count
            FROM action_items
            GROUP BY status
        `);
        return rows; // Return the grouped data
    } catch (error) {
        console.error('Error fetching incidents by status:', error);
        throw error;
    }
};

export const getIncidentsByAssignee = async () => {
    try {
        const [rows] = await db.query(`
            SELECT assigned_to AS assignee, COUNT(*) AS count
            FROM action_items
            GROUP BY assigned_to
            ORDER BY count DESC
        `);
        return rows; // Return the grouped data
    } catch (error) {
        console.error('Error fetching incidents by assignee:', error);
        throw error;
    }
};

export const getActionItems = async () => {
    try {
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
    } catch (error) {
        console.error('Error fetching action items:', error);
        throw error;
    }
};

export const createActionItem = async (data) => {
    const { title, description, incidentId } = data;
    await db.query('INSERT INTO action_items (title, description, incidentId) VALUES (?, ?, ?)', [title, description, incidentId]);
};

export const getActionItemById = async (id) => {
    try {
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
        return rows[0]; // Return the first row (action item with incident title)
    } catch (error) {
        console.error('Error fetching action item by ID:', error);
        throw error;
    }
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
    return rows[0]; // Return the first user or undefined if not found
};
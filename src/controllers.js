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

export const updateIncident = async (id, data) => {
    const { title, description, root_cause } = data;
    await db.query('UPDATE incidents SET title = ?, description = ?, root_cause = ? WHERE id = ?', [title, description, root_cause, id]);
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
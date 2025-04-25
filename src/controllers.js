import db from '../db.js';

export const getIncidents = async () => {
    const result = await db.query('CALL GetIncidents()');
    const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0][0] : [];
    return rows;
};

export const createIncident = async (data) => {
    const { title, description, root_cause } = data;

    const [result] = await db.query(
        'CALL CreateIncident(?, ?, ?)',
        [title, description, root_cause]
    );


    return { id: result[0]?.id || result.insertId };
};

export const getIncidentById = async (id) => {
    const [rows] = await db.query('SELECT id, title, description, root_cause, created_at AS createdAt FROM incidents WHERE id = ?', [id]);
    return rows[0];
};

export const updateIncident = async (id, { title, description, root_cause, status }) => {
    const [result] = await db.query(
        'CALL UpdateIncident(?, ?, ?, ?, ?)',
        [id, title, description, root_cause, status]
    );
    return result;
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
    const [rows] = await db.query('CALL GetActionItemById(?)', [id]);
    return rows[0][0];
};

export const updateActionItem = async (id, updatedFields) => {
    try {
        const { action_item, assigned_to, due_date, status } = updatedFields;

        const [result] = await db.query(
            'CALL UpdateActionItem(?, ?, ?, ?, ?)',
            [id, action_item, assigned_to, due_date, status]
        );

        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteActionItem = async (id) => {
    try {
        const [result] = await db.query('CALL DeleteActionItem(?)', [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

export const getUserByUsername = async (username) => {
    try {
        const [rows] = await db.query('CALL GetUserByUsername(?)', [username]);
        console.log('Database query result:', rows); // Debugging log
        return rows[0][0];
    } catch (error) {
        console.error('Database error:', error);
        throw new Error('Database error');
    }
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
    const [rows] = await db.query(
        'CALL FetchActionItemsByIncidentId(?)',
        [incidentId]
    );
    return rows[0];
};

export const createUser = async (username, hashedPassword, role) => {
    try {
        const [result] = await db.query(
            'CALL CreateUser(?, ?, ?)',
            [username, hashedPassword, role]
        );
        return result.insertId; 
    } catch (error) {
        throw error; 
    }
};
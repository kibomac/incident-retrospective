import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import {
    createIncident,
    createActionItem,
    getIncidentById,
    updateIncident,
    getActionItemById,
    getIncidentsByMonth,
    getIncidentsByRootCause,
    getIncidentsByStatus,
    getIncidentsByAssignee,
    getUserByUsername,
    fetchFilteredIncidents,
    fetchFilteredActionItems,
    fetchActionItemsByIncidentId,
    createUser,
    updateActionItem,
} from './controllers.js';
import { getRootCauses, getIncidentStatuses } from './config.js';
import { ensureAuthenticated } from './middleware/auth.js';
import { ensureAdmin } from './middleware/middleware.js';

const router = express.Router();

// Public routes
router.get('/', (req, res) => res.render('index', { title: 'Home' }));

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username, password });

        const user = await getUserByUsername(username);
        console.log('User found:', user);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('Invalid credentials');
            return res.render('login', { error: 'Invalid username or password' });
        }

        req.session.user = { id: user.id, username: user.username, role: user.role };
        console.log('Session created:', req.session.user);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error in /login route:', error);
        next(error);
    }
});

router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

router.post('/register', async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).send('All fields are required.');
        }

        const validRoles = ['business_user', 'admin_user', 'engineer'];
        if (!validRoles.includes(role)) {
            return res.status(400).send('Invalid role.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser(username, hashedPassword, role);

        res.redirect('/login'); 
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Username already exists.');
        } else {
            next(error);
        }
    }
});

// Protected routes
router.use(ensureAuthenticated);

router.get('/dashboard', (req, res, next) => {
    try {
        res.render('dashboard');
    } catch (error) {
        next(error);
    }
});

router.get('/incidents', async (req, res, next) => {
    try {
        const { startDate, endDate, rootCause, status, assignee } = req.query;
        const rootCauses = getRootCauses();
        const statuses = getIncidentStatuses();
        const incidents = await fetchFilteredIncidents({ startDate, endDate, rootCause, status, assignee });

        res.render('incidents', {
            incidents,
            rootCauses,
            statuses,
            startDate,
            endDate,
            rootCause,
            selectedStatus: status,
            assignee,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/incidents/create', async (req, res, next) => {
    try {
        // Render the create page without a success message
        res.render('incidents/create', {
            success: false,
            incidentId: null,
            rootCauses: await getRootCauses(), // Pass root causes for the dropdown
        });
    } catch (error) {
        next(error);
    }
});

router.post('/incidents/create', async (req, res, next) => {
    try {
        const { title, description, root_cause } = req.body;

        if (!title || !description) {
            return res.status(400).send('Title and description are required.');
        }

        const incidentId = await createIncident({ title, description, root_cause });

        res.render('incidents/create', {
            success: true,
            incidentId,
            rootCauses: await getRootCauses(), 
        });
    } catch (error) {
        next(error);
    }
});

router.get('/incidents/edit/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const incident = await getIncidentById(id);

        if (!incident) {
            return res.status(404).render('404', { title: 'Incident Not Found' });
        }

        const rootCauses = getRootCauses();
        const statuses = getIncidentStatuses();
        const actionItemStatuses = process.env.ACTION_ITEM_STATUSES.split(',');

        // Fetch associated action items
        const actionItems = await fetchActionItemsByIncidentId(id);

        res.render('incidents/edit', {
            title: 'Edit Incident',
            incident,
            rootCauses,
            statuses,
            actionItemStatuses,
            actionItems,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/incidents/edit/:id', async (req, res, next) => {
    try {
        const { title, description, root_cause, status } = req.body;
        const { id } = req.params;

        if (!title || !description || !root_cause || !status) {
            throw new Error('Missing required fields');
        }

        await updateIncident(id, { title, description, root_cause, status });
        res.redirect('/incidents');
    } catch (error) {
        next(error);
    }
});

router.get('/incidents/view/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const incident = await getIncidentById(id);

        const actionItems = await fetchActionItemsByIncidentId(id);

        if (!incident) {
            return res.status(404).render('404', { title: 'Incident Not Found' });
        }

        res.render('incidents/view', {
            title: 'View Incident',
            incident,
            actionItems, 
        });
    } catch (error) {
        next(error);
    }
});

router.get('/action-items', async (req, res, next) => {
    try {
        const { assignedTo, incidentId, dueDate, status } = req.query;

        const statuses = process.env.ACTION_ITEM_STATUSES.split(',');

        const actionItems = await fetchFilteredActionItems({ assignedTo, incidentId, dueDate, status });

        res.render('actionItems/actionItems', {
            title: 'Action Items',
            actionItems,
            assignedTo,
            incidentId,
            dueDate,
            statuses,
            selectedStatus: status,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/action-items/create', (req, res) => {
    const statuses = process.env.ACTION_ITEM_STATUSES.split(',').map(status => status.trim());

    res.render('actionItems/create', {
        success: false,
        actionId: null,
        incidentId: null,
        statuses, 
    });
});

router.post('/action-items', async (req, res, next) => {
    try {
        const { incidentId, action_item, assigned_to, due_date, status } = req.body;

        if (!incidentId || !action_item || !assigned_to || !status) {
            return res.status(400).send('All fields except due date are required.');
        }

        const actionItem = await createActionItem({
            incident_id: incidentId,
            action_item,
            assigned_to,
            due_date,
            status,
        });

        res.render('actionItems/create', {
            success: true,
            actionId: actionItem.id,
            incidentId: actionItem.incidentId,
            statuses: process.env.ACTION_ITEM_STATUSES.split(',').map(status => status.trim()),
        });
    } catch (error) {
        next(error);
    }
});

router.post('/action-items/create', async (req, res, next) => {
    try {
        const { incident_id } = req.body;

        const newActionItem = await createActionItem(req.body);

        res.redirect(`/incidents/edit/${incident_id}`);
    } catch (error) {
        next(error);
    }
});

router.get('/action-items/view/:id', async (req, res, next) => {
    try {
        const actionItem = await getActionItemById(req.params.id);
        
        if (!actionItem) {
            return res.status(404).send('Action item not found');
        }

        res.render('actionItems/view', { title: 'View Action Item', actionItem });
    } catch (error) { 
        next(error);
    }
});

router.get('/action-items/edit/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const actionItem = await getActionItemById(id);

        if (!actionItem) {
            return res.status(404).render('404', { title: 'Action Item Not Found' });
        }

        const actionItemStatuses = process.env.ACTION_ITEM_STATUSES.split(',').map(status => status.trim());

        res.render('actionItems/edit', {
            title: 'Edit Action Item',
            actionItem,
            incident_id: actionItem.incidentId,
            actionItemStatuses,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/action-items/edit/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action_item, assigned_to, due_date, status } = req.body;

        if (!action_item || !assigned_to || !status) {
            return res.status(400).send('All fields except due date are required.');
        }

        await updateActionItem(id, { action_item, assigned_to, due_date, status });

        res.redirect(`/incidents/view/${req.body.incident_id}`);
    } catch (error) {
        next(error);
    }
});

router.post('/action-items/delete/:id', async (req, res, next) => {
    try {
        await deleteActionItem(req.params.id);
        res.redirect('/action-items');
    } catch (error) {
        next(error);
    }
});

router.get('/api/incidents', async (req, res, next) => {
    try {
        const incidentsByMonth = await getIncidentsByMonth();
        res.json(incidentsByMonth);
    } catch (error) {
        next(error);
    }
});

router.get('/api/incidents/root-cause', async (req, res, next) => {
    try {
        const rootCauseData = await getIncidentsByRootCause();
        res.json(rootCauseData);
    } catch (error) {
        next(error);
    }
});

router.get('/api/incidents/status', async (req, res, next) => {
    try {
        const statusData = await getIncidentsByStatus();
        res.json(statusData);
    } catch (error) {
        next(error);
    }
});

router.get('/api/action-items/assignee', async (req, res, next) => {
    try {
        const assigneeData = await getIncidentsByAssignee();
        res.json(assigneeData);
    } catch (error) {
        next(error);
    }
});

router.get('/api/root-causes', (req, res, next) => {
    try {
        const rootCauses = getRootCauses();
        res.json(rootCauses);
    } catch (error) {
        next(error);
    }
});

router.get('/api/incident-statuses', (req, res, next) => {
    try {
        const statuses = getIncidentStatuses();
        res.json(statuses);
    } catch (error) {
        next(error);
    }
});

router.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

router.get('/forbidden', (req, res) => {
    res.status(403).send('403 Forbidden');
});

router.get('/admin', ensureAdmin, (req, res) => {
    res.send('Welcome to the admin panel');
});

router.get('/valid-route', (req, res) => {
    res.status(200).send('Valid Route');
});

router.get('/unauthorized', (req, res) => {
    res.status(401).send('401 Unauthorized');
});

router.get('/bad-request', (req, res) => {
    res.status(400).send('400 Bad Request');
});

router.get('/method-not-allowed', (req, res) => {
    res.status(200).send('GET method is allowed');
});

router.all('/method-not-allowed', (req, res) => {
    res.status(405).send('405 Method Not Allowed');
});

router.get('/error', (req, res) => {
    res.status(500).send('500 Internal Server Error');
});

export default router;
import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import {
    getIncidents,
    createIncident,
    createActionItem,
    getIncidentById,
    updateIncident,
    getActionItems,
    getActionItemById,
    getIncidentsByMonth,
    getIncidentsByRootCause,
    getIncidentsByStatus,
    getIncidentsByAssignee,
    getUserByUsername,
    fetchFilteredIncidents,
    fetchFilteredActionItems,
    fetchActionItemsByIncidentId,
} from './controllers.js';
import { getRootCauses, getIncidentStatuses } from './config.js';
import { ensureAuthenticated } from './middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', (req, res) => res.render('index', { title: 'Home' }));

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
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
        const rootCauses = getRootCauses();
        res.render('incidents/create', { rootCauses });
    } catch (error) {
        next(error);
    }
});

router.post('/incidents/create', async (req, res, next) => {
    try {
        await createIncident(req.body);
        res.redirect('/incidents');
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

router.get('/action-items/create', (req, res, next) => {
    try {
        const actionItemStatuses = process.env.ACTION_ITEM_STATUSES.split(',').map(status => status.trim());

        res.render('actionItems/create', {
            title: 'Create Action Item',
            actionItemStatuses,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/action-items', async (req, res, next) => {
    try {
        await createActionItem(req.body);
        res.redirect('/action-items');
    } catch (error) {
        next(error);
    }
});

router.post('/action-items/create', async (req, res, next) => {
    try {
        const { incident_id } = req.body;

        // Call the controller function to create the action item
        const newActionItem = await createActionItem(req.body);

        console.log('New Action Item Created:', newActionItem);

        // Redirect back to the edit page for the incident
        res.redirect(`/incidents/edit/${incident_id}`);
    } catch (error) {
        next(error);
    }
});

router.get('/action-items/view/:id', async (req, res, next) => {
    try {
        const actionItem = await getActionItemById(req.params.id);
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

        console.log({ actionItem, actionItemStatuses }); // Debugging output

        res.render('actionItems/edit', {
            title: 'Edit Action Item',
            actionItem,
            actionItemStatuses,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/action-items/edit/:id', async (req, res, next) => {
    try {
        await updateActionItem(req.params.id, req.body);
        res.redirect('/action-items');
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

export default router;
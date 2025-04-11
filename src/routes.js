import express from 'express';
import bcrypt from 'bcrypt';
import {
    getIncidents,
    createIncident,
    getIncidentById,
    updateIncident,
    getActionItems,
    getActionItemById,
    getIncidentsByMonth,
    getIncidentsByRootCause,
    getIncidentsByStatus,
    getIncidentsByAssignee,
    getUserByUsername,
} from './controllers.js';
import { getRootCauses, getIncidentStatuses } from './config.js';
import { ensureAuthenticated } from './middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Store user in session
        req.session.user = { id: user.id, username: user.username, role: user.role };

        // Redirect to dashboard or appropriate page
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during login:', error);
        next(error);
    }
});

// Protected routes
router.use(ensureAuthenticated); // Apply middleware to all routes below this line

router.get('/dashboard', (req, res) => {
    try {
        res.render('dashboard');
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        next(error);
    }
});

router.get('/incidents', async (req, res) => {
    try {
        const incidents = await getIncidents();
        res.render('incidents', { incidents });
    } catch (error) {
        console.error('Error fetching incidents:', error);
        next(error);
    }
});

// Route to render the create incident page
router.get('/incidents/create', async (req, res) => {
    try {
        const rootCauses = getRootCauses();
        res.render('incidents/create', { rootCauses });
    } catch (error) {
        console.error('Error rendering create page:', error);
        next(error);
    }
});

// Route to handle creating a new incident
router.post('/incidents/create', async (req, res) => {
    try {
        await createIncident(req.body);
        res.redirect('/incidents');
    } catch (error) {
        console.error('Error creating incident:', error);
        next(error);
    }
});

// Route to render the edit incident page
router.get('/incidents/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const incident = await getIncidentById(id);

        if (!incident) {
            return res.status(404).render('404', { title: 'Incident Not Found' });
        }

        const rootCauses = getRootCauses();
        const statuses = getIncidentStatuses();
        res.render('incidents/edit', { incident, rootCauses, statuses });
    } catch (error) {
        console.error('Error rendering edit page:', error);
        next(error);
    }
});

// Route to handle updating an incident
router.post('/incidents/edit/:id', async (req, res) => {
    try {
        const { title, description, root_cause, status } = req.body;
        const { id } = req.params;

        if (!title || !description || !root_cause || !status) {
            throw new Error('Missing required fields');
        }

        await updateIncident(id, { title, description, root_cause, status });
        res.redirect('/incidents');
    } catch (error) {
        console.error('Error updating incident:', error);
        next(error);
    }
});

// Route to render the view incident page
router.get('/incidents/view/:id', async (req, res) => {
    try {
        const incident = await getIncidentById(req.params.id);
        if (!incident) {
            return res.status(404).send('Incident not found');
        }
        res.render('incidents/view', { title: 'View Incident', incident });
    } catch (error) {
        console.error('Error fetching incident:', error);
        next(error);
    }
});

// Route to render the action items page
router.get('/action-items', async (req, res) => {
    try {
        const actionItems = await getActionItems();
        res.render('actionItems/actionItems', { title: 'Action Items', actionItems });
    } catch (error) {
        console.error('Error fetching action items:', error);
        next(error);
    }
});

// Route to render the create action item page
router.get('/action-items/create', (req, res) => {
    try {
        res.render('actionItems/create', { title: 'Create Action Item' });
    } catch (error) {
        console.error('Error rendering action item:', error);
        next(error);
    }
});

// Route to handle creating a new action item
router.post('/action-items', async (req, res) => {
    try {
        await createActionItem(req.body);
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error creating action item:', error);
        next(error);
    }
});

// Route to render the view action item page
router.get('/action-items/view/:id', async (req, res) => {
    try {
        const actionItem = await getActionItemById(req.params.id);
        res.render('actionItems/view', { title: 'View Action Item', actionItem });
    } catch (error) {
        console.error('Error fetching action item:', error);
        next(error);
    }
});

// Route to render the edit action item page
router.get('/action-items/edit/:id', async (req, res) => {
    try {
        const actionItem = await getActionItemById(req.params.id);
        res.render('actionItems/edit', { title: 'Edit Action Item', actionItem });
    } catch (error) {
        console.error('Error fetching action item:', error);
        next(error);
    }
});

// Route to handle updating an action item
router.post('/action-items/edit/:id', async (req, res) => {
    try {
        await updateActionItem(req.params.id, req.body);
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error updating action item:', error);
        next(error);
    }
});

// Route to handle deleting an action item
router.post('/action-items/delete/:id', async (req, res) => {
    try {
        await deleteActionItem(req.params.id);
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error deleting action item:', error);
        next(error);
    }
});

// API route to fetch incidents grouped by month
router.get('/api/incidents', async (req, res) => {
    try {
        const incidentsByMonth = await getIncidentsByMonth();
        console.log('Incidents by Month:', incidentsByMonth); // Debugging log
        res.json(incidentsByMonth);
    } catch (error) {
        console.error('Error fetching incidents by month:', error);
        next(error);
    }
});

// API route to fetch incidents grouped by root cause
router.get('/api/incidents/root-cause', async (req, res) => {
    try {
        const rootCauseData = await getIncidentsByRootCause();
        console.log('Incidents by Root Cause:', rootCauseData);
        res.json(rootCauseData);
    } catch (error) {
        console.error('Error fetching incidents by root cause:', error);
        next(error);
    }
});

// API route to fetch incidents grouped by status
router.get('/api/incidents/status', async (req, res) => {
    try {
        const statusData = await getIncidentsByStatus();
        console.log('Incidents by Status:', statusData);
        res.json(statusData);
    } catch (error) {
        console.error('Error fetching incidents by status:', error);
        next(error);
    }
});

// API route to fetch action items grouped by assignee
router.get('/api/action-items/assignee', async (req, res) => {
    try {
        const assigneeData = await getIncidentsByAssignee();
        console.log('Incidents by Assignee:', assigneeData);
        res.json(assigneeData);
    } catch (error) {
        console.error('Error fetching action items by assignee:', error);
        next(error);
    }
});

// API route to fetch list of root causes
router.get('/api/root-causes', (req, res) => {
    try {
        const rootCauses = getRootCauses();
        res.json(rootCauses);
    } catch (error) {
        console.error('Error fetching root causes:', error);
        next(error);
    }
});

// API route to fetch list of incident statuses
router.get('/api/incident-statuses', (req, res) => {
    try {
        const statuses = getIncidentStatuses();
        res.json(statuses);
    } catch (error) {
        console.error('Error fetching incident statuses:', error);
        next(error);
    }
});

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

export default router;
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
    getUserByUsername, // Ensure this is imported
} from './controllers.js';
import { getRootCauses, getIncidentStatuses } from './config.js';

const router = express.Router();

// Route to render the index page
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' }); // Ensure the view file is named 'index.ejs'
});

// Route to render the incidents page
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await getIncidents();
        res.render('incidents', { title: 'Incidents', incidents });
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the create incident page
router.get('/incidents/create', async (req, res) => {
    try {
        // Fetch root causes
        const rootCauses = getRootCauses();

        // Render the create page with the required data
        res.render('incidents/create', { rootCauses });
    } catch (error) {
        console.error('Error rendering create page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle creating a new incident
router.post('/incidents/create', async (req, res) => {
    try {
        await createIncident(req.body);
        res.redirect('/incidents');
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the edit incident page
router.get('/incidents/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the incident by ID
        const incident = await getIncidentById(id);

        if (!incident) {
            return res.status(404).render('404', { title: 'Incident Not Found' });
        }

        // Fetch root causes and statuses
        const rootCauses = getRootCauses();
        const statuses = getIncidentStatuses();

        // Render the edit page with the required data
        res.render('incidents/edit', { incident, rootCauses, statuses });
    } catch (error) {
        console.error('Error rendering edit page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle updating an incident
router.post('/incidents/edit/:id', async (req, res) => {
    try {
        console.log(req.body); // Log the form data
        const { title, description, root_cause, status } = req.body; // Extract form data
        const { id } = req.params;

        if (!title || !description || !root_cause || !status) {
            throw new Error('Missing required fields');
        }

        await updateIncident(id, { title, description, root_cause, status });
        res.redirect('/incidents'); // Redirect after successful update
    } catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the view incident page
router.get('/incidents/view/:id', async (req, res) => {
    try {
        const incident = await getIncidentById(req.params.id); // Fetch the incident by ID
        if (!incident) {
            return res.status(404).send('Incident not found');
        }
        res.render('incidents/view', { title: 'View Incident', incident }); // Pass the incident to the template
    } catch (error) {
        console.error('Error fetching incident:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the action items page
router.get('/action-items', async (req, res) => {
    try {
        const actionItems = await getActionItems(); // Assume getActionItems is defined in controllers
        res.render('actionItems/actionItems', { title: 'Action Items', actionItems });
    } catch (error) {
        console.error('Error fetching action items:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the create action item page
router.get('/action-items/create', (req, res) => {
    res.render('actionItems/create', { title: 'Create Action Item' });
});

// Route to handle creating a new action item
router.post('/action-items', async (req, res) => {
    try {
        await createActionItem(req.body); // Assume createActionItem is defined in controllers
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error creating action item:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the view action item page
router.get('/action-items/view/:id', async (req, res) => {
    try {
        const actionItem = await getActionItemById(req.params.id); // Assume getActionItemById is defined in controllers
        res.render('actionItems/view', { title: 'View Action Item', actionItem });
    } catch (error) {
        console.error('Error fetching action item:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the edit action item page
router.get('/action-items/edit/:id', async (req, res) => {
    try {
        const actionItem = await getActionItemById(req.params.id);
        res.render('actionItems/edit', { title: 'Edit Action Item', actionItem });
    } catch (error) {
        console.error('Error fetching action item:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle updating an action item
router.post('/action-items/edit/:id', async (req, res) => {
    try {
        await updateActionItem(req.params.id, req.body); // Assume updateActionItem is defined in controllers
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error updating action item:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle deleting an action item
router.post('/action-items/delete/:id', async (req, res) => {
    try {
        await deleteActionItem(req.params.id); // Assume deleteActionItem is defined in controllers
        res.redirect('/action-items');
    } catch (error) {
        console.error('Error deleting action item:', error);
        res.status(500).send('Internal Server Error');
    }
});

// API route to fetch incidents grouped by month
router.get('/api/incidents', async (req, res) => {
    try {
        const incidentsByMonth = await getIncidentsByMonth(); // Use the exported function
        res.json(incidentsByMonth); // Send the data as JSON
    } catch (error) {
        console.error('Error fetching incidents by month:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch incidents grouped by root cause
router.get('/api/incidents/root-cause', async (req, res) => {
    try {
        const rootCauseData = await getIncidentsByRootCause(); // Use the function from controllers.js
        res.json(rootCauseData); // Send the data as JSON
    } catch (error) {
        console.error('Error fetching incidents by root cause:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch incidents grouped by status
router.get('/api/incidents/status', async (req, res) => {
    try {
        const statusData = await getIncidentsByStatus(); // Use the function from controllers.js
        res.json(statusData); // Send the data as JSON
    } catch (error) {
        console.error('Error fetching incidents by status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch action items grouped by assignee
router.get('/api/action-items/assignee', async (req, res) => {
    try {
        const assigneeData = await getIncidentsByAssignee(); // Use the function from controllers.js
        res.json(assigneeData); // Send the data as JSON
    } catch (error) {
        console.error('Error fetching action items by assignee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch root causes
router.get('/api/root-causes', (req, res) => {
    try {
        const rootCauses = getRootCauses();
        res.json(rootCauses); // Send the root causes as JSON
    } catch (error) {
        console.error('Error fetching root causes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch incident statuses
router.get('/api/incident-statuses', (req, res) => {
    try {
        const statuses = getIncidentStatuses();
        res.json(statuses); // Send the statuses as JSON
    } catch (error) {
        console.error('Error fetching incident statuses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to render the dashboard page
router.get('/dashboard', async (req, res) => {
    try {
        res.render('dashboard', { title: 'Dashboard' }); // Render the dashboard view
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Route to handle login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Fetch user by username
        const user = await getUserByUsername(username);

        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Store user information in the session (or JWT if applicable)
        req.session.user = { id: user.id, username: user.username, role: user.role };

        // Redirect based on user role
        if (user.role === 'admin_user') {
            res.redirect('/dashboard');
        } else if (user.role === 'engineer') {
            res.redirect('/dashboard');
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
import express from 'express';
import { getIncidents, createIncident, getIncidentById, updateIncident, getActionItems, getActionItemById } from './controllers.js';

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
router.get('/incidents/create', (req, res) => {
    res.render('incidents/create', { title: 'Create Incident' }); // Updated path
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
        const incident = await getIncidentById(req.params.id); // Fetch the incident by ID
        if (!incident) {
            return res.status(404).send('Incident not found');
        }
        res.render('incidents/edit', { title: 'Edit Incident', incident }); // Pass the incident to the template
    } catch (error) {
        console.error('Error fetching incident:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle updating an incident
router.post('/incidents/edit/:id', async (req, res) => {
    try {
        await updateIncident(req.params.id, req.body);
        res.redirect('/incidents');
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

export default router;
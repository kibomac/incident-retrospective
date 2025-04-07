import db from '../db.js'; // Ensure this points to your database connection file
import { faker } from '@faker-js/faker'; // Use the updated faker package
import { getRootCauses, getIncidentStatuses, getActionItemStatuses, getUsers } from './config.js'; // Import utility functions

const seedData = async () => {
    try {
        // Clear existing data
        await db.query('DELETE FROM action_items');
        await db.query('DELETE FROM incidents');

        // Load users, root causes, incident statuses, and action item statuses from utility functions
        const users = getUsers();
        const rootCauses = getRootCauses();
        const incidentStatuses = getIncidentStatuses();
        const actionItemStatuses = getActionItemStatuses();

        const incidents = [];
        const actionItems = [];

        // Generate 1000 incidents
        for (let i = 0; i < 1000; i++) {
            const createdAt = faker.date.between({ from: '2023-04-01', to: '2025-04-01' }); // Random date over the last 24 months
            const incident = {
                title: faker.company.catchPhrase(),
                description: faker.lorem.sentence(),
                root_cause: faker.helpers.arrayElement(rootCauses), // Randomly select a root cause
                status: faker.helpers.arrayElement(incidentStatuses), // Randomly assign a status
                createdAt: createdAt.toISOString().split('T')[0] // Format as YYYY-MM-DD
            };
            incidents.push(incident);
        }

        // Insert incidents into the database
        for (const incident of incidents) {
            const [result] = await db.query(
                'INSERT INTO incidents (title, description, root_cause, status, created_at) VALUES (?, ?, ?, ?, ?)',
                [incident.title, incident.description, incident.root_cause, incident.status, incident.createdAt]
            );

            // Generate 1-3 action items for each incident
            const numActionItems = faker.number.int({ min: 1, max: 3 }); // Updated to faker.number.int
            for (let j = 0; j < numActionItems; j++) {
                const actionItem = {
                    incident_id: result.insertId, // Use the inserted incident's ID
                    action_item: faker.lorem.sentence(),
                    assigned_to: faker.helpers.arrayElement(users), // Randomly assign to a user
                    status: faker.helpers.arrayElement(actionItemStatuses), // Randomly assign a status for action items
                    due_date: faker.date.future({ years: 0.5, refDate: incident.createdAt }).toISOString().split('T')[0] // Due date within 6 months
                };
                actionItems.push(actionItem);
            }
        }

        // Insert action items into the database
        for (const actionItem of actionItems) {
            await db.query(
                'INSERT INTO action_items (incident_id, action_item, assigned_to, status, due_date) VALUES (?, ?, ?, ?, ?)',
                [actionItem.incident_id, actionItem.action_item, actionItem.assigned_to, actionItem.status, actionItem.due_date]
            );
        }

        console.log('Database seeded with 1000 incidents and corresponding action items.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        db.end(); // Close the database connection
    }
};

seedData();
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export const getRootCauses = () => {
    const rootCauses = process.env.ROOT_CAUSES;
    if (!rootCauses) {
        throw new Error('ROOT_CAUSES is not defined in the .env file');
    }
    return rootCauses.split(','); // Split the comma-separated string into an array
};

export const getIncidentStatuses = () => {
    const statuses = process.env.INCIDENT_STATUSES;
    if (!statuses) {
        throw new Error('INCIDENT_STATUSES is not defined in the .env file');
    }
    return statuses.split(','); // Split the comma-separated string into an array
};

export const getActionItemStatuses = () => {
    const statuses = process.env.ACTION_ITEM_STATUSES;
    if (!statuses) {
        throw new Error('ACTION_ITEM_STATUSES is not defined in the .env file');
    }
    return statuses.split(','); // Split the comma-separated string into an array
};

export const getUsers = () => {
    const users = process.env.USERS;
    if (!users) {
        throw new Error('USERS is not defined in the .env file');
    }
    return users.split(','); // Split the comma-separated string into an array
};
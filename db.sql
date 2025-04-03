-- Create the database
CREATE DATABASE IF NOT EXISTS incident_retrospective_tool;
USE incident_retrospective_tool;

-- Create the incidents table
CREATE TABLE incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    root_cause TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the action_items table
CREATE TABLE action_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT,
    action_item TEXT NOT NULL,
    assigned_to VARCHAR(255),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Insert sample data into incidents
INSERT INTO incidents (title, description, root_cause) VALUES
('Server Outage', 'The server went down due to high traffic.', 'Insufficient server capacity'),
('Database Corruption', 'Data corruption occurred in the user table.', 'Faulty database migration script'),
('API Downtime', 'The API was unavailable for 2 hours.', 'Expired SSL certificate');

-- Insert sample data into action_items
INSERT INTO action_items (incident_id, action_item, assigned_to, due_date) VALUES
(1, 'Upgrade server capacity', 'John Doe', '2025-04-10'),
(2, 'Fix database migration script', 'Jane Smith', '2025-04-15'),
(3, 'Renew SSL certificate', 'Alice Johnson', '2025-04-20');
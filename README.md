# Incident Retrospective Application

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Folder Structure](#folder-structure)
4. [API Endpoints](#api-endpoints)
5. [Installation](#installation)
6. [Running the Application](#running-the-application)
7. [Environment Variables](#environment-variables)

---

## 1. Project Overview
The **Incident Retrospective Application** is a web-based tool designed to manage incidents and their associated action items. It allows users to create, view, edit, and delete incidents and action items, assign responsibilities, and track progress.

---

## 2. Features
- **Incident Management**:
  - Create, view, edit, and delete incidents.
  - Assign root causes and descriptions to incidents.
- **Action Item Management**:
  - Create, view, edit, and delete action items.
  - Assign action items to users, set due dates, and track statuses.
- **Dynamic Filtering**:
  - Filter incidents and action items based on various criteria (e.g., status, assignee, root cause).
- **User Roles**:
  - Role-based access control for business users, engineers, and administrators.

---

## 3. Folder Structure

/src 
├── controllers/ # Business logic and database interaction 
├── models/ # Database models (if applicable) 
├── routes/ # API and web routes 
├── views/ # EJS templates for rendering pages 
│ ├── incidents/ # Incident-related views 
│ ├── actionItems/ # Action item-related views 
│ ├── partials/ # Shared partial templates (e.g., header, footer) 
├── public/ # Static assets (CSS, JS, images) 
│ ├── css/ # Stylesheets 
│ ├── js/ # Client-side JavaScript 
├── .env # Environment variables 
├── app.js # Main application entry point 
├── README.md # Documentation file

---

## 4. API Endpoints

### **Incidents**
| Method | Endpoint               | Description                     |
|--------|-------------------------|---------------------------------|
| GET    | `/incidents`           | View all incidents              |
| GET    | `/incidents/create`    | Render the create incident page |
| POST   | `/incidents/create`    | Create a new incident           |
| GET    | `/incidents/edit/:id`  | Render the edit incident page   |
| POST   | `/incidents/edit/:id`  | Update an existing incident     |
| POST   | `/incidents/delete/:id`| Delete an incident              |

### **Action Items**
| Method | Endpoint                  | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/action-items`           | View all action items                |
| GET    | `/action-items/create`    | Render the create action item page   |
| POST   | `/action-items`           | Create a new action item             |
| GET    | `/action-items/edit/:id`  | Render the edit action item page     |
| POST   | `/action-items/edit/:id`  | Update an existing action item       |
| POST   | `/action-items/delete/:id`| Delete an action item                |

---

## 5. Installation

### **Prerequisites**
- Node.js (v14 or higher)
- MySQL database

### **Steps**
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd incident-retrospective

2. Install dependencies:
    npm install

3. Set up the database:
    - Create a MySQL database.
    - Import the provided SQL schema (if available).

4. Configure environment variables:
    - Create a .env file in the root directory.
    - add the following variables:
        DB_HOST=root
        DB_USER=root
        DB_PASSWORD=yourpassword
        DB_NAME=yourdbname
        PORT=3000
        SECRET_KEY=yourkey
        JWT_SECRET=yoursecret
        AUTH_ENABLED=false
        ROOT_CAUSES=Power Failure,Memory Leak,Network Issue,Faulty Configuration,Human Error,Hardware Failure,Software Bug,Under Investigation
        INCIDENT_STATUSES=Identified,Under Investigation,Root Cause Identified,Action Plan Defined,Fix in Progress,Fix Deployed,Monitoring,Resolved,Closed,Escalated,Deferred,Reopened
        ACTION_ITEM_STATUSES=Not Started,In Progress,Blocked,Completed,Deferred,Cancelled
        USERS=Alice,Bob,Charlie,David

6. Running the Application
    Start the Development Server
        npm start
    Access the Application
        - Open your browser and navigate to:
            http://localhost:3000   

7. Environment Variables
|  Endpoint              | Description                          |
|------------------------|--------------------------------------------------|
|  DB_HOST               | Hostname of the MySQL database                   |
|  DB_USER               | MySQL username                                   |
|  DB_PASSWORD           | MySQL password                                   |
|  DB_NAME               | Name of the MySQL database                       |
|  PORT                  | Port number for the application                  |
|  SECRET_KEY            | Secret key for session management                |
|  JWT_SECRET            | Secret key for JWT authentication                |
|  AUTH_ENABLED          | Enable or disable authentication (true/false)    |
|  ROOT_CAUSES           | Comma-separated list of root causes              |
|  INCIDENT_STATUSES     | Comma-separated list of incident statuses        |
|  AUTH_ENABLED          | Enable or disable authentication (true/false)    |
|  ROOT_CAUSES           | Comma-separated list of root causes              |
|  ACTION_ITEM_STATUSES  | Comma-separated list of action item statuses     |

Notes:
    - Ensure the database is running before starting the application.
    - Use the provided SQL schema to set up the database tables.


8. Using Seed Data Scripts
    Purpose
        The seed data scripts are used to populate the database with initial data for testing and development purposes.

    Steps to Use Seed Data Scripts
    1. Navigate to the seed directory:

    2. Run the seed script:
            node seedData.js
            node seedUsers.js
    3. Verify the data:
        - Check the database to ensure the tables are populated with the seed data.
    
    Seed Data Includes
        - Users: Predefined users for testing.
        - Incidents: Sample incidents with various statuses and root causes.
        - Action Items: Sample action items linked to incidents.
    
    Notes
    Ensure the database is running before starting the application.
    Use the seed data scripts to quickly populate the database for testing.

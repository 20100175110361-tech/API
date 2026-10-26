# Task API Project — Backend (MVC) & Frontend

A complete Task List application built with **Node.js, Express, MySQL (Aiven), and Vanilla JavaScript**. 
This project follows the MVC (Model-View-Controller) architecture for the backend and includes a custom frontend to interact with the API.

## 📁 Project Structure

```text
task-api-project/
├── .env                  # Your secret DB credentials (Ignored by Git)
├── .env.example          # Template for environment variables
├── .gitignore            # Prevents node_modules and .env from being pushed
├── package.json          # Dependencies and scripts
├── server.js             # Entry point (Express app & middleware)
├── test-db.js            # Script to test database connection
├── database/
│   └── data.sql          # SQL script to create tables and seed data
├── src/                  # Backend Source Code (MVC Pattern)
│   ├── db.js             # MySQL connection pool
│   ├── routes/           
│   │   └── taskRoutes.js # Maps URLs to controllers
│   ├── controllers/      
│   │   └── taskController.js # Handles HTTP requests & validation
│   └── models/           
│       └── taskModel.js  # Handles raw SQL queries
└── frontend/             # Frontend Source Code
    ├── index.html        # UI Structure
    ├── style.css         # Styling
    └── app.js            # Fetch API logic to talk to the backend
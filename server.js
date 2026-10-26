// server.js — entry point
// Flow: request → routes → controllers → models → MySQL

require('dotenv').config(); // MUST be the first line to load .env

const express = require('express');
const path = require('path');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- SERVE THE FRONTEND ---
// This tells Express to serve the files inside your 'frontend' folder.
// If you go to http://localhost:3000, it will load your index.html!
app.use(express.static(path.join(__dirname, 'frontend')));

// --- API ROUTES ---
// All routes starting with /tasks go to taskRoutes
app.use('/tasks', taskRoutes);

// Health check endpoint for the API (optional if frontend is running)
app.get('/api/health', (req, res) => {
  res.json({ message: 'Task API is ready!', version: 'MySQL + MVC' });
});

// --- GLOBAL ERROR HANDLER ---
// MUST sit after every route. Express recognizes an error handler because it has 4 parameters.
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🖥️  Frontend available at the URL above`);
  console.log(`=========================================`);
  console.log('API Endpoints:');
  console.log('GET    /tasks');
  console.log('POST   /tasks');
  console.log('GET    /tasks/:id');
  console.log('PUT    /tasks/:id');
  console.log('PATCH  /tasks/:id');
  console.log('DELETE /tasks/:id');
});
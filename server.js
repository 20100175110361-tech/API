// server.js — Complete Flat Version with Fixed Aiven Connection
require('dotenv').config(); // MUST be the first line

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve your frontend folder (if you have one)
app.use(express.static(path.join(__dirname, 'frontend')));

// --- DATABASE CONNECTION CONFIGURATION ---
const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Aiven REQUIRES SSL. This fixes the "Lost connection" error.
if ((process.env.DB_SSL || '').toUpperCase() === 'REQUIRED') {
  poolConfig.ssl = {
    // If you downloaded a ca.pem from Aiven, uncomment the line below and add:
    // ca: require('fs').readFileSync('./ca.pem'),
    rejectUnauthorized: false // Setting this to false allows the connection without the CA file
  };
}

// Create the connection pool
const pool = mysql.createPool(poolConfig);

// --- ROUTES ---

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Task API is ready!', version: 'MySQL edition' });
});

// GET /tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /tasks
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, completed = false } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: 'Title is required' });
    }
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title.trim(), completed]
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be true or false' });
    }

    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title.trim(), completed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /tasks/:id
app.patch('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'Provide title or completed to update' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be true or false' });
      }
      updates.push('completed = ?');
      values.push(completed);
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log('You can test your API using Postman or the frontend.');
});
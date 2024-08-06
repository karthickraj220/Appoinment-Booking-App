const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Create table
db.serialize(() => {
  db.run(`
    CREATE TABLE appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      date TEXT,
      time TEXT
    )
  `);
});

// CRUD operations
app.post('/appointments', (req, res) => {
  const { name, email, phone, date, time } = req.body;
  db.run(
    `INSERT INTO appointments (name, email, phone, date, time) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, date, time],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get('/appointments', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  db.all(`SELECT * FROM appointments LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date, time } = req.body;
  db.run(
    `UPDATE appointments SET name = ?, email = ?, phone = ?, date = ?, time = ? WHERE id = ?`,
    [name, email, phone, date, time, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM appointments WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

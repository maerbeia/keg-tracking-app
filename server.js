const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('./kegs.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS kegs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'available',
      quantity INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keg_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      quantity_changed INTEGER,
      from_location TEXT,
      to_location TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      user TEXT,
      notes TEXT,
      FOREIGN KEY(keg_id) REFERENCES kegs(id)
    )
  `);
});

// Routes

// Get all kegs
app.get('/api/kegs', (req, res) => {
  db.all('SELECT * FROM kegs ORDER BY name', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Get single keg
app.get('/api/kegs/:id', (req, res) => {
  db.get('SELECT * FROM kegs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(row);
  });
});

// Get keg transaction history
app.get('/api/kegs/:id/history', (req, res) => {
  db.all(
    'SELECT * FROM transactions WHERE keg_id = ? ORDER BY timestamp DESC',
    [req.params.id],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Create new keg
app.post('/api/kegs', (req, res) => {
  const { name, type, location, quantity, notes } = req.body;
  db.run(
    'INSERT INTO kegs (name, type, location, quantity, notes) VALUES (?, ?, ?, ?, ?)',
    [name, type, location, quantity || 1, notes],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, message: 'Keg created' });
    }
  );
});

// Update keg
app.put('/api/kegs/:id', (req, res) => {
  const { name, type, location, status, quantity, notes } = req.body;
  db.run(
    'UPDATE kegs SET name = ?, type = ?, location = ?, status = ?, quantity = ?, notes = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
    [name, type, location, status, quantity, notes, req.params.id],
    function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: 'Keg updated' });
    }
  );
});

// Transfer keg (move between locations)
app.post('/api/kegs/:id/transfer', (req, res) => {
  const { to_location, user, notes } = req.body;
  const kegId = req.params.id;

  db.get('SELECT location FROM kegs WHERE id = ?', [kegId], (err, keg) => {
    if (err || !keg) {
      res.status(404).json({ error: 'Keg not found' });
      return;
    }

    const fromLocation = keg.location;

    db.run(
      'UPDATE kegs SET location = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [to_location, kegId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        db.run(
          'INSERT INTO transactions (keg_id, action, from_location, to_location, user, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [kegId, 'TRANSFER', fromLocation, to_location, user, notes],
          function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ message: 'Keg transferred' });
          }
        );
      }
    );
  });
});

// Adjust quantity
app.post('/api/kegs/:id/adjust', (req, res) => {
  const { quantity_changed, user, notes } = req.body;
  const kegId = req.params.id;

  db.run(
    'UPDATE kegs SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity_changed, kegId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.run(
        'INSERT INTO transactions (keg_id, action, quantity_changed, user, notes) VALUES (?, ?, ?, ?, ?)',
        [kegId, quantity_changed > 0 ? 'ADD' : 'REMOVE', quantity_changed, user, notes],
        function(err) {
          if (err) res.status(500).json({ error: err.message });
          else res.json({ message: 'Quantity adjusted' });
        }
      );
    }
  );
});

// Delete keg
app.delete('/api/kegs/:id', (req, res) => {
  db.run('DELETE FROM kegs WHERE id = ?', [req.params.id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ message: 'Keg deleted' });
  });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.render('dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Keg Tracking App running on http://localhost:${PORT}`);
});

const express = require('express');
const db = require('./db');
const xss = require('xss');

function createRouter(authMiddleware) {
  const router = express.Router();

  router.use(authMiddleware);

  // ---- TASKS ----

  router.get('/tasks', (req, res) => {
    try {
      const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
      res.json(tasks.map(t => ({ ...t, completed: !!t.completed })));
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/tasks', (req, res) => {
    const { title, due_date, priority, project } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    try {
      db.prepare('INSERT INTO tasks (id, user_id, title, due_date, priority, project) VALUES (?, ?, ?, ?, ?, ?)').run(
        id, req.userId, xss(title.trim()), due_date || '', priority || 'P2', project || ''
      );
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      res.json({ ...task, completed: !!task.completed });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/tasks/:id', (req, res) => {
    const { title, due_date, priority, project, completed } = req.body;
    try {
      const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
      if (!existing) return res.status(404).json({ error: 'Task not found' });
      db.prepare('UPDATE tasks SET title = ?, due_date = ?, priority = ?, project = ?, completed = ? WHERE id = ? AND user_id = ?').run(
        xss(title || existing.title), due_date !== undefined ? due_date : existing.due_date,
        priority || existing.priority, project !== undefined ? project : existing.project,
        completed !== undefined ? (completed ? 1 : 0) : existing.completed,
        req.params.id, req.userId
      );
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
      res.json({ ...task, completed: !!task.completed });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/tasks/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
      if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  // ---- PROJECTS ----

  router.get('/projects', (req, res) => {
    try {
      const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
      res.json(projects);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/projects', (req, res) => {
    const { name, color, due_date, priority } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const colors = ['#5b7fa5', '#4a8c6a', '#c0392b', '#c49a1a', '#6b5b7b', '#2d7d9a', '#c0764a'];
    try {
      const count = db.prepare('SELECT COUNT(*) as c FROM projects WHERE user_id = ?').get(req.userId);
      db.prepare('INSERT INTO projects (id, user_id, name, color, due_date, priority) VALUES (?, ?, ?, ?, ?, ?)').run(
        id, req.userId, xss(name.trim()), color || colors[count.c % colors.length], due_date || '', priority || 'P2'
      );
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      res.json(project);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/projects/:id', (req, res) => {
    const { name, color, due_date, priority } = req.body;
    try {
      const existing = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
      if (!existing) return res.status(404).json({ error: 'Project not found' });
      db.prepare('UPDATE projects SET name = ?, color = ?, due_date = ?, priority = ? WHERE id = ? AND user_id = ?').run(
        xss(name || existing.name), color || existing.color, due_date !== undefined ? due_date : existing.due_date,
        priority || existing.priority, req.params.id, req.userId
      );
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
      res.json(project);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/projects/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
      if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
      db.prepare('UPDATE tasks SET project = \'\' WHERE project = ? AND user_id = ?').run(req.params.id, req.userId);
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  // ---- LABELS ----

  router.get('/labels', (req, res) => {
    try {
      const labels = db.prepare('SELECT * FROM labels WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
      res.json(labels);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/labels', (req, res) => {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    try {
      db.prepare('INSERT INTO labels (id, user_id, name, color) VALUES (?, ?, ?, ?)').run(id, req.userId, xss(name.trim()), color || '#5b7fa5');
      const label = db.prepare('SELECT * FROM labels WHERE id = ?').get(id);
      res.json(label);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/labels/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM labels WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
      if (result.changes === 0) return res.status(404).json({ error: 'Label not found' });
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  // ---- TRADES ----

  router.get('/trades', (req, res) => {
    try {
      const trades = db.prepare('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
      res.json(trades);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.post('/trades', (req, res) => {
    const { date, pair, direction, result, entry_price, exit_price, qty, pnl, notes, image } = req.body;
    if (!pair || !pair.trim()) return res.status(400).json({ error: 'Pair is required' });
    try {
      const info = db.prepare('INSERT INTO trades (user_id, date, pair, direction, result, entry_price, exit_price, qty, pnl, notes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        req.userId, date || '', xss(pair.trim()), direction || 'Long', result || 'Win',
        entry_price || '', exit_price || '', qty || '', pnl || '', xss(notes || ''), image || ''
      );
      const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(info.lastInsertRowid);
      res.json(trade);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/trades/:id', (req, res) => {
    const { date, pair, direction, result, entry_price, exit_price, qty, pnl, notes, image } = req.body;
    try {
      const existing = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
      if (!existing) return res.status(404).json({ error: 'Trade not found' });
      db.prepare('UPDATE trades SET date = ?, pair = ?, direction = ?, result = ?, entry_price = ?, exit_price = ?, qty = ?, pnl = ?, notes = ?, image = ? WHERE id = ? AND user_id = ?').run(
        date !== undefined ? date : existing.date, pair ? xss(pair) : existing.pair,
        direction || existing.direction, result || existing.result,
        entry_price !== undefined ? entry_price : existing.entry_price,
        exit_price !== undefined ? exit_price : existing.exit_price,
        qty !== undefined ? qty : existing.qty, pnl !== undefined ? pnl : existing.pnl,
        notes !== undefined ? xss(notes) : existing.notes, image !== undefined ? image : existing.image,
        req.params.id, req.userId
      );
      const trade = db.prepare('SELECT * FROM trades WHERE id = ?').get(req.params.id);
      res.json(trade);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.delete('/trades/:id', (req, res) => {
    try {
      const result = db.prepare('DELETE FROM trades WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
      if (result.changes === 0) return res.status(404).json({ error: 'Trade not found' });
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  // ---- SETTINGS ----

  router.get('/settings', (req, res) => {
    try {
      const rows = db.prepare('SELECT key, value FROM settings WHERE user_id = ?').all(req.userId);
      const obj = {};
      rows.forEach(r => obj[r.key] = r.value);
      res.json(obj);
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  router.put('/settings', (req, res) => {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });
    try {
      db.prepare('INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value').run(req.userId, key, String(value));
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Server error' }); }
  });

  return router;
}

module.exports = createRouter;

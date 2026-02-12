import { Router } from 'express';
import db from '../db/database.js';
import { localDateISO } from '../lib/dates.js';

const router = Router();

// GET /api/tools — list all tool definitions
router.get('/', (req, res) => {
  const { category, tool_type, difficulty } = req.query;
  let sql = 'SELECT * FROM tool_definitions WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (tool_type) {
    sql += ' AND tool_type = ?';
    params.push(tool_type);
  }
  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }

  sql += ' ORDER BY category, name';
  const tools = db.prepare(sql).all(...params);
  res.json(tools);
});

// GET /api/tools/categories — list unique categories
router.get('/categories', (req, res) => {
  const categories = db.prepare(
    'SELECT DISTINCT category FROM tool_definitions ORDER BY category'
  ).all();
  res.json(categories.map(c => c.category));
});

// GET /api/tools/favorites — list favorite tool IDs
router.get('/favorites', (req, res) => {
  const rows = db.prepare(
    'SELECT tool_id FROM tool_favorites ORDER BY created_at DESC'
  ).all();
  res.json(rows.map(r => r.tool_id));
});

// POST /api/tools/favorites/:toolId — add favorite
router.post('/favorites/:toolId', (req, res) => {
  const toolId = Number(req.params.toolId);
  try {
    db.prepare('INSERT OR IGNORE INTO tool_favorites (tool_id) VALUES (?)').run(toolId);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/tools/favorites/:toolId — remove favorite
router.delete('/favorites/:toolId', (req, res) => {
  const toolId = Number(req.params.toolId);
  db.prepare('DELETE FROM tool_favorites WHERE tool_id = ?').run(toolId);
  res.json({ ok: true });
});

// GET /api/tools/sessions/history — get session history
router.get('/sessions/history', (req, res) => {
  const { tool_id, limit = 20, offset = 0 } = req.query;
  let sql = `SELECT ts.*, td.name as tool_name, td.slug as tool_slug, td.category as tool_category
    FROM tool_sessions ts
    JOIN tool_definitions td ON td.id = ts.tool_id
    WHERE 1=1`;
  const params = [];

  if (tool_id) {
    sql += ' AND ts.tool_id = ?';
    params.push(Number(tool_id));
  }

  sql += ' ORDER BY ts.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const sessions = db.prepare(sql).all(...params);
  res.json(sessions);
});

// GET /api/tools/sessions/stats — aggregate stats
router.get('/sessions/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM tool_sessions').get();
  const totalTime = db.prepare('SELECT COALESCE(SUM(duration_seconds), 0) as total FROM tool_sessions').get();
  const thisWeek = db.prepare(
    `SELECT COUNT(*) as count FROM tool_sessions WHERE date >= date('now', '-7 days')`
  ).get();
  const thisWeekTime = db.prepare(
    `SELECT COALESCE(SUM(duration_seconds), 0) as total FROM tool_sessions WHERE date >= date('now', '-7 days')`
  ).get();
  const mostUsed = db.prepare(
    `SELECT td.id, td.name, td.slug, td.category, COUNT(*) as sessions
     FROM tool_sessions ts JOIN tool_definitions td ON td.id = ts.tool_id
     GROUP BY ts.tool_id ORDER BY sessions DESC LIMIT 5`
  ).all();
  const byCategory = db.prepare(
    `SELECT td.category, COUNT(*) as sessions, COALESCE(SUM(ts.duration_seconds), 0) as total_seconds
     FROM tool_sessions ts JOIN tool_definitions td ON td.id = ts.tool_id
     GROUP BY td.category ORDER BY sessions DESC`
  ).all();

  res.json({
    totalSessions: total.count,
    totalSeconds: totalTime.total,
    weekSessions: thisWeek.count,
    weekSeconds: thisWeekTime.total,
    mostUsed,
    byCategory,
  });
});

// GET /api/tools/sessions/recent-tools — get recently-used tool IDs
router.get('/sessions/recent-tools', (req, res) => {
  const rows = db.prepare(
    `SELECT DISTINCT tool_id, MAX(created_at) as last_used
     FROM tool_sessions
     GROUP BY tool_id
     ORDER BY last_used DESC
     LIMIT 10`
  ).all();
  res.json(rows.map(r => r.tool_id));
});

// POST /api/tools/sessions — log a completed tool session
router.post('/sessions', (req, res) => {
  const { tool_id, duration_seconds, config, results, notes } = req.body;
  if (!tool_id) return res.status(400).json({ error: 'tool_id required' });

  const tool = db.prepare('SELECT id FROM tool_definitions WHERE id = ?').get(tool_id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });

  const result = db.prepare(
    `INSERT INTO tool_sessions (tool_id, date, duration_seconds, config, results, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(tool_id, localDateISO(), duration_seconds, config ? JSON.stringify(config) : null,
    results ? JSON.stringify(results) : null, notes);

  res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/tools/suggestions — favorites + recent + all tools in one call
router.get('/suggestions', (req, res) => {
  const favIds = db.prepare('SELECT tool_id FROM tool_favorites ORDER BY created_at DESC').all().map(r => r.tool_id);
  const recentIds = db.prepare(
    `SELECT DISTINCT tool_id, MAX(created_at) as last_used
     FROM tool_sessions GROUP BY tool_id ORDER BY last_used DESC LIMIT 10`
  ).all().map(r => r.tool_id);
  const allTools = db.prepare('SELECT * FROM tool_definitions ORDER BY category, name').all();
  res.json({ favoriteIds: favIds, recentIds, tools: allTools });
});

// GET /api/tools/:slug — get single tool by slug (must be last due to wildcard)
router.get('/:slug', (req, res) => {
  const tool = db.prepare('SELECT * FROM tool_definitions WHERE slug = ?').get(req.params.slug);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  res.json(tool);
});

export default router;

import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const { category, subcategory } = req.query;
  let sql = 'SELECT * FROM exercises WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (subcategory) { sql += ' AND subcategory = ?'; params.push(subcategory); }
  sql += ' ORDER BY category, subcategory, name';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json(exercise);
});

router.post('/', (req, res) => {
  const { name, category, subcategory, default_metric, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
  const result = db.prepare(
    'INSERT INTO exercises (name, category, subcategory, default_metric, description) VALUES (?, ?, ?, ?, ?)'
  ).run(name, category, subcategory || null, default_metric || 'reps', description || null);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

export default router;

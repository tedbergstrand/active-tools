import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM plans WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND (category = ? OR category = \'mixed\')'; params.push(category); }
  sql += ' ORDER BY is_active DESC, name';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const weeks = db.prepare('SELECT * FROM plan_weeks WHERE plan_id = ? ORDER BY week_number').all(plan.id);
  for (const week of weeks) {
    week.workouts = db.prepare('SELECT * FROM plan_workouts WHERE plan_week_id = ? ORDER BY day_of_week').all(week.id);
    for (const workout of week.workouts) {
      workout.exercises = db.prepare(`
        SELECT pwe.*, e.name as exercise_name, e.default_metric
        FROM plan_workout_exercises pwe
        JOIN exercises e ON e.id = pwe.exercise_id
        WHERE pwe.plan_workout_id = ?
        ORDER BY pwe.sort_order
      `).all(workout.id);
    }
  }

  res.json({ ...plan, weeks });
});

router.post('/', (req, res) => {
  const { name, category, duration_weeks, difficulty, goal, description } = req.body;
  if (!name || !category || !duration_weeks) {
    return res.status(400).json({ error: 'Name, category, and duration required' });
  }
  const result = db.prepare(
    'INSERT INTO plans (name, category, duration_weeks, difficulty, goal, description) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, category, duration_weeks, difficulty, goal, description);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Plan not found' });

  const { name, category, duration_weeks, difficulty, goal, description } = req.body;
  db.prepare(`
    UPDATE plans SET name=?, category=?, duration_weeks=?, difficulty=?, goal=?, description=?
    WHERE id=?
  `).run(name, category, duration_weeks, difficulty, goal, description, req.params.id);
  res.json({ success: true });
});

router.post('/:id/activate', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  db.transaction(() => {
    db.prepare('UPDATE plans SET is_active = 0 WHERE is_active = 1').run();
    db.prepare('UPDATE plans SET is_active = 1 WHERE id = ?').run(req.params.id);
  })();

  res.json({ success: true });
});

router.post('/:id/deactivate', (req, res) => {
  db.prepare('UPDATE plans SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Plan not found' });

  db.transaction(() => {
    const weeks = db.prepare('SELECT id FROM plan_weeks WHERE plan_id = ?').all(req.params.id);
    for (const week of weeks) {
      const workouts = db.prepare('SELECT id FROM plan_workouts WHERE plan_week_id = ?').all(week.id);
      for (const w of workouts) {
        db.prepare('DELETE FROM plan_workout_exercises WHERE plan_workout_id = ?').run(w.id);
      }
      db.prepare('DELETE FROM plan_workouts WHERE plan_week_id = ?').run(week.id);
    }
    db.prepare('DELETE FROM plan_weeks WHERE plan_id = ?').run(req.params.id);
    db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);
  })();

  res.json({ success: true });
});

export default router;

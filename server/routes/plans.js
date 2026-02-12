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

// Must be registered before /:id to avoid being caught by param route
router.get('/active/today', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE is_active = 1').get();
  if (!plan) return res.json({ plan: null, workouts: [] });

  const today = new Date().getDay(); // 0=Sunday, 6=Saturday

  const weeks = db.prepare('SELECT * FROM plan_weeks WHERE plan_id = ? ORDER BY week_number').all(plan.id);
  const weekIds = weeks.map(w => w.id);
  if (!weekIds.length) return res.json({ plan, workouts: [] });

  const allWorkouts = db.prepare(
    `SELECT * FROM plan_workouts WHERE plan_week_id IN (${weekIds.map(() => '?').join(',')}) AND day_of_week = ? ORDER BY plan_week_id`
  ).all(...weekIds, today);

  const workoutIds = allWorkouts.map(w => w.id);
  const allExercises = workoutIds.length
    ? db.prepare(`
        SELECT pwe.*, e.name as exercise_name, e.default_metric
        FROM plan_workout_exercises pwe
        JOIN exercises e ON e.id = pwe.exercise_id
        WHERE pwe.plan_workout_id IN (${workoutIds.map(() => '?').join(',')})
        ORDER BY pwe.sort_order
      `).all(...workoutIds)
    : [];

  const exercisesByWorkout = {};
  for (const ex of allExercises) {
    (exercisesByWorkout[ex.plan_workout_id] ??= []).push(ex);
  }

  // Check if logged today
  const todayDate = new Date().toISOString().split('T')[0];
  const loggedIds = workoutIds.length
    ? db.prepare(
        `SELECT DISTINCT plan_workout_id FROM workouts WHERE plan_workout_id IN (${workoutIds.map(() => '?').join(',')}) AND date = ?`
      ).all(...workoutIds, todayDate).map(r => r.plan_workout_id)
    : [];

  const workouts = allWorkouts.map(w => ({
    ...w,
    exercises: exercisesByWorkout[w.id] || [],
    logged_today: loggedIds.includes(w.id),
  }));

  res.json({ plan, workouts });
});

router.get('/:id/progress', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const weeks = db.prepare('SELECT id FROM plan_weeks WHERE plan_id = ?').all(plan.id);
  const weekIds = weeks.map(w => w.id);
  if (!weekIds.length) return res.json({ completions: {} });

  const allWorkouts = db.prepare(
    `SELECT id FROM plan_workouts WHERE plan_week_id IN (${weekIds.map(() => '?').join(',')})`
  ).all(...weekIds);
  const workoutIds = allWorkouts.map(w => w.id);

  if (!workoutIds.length) return res.json({ completions: {} });

  const logged = db.prepare(
    `SELECT plan_workout_id, COUNT(*) as count FROM workouts
     WHERE plan_workout_id IN (${workoutIds.map(() => '?').join(',')})
     GROUP BY plan_workout_id`
  ).all(...workoutIds);

  const completions = {};
  for (const row of logged) {
    completions[row.plan_workout_id] = row.count;
  }

  res.json({ completions });
});

router.get('/:id', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const weeks = db.prepare('SELECT * FROM plan_weeks WHERE plan_id = ? ORDER BY week_number').all(plan.id);
  const weekIds = weeks.map(w => w.id);

  const allWorkouts = weekIds.length
    ? db.prepare(`SELECT * FROM plan_workouts WHERE plan_week_id IN (${weekIds.map(() => '?').join(',')}) ORDER BY day_of_week`).all(...weekIds)
    : [];
  const workoutIds = allWorkouts.map(w => w.id);

  const allExercises = workoutIds.length
    ? db.prepare(`
        SELECT pwe.*, e.name as exercise_name, e.default_metric
        FROM plan_workout_exercises pwe
        JOIN exercises e ON e.id = pwe.exercise_id
        WHERE pwe.plan_workout_id IN (${workoutIds.map(() => '?').join(',')})
        ORDER BY pwe.sort_order
      `).all(...workoutIds)
    : [];

  const exercisesByWorkout = {};
  for (const ex of allExercises) {
    (exercisesByWorkout[ex.plan_workout_id] ??= []).push(ex);
  }
  const workoutsByWeek = {};
  for (const w of allWorkouts) {
    w.exercises = exercisesByWorkout[w.id] || [];
    (workoutsByWeek[w.plan_week_id] ??= []).push(w);
  }
  for (const week of weeks) {
    week.workouts = workoutsByWeek[week.id] || [];
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
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  db.prepare('UPDATE plans SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Plan not found' });

  // CASCADE handles plan_weeks → plan_workouts → plan_workout_exercises
  db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);

  res.json({ success: true });
});

export default router;

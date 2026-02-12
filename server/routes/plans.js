import { Router } from 'express';
import db from '../db/database.js';
import { generatePlanStructure, insertGeneratedStructure } from '../lib/planGenerator.js';

const router = Router();

// Must be before /:id param routes
router.post('/:id/generate', (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  try {
    const weeks = generatePlanStructure(plan);
    insertGeneratedStructure(plan.id, weeks);
    res.json({ success: true, weeks_generated: weeks.length });
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate plan structure' });
  }
});

router.get('/', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM plans WHERE 1=1';
  const params = [];
  if (category) {
    const validCats = ['roped', 'bouldering', 'traditional', 'mixed'];
    if (!validCats.includes(category)) return res.status(400).json({ error: 'Invalid category' });
    sql += ' AND (category = ? OR category = \'mixed\')'; params.push(category);
  }
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
  const validCats = ['roped', 'bouldering', 'traditional', 'mixed'];
  if (!validCats.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  const weeks = Number(duration_weeks);
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) return res.status(400).json({ error: 'Duration must be 1-52 weeks' });
  if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) return res.status(400).json({ error: 'Invalid difficulty' });
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

// --- Plan structure management (weeks, workouts, exercises) ---

// PUT /:id/structure — Replace entire plan structure atomically
router.put('/:id/structure', (req, res) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const { weeks } = req.body;
  if (!Array.isArray(weeks)) return res.status(400).json({ error: 'weeks array required' });

  db.transaction(() => {
    // Clear existing structure (CASCADE handles children)
    db.prepare('DELETE FROM plan_weeks WHERE plan_id = ?').run(req.params.id);

    const insertWeek = db.prepare('INSERT INTO plan_weeks (plan_id, week_number, focus) VALUES (?, ?, ?)');
    const insertWorkout = db.prepare('INSERT INTO plan_workouts (plan_week_id, day_of_week, title, category) VALUES (?, ?, ?, ?)');
    const insertExercise = db.prepare(
      'INSERT INTO plan_workout_exercises (plan_workout_id, exercise_id, sort_order, target_sets, target_reps, target_weight, target_duration, target_grade, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (const week of weeks) {
      const weekResult = insertWeek.run(req.params.id, week.week_number, week.focus || null);
      const weekId = weekResult.lastInsertRowid;

      if (week.workouts?.length) {
        for (const workout of week.workouts) {
          if (!workout.title || !workout.category) continue;
          const dow = Number(workout.day_of_week);
          if (isNaN(dow) || dow < 0 || dow > 6) continue;
          const wResult = insertWorkout.run(weekId, dow, workout.title, workout.category);
          const workoutId = wResult.lastInsertRowid;

          if (workout.exercises?.length) {
            for (let i = 0; i < workout.exercises.length; i++) {
              const ex = workout.exercises[i];
              if (!ex.exercise_id) continue;
              insertExercise.run(
                workoutId, ex.exercise_id, i,
                ex.target_sets || null, ex.target_reps || null,
                ex.target_weight || null, ex.target_duration || null,
                ex.target_grade || null, ex.notes || null
              );
            }
          }
        }
      }
    }
  })();

  res.json({ success: true });
});

// POST /:id/weeks — Add a single week
router.post('/:id/weeks', (req, res) => {
  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const maxWeek = db.prepare('SELECT MAX(week_number) as max FROM plan_weeks WHERE plan_id = ?').get(req.params.id);
  const weekNumber = (maxWeek?.max || 0) + 1;
  const { focus } = req.body;

  const result = db.prepare('INSERT INTO plan_weeks (plan_id, week_number, focus) VALUES (?, ?, ?)').run(req.params.id, weekNumber, focus || null);
  res.status(201).json({ id: result.lastInsertRowid, week_number: weekNumber, focus: focus || null, workouts: [] });
});

// DELETE /weeks/:weekId
router.delete('/weeks/:weekId', (req, res) => {
  const week = db.prepare('SELECT id FROM plan_weeks WHERE id = ?').get(req.params.weekId);
  if (!week) return res.status(404).json({ error: 'Week not found' });
  db.prepare('DELETE FROM plan_weeks WHERE id = ?').run(req.params.weekId);
  res.json({ success: true });
});

// POST /weeks/:weekId/workouts — Add a workout to a week
router.post('/weeks/:weekId/workouts', (req, res) => {
  const week = db.prepare('SELECT id FROM plan_weeks WHERE id = ?').get(req.params.weekId);
  if (!week) return res.status(404).json({ error: 'Week not found' });

  const { day_of_week, title, category } = req.body;
  if (title == null || category == null || day_of_week == null) {
    return res.status(400).json({ error: 'day_of_week, title, and category required' });
  }
  const dow = Number(day_of_week);
  if (isNaN(dow) || dow < 0 || dow > 6) return res.status(400).json({ error: 'day_of_week must be 0-6' });

  const validCats = ['roped', 'bouldering', 'traditional'];
  if (!validCats.includes(category)) return res.status(400).json({ error: 'Invalid category' });

  const result = db.prepare('INSERT INTO plan_workouts (plan_week_id, day_of_week, title, category) VALUES (?, ?, ?, ?)').run(req.params.weekId, dow, title, category);
  res.status(201).json({ id: result.lastInsertRowid, plan_week_id: week.id, day_of_week: dow, title, category, exercises: [] });
});

// PUT /workouts/:workoutId — Update a plan workout
router.put('/workouts/:workoutId', (req, res) => {
  const workout = db.prepare('SELECT id FROM plan_workouts WHERE id = ?').get(req.params.workoutId);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const { day_of_week, title, category, exercises } = req.body;

  db.transaction(() => {
    if (title != null || day_of_week != null || category != null) {
      const current = db.prepare('SELECT * FROM plan_workouts WHERE id = ?').get(req.params.workoutId);
      db.prepare('UPDATE plan_workouts SET day_of_week=?, title=?, category=? WHERE id=?').run(
        day_of_week ?? current.day_of_week, title ?? current.title, category ?? current.category, req.params.workoutId
      );
    }

    if (Array.isArray(exercises)) {
      db.prepare('DELETE FROM plan_workout_exercises WHERE plan_workout_id = ?').run(req.params.workoutId);
      const insertEx = db.prepare(
        'INSERT INTO plan_workout_exercises (plan_workout_id, exercise_id, sort_order, target_sets, target_reps, target_weight, target_duration, target_grade, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        if (!ex.exercise_id) continue;
        insertEx.run(
          req.params.workoutId, ex.exercise_id, i,
          ex.target_sets || null, ex.target_reps || null,
          ex.target_weight || null, ex.target_duration || null,
          ex.target_grade || null, ex.notes || null
        );
      }
    }
  })();

  res.json({ success: true });
});

// DELETE /workouts/:workoutId
router.delete('/workouts/:workoutId', (req, res) => {
  const workout = db.prepare('SELECT id FROM plan_workouts WHERE id = ?').get(req.params.workoutId);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  db.prepare('DELETE FROM plan_workouts WHERE id = ?').run(req.params.workoutId);
  res.json({ success: true });
});

export default router;

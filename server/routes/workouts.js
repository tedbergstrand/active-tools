import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  let sql = 'SELECT * FROM workouts WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const workouts = db.prepare(sql).all(...params);
  const total = db.prepare(
    `SELECT COUNT(*) as count FROM workouts${category ? ' WHERE category = ?' : ''}`
  ).get(...(category ? [category] : []));

  res.json({ workouts, total: total.count });
});

router.get('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const exercises = db.prepare(`
    SELECT we.*, e.name as exercise_name, e.category as exercise_category,
           e.subcategory, e.default_metric
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we.sort_order
  `).all(req.params.id);

  const allSets = db.prepare(`
    SELECT ws.* FROM workout_sets ws
    WHERE ws.workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)
    ORDER BY ws.workout_exercise_id, ws.set_number
  `).all(req.params.id);

  const setsByExercise = {};
  for (const s of allSets) {
    (setsByExercise[s.workout_exercise_id] ??= []).push(s);
  }
  for (const ex of exercises) {
    ex.sets = setsByExercise[ex.id] || [];
  }

  res.json({ ...workout, exercises });
});

router.post('/', (req, res) => {
  const { category, date, duration_minutes, location, notes, rpe, plan_workout_id, exercises } = req.body;
  if (!category) return res.status(400).json({ error: 'Category required' });

  const result = db.transaction(() => {
    const w = db.prepare(`
      INSERT INTO workouts (category, date, duration_minutes, location, notes, rpe, plan_workout_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(category, date || new Date().toISOString().split('T')[0], duration_minutes, location, notes, rpe, plan_workout_id);

    const workoutId = w.lastInsertRowid;

    if (exercises?.length) {
      const insertEx = db.prepare(
        'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order, notes) VALUES (?, ?, ?, ?)'
      );
      const insertSet = db.prepare(`
        INSERT INTO workout_sets (workout_exercise_id, set_number, grade, send_type, wall_angle,
          route_name, reps, weight_kg, duration_seconds, grip_type, edge_size_mm, rest_seconds, completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exercises.forEach((ex, i) => {
        const exResult = insertEx.run(workoutId, ex.exercise_id, ex.sort_order ?? i, ex.notes);
        const weId = exResult.lastInsertRowid;
        ex.sets?.forEach((set, j) => {
          insertSet.run(weId, j + 1, set.grade, set.send_type, set.wall_angle,
            set.route_name, set.reps, set.weight_kg, set.duration_seconds,
            set.grip_type, set.edge_size_mm, set.rest_seconds, set.completed ?? 1);
        });
      });
    }

    return workoutId;
  })();

  res.status(201).json({ id: result });
});

router.put('/:id', (req, res) => {
  const { category, date, duration_minutes, location, notes, rpe, exercises } = req.body;
  const existing = db.prepare('SELECT id FROM workouts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Workout not found' });

  db.transaction(() => {
    db.prepare(`
      UPDATE workouts SET category=?, date=?, duration_minutes=?, location=?, notes=?, rpe=?
      WHERE id=?
    `).run(category, date, duration_minutes, location, notes, rpe, req.params.id);

    // Replace exercises and sets (CASCADE handles workout_sets)
    db.prepare('DELETE FROM workout_exercises WHERE workout_id = ?').run(req.params.id);

    if (exercises?.length) {
      const insertEx = db.prepare(
        'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order, notes) VALUES (?, ?, ?, ?)'
      );
      const insertSet = db.prepare(`
        INSERT INTO workout_sets (workout_exercise_id, set_number, grade, send_type, wall_angle,
          route_name, reps, weight_kg, duration_seconds, grip_type, edge_size_mm, rest_seconds, completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      exercises.forEach((ex, i) => {
        const exResult = insertEx.run(req.params.id, ex.exercise_id, ex.sort_order ?? i, ex.notes);
        const weId = exResult.lastInsertRowid;
        ex.sets?.forEach((set, j) => {
          insertSet.run(weId, j + 1, set.grade, set.send_type, set.wall_angle,
            set.route_name, set.reps, set.weight_kg, set.duration_seconds,
            set.grip_type, set.edge_size_mm, set.rest_seconds, set.completed ?? 1);
        });
      });
    }
  })();

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM workouts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Workout not found' });

  // CASCADE handles workout_exercises → workout_sets
  db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);

  res.json({ success: true });
});

export default router;

import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const format = req.query.format || 'json';

  const workouts = db.prepare('SELECT * FROM workouts ORDER BY date DESC').all();
  const allExercises = db.prepare(`
    SELECT we.*, e.name as exercise_name, e.category as exercise_category, e.subcategory
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    ORDER BY we.workout_id, we.sort_order
  `).all();
  const allSets = db.prepare(`
    SELECT ws.* FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    ORDER BY ws.workout_exercise_id, ws.set_number
  `).all();

  const setsByExercise = {};
  for (const s of allSets) {
    (setsByExercise[s.workout_exercise_id] ??= []).push(s);
  }
  const exercisesByWorkout = {};
  for (const ex of allExercises) {
    ex.sets = setsByExercise[ex.id] || [];
    (exercisesByWorkout[ex.workout_id] ??= []).push(ex);
  }
  for (const w of workouts) {
    w.exercises = exercisesByWorkout[w.id] || [];
  }

  if (format === 'csv') {
    const headers = [
      'workout_id', 'date', 'category', 'duration_minutes', 'location', 'notes', 'rpe',
      'exercise_name', 'exercise_category', 'set_number',
      'grade', 'send_type', 'wall_angle', 'route_name',
      'reps', 'weight_kg', 'duration_seconds', 'grip_type', 'edge_size_mm', 'rest_seconds',
    ];

    const rows = [headers.join(',')];
    for (const w of workouts) {
      if (w.exercises.length === 0) {
        rows.push([
          w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
          '', '', '', '', '', '', '', '', '', '', '', '', '',
        ].join(','));
      }
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          rows.push([
            w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
            csvEscape(ex.exercise_name), ex.exercise_category, s.set_number,
            s.grade || '', s.send_type || '', s.wall_angle || '', csvEscape(s.route_name),
            s.reps ?? '', s.weight_kg ?? '', s.duration_seconds ?? '', s.grip_type || '', s.edge_size_mm ?? '', s.rest_seconds ?? '',
          ].join(','));
        }
        if (ex.sets.length === 0) {
          rows.push([
            w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
            csvEscape(ex.exercise_name), ex.exercise_category, '', '', '', '', '', '', '', '', '', '', '',
          ].join(','));
        }
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="climbing-workouts.csv"');
    res.send(rows.join('\n'));
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="climbing-workouts.json"');
    res.json(workouts);
  }
});

function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default router;

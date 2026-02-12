import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CSV_HEADERS = [
  'workout_id', 'date', 'category', 'duration_minutes', 'location', 'notes', 'rpe',
  'exercise_name', 'exercise_category', 'set_number',
  'grade', 'send_type', 'wall_angle', 'route_name',
  'reps', 'weight_kg', 'duration_seconds', 'grip_type', 'edge_size_mm', 'rest_seconds',
];

router.get('/', (req, res) => {
  const format = req.query.format || 'json';

  // Use chunked processing — iterate workouts in batches
  const BATCH = 100;
  const totalCount = db.prepare('SELECT COUNT(*) as c FROM workouts').get().c;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="climbing-workouts.csv"');
    res.write(CSV_HEADERS.join(',') + '\n');

    for (let offset = 0; offset < totalCount; offset += BATCH) {
      const workouts = db.prepare('SELECT * FROM workouts ORDER BY date DESC LIMIT ? OFFSET ?').all(BATCH, offset);
      if (!workouts.length) break;

      const ids = workouts.map(w => w.id);
      const exercises = db.prepare(`
        SELECT we.*, e.name as exercise_name, e.category as exercise_category
        FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id IN (${ids.map(() => '?').join(',')})
        ORDER BY we.workout_id, we.sort_order
      `).all(...ids);

      const weIds = exercises.map(ex => ex.id);
      const sets = weIds.length
        ? db.prepare(`SELECT * FROM workout_sets WHERE workout_exercise_id IN (${weIds.map(() => '?').join(',')}) ORDER BY workout_exercise_id, set_number`).all(...weIds)
        : [];

      const setsByEx = {};
      for (const s of sets) (setsByEx[s.workout_exercise_id] ??= []).push(s);
      const exByWorkout = {};
      for (const ex of exercises) {
        ex.sets = setsByEx[ex.id] || [];
        (exByWorkout[ex.workout_id] ??= []).push(ex);
      }

      for (const w of workouts) {
        const wExercises = exByWorkout[w.id] || [];
        if (wExercises.length === 0) {
          res.write([
            w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
            '', '', '', '', '', '', '', '', '', '', '', '', '',
          ].join(',') + '\n');
        }
        for (const ex of wExercises) {
          if (ex.sets.length === 0) {
            res.write([
              w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
              csvEscape(ex.exercise_name), ex.exercise_category, '', '', '', '', '', '', '', '', '', '', '',
            ].join(',') + '\n');
          }
          for (const s of ex.sets) {
            res.write([
              w.id, w.date, w.category, w.duration_minutes || '', csvEscape(w.location), csvEscape(w.notes), w.rpe || '',
              csvEscape(ex.exercise_name), ex.exercise_category, s.set_number,
              s.grade || '', s.send_type || '', s.wall_angle || '', csvEscape(s.route_name),
              s.reps ?? '', s.weight_kg ?? '', s.duration_seconds ?? '', s.grip_type || '', s.edge_size_mm ?? '', s.rest_seconds ?? '',
            ].join(',') + '\n');
          }
        }
      }
    }

    res.end();
  } else {
    // JSON — stream as array
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="climbing-workouts.json"');
    res.write('[');
    let first = true;

    for (let offset = 0; offset < totalCount; offset += BATCH) {
      const workouts = db.prepare('SELECT * FROM workouts ORDER BY date DESC LIMIT ? OFFSET ?').all(BATCH, offset);
      if (!workouts.length) break;

      const ids = workouts.map(w => w.id);
      const exercises = db.prepare(`
        SELECT we.*, e.name as exercise_name, e.category as exercise_category, e.subcategory
        FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id IN (${ids.map(() => '?').join(',')})
        ORDER BY we.workout_id, we.sort_order
      `).all(...ids);

      const weIds = exercises.map(ex => ex.id);
      const sets = weIds.length
        ? db.prepare(`SELECT * FROM workout_sets WHERE workout_exercise_id IN (${weIds.map(() => '?').join(',')}) ORDER BY workout_exercise_id, set_number`).all(...weIds)
        : [];

      const setsByEx = {};
      for (const s of sets) (setsByEx[s.workout_exercise_id] ??= []).push(s);
      const exByWorkout = {};
      for (const ex of exercises) {
        ex.sets = setsByEx[ex.id] || [];
        (exByWorkout[ex.workout_id] ??= []).push(ex);
      }

      for (const w of workouts) {
        w.exercises = exByWorkout[w.id] || [];
        if (!first) res.write(',');
        res.write(JSON.stringify(w));
        first = false;
      }
    }

    res.write(']');
    res.end();
  }
});

export default router;

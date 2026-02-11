import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/summary', (req, res) => {
  const { category, days = 30 } = req.query;
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  let whereClause = 'WHERE w.date >= ?';
  const params = [since];
  if (category) { whereClause += ' AND w.category = ?'; params.push(category); }

  const totalWorkouts = db.prepare(
    `SELECT COUNT(*) as count FROM workouts w ${whereClause}`
  ).get(...params).count;

  const totalDuration = db.prepare(
    `SELECT COALESCE(SUM(duration_minutes), 0) as total FROM workouts w ${whereClause}`
  ).get(...params).total;

  const avgRpe = db.prepare(
    `SELECT ROUND(AVG(rpe), 1) as avg FROM workouts w ${whereClause} AND rpe IS NOT NULL`
  ).get(...params).avg;

  const totalSets = db.prepare(`
    SELECT COUNT(*) as count FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    ${whereClause}
  `).get(...params).count;

  res.json({ totalWorkouts, totalDuration, avgRpe, totalSets, days: Number(days) });
});

router.get('/grades', (req, res) => {
  const { category, days = 90 } = req.query;
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  let whereClause = 'WHERE w.date >= ? AND ws.grade IS NOT NULL';
  const params = [since];
  if (category) { whereClause += ' AND w.category = ?'; params.push(category); }

  const grades = db.prepare(`
    SELECT w.date, ws.grade, ws.send_type, w.category
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    ${whereClause}
    ORDER BY w.date
  `).all(...params);

  res.json(grades);
});

router.get('/volume', (req, res) => {
  const { days = 90 } = req.query;
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const volume = db.prepare(`
    SELECT
      strftime('%Y-W%W', w.date) as week,
      w.category,
      COUNT(DISTINCT w.id) as sessions,
      COALESCE(SUM(w.duration_minutes), 0) as total_minutes,
      COUNT(ws.id) as total_sets
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE w.date >= ?
    GROUP BY week, w.category
    ORDER BY week
  `).all(since);

  res.json(volume);
});

router.get('/frequency', (req, res) => {
  const { days = 365 } = req.query;
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const frequency = db.prepare(`
    SELECT w.date, w.category, COUNT(*) as count
    FROM workouts w
    WHERE w.date >= ?
    GROUP BY w.date, w.category
    ORDER BY w.date
  `).all(since);

  res.json(frequency);
});

router.get('/personal-records', (req, res) => {
  const { category } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];
  if (category) { whereClause += ' AND w.category = ?'; params.push(category); }

  // Highest grades
  const highestGrades = db.prepare(`
    SELECT ws.grade, ws.send_type, w.date, w.category, e.name as exercise_name
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercises e ON e.id = we.exercise_id
    ${whereClause} AND ws.grade IS NOT NULL AND ws.send_type IN ('onsight', 'flash', 'redpoint')
    ORDER BY ws.grade DESC
    LIMIT 10
  `).all(...params);

  // Max weight on weighted exercises
  const maxWeights = db.prepare(`
    SELECT MAX(ws.weight_kg) as max_weight, e.name as exercise_name, w.date
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercises e ON e.id = we.exercise_id
    ${whereClause} AND ws.weight_kg IS NOT NULL AND ws.weight_kg > 0
    GROUP BY e.name
    ORDER BY max_weight DESC
  `).all(...params);

  // Max reps
  const maxReps = db.prepare(`
    SELECT MAX(ws.reps) as max_reps, e.name as exercise_name, w.date
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercises e ON e.id = we.exercise_id
    ${whereClause} AND ws.reps IS NOT NULL
    GROUP BY e.name
    ORDER BY max_reps DESC
  `).all(...params);

  // Max duration
  const maxDurations = db.prepare(`
    SELECT MAX(ws.duration_seconds) as max_duration, e.name as exercise_name, w.date
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercises e ON e.id = we.exercise_id
    ${whereClause} AND ws.duration_seconds IS NOT NULL
    GROUP BY e.name
    ORDER BY max_duration DESC
  `).all(...params);

  res.json({ highestGrades, maxWeights, maxReps, maxDurations });
});

export default router;

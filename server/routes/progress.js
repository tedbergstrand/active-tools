import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// Grade ranking for correct sorting (alphabetical ORDER BY gets V9 > V10 wrong)
const GRADE_ORDER = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
  'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17',
  '5.5', '5.6', '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d',
  '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d',
  '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d',
  '5.15a', '5.15b', '5.15c',
];
const GRADE_RANK = Object.fromEntries(GRADE_ORDER.map((g, i) => [g, i]));
function gradeRank(g) { return GRADE_RANK[g] ?? -1; }

function parseDays(raw, fallback) {
  const n = Number(raw);
  return Math.max(1, Math.min(3650, Number.isNaN(n) ? fallback : n));
}

router.get('/summary', (req, res) => {
  const { category } = req.query;
  const days = parseDays(req.query.days, 30);
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
  const { category } = req.query;
  const days = parseDays(req.query.days, 90);
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
  const days = parseDays(req.query.days, 90);
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
  const days = parseDays(req.query.days, 365);
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

router.get('/streak', (req, res) => {
  const dates = db.prepare(
    `SELECT DISTINCT date FROM workouts ORDER BY date DESC`
  ).all().map(r => r.date);

  if (dates.length === 0) return res.json({ current: 0, longest: 0 });

  // Calculate current streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let current = 0;

  if (dates[0] === today || dates[0] === yesterday) {
    let checkDate = new Date(dates[0]);
    const dateSet = new Set(dates);
    while (dateSet.has(checkDate.toISOString().split('T')[0])) {
      current++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  }

  // Calculate longest streak
  let longest = 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  res.json({ current, longest });
});

router.get('/trends', (req, res) => {
  const { category } = req.query;
  const days = parseDays(req.query.days, 30);
  const now = Date.now();
  const currentStart = new Date(now - days * 86400000).toISOString().split('T')[0];
  const previousStart = new Date(now - days * 2 * 86400000).toISOString().split('T')[0];
  const currentEnd = new Date(now).toISOString().split('T')[0];

  function periodStats(since, until) {
    let where = 'WHERE w.date >= ? AND w.date <= ?';
    const params = [since, until];
    if (category) { where += ' AND w.category = ?'; params.push(category); }

    const workouts = db.prepare(`SELECT COUNT(*) as c FROM workouts w ${where}`).get(...params).c;
    const duration = db.prepare(`SELECT COALESCE(SUM(duration_minutes),0) as d FROM workouts w ${where}`).get(...params).d;
    const rpe = db.prepare(`SELECT ROUND(AVG(rpe),1) as r FROM workouts w ${where} AND rpe IS NOT NULL`).get(...params).r;
    return { workouts, duration, rpe };
  }

  const current = periodStats(currentStart, currentEnd);
  const previous = periodStats(previousStart, currentStart);

  function pctChange(cur, prev) {
    if (!prev || prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  }

  res.json({
    workouts: { value: current.workouts, change: pctChange(current.workouts, previous.workouts) },
    duration: { value: current.duration, change: pctChange(current.duration, previous.duration) },
    rpe: { value: current.rpe, change: current.rpe && previous.rpe ? Math.round((current.rpe - previous.rpe) * 10) / 10 : 0 },
  });
});

router.get('/distribution', (req, res) => {
  const days = parseDays(req.query.days, 90);
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT category, COUNT(*) as sessions, COALESCE(SUM(duration_minutes), 0) as total_minutes
    FROM workouts WHERE date >= ?
    GROUP BY category
  `).all(since);

  res.json(rows);
});

router.get('/rpe-trend', (req, res) => {
  const days = parseDays(req.query.days, 90);
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT date, ROUND(AVG(rpe), 1) as avg_rpe
    FROM workouts
    WHERE date >= ? AND rpe IS NOT NULL
    GROUP BY date
    ORDER BY date
  `).all(since);

  res.json(rows);
});

router.get('/personal-records', (req, res) => {
  const { category } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];
  if (category) { whereClause += ' AND w.category = ?'; params.push(category); }

  // Highest grades — sort by grade rank in JS (SQL alphabetical sort gets V9 > V10 wrong)
  const highestGrades = db.prepare(`
    SELECT ws.grade, ws.send_type, w.date, w.category, e.name as exercise_name
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercises e ON e.id = we.exercise_id
    ${whereClause} AND ws.grade IS NOT NULL AND ws.send_type IN ('onsight', 'flash', 'redpoint')
    LIMIT 10000
  `).all(...params)
    .sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade))
    .slice(0, 10);

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

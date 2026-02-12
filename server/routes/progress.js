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

  // Tool session stats for the same period
  const toolSessions = db.prepare(
    `SELECT COUNT(*) as count, COALESCE(SUM(duration_seconds), 0) as seconds
     FROM tool_sessions WHERE date >= ?`
  ).get(since);

  res.json({
    totalWorkouts, totalDuration, avgRpe, totalSets, days: Number(days),
    toolSessions: toolSessions.count,
    toolMinutes: Math.round(toolSessions.seconds / 60),
  });
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
    SELECT date, category, SUM(cnt) as count FROM (
      SELECT w.date, w.category, COUNT(*) as cnt
      FROM workouts w WHERE w.date >= ?
      GROUP BY w.date, w.category
      UNION ALL
      SELECT ts.date, 'tools' as category, COUNT(*) as cnt
      FROM tool_sessions ts WHERE ts.date >= ?
      GROUP BY ts.date
    ) GROUP BY date, category
    ORDER BY date
  `).all(since, since);

  res.json(frequency);
});

router.get('/streak', (req, res) => {
  // Include both workout dates and tool session dates
  const dates = db.prepare(
    `SELECT DISTINCT date FROM (
       SELECT date FROM workouts
       UNION
       SELECT date FROM tool_sessions
     ) ORDER BY date DESC`
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
    SELECT category, SUM(sessions) as sessions, SUM(total_minutes) as total_minutes FROM (
      SELECT category, COUNT(*) as sessions, COALESCE(SUM(duration_minutes), 0) as total_minutes
      FROM workouts WHERE date >= ? GROUP BY category
      UNION ALL
      SELECT 'tools' as category, COUNT(*) as sessions, ROUND(COALESCE(SUM(duration_seconds), 0) / 60.0) as total_minutes
      FROM tool_sessions WHERE date >= ?
    ) GROUP BY category
  `).all(since, since);

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

// Smart recovery analysis
router.get('/recovery', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Get recent workout dates with RPE
  const recentWorkouts = db.prepare(`
    SELECT date, rpe, duration_minutes FROM workouts
    WHERE date >= date(?, '-30 days')
    ORDER BY date DESC
  `).all(today);

  if (recentWorkouts.length === 0) {
    return res.json({ status: 'welcome_back', days_since_rest: 0, consecutive_training_days: 0, high_rpe_streak: 0, volume_spike_pct: 0, suggest_deload: false, nudge: 'Welcome! Ready to start training?' });
  }

  // Days since last training
  const daysSinceTraining = recentWorkouts.length > 0
    ? Math.floor((Date.now() - new Date(recentWorkouts[0].date).getTime()) / 86400000)
    : 999;

  if (daysSinceTraining >= 3) {
    return res.json({ status: 'welcome_back', days_since_rest: daysSinceTraining, consecutive_training_days: 0, high_rpe_streak: 0, volume_spike_pct: 0, suggest_deload: false, nudge: `Welcome back! It's been ${daysSinceTraining} days since your last session.` });
  }

  // Get distinct training dates
  const trainingDates = [...new Set(recentWorkouts.map(w => w.date))].sort().reverse();

  // Consecutive training days (from most recent)
  let consecutive = 0;
  let checkDate = new Date(trainingDates[0]);
  const dateSet = new Set(trainingDates);
  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    consecutive++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  // Days since last rest (first gap in training dates)
  let daysSinceRest = consecutive;

  // High RPE streak: consecutive dates with avg RPE >= 8
  let highRpeStreak = 0;
  for (const date of trainingDates) {
    const dayWorkouts = recentWorkouts.filter(w => w.date === date && w.rpe != null);
    if (dayWorkouts.length === 0) break;
    const avgRpe = dayWorkouts.reduce((s, w) => s + w.rpe, 0) / dayWorkouts.length;
    if (avgRpe >= 8) highRpeStreak++;
    else break;
  }

  // Volume spike: current week vs 4-week rolling average
  const weeklyVolume = [];
  for (let i = 0; i < 5; i++) {
    const weekEnd = new Date(Date.now() - i * 7 * 86400000).toISOString().split('T')[0];
    const weekStart = new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString().split('T')[0];
    const vol = db.prepare(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM workouts WHERE date > ? AND date <= ?'
    ).get(weekStart, weekEnd).total;
    weeklyVolume.push(vol);
  }
  const currentWeekVol = weeklyVolume[0];
  const avgPreviousWeeks = weeklyVolume.slice(1).reduce((s, v) => s + v, 0) / 4;
  const volumeSpikePct = avgPreviousWeeks > 0 ? Math.round(((currentWeekVol - avgPreviousWeeks) / avgPreviousWeeks) * 100) : 0;

  // Sustained high volume: 3+ consecutive above-average weeks
  let aboveAvgStreak = 0;
  for (let i = 0; i < 4; i++) {
    if (weeklyVolume[i] > avgPreviousWeeks * 1.1) aboveAvgStreak++;
    else break;
  }
  const suggestDeload = aboveAvgStreak >= 3;

  // Determine status and nudge
  let status = 'good';
  let nudge = null;

  if (consecutive >= 7) {
    status = 'needs_rest';
    nudge = `You've trained ${consecutive} days straight. Your body needs recovery to get stronger.`;
  } else if (highRpeStreak >= 3) {
    status = 'needs_rest';
    nudge = `${highRpeStreak} consecutive high-intensity sessions (RPE 8+). Consider an easy day or rest.`;
  } else if (volumeSpikePct >= 50) {
    status = 'moderate';
    nudge = `This week's volume is ${volumeSpikePct}% above your recent average. Watch for fatigue.`;
  } else if (suggestDeload) {
    status = 'suggest_deload';
    nudge = `${aboveAvgStreak} weeks of above-average training. A deload week could boost your next phase.`;
  } else if (consecutive >= 4) {
    status = 'moderate';
    nudge = `${consecutive} days in a row. A rest day soon will help you absorb these gains.`;
  }

  res.json({ status, days_since_rest: daysSinceRest, consecutive_training_days: consecutive, high_rpe_streak: highRpeStreak, volume_spike_pct: volumeSpikePct, suggest_deload: suggestDeload, nudge });
});

// Check for personal records in a saved workout
router.post('/check-prs', (req, res) => {
  const { workout_id } = req.body;
  if (!workout_id) return res.status(400).json({ error: 'workout_id required' });

  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workout_id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  // Get all exercises and sets in this workout
  const exercises = db.prepare(`
    SELECT we.id as we_id, we.exercise_id, e.name as exercise_name, e.default_metric
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
  `).all(workout_id);

  const sets = db.prepare(`
    SELECT ws.*, ws.workout_exercise_id
    FROM workout_sets ws
    WHERE ws.workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)
  `).all(workout_id);

  const setsByExercise = {};
  for (const s of sets) {
    (setsByExercise[s.workout_exercise_id] ??= []).push(s);
  }

  const prs = [];

  for (const ex of exercises) {
    const exSets = setsByExercise[ex.we_id] || [];

    // Get previous bests (excluding this workout)
    const prevBest = db.prepare(`
      SELECT
        MAX(ws.weight_kg) as max_weight,
        MAX(ws.reps) as max_reps,
        MAX(ws.duration_seconds) as max_duration
      FROM workout_sets ws
      JOIN workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.exercise_id = ? AND we.workout_id != ?
    `).get(ex.exercise_id, workout_id);

    // Previous best grade
    const prevGrades = db.prepare(`
      SELECT ws.grade
      FROM workout_sets ws
      JOIN workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.exercise_id = ? AND we.workout_id != ? AND ws.grade IS NOT NULL
    `).all(ex.exercise_id, workout_id).map(r => r.grade);
    const prevMaxGradeRank = prevGrades.length ? Math.max(...prevGrades.map(g => gradeRank(g))) : -1;

    for (const set of exSets) {
      // Grade PR
      if (set.grade && gradeRank(set.grade) > prevMaxGradeRank && prevMaxGradeRank >= 0) {
        const prevGrade = prevGrades.find(g => gradeRank(g) === prevMaxGradeRank);
        prs.push({ exercise_name: ex.exercise_name, type: 'grade', value: set.grade, previous: prevGrade, unit: '' });
      }
      // Weight PR
      if (set.weight_kg && prevBest?.max_weight != null && set.weight_kg > prevBest.max_weight) {
        prs.push({ exercise_name: ex.exercise_name, type: 'weight', value: set.weight_kg, previous: prevBest.max_weight, unit: 'kg' });
      }
      // Reps PR
      if (set.reps && prevBest?.max_reps != null && set.reps > prevBest.max_reps) {
        prs.push({ exercise_name: ex.exercise_name, type: 'reps', value: set.reps, previous: prevBest.max_reps, unit: 'reps' });
      }
      // Duration PR
      if (set.duration_seconds && prevBest?.max_duration != null && set.duration_seconds > prevBest.max_duration) {
        prs.push({ exercise_name: ex.exercise_name, type: 'duration', value: set.duration_seconds, previous: prevBest.max_duration, unit: 's' });
      }
    }
  }

  // Deduplicate: keep only the best PR per exercise+type
  const unique = {};
  for (const pr of prs) {
    const key = `${pr.exercise_name}_${pr.type}`;
    if (!unique[key] || pr.value > unique[key].value) unique[key] = pr;
  }

  res.json({ prs: Object.values(unique) });
});

// Session insight for tool sessions
router.get('/insight', (req, res) => {
  const { type, category, duration } = req.query;
  const durationSec = Number(duration) || 0;

  // Count sessions this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekCount = db.prepare(
    'SELECT COUNT(*) as count FROM tool_sessions WHERE date >= ?'
  ).get(weekStartStr).count;

  // Check if longest this month
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  let catWhere = '';
  const catParams = [monthStartStr];
  if (category) {
    catWhere = ' AND tool_id IN (SELECT id FROM tool_definitions WHERE category = ?)';
    catParams.push(category);
  }
  const longest = db.prepare(
    `SELECT MAX(duration_seconds) as max FROM tool_sessions WHERE date >= ?${catWhere}`
  ).get(...catParams);

  // Check days since last session of this category
  if (category) {
    const lastSession = db.prepare(`
      SELECT date FROM tool_sessions
      WHERE tool_id IN (SELECT id FROM tool_definitions WHERE category = ?)
      ORDER BY date DESC LIMIT 1 OFFSET 1
    `).get(category);
    if (lastSession) {
      const daysSince = Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86400000);
      if (daysSince >= 7) {
        return res.json({ insight: `First ${category} session in ${daysSince} days \u2014 welcome back!` });
      }
    }
  }

  if (durationSec > 0 && longest?.max != null && durationSec >= longest.max) {
    return res.json({ insight: `That was your longest ${category || 'training'} session this month!` });
  }

  if (weekCount >= 3) {
    return res.json({ insight: `${weekCount} sessions this week \u2014 nice consistency!` });
  }

  res.json({ insight: null });
});

// Exercise-specific history: per-exercise time-series data
router.get('/exercise-history/:exerciseId', (req, res) => {
  const days = parseDays(req.query.days, 365);
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const exerciseId = Number(req.params.exerciseId);
  if (!Number.isInteger(exerciseId) || exerciseId < 1) return res.status(400).json({ error: 'Invalid exercise ID' });

  const exercise = db.prepare('SELECT id, name, category, default_metric FROM exercises WHERE id = ?').get(exerciseId);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });

  const rows = db.prepare(`
    SELECT w.date, ws.grade, ws.weight_kg, ws.reps, ws.duration_seconds
    FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ? AND w.date >= ?
    ORDER BY w.date, ws.set_number
  `).all(exerciseId, since);

  // Group by date, take max per metric per day
  const byDate = {};
  for (const row of rows) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date, maxGrade: null, maxGradeRank: -1, maxWeight: null, maxReps: null, maxDuration: null };
    const d = byDate[row.date];
    if (row.grade) {
      const rank = gradeRank(row.grade);
      if (rank > d.maxGradeRank) { d.maxGrade = row.grade; d.maxGradeRank = rank; }
    }
    if (row.weight_kg != null && (d.maxWeight == null || row.weight_kg > d.maxWeight)) d.maxWeight = row.weight_kg;
    if (row.reps != null && (d.maxReps == null || row.reps > d.maxReps)) d.maxReps = row.reps;
    if (row.duration_seconds != null && (d.maxDuration == null || row.duration_seconds > d.maxDuration)) d.maxDuration = row.duration_seconds;
  }

  const history = Object.values(byDate).map(d => ({
    date: d.date,
    grade: d.maxGrade,
    grade_rank: d.maxGradeRank,
    weight_kg: d.maxWeight,
    reps: d.maxReps,
    duration_seconds: d.maxDuration,
  }));

  res.json({ exercise, history });
});

// Volume detail: weekly tonnage + TUT by category
router.get('/volume-detail', (req, res) => {
  const days = parseDays(req.query.days, 365);
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT strftime('%Y-W%W', w.date) as week, w.category,
      COUNT(DISTINCT w.id) as sessions, COUNT(ws.id) as total_sets,
      COALESCE(SUM(ws.reps * COALESCE(ws.weight_kg, 0)), 0) as tonnage_kg,
      COALESCE(SUM(ws.duration_seconds), 0) as time_under_tension,
      COALESCE(SUM(ws.reps), 0) as total_reps
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE w.date >= ?
    GROUP BY week, w.category
    ORDER BY week
  `).all(since);

  res.json(rows);
});

// Exercises that have logged data (for dropdown picker)
router.get('/exercises-with-data', (req, res) => {
  const rows = db.prepare(`
    SELECT DISTINCT e.id, e.name, e.category, e.default_metric
    FROM exercises e
    JOIN workout_exercises we ON we.exercise_id = e.id
    JOIN workout_sets ws ON ws.workout_exercise_id = we.id
    ORDER BY e.category, e.name
  `).all();

  res.json(rows);
});

export default router;

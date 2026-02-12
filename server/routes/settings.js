import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const ALLOWED_KEYS = new Set([
  'grade_system', 'boulder_grade_system', 'units', 'timer_sound', 'timer_vibration', 'theme',
  'onboarding_completed', 'experience_level', 'primary_discipline', 'max_roped_grade', 'max_boulder_grade', 'training_goal',
]);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

router.put('/', (req, res) => {
  const entries = Object.entries(req.body).filter(([key]) => ALLOWED_KEYS.has(key));
  if (!entries.length) return res.status(400).json({ error: 'No valid settings provided' });
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  db.transaction(() => {
    for (const [key, value] of entries) {
      upsert.run(key, String(value));
    }
  })();
  res.json({ success: true });
});

export default router;

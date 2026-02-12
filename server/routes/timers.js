import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const presets = db.prepare('SELECT * FROM timer_presets ORDER BY name').all();
  if (presets.length) {
    const ids = presets.map(p => p.id);
    const allPhases = db.prepare(
      `SELECT * FROM timer_phases WHERE preset_id IN (${ids.map(() => '?').join(',')}) ORDER BY preset_id, phase_order`
    ).all(...ids);
    const phasesByPreset = {};
    for (const phase of allPhases) {
      (phasesByPreset[phase.preset_id] ??= []).push(phase);
    }
    for (const preset of presets) {
      preset.phases = phasesByPreset[preset.id] || [];
    }
  }
  res.json(presets);
});

router.get('/:id', (req, res) => {
  const preset = db.prepare('SELECT * FROM timer_presets WHERE id = ?').get(req.params.id);
  if (!preset) return res.status(404).json({ error: 'Preset not found' });
  preset.phases = db.prepare(
    'SELECT * FROM timer_phases WHERE preset_id = ? ORDER BY phase_order'
  ).all(preset.id);
  res.json(preset);
});

router.post('/', (req, res) => {
  const { name, mode, total_sets, phases } = req.body;
  if (!name || !mode) return res.status(400).json({ error: 'Name and mode required' });

  const result = db.transaction(() => {
    const pid = db.prepare(
      'INSERT INTO timer_presets (name, mode, total_sets) VALUES (?, ?, ?)'
    ).run(name, mode, total_sets || 1).lastInsertRowid;

    if (phases?.length) {
      const insert = db.prepare(
        'INSERT INTO timer_phases (preset_id, phase_order, label, duration_seconds, color) VALUES (?, ?, ?, ?, ?)'
      );
      phases.forEach((p, i) => {
        insert.run(pid, i + 1, p.label, p.duration_seconds, p.color || '#3b82f6');
      });
    }
    return pid;
  })();

  res.status(201).json({ id: result });
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM timer_presets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Preset not found' });

  const { name, mode, total_sets, phases } = req.body;
  if (!name || !mode) return res.status(400).json({ error: 'Name and mode are required' });
  const validModes = ['rest', 'hangboard', 'interval'];
  if (!validModes.includes(mode)) return res.status(400).json({ error: 'Invalid mode' });

  db.transaction(() => {
    db.prepare('UPDATE timer_presets SET name=?, mode=?, total_sets=? WHERE id=?')
      .run(name, mode, total_sets, req.params.id);
    db.prepare('DELETE FROM timer_phases WHERE preset_id = ?').run(req.params.id);
    if (phases?.length) {
      const insert = db.prepare(
        'INSERT INTO timer_phases (preset_id, phase_order, label, duration_seconds, color) VALUES (?, ?, ?, ?, ?)'
      );
      phases.forEach((p, i) => {
        insert.run(req.params.id, i + 1, p.label, p.duration_seconds, p.color || '#3b82f6');
      });
    }
  })();

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM timer_presets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Preset not found' });

  db.transaction(() => {
    db.prepare('DELETE FROM timer_phases WHERE preset_id = ?').run(req.params.id);
    db.prepare('DELETE FROM timer_presets WHERE id = ?').run(req.params.id);
  })();

  res.json({ success: true });
});

export default router;

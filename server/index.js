import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import exercisesRouter from './routes/exercises.js';
import workoutsRouter from './routes/workouts.js';
import plansRouter from './routes/plans.js';
import progressRouter from './routes/progress.js';
import timersRouter from './routes/timers.js';
import settingsRouter from './routes/settings.js';
import toolsRouter from './routes/tools.js';

// Run seed on first import (creates tables + seed data if needed)
import './db/seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/exercises', exercisesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/progress', progressRouter);
app.use('/api/timer-presets', timersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tools', toolsRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

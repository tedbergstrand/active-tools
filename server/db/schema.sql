CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('roped', 'bouldering', 'traditional')),
  subcategory TEXT,
  default_metric TEXT DEFAULT 'reps',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('roped', 'bouldering', 'traditional')),
  date TEXT NOT NULL DEFAULT (date('now')),
  duration_minutes INTEGER,
  location TEXT,
  notes TEXT,
  rpe INTEGER CHECK(rpe BETWEEN 1 AND 10),
  plan_workout_id INTEGER REFERENCES plan_workouts(id) ON DELETE SET NULL,
  tool_session_id INTEGER REFERENCES tool_sessions(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER DEFAULT 1,
  grade TEXT,
  send_type TEXT CHECK(send_type IN ('onsight', 'flash', 'redpoint', 'repeat', 'attempt', 'project')),
  wall_angle TEXT,
  route_name TEXT,
  reps INTEGER,
  weight_kg REAL,
  duration_seconds INTEGER,
  grip_type TEXT,
  edge_size_mm INTEGER,
  rest_seconds INTEGER,
  completed INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('roped', 'bouldering', 'traditional', 'mixed')),
  duration_weeks INTEGER NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_weeks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  focus TEXT
);

CREATE TABLE IF NOT EXISTS plan_workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_week_id INTEGER NOT NULL REFERENCES plan_weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('roped', 'bouldering', 'traditional'))
);

CREATE TABLE IF NOT EXISTS plan_workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_workout_id INTEGER NOT NULL REFERENCES plan_workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  target_sets INTEGER,
  target_reps INTEGER,
  target_weight REAL,
  target_duration INTEGER,
  target_grade TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS timer_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('rest', 'hangboard', 'interval')),
  total_sets INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timer_phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  preset_id INTEGER NOT NULL REFERENCES timer_presets(id) ON DELETE CASCADE,
  phase_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6'
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_category ON workouts(category);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_category_date ON workouts(category, date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name_category ON exercises(name, category);
CREATE INDEX IF NOT EXISTS idx_workout_sets_grade ON workout_sets(grade);
CREATE INDEX IF NOT EXISTS idx_workouts_tool_session ON workouts(tool_session_id);
CREATE INDEX IF NOT EXISTS idx_workouts_plan_workout ON workouts(plan_workout_id);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plan_weeks_plan ON plan_weeks(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_workouts_week ON plan_workouts(plan_week_id);
CREATE INDEX IF NOT EXISTS idx_plan_workout_exercises_workout ON plan_workout_exercises(plan_workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_plan_workout_exercises_exercise ON plan_workout_exercises(exercise_id);

-- Training tool definitions (seeded, not user-editable)
CREATE TABLE IF NOT EXISTS tool_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  instructions TEXT,
  trains TEXT,
  tool_type TEXT NOT NULL,
  default_config TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  requires_partner INTEGER DEFAULT 0
);

-- Logged tool sessions
CREATE TABLE IF NOT EXISTS tool_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id INTEGER NOT NULL REFERENCES tool_definitions(id) ON DELETE CASCADE,
  date TEXT DEFAULT (date('now')),
  duration_seconds INTEGER,
  config TEXT,
  results TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tool_definitions_category ON tool_definitions(category);
CREATE INDEX IF NOT EXISTS idx_tool_definitions_slug ON tool_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_tool_date ON tool_sessions(tool_id, date);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_date ON tool_sessions(date);

-- Tool favorites
CREATE TABLE IF NOT EXISTS tool_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id INTEGER NOT NULL REFERENCES tool_definitions(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tool_id)
);
CREATE INDEX IF NOT EXISTS idx_tool_favorites_tool ON tool_favorites(tool_id);

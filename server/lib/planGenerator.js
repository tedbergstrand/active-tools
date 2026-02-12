import db from '../db/database.js';

// Workout templates by plan category+goal
// Each template has 3 workouts per week (days 1/3/5 = Mon/Wed/Fri)
const WORKOUT_TEMPLATES = {
  roped: {
    default: [
      { day: 1, title: 'Endurance Session', category: 'roped', exercises: ['Volume Climbing', 'Autobelay Laps'] },
      { day: 3, title: 'Project Session', category: 'roped', exercises: ['Route Projecting', 'Lead Climbing'] },
      { day: 5, title: 'Strength & Conditioning', category: 'traditional', exercises: ['Pull-ups', 'Plank', 'Hanging Leg Raises'] },
    ],
  },
  bouldering: {
    default: [
      { day: 1, title: 'Limit Session', category: 'bouldering', exercises: ['Limit Bouldering', 'System Board'] },
      { day: 3, title: 'Power Training', category: 'traditional', exercises: ['Campus Board', 'Weighted Pull-ups', 'Hangboard Max Hangs'] },
      { day: 5, title: 'Volume Session', category: 'bouldering', exercises: ['Volume Bouldering', 'Slab Practice'] },
    ],
  },
  traditional: {
    'Build finger strength': [
      { day: 1, title: 'Max Hangs', category: 'traditional', exercises: ['Hangboard Max Hangs', 'Reverse Wrist Curls'] },
      { day: 3, title: 'Repeaters', category: 'traditional', exercises: ['Hangboard Repeaters', 'Hangboard Min Edge'] },
      { day: 5, title: 'Core & Antagonist', category: 'traditional', exercises: ['Hanging Leg Raises', 'Front Lever Progression', 'External Rotations'] },
    ],
    'Build climbing fitness foundation': [
      { day: 1, title: 'Upper Body Pull', category: 'traditional', exercises: ['Pull-ups', 'Rows'] },
      { day: 3, title: 'Upper Body Push + Core', category: 'traditional', exercises: ['Push-ups', 'Shoulder Press', 'Plank'] },
      { day: 5, title: 'Legs + Antagonist', category: 'traditional', exercises: ['Squats', 'Calf Raises', 'External Rotations'] },
    ],
    'Stay healthy and prevent injuries': [
      { day: 1, title: 'Antagonist & Prehab', category: 'traditional', exercises: ['Reverse Wrist Curls', 'External Rotations', 'Push-ups'] },
      { day: 3, title: 'Core & Stability', category: 'traditional', exercises: ['Plank', 'Hanging Leg Raises', 'Rice Bucket'] },
      { day: 5, title: 'Light Strength', category: 'traditional', exercises: ['Dips', 'Pistol Squats', 'Calf Raises'] },
    ],
    default: [
      { day: 1, title: 'Pull Strength', category: 'traditional', exercises: ['Pull-ups', 'Hangboard Max Hangs'] },
      { day: 3, title: 'Push & Core', category: 'traditional', exercises: ['Push-ups', 'Dips', 'Plank'] },
      { day: 5, title: 'Legs & Mobility', category: 'traditional', exercises: ['Squats', 'Calf Raises', 'Rice Bucket'] },
    ],
  },
  mixed: {
    default: [
      { day: 1, title: '4x4 Session', category: 'roped', exercises: ['4x4 Routes', 'Volume Climbing'] },
      { day: 3, title: 'Boulder Power', category: 'bouldering', exercises: ['Limit Bouldering', 'Bouldering'] },
      { day: 5, title: 'Conditioning', category: 'traditional', exercises: ['Hangboard Repeaters', 'Ab Wheel Rollouts', 'Pull-ups'] },
    ],
  },
};

// Base targets by exercise default_metric
const BASE_TARGETS = {
  grade: { sets: 1, reps: null, duration: null },
  reps: { sets: 3, reps: 8, duration: null },
  duration: { sets: 3, reps: null, duration: 30 },
  weight: { sets: 3, reps: 8, duration: null },
};

function getWeekFocus(week, totalWeeks) {
  const ratio = week / totalWeeks;
  if (ratio <= 0.375) return 'Foundation';
  if (ratio <= 0.75) return 'Building';
  return 'Peak';
}

function applyProgression(base, week) {
  const progressionBlock = Math.floor((week - 1) / 4);
  const isDeload = week % 4 === 0;

  if (isDeload) {
    return {
      sets: base.sets ? Math.ceil(base.sets * 0.6) : null,
      reps: base.reps ? Math.ceil(base.reps * 0.6) : null,
      duration: base.duration ? Math.ceil(base.duration * 0.6) : null,
    };
  }

  return {
    sets: base.sets ? base.sets + progressionBlock : null,
    reps: base.reps ? base.reps + (progressionBlock * 2) : null,
    duration: base.duration ? base.duration + (progressionBlock * 5) : null,
  };
}

export function generatePlanStructure(plan) {
  const exerciseCache = {};
  const getExercise = (name) => {
    if (!exerciseCache[name]) {
      exerciseCache[name] = db.prepare('SELECT id, default_metric FROM exercises WHERE name = ?').get(name);
    }
    return exerciseCache[name];
  };

  // Pick the best template
  const categoryTemplates = WORKOUT_TEMPLATES[plan.category] || WORKOUT_TEMPLATES.traditional;
  const template = categoryTemplates[plan.goal] || categoryTemplates.default;

  const weeks = [];

  for (let w = 1; w <= plan.duration_weeks; w++) {
    const focus = getWeekFocus(w, plan.duration_weeks);
    const workouts = template.map(tmpl => {
      const exercises = tmpl.exercises
        .map((name, i) => {
          const ex = getExercise(name);
          if (!ex) return null;
          const base = BASE_TARGETS[ex.default_metric] || BASE_TARGETS.reps;
          const progressed = applyProgression(base, w);
          return {
            exercise_id: ex.id,
            sort_order: i,
            target_sets: progressed.sets,
            target_reps: progressed.reps,
            target_duration: progressed.duration,
            target_weight: null,
            target_grade: null,
            notes: w % 4 === 0 ? 'Deload week — reduce intensity' : null,
          };
        })
        .filter(Boolean);

      return {
        day_of_week: tmpl.day,
        title: tmpl.title,
        category: tmpl.category,
        exercises,
      };
    });

    weeks.push({
      week_number: w,
      focus,
      workouts,
    });
  }

  return weeks;
}

export function insertGeneratedStructure(planId, weeks) {
  const insertWeek = db.prepare('INSERT INTO plan_weeks (plan_id, week_number, focus) VALUES (?, ?, ?)');
  const insertWorkout = db.prepare('INSERT INTO plan_workouts (plan_week_id, day_of_week, title, category) VALUES (?, ?, ?, ?)');
  const insertExercise = db.prepare(
    'INSERT INTO plan_workout_exercises (plan_workout_id, exercise_id, sort_order, target_sets, target_reps, target_weight, target_duration, target_grade, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  db.transaction(() => {
    // Clear existing structure
    db.prepare('DELETE FROM plan_weeks WHERE plan_id = ?').run(planId);

    for (const week of weeks) {
      const weekId = insertWeek.run(planId, week.week_number, week.focus || null).lastInsertRowid;

      for (const workout of week.workouts) {
        const workoutId = insertWorkout.run(weekId, workout.day_of_week, workout.title, workout.category).lastInsertRowid;

        for (const ex of workout.exercises) {
          insertExercise.run(
            workoutId, ex.exercise_id, ex.sort_order,
            ex.target_sets, ex.target_reps, ex.target_weight,
            ex.target_duration, ex.target_grade, ex.notes
          );
        }
      }
    }
  })();
}

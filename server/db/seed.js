import db from './database.js';

function seed() {
  const existingExercises = db.prepare('SELECT COUNT(*) as count FROM exercises').get();
  if (existingExercises.count > 0) {
    console.log('Exercises already seeded, refreshing tool definitions...');
    seedToolDefinitions();
    return;
  }

  console.log('Seeding database...');

  const insertExercise = db.prepare(
    'INSERT INTO exercises (name, category, subcategory, default_metric, description) VALUES (?, ?, ?, ?, ?)'
  );

  const exercises = [
    // Roped climbing (8)
    ['Lead Climbing', 'roped', 'lead', 'grade', 'Sport or trad lead climbing'],
    ['Top Rope', 'roped', 'toprope', 'grade', 'Top rope climbing'],
    ['Lead Falls Practice', 'roped', 'lead', 'reps', 'Practicing taking lead falls'],
    ['Route Projecting', 'roped', 'lead', 'grade', 'Working a project route over multiple sessions'],
    ['Autobelay Laps', 'roped', 'endurance', 'reps', 'Continuous laps on autobelay for endurance'],
    ['4x4 Routes', 'roped', 'endurance', 'reps', 'Four routes back to back, four sets'],
    ['Onsight Attempts', 'roped', 'lead', 'grade', 'First-try lead attempts on new routes'],
    ['Volume Climbing', 'roped', 'endurance', 'reps', 'High volume of easier routes'],

    // Bouldering (8)
    ['Bouldering', 'bouldering', 'general', 'grade', 'General bouldering session'],
    ['Limit Bouldering', 'bouldering', 'power', 'grade', 'Working at or near max grade'],
    ['Volume Bouldering', 'bouldering', 'endurance', 'reps', 'High volume of easier problems'],
    ['Campus Board', 'bouldering', 'power', 'reps', 'Campus board training'],
    ['System Board', 'bouldering', 'technique', 'grade', 'Training on a system/moonboard'],
    ['Dyno Practice', 'bouldering', 'power', 'reps', 'Dynamic movement practice'],
    ['Slab Practice', 'bouldering', 'technique', 'grade', 'Slab climbing technique work'],
    ['Competition Simulation', 'bouldering', 'general', 'reps', 'Simulated comp-style bouldering'],

    // Traditional exercises (20)
    ['Hangboard Repeaters', 'traditional', 'hangboard', 'duration', '7/3 repeater protocol on hangboard'],
    ['Hangboard Max Hangs', 'traditional', 'hangboard', 'duration', 'Max weight hangs for 7-10 seconds'],
    ['Hangboard Min Edge', 'traditional', 'hangboard', 'duration', 'Minimum edge hangs for finger strength'],
    ['Pull-ups', 'traditional', 'pull', 'reps', 'Bodyweight or weighted pull-ups'],
    ['Weighted Pull-ups', 'traditional', 'pull', 'reps', 'Pull-ups with added weight'],
    ['Lock-offs', 'traditional', 'pull', 'duration', 'Isometric lock-off holds at various angles'],
    ['Rows', 'traditional', 'pull', 'reps', 'Barbell or dumbbell rows'],
    ['Push-ups', 'traditional', 'push', 'reps', 'Bodyweight push-ups'],
    ['Dips', 'traditional', 'push', 'reps', 'Parallel bar or ring dips'],
    ['Shoulder Press', 'traditional', 'push', 'reps', 'Overhead pressing movement'],
    ['Plank', 'traditional', 'core', 'duration', 'Front plank hold'],
    ['Hanging Leg Raises', 'traditional', 'core', 'reps', 'Leg raises from a dead hang'],
    ['Ab Wheel Rollouts', 'traditional', 'core', 'reps', 'Ab wheel or barbell rollouts'],
    ['Front Lever Progression', 'traditional', 'core', 'duration', 'Front lever holds and progressions'],
    ['Squats', 'traditional', 'legs', 'reps', 'Barbell or bodyweight squats'],
    ['Pistol Squats', 'traditional', 'legs', 'reps', 'Single-leg squat'],
    ['Calf Raises', 'traditional', 'legs', 'reps', 'Standing or seated calf raises'],
    ['Reverse Wrist Curls', 'traditional', 'antagonist', 'reps', 'Wrist extensor strengthening'],
    ['External Rotations', 'traditional', 'antagonist', 'reps', 'Shoulder external rotation with band'],
    ['Rice Bucket', 'traditional', 'antagonist', 'duration', 'Hand and forearm rehab/prehab with rice bucket'],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertExercise.run(...item);
    }
  });
  insertMany(exercises);
  console.log(`  Inserted ${exercises.length} exercises`);

  // Seed plans
  const insertPlan = db.prepare(
    'INSERT INTO plans (name, category, duration_weeks, difficulty, goal, description) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertWeek = db.prepare(
    'INSERT INTO plan_weeks (plan_id, week_number, focus) VALUES (?, ?, ?)'
  );
  const insertPlanWorkout = db.prepare(
    'INSERT INTO plan_workouts (plan_week_id, day_of_week, title, category) VALUES (?, ?, ?, ?)'
  );
  const insertPlanExercise = db.prepare(
    'INSERT INTO plan_workout_exercises (plan_workout_id, exercise_id, sort_order, target_sets, target_reps, target_duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const getExerciseId = db.prepare('SELECT id FROM exercises WHERE name = ?');

  const seedPlans = db.transaction(() => {
    // Plan 1: Route Projecting
    const p1 = insertPlan.run('Route Projecting', 'roped', 8, 'intermediate',
      'Send your project route', 'An 8-week plan focused on building the endurance and technique needed to send your project route.').lastInsertRowid;
    for (let w = 1; w <= 8; w++) {
      const focus = w <= 3 ? 'Base endurance' : w <= 6 ? 'Route-specific work' : 'Peak & send';
      const wid = insertWeek.run(p1, w, focus).lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, 'Endurance Session', 'roped').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('Volume Climbing').id, 1, 4, 6, null, 'Climb 6 routes 3-4 grades below project');
      const pw2 = insertPlanWorkout.run(wid, 3, 'Project Session', 'roped').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Route Projecting').id, 1, null, null, null, 'Work project route sections');
      const pw3 = insertPlanWorkout.run(wid, 5, 'Strength & Conditioning', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Pull-ups').id, 1, 3, 8, null, null);
      insertPlanExercise.run(pw3, getExerciseId.get('Plank').id, 2, 3, null, 60, null);
    }

    // Plan 2: Bouldering Power
    const p2 = insertPlan.run('Bouldering Power', 'bouldering', 6, 'advanced',
      'Increase max bouldering grade', 'A 6-week power-focused plan for pushing your bouldering limit.').lastInsertRowid;
    for (let w = 1; w <= 6; w++) {
      const focus = w <= 2 ? 'Volume & technique' : w <= 4 ? 'Limit bouldering' : 'Peak power';
      const wid = insertWeek.run(p2, w, focus).lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, 'Limit Session', 'bouldering').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('Limit Bouldering').id, 1, null, 8, null, 'Work problems at or above project grade');
      const pw2 = insertPlanWorkout.run(wid, 3, 'Power Training', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Campus Board').id, 1, 5, 6, null, null);
      insertPlanExercise.run(pw2, getExerciseId.get('Weighted Pull-ups').id, 2, 4, 5, null, null);
      const pw3 = insertPlanWorkout.run(wid, 5, 'Volume Session', 'bouldering').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Volume Bouldering').id, 1, null, 20, null, 'Flash-level problems');
    }

    // Plan 3: Finger Strength
    const p3 = insertPlan.run('Finger Strength', 'traditional', 4, 'intermediate',
      'Build finger strength', 'A focused 4-week hangboard protocol for finger strength gains.').lastInsertRowid;
    for (let w = 1; w <= 4; w++) {
      const focus = w <= 2 ? 'Adaptation' : 'Progressive overload';
      const wid = insertWeek.run(p3, w, focus).lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, 'Max Hangs', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('Hangboard Max Hangs').id, 1, 5, null, 10, 'Add weight each week');
      insertPlanExercise.run(pw1, getExerciseId.get('Reverse Wrist Curls').id, 2, 3, 15, null, 'Antagonist work');
      const pw2 = insertPlanWorkout.run(wid, 3, 'Repeaters', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Hangboard Repeaters').id, 1, 6, null, 7, '7 on / 3 off repeaters');
      const pw3 = insertPlanWorkout.run(wid, 5, 'Easy Climbing + Core', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Hanging Leg Raises').id, 1, 3, 12, null, null);
      insertPlanExercise.run(pw3, getExerciseId.get('Front Lever Progression').id, 2, 4, null, 15, null);
    }

    // Plan 4: General Fitness
    const p4 = insertPlan.run('General Fitness', 'traditional', 8, 'beginner',
      'Build climbing fitness foundation', 'An 8-week general fitness plan for climbers, covering push, pull, core, and legs.').lastInsertRowid;
    for (let w = 1; w <= 8; w++) {
      const focus = w <= 3 ? 'Foundation' : w <= 6 ? 'Building strength' : 'Consolidation';
      const wid = insertWeek.run(p4, w, focus).lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, 'Upper Body Pull', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('Pull-ups').id, 1, 3, 8, null, null);
      insertPlanExercise.run(pw1, getExerciseId.get('Rows').id, 2, 3, 10, null, null);
      const pw2 = insertPlanWorkout.run(wid, 3, 'Upper Body Push + Core', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Push-ups').id, 1, 3, 15, null, null);
      insertPlanExercise.run(pw2, getExerciseId.get('Shoulder Press').id, 2, 3, 10, null, null);
      insertPlanExercise.run(pw2, getExerciseId.get('Plank').id, 3, 3, null, 45, null);
      const pw3 = insertPlanWorkout.run(wid, 5, 'Legs + Antagonist', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Squats').id, 1, 3, 12, null, null);
      insertPlanExercise.run(pw3, getExerciseId.get('Calf Raises').id, 2, 3, 15, null, null);
      insertPlanExercise.run(pw3, getExerciseId.get('External Rotations').id, 3, 3, 15, null, null);
    }

    // Plan 5: Power Endurance
    const p5 = insertPlan.run('Power Endurance', 'mixed', 6, 'intermediate',
      'Sustain power through long routes', 'A 6-week plan combining bouldering and route climbing to build power endurance.').lastInsertRowid;
    for (let w = 1; w <= 6; w++) {
      const focus = w <= 2 ? 'Aerobic base' : w <= 4 ? 'Anaerobic capacity' : 'Race pace';
      const wid = insertWeek.run(p5, w, focus).lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, '4x4 Session', 'roped').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('4x4 Routes').id, 1, 4, 4, null, '4 routes back to back, rest 4 min between sets');
      const pw2 = insertPlanWorkout.run(wid, 3, 'Boulder Power', 'bouldering').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Limit Bouldering').id, 1, null, 6, null, 'Hard problems with full rest');
      const pw3 = insertPlanWorkout.run(wid, 5, 'Conditioning', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Hangboard Repeaters').id, 1, 4, null, 7, null);
      insertPlanExercise.run(pw3, getExerciseId.get('Ab Wheel Rollouts').id, 2, 3, 10, null, null);
    }

    // Plan 6: Injury Prevention
    const p6 = insertPlan.run('Injury Prevention', 'traditional', 4, 'beginner',
      'Stay healthy and prevent injuries', 'A 4-week maintenance plan focused on antagonist training, mobility, and prehab.').lastInsertRowid;
    for (let w = 1; w <= 4; w++) {
      const wid = insertWeek.run(p6, w, 'Maintenance').lastInsertRowid;
      const pw1 = insertPlanWorkout.run(wid, 1, 'Antagonist & Prehab', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw1, getExerciseId.get('Reverse Wrist Curls').id, 1, 3, 15, null, null);
      insertPlanExercise.run(pw1, getExerciseId.get('External Rotations').id, 2, 3, 15, null, null);
      insertPlanExercise.run(pw1, getExerciseId.get('Push-ups').id, 3, 3, 12, null, null);
      const pw2 = insertPlanWorkout.run(wid, 3, 'Core & Stability', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw2, getExerciseId.get('Plank').id, 1, 3, null, 45, null);
      insertPlanExercise.run(pw2, getExerciseId.get('Hanging Leg Raises').id, 2, 3, 10, null, null);
      insertPlanExercise.run(pw2, getExerciseId.get('Rice Bucket').id, 3, 2, null, 120, '2 min each hand');
      const pw3 = insertPlanWorkout.run(wid, 5, 'Light Strength', 'traditional').lastInsertRowid;
      insertPlanExercise.run(pw3, getExerciseId.get('Dips').id, 1, 3, 10, null, null);
      insertPlanExercise.run(pw3, getExerciseId.get('Pistol Squats').id, 2, 3, 5, null, 'Each leg');
    }
  });
  seedPlans();
  console.log('  Inserted 6 training plans');

  // Seed timer presets
  const insertPreset = db.prepare(
    'INSERT INTO timer_presets (name, mode, total_sets) VALUES (?, ?, ?)'
  );
  const insertPhase = db.prepare(
    'INSERT INTO timer_phases (preset_id, phase_order, label, duration_seconds, color) VALUES (?, ?, ?, ?, ?)'
  );

  const seedTimers = db.transaction(() => {
    // 7/3 Repeaters
    let pid = insertPreset.run('7/3 Repeaters', 'hangboard', 6).lastInsertRowid;
    insertPhase.run(pid, 1, 'Hang', 7, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 3, '#22c55e');

    // Max Hangs 10s
    pid = insertPreset.run('Max Hangs 10s', 'hangboard', 5).lastInsertRowid;
    insertPhase.run(pid, 1, 'Hang', 10, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 180, '#22c55e');

    // Max Hangs 7s
    pid = insertPreset.run('Max Hangs 7s', 'hangboard', 5).lastInsertRowid;
    insertPhase.run(pid, 1, 'Hang', 7, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 180, '#22c55e');

    // Rest timers
    pid = insertPreset.run('1 Min Rest', 'rest', 1).lastInsertRowid;
    insertPhase.run(pid, 1, 'Rest', 60, '#3b82f6');

    pid = insertPreset.run('2 Min Rest', 'rest', 1).lastInsertRowid;
    insertPhase.run(pid, 1, 'Rest', 120, '#3b82f6');

    pid = insertPreset.run('3 Min Rest', 'rest', 1).lastInsertRowid;
    insertPhase.run(pid, 1, 'Rest', 180, '#3b82f6');

    pid = insertPreset.run('5 Min Rest', 'rest', 1).lastInsertRowid;
    insertPhase.run(pid, 1, 'Rest', 300, '#3b82f6');

    // Tabata
    pid = insertPreset.run('Tabata', 'interval', 8).lastInsertRowid;
    insertPhase.run(pid, 1, 'Work', 20, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 10, '#22c55e');

    // Core Circuit
    pid = insertPreset.run('Core Circuit', 'interval', 3).lastInsertRowid;
    insertPhase.run(pid, 1, 'Work', 40, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 20, '#22c55e');

    // Custom Interval placeholder
    pid = insertPreset.run('EMOM', 'interval', 10).lastInsertRowid;
    insertPhase.run(pid, 1, 'Work', 40, '#ef4444');
    insertPhase.run(pid, 2, 'Rest', 20, '#22c55e');
  });
  seedTimers();
  console.log('  Inserted 10 timer presets');

  // Seed default settings
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('grade_system', 'yds');
  insertSetting.run('boulder_grade_system', 'v_scale');
  insertSetting.run('units', 'metric');
  insertSetting.run('theme', 'dark');
  insertSetting.run('timer_sound', 'true');
  insertSetting.run('timer_vibration', 'true');
  console.log('  Inserted default settings');

  // Always refresh tool definitions to pick up changes
  seedToolDefinitions();

  console.log('Seeding complete!');
}

function seedToolDefinitions() {
  db.prepare('DELETE FROM tool_sessions').run();
  db.prepare('DELETE FROM tool_definitions').run();
  const insert = db.prepare(
    `INSERT INTO tool_definitions (slug, name, category, subcategory, description, instructions, trains, tool_type, default_config, difficulty, requires_partner)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const tools = [
    // Footwork (5)
    ['silent-feet', 'Silent Feet Drill', 'footwork', null,
      'Place every foot with zero audible sound. If your foot makes noise, move it back and retry.',
      'Choose problems 2-3 grades below your onsight level. Place every foot silently. If you hear contact noise, move your foot back to the previous hold and retry. Engage your core to lower your foot in a slow, controlled hover.',
      'Foot placement precision, core engagement, body awareness',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 60, reminderText: 'Quiet feet! Place with zero sound.' }),
      'beginner', 0],

    ['sticky-feet', 'Sticky Feet (No Readjustment)', 'footwork', null,
      'Once your foot touches a hold, it is glued — no readjusting or shifting allowed.',
      'Climb problems 1-2 grades below onsight. Once your foot touches a hold, no readjusting, no micro-shifts, no double-touching. If you readjust, restart the problem or mark a penalty.',
      'Foot placement accuracy, visual targeting, commitment',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 45, reminderText: 'Feet are glued! No readjusting.' }),
      'beginner', 0],

    ['hover-feet', 'Hover Feet', 'footwork', null,
      'Hover your toe 1-2 inches above each foothold for 3 seconds before placing it.',
      'Before placing your foot, hover your toe above the target for a full 3-second count, then gently lower into place. Identify the exact best contact point before your toe arrives.',
      'Visual targeting, precision, patience, proprioception',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 10, callouts: ['Hover... 3... 2... 1... Place!', 'Float above the hold... feel the spot... now place.', 'Hover your toe... steady... set it down gently.', 'Pause above... find the sweet spot... place with precision.', 'Hold it... don\'t rush... 3... 2... 1... down.'] }),
      'beginner', 0],

    ['toe-precision', 'Toe Precision Drill', 'footwork', null,
      'Place the tip of your big toe on the single best contact point of each foothold — one touch, no adjusting.',
      'While traversing easy terrain (2-3 grades below onsight), pause before each foot placement. Identify the single best contact point on the foothold. Place the tip of your big toe directly on that point with one deliberate movement. Don\'t break eye contact with the hold until your toe is set. If your foot slides or needs adjusting, the placement failed — reset and try again.',
      'Visual targeting, toe dexterity, foot-eye coordination, precise placement',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 30, reminderText: 'One touch. Big toe on the best spot.' }),
      'beginner', 0],

    ['no-arms-slab', 'No-Arms Slab Climbing', 'footwork', null,
      'Climb slab terrain using only feet and open-palm balance touches — no gripping.',
      'On slab terrain (less than vertical), climb using only feet and open-palm balance touches. No gripping. Forces total commitment to footwork and balance.',
      'Foot trust, balance, weight centering, slab technique',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 30, reminderText: 'Open palms only! Trust your feet.' }),
      'intermediate', 0],

    // Movement Technique (6)
    ['lock-off-ladder', 'Lock-Off Ladders', 'movement', null,
      'Pull into a lock-off and hover your reaching hand for 3-5 seconds before grabbing.',
      'Climb 2-3 grades below max. On every hand move, pull into a lock-off with the stationary arm and hover your reaching hand 1-2 inches from the target for 3-5 seconds before grabbing.',
      'Lock-off strength, static control, body tension',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 15, callouts: ['Lock off... hover... 5... 4... 3... 2... 1... Grab!', 'Pull in tight... hold the lock... reach and hover... now take it.', 'Squeeze... lock it off... hand floats near the hold... grab!', 'Lock off strong... reach... hover... steady... take the hold.', 'Engage... pull to lock... hover that hand... 3... 2... 1... grab!'] }),
      'intermediate', 0],

    ['flag-practice', 'Flagging Practice', 'movement', null,
      'Deliberately flag on every single move, even when unnecessary.',
      'On vertical to slightly overhanging terrain, flag on every move. Alternate between inside flag, outside flag, and back flag. Hold each flagged position for 2-3 seconds.',
      'Balance, counter-rotation, hip positioning, efficiency',
      'callout', JSON.stringify({ mode: 'timed', interval: 8, pools: { flag: ['Inside flag!', 'Outside flag!', 'Back flag!', 'Inside flag — press into the wall!', 'Outside flag — reach further!', 'Back flag — counterbalance!'] } }),
      'intermediate', 0],

    ['drop-knee-drill', 'Drop Knee Drill', 'movement', null,
      'Practice driving your knee inward and down on every possible move.',
      'On moderately overhanging terrain, drop your knee on every possible move. Alternate sides. Hold each drop knee for 2-3 seconds. Start on a system board or familiar problems.',
      'Hip-to-wall engagement, reach extension, energy conservation',
      'callout', JSON.stringify({ mode: 'timed', interval: 8, pools: { knee: ['Left knee drop!', 'Right knee drop!', 'Left knee in — hip to the wall!', 'Right knee in — drive it down!', 'Drop knee left — feel the reach!', 'Drop knee right — extend!'] } }),
      'intermediate', 0],

    ['twist-lock-drill', 'Twist Lock Practice', 'movement', null,
      'On every reach, rotate your torso so the reaching shoulder turns into the wall.',
      'On every reach, backstep and rotate your torso so your reaching shoulder turns into the wall. Hold the twisted position for 2 seconds before grabbing.',
      'Reach extension, hip rotation, energy efficiency',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 12, callouts: ['Twist and reach... Hold... Grab!', 'Backstep... rotate your shoulder in... extend... take it!', 'Turn your hips... twist lock... reach far... grab!', 'Rotate in... shoulder to the wall... hold the twist... now go!', 'Drop your heel... twist... feel the reach extend... grab!'] }),
      'intermediate', 0],

    ['hover-hand', 'Hover Hand', 'movement', null,
      'Pause with your hand hovering 3 seconds before every grab.',
      'On every hand move, hover your hand 1-2 inches from the target hold for 3 seconds before grabbing. Maintain perfect body position during the hover — no sagging or repositioning.',
      'Static strength, body tension, lock-off power, composure',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 12, callouts: ['Hover... 3... 2... 1... Grab!', 'Float your hand close... hold position... now take it.', 'Reach... pause near the hold... stay tight... grab!', 'Hand hovers... body stays strong... 3... 2... 1... commit!', 'Extend... hover... feel the tension... no sagging... grab!'] }),
      'intermediate', 0],

    ['downclimb-everything', 'Downclimb Everything', 'movement', null,
      'After every ascent, reverse every move back to the start. Feet first, eyes down.',
      'Choose problems 1-3 grades below your max. Climb to the top, then downclimb every move in reverse order. Look down, place feet first, then release hands. Keep hips close to the wall on the descent. If you can\'t reverse a move cleanly, the problem is too hard for this drill. Repeat with different problems throughout the session.',
      'Footwork precision, route memorization, eccentric strength, controlled descent',
      'timer', JSON.stringify({ duration: 1200, reminderInterval: 120, reminderText: 'Remember: downclimb everything. Feet first, eyes down.' }),
      'beginner', 0],

    // Power (3)
    ['limit-bouldering-coach', 'Limit Bouldering Coach', 'power', null,
      'Guided limit bouldering with attempt tracking, enforced rest, and output quality monitoring.',
      'Select 3-4 problems at or just above your current redpoint level — hard enough that you fail on most attempts. Give maximum effort on each try. Rest a full 3-5 minutes between attempts to allow full neuromuscular recovery. If you notice a significant drop in effort quality (can\'t latch holds you previously stuck, losing body tension), end the session. Total session: 60-75 minutes including rest.',
      'Maximum strength, motor unit recruitment, contact strength, power',
      'session', JSON.stringify({ attempts: 8, attemptDuration: 300, restBetweenAttempts: 240 }),
      'advanced', 0],

    ['campus-board-workout', 'Campus Board Workout', 'power', null,
      'Structured campus board session with ladders, bumps, and matched touches.',
      'PREREQUISITES: Minimum 2 years of consistent climbing, ability to do 10+ pull-ups, no current finger or shoulder injuries. Warm up thoroughly first (15-20 min of easy climbing + progressive finger loading).\n\nExercises:\n- Ladders: Alternate hands up the rungs (1-2-3, 1-3-5, etc.)\n- Bumps: One hand moves up one rung at a time while the other stays\n- Matched Touches: Both hands on one rung, one hand touches the rung above and returns\n\n2-3 sets of 2-3 reps per exercise. Full rest (3 min) between sets, 5 min between exercises. STOP immediately if you feel any tweak or sharp pain in your fingers.',
      'Contact strength, explosive pulling power, rate of force development',
      'session', JSON.stringify({ exercises: ['Ladders', 'Bumps', 'Matched Touches'], setsPerExercise: 3, setDuration: 30, restBetweenSets: 180, restBetweenExercises: 300 }),
      'advanced', 0],

    ['explosive-catch', 'Explosive Catch Drill', 'power', null,
      'Practice generating maximum force to latch holds at the limit of your static reach.',
      'On large, positive holds, start from a dead hang with straight arms. Pull explosively and reach/slap for a target hold that is just beyond your static reach. Focus on generating maximum force quickly and latching the hold cleanly. 3-4 reps per set, 3-4 sets, with full rest (3 min) between sets. Stop if contact quality drops — you should be latching the target most attempts.',
      'Rate of force development, dynamic movement, explosive pulling power, contact strength',
      'session', JSON.stringify({ sets: 4, setDuration: 60, restBetweenSets: 180 }),
      'advanced', 0],

    // Power Endurance (4)
    ['four-by-four', '4x4 Session Coach', 'power-endurance', null,
      'Four problems climbed back-to-back, repeated for four sets with timed rest.',
      'Select 4 boulder problems 2-3 grades below your redpoint max. Climb all 4 back-to-back with NO rest between problems — just walk to the next one and go. Rest 4 minutes between sets. Repeat for 4 total sets. If you\'re falling off during a set, the problems are too hard — go easier. You should be deeply pumped but able to complete each set.',
      'Power endurance, anaerobic capacity, climbing while pumped, mental fortitude',
      'session', JSON.stringify({ sets: 4, setDuration: 480, restBetweenSets: 240 }),
      'intermediate', 0],

    ['linked-boulders', 'Linked Boulders', 'power-endurance', null,
      'Link 2-3 nearby problems into one continuous circuit without stepping off the wall.',
      'Select 2-3 nearby problems at 2-3 grades below your max. Climb Problem 1, traverse directly to Problem 2, traverse to Problem 3 — no chalk, no shaking out, no stepping off the wall. Rest 4 minutes between circuits. Repeat for 3 circuits. If you\'re falling off mid-circuit, use easier problems.',
      'Sustained power, transitions, pump management, continuous effort',
      'session', JSON.stringify({ circuits: 3, circuitDuration: 480, restBetweenCircuits: 240 }),
      'intermediate', 0],

    ['diminishing-intervals', '3:2 Diminishing Intervals', 'power-endurance', null,
      'Decreasing work:rest intervals that progressively increase difficulty.',
      'Start with 3 minutes climbing, 2 minutes rest. Each round, reduce climbing by 30s and rest by 20s. Continue until work period reaches 30 seconds.',
      'Anaerobic threshold, power endurance, recovery under fatigue',
      'timer', JSON.stringify({ startWork: 180, startRest: 120, workDecrement: 30, restDecrement: 20, minWork: 30 }),
      'advanced', 0],

    ['timed-circuit', 'Timed Bouldering Circuit', 'power-endurance', null,
      'EMOM-style — start a new problem every minute on the minute.',
      'Set a timer for 8-10 minutes. Start a new problem at the top of every minute. Problems should be 2-4 grades below max. Rest only in remaining time before the next minute.',
      'Power endurance, pacing, climbing efficiency under pressure',
      'timer', JSON.stringify({ totalMinutes: 10, intervalSeconds: 60 }),
      'intermediate', 0],

    // Endurance (4)
    ['arc-training', 'ARC Training', 'endurance', null,
      'Aerobic Restoration and Capillarity — 20-45 minutes of continuous easy climbing.',
      'Climb continuously for 20-45 minutes on terrain well below your limit. Never stop moving. Maintain a very light pump; if it increases, move to easier holds. Focus on smooth, efficient movement.',
      'Capillary density, aerobic energy system, base endurance, movement economy',
      'timer', JSON.stringify({ duration: 1800, pumpCheckInterval: 300, pumpCheckText: 'Rate your pump 1-10. If above 4, move to easier terrain.' }),
      'beginner', 0],

    ['up-down-up', 'Up-Down-Up Endurance', 'endurance', null,
      'Climb up, downclimb, add one more hold each round.',
      'Climb up one hold, downclimb to start. Climb to the second hold, downclimb. Keep adding one hold until you reach the top or pump out.',
      'Endurance, pump tolerance, downclimbing, movement memorization',
      'timer', JSON.stringify({ duration: 1200, reminderInterval: 60, reminderText: 'Add one more hold!' }),
      'intermediate', 0],

    ['continuous-climbing', 'Continuous Climbing Timer', 'endurance', null,
      'Traverse or climb circuits without stopping for 15-30 minutes.',
      'Traverse and climb circuits without stopping for the set duration. Use the full gym. Keep intensity low enough to sustain continuous movement. No chalk breaks, no rest stances.',
      'Aerobic endurance, movement efficiency, pump management',
      'timer', JSON.stringify({ duration: 1200, reminderInterval: 300, reminderText: 'Keep moving! Stay relaxed.' }),
      'beginner', 0],

    ['route-lapping', 'Route Lapping Coach', 'endurance', null,
      'Repeated laps on the same route to build efficiency and aerobic endurance.',
      'Select a route 3-4 grades below your redpoint max. Climb it, lower, shake out for 30 seconds, then climb it again. Perform 4-6 laps. Focus on climbing each lap with smoother, more efficient movement rather than faster. If you can\'t maintain technique by lap 3, the route is too hard for this drill.',
      'Endurance, movement economy, aerobic capacity, route memorization',
      'session', JSON.stringify({ laps: 5, lapDuration: 180, restBetweenLaps: 30 }),
      'intermediate', 0],

    // Technique / Mental (5)
    ['eyes-closed-climbing', 'Eyes Closed Climbing', 'technique', null,
      'Climb by feel on easy, familiar terrain with your eyes closed.',
      'On very easy, familiar problems, close your eyes and climb by feel. Use your toes to read holds. Start with 3-5 moves and progress longer.',
      'Proprioception, kinesthetic awareness, body position sense',
      'callout', JSON.stringify({ mode: 'timed', interval: 20, callouts: ['Eyes closed... feel the holds.', 'Trust your body position.', 'Find the hold with your toes.'] }),
      'intermediate', 0],

    ['visualization-timer', 'Pre-Climb Visualization Timer', 'technique', null,
      'Guided visualization countdown before each attempt.',
      'Before each attempt, close your eyes and mentally climb the problem move by move. Visualize hand placements, foot positions, body tension, and breathing. Then execute.',
      'Visualization skill, route reading, mental rehearsal',
      'timer', JSON.stringify({ visualizationDuration: 90, countdownBeeps: true, postClimbPrompt: 'How closely did the climb match your visualization? Rate 1-10.' }),
      'beginner', 0],

    ['three-second-rule', '3-Second Rule', 'technique', null,
      'Hold every position for exactly 3 seconds before moving the next limb.',
      'Every limb placement must be held for exactly 3 seconds before the next limb moves. No exceptions. Climb complete problems under this constraint.',
      'Patience, body tension, static strength, deliberate movement',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 8, callouts: ['3... 2... 1... Move!', 'Hold it... hold it... hold it... now move one limb.', 'Freeze... feel your balance... 3... 2... 1... go.', 'Stay still... check your position... now move.', 'Pause... breathe... are you balanced?... move!'] }),
      'beginner', 0],

    ['soft-hands', 'Soft Hands (Minimum Grip)', 'technique', null,
      'Climb using the minimum grip force needed — hands barely closed.',
      'Climb problems with the lightest possible grip. Your hands should be barely closed around holds. Focus on body position and feet carrying your weight. If you start gripping hard, move to easier terrain.',
      'Grip efficiency, straight-arm technique, weight on feet',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 30, reminderText: 'Soften your grip! Let your feet carry you.' }),
      'intermediate', 0],

    ['pause-and-feel', 'Pause and Feel', 'technique', null,
      'Pause on each hold for 3 seconds to consciously read its shape and best grip.',
      'On every hand move, pause for 3 seconds to consciously feel the hold\'s shape, texture, and best grip position. Build a tactile memory of the hold before committing to the move.',
      'Hold reading, conscious grip selection, tactile awareness',
      'callout', JSON.stringify({ duration: 600, mode: 'timed', interval: 12, callouts: ['Feel the hold... Read it... 3... 2... 1... Commit!', 'What shape is it?... Where\'s the best part?... Now grip.', 'Touch it... explore the texture... find the edge... commit!', 'Squeeze gently... feel the contour... now commit to your grip.', 'Read the hold... thumb? index? middle?... choose... go!'] }),
      'beginner', 0],

    // Games / Fun (5)
    ['climbing-twister', 'Climbing Twister', 'game', null,
      'Random limb + color callouts — "Left hand BLUE!", "Right foot RED!"',
      'A random prompt calls out a limb and color: "Left hand BLUE!" You must use that limb on a hold of that color. Continues until you fall or complete a set number of calls.',
      'Coordination, limb independence, creative sequencing, cognitive load',
      'callout', JSON.stringify({ mode: 'timed', interval: 8, pools: { limb: ['Left hand', 'Right hand', 'Left foot', 'Right foot'], color: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'WHITE', 'BLACK'] } }),
      'beginner', 0],

    ['random-move-generator', 'Random Move Generator', 'game', null,
      'Random directional commands — "Right hand UP!", "Left foot MATCH!"',
      'While on the wall, random prompts call out instructions: "Left hand up," "Right foot right." Execute the called move. Continues until you fall or complete a set number.',
      'Adaptability, limb coordination, creative problem-solving',
      'callout', JSON.stringify({ mode: 'timed', interval: 8, pools: { limb: ['Left hand', 'Right hand', 'Left foot', 'Right foot'], direction: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'MATCH', 'CROSS'] } }),
      'beginner', 0],

    ['elimination-game', 'Elimination Game', 'game', null,
      'Complete a problem, then eliminate one hold each round until impossible.',
      'Climb a problem successfully. Next attempt, eliminate one hold. Climb again. Eliminate another. Continue until the problem is impossible.',
      'Problem-solving, power, creativity, technique adaptation',
      'session', JSON.stringify({ rounds: 8, roundDuration: 180, restBetweenRounds: 60, activeAnnounce: 'Round {n}. Climb the problem with {remaining} eliminated holds. Go!', activeLabel: 'Round {n} — {prev} holds eliminated', restAnnounce: 'Pick a hold to eliminate! That\'s {n} holds gone now. Memorize what\'s left.', restLabel: 'Eliminate hold #{n}' }),
      'intermediate', 0],

    ['add-on-solo', 'Add-On Solo (Memory Chain)', 'game', null,
      'Build a specific move sequence from scratch — add one unique move each round, replay the entire chain.',
      'Start on a blank section of wall. Make one move (your "opening move"). Return to start. Now replay the opening move AND add one new move at the end. Return to start. Each round, replay the ENTIRE sequence from Move 1, then add one new move. You must remember and repeat every previous move exactly. Different from Up-Down-Up — here you\'re building a specific route and memorizing the exact sequence. Continue until you can\'t complete the chain or run out of wall.',
      'Movement memorization, sequence recall, endurance under cognitive load, creativity',
      'session', JSON.stringify({ rounds: 12, roundDuration: 120, restBetweenRounds: 15, activeAnnounce: 'Round {n}. Replay all {n} moves, then add one new move at the end. Go!', activeLabel: 'Round {n} — {n}-move sequence', restAnnounce: 'Good. Your sequence is now {n} moves. Memorize it before the next round.', restLabel: 'Memorize {n}-move sequence' }),
      'beginner', 0],

    ['flash-blitz', 'Flash Blitz', 'game', null,
      'Timed session — attempt as many flash sends as possible.',
      'Set a 30-60 minute timer. Attempt as many problems as possible, all on first try. Track sends and difficulty points. Rest only while walking between problems.',
      'Volume, flash fitness, decision-making, session pacing',
      'session', JSON.stringify({ sessionDuration: 1800, trackGrades: true }),
      'intermediate', 0],

    // Rhythm / Flow (5)
    ['tempo-climbing', 'Tempo Climbing', 'rhythm', null,
      'Climb to a metronome beat — one move per click at configurable BPM.',
      'Set a metronome BPM. Move exactly one limb per beat. Start slow (40 BPM) and increase over sessions. Forces rhythmic, deliberate movement.',
      'Rhythm, deliberate movement, pacing, composure',
      'metronome', JSON.stringify({ bpm: 40, beatsPerMove: 1 }),
      'beginner', 0],

    ['sloth-mode', 'Sloth Mode (Ultra Slow)', 'rhythm', null,
      'Climb as slowly as physically possible — minimum 5 seconds per move.',
      'Every hand move must take at least 5 seconds. Every foot placement at least 3 seconds. Hold each position for a full breath. Maximize total time on the wall.',
      'Body tension, lock-off endurance, balance, isometric strength',
      'metronome', JSON.stringify({ bpm: 12, beatsPerMove: 1 }),
      'intermediate', 0],

    ['monkey-mode', 'Monkey Mode (Fast Flow)', 'rhythm', null,
      'Climb fast and flowing — high BPM metronome driving momentum.',
      'Set metronome to 100-120 BPM. Climb with flow and momentum, one move per beat. Focus on reading ahead and trusting feet. Stay relaxed despite speed.',
      'Speed, flow, reading ahead, confidence, momentum',
      'metronome', JSON.stringify({ bpm: 100, beatsPerMove: 1 }),
      'intermediate', 0],

    ['surge-cruise', 'Surge and Cruise', 'rhythm', null,
      'Alternating tempo — 6 slow moves then 4 fast moves, repeating.',
      'Alternate between slow climbing (6 moves at 30 BPM) and fast climbing (4 moves at 100 BPM). Repeat the cycle throughout the problem.',
      'Tempo control, composure, speed variation, mental flexibility',
      'metronome', JSON.stringify({ slowBpm: 30, fastBpm: 100, slowMoves: 6, fastMoves: 4 }),
      'advanced', 0],

    ['deceleration', 'Deceleration Drill', 'rhythm', null,
      'Start fast and progressively slow down throughout the climb.',
      'Begin at 100 BPM and decrease by 10 BPM every 5 moves until reaching 30 BPM. Forces transition from momentum-based to precision-based climbing.',
      'Tempo control, transition skills, lock-off under fatigue',
      'metronome', JSON.stringify({ startBpm: 100, endBpm: 30, decrementPerPhase: 10, movesPerPhase: 5 }),
      'advanced', 0],

    // Grip Training (4)
    ['crimps-only', 'Crimps Only Climbing', 'grip', null,
      'Climb using only crimp holds — use half-crimp position to build strength while protecting pulleys.',
      'Choose problems with small edges, 2-3 grades below max. Use half-crimp grip (fingers bent ~90 degrees, thumb resting alongside index finger — NOT locked over the top). Avoid full crimp (thumb over index) as it loads pulleys dangerously. Monitor finger fatigue carefully — stop immediately if you feel any sharp pain, tweakiness, or heat in the finger tendons. Keep sessions to 15 minutes maximum.',
      'Half-crimp strength, finger flexor recruitment, tendon conditioning',
      'timer', JSON.stringify({ duration: 900, reminderInterval: 180, reminderText: 'Check your fingers. Any tweaks or sharp pain? Stop if so.' }),
      'intermediate', 0],

    ['slopers-only', 'Slopers Only Climbing', 'grip', null,
      'Climb using only sloper holds for hands.',
      'Use only sloper holds. Focus on maximizing surface contact, straight arms, pressing through feet, and body tension. Requires different positioning than crimps.',
      'Open-hand grip, friction management, body positioning, core tension',
      'timer', JSON.stringify({ duration: 1200, reminderInterval: 120, reminderText: 'Straight arms! Weight on feet!' }),
      'intermediate', 0],

    ['open-hand-only', 'Open Hand Only', 'grip', null,
      'Climb using only open-hand grip, never closing into a crimp.',
      'Climb all problems using only open-hand (three-finger drag) grip. Forces reliance on friction, body position, and technique over raw finger power.',
      'Open-hand strength, tendon-friendly habits, technique dependence',
      'callout', JSON.stringify({ mode: 'timed', interval: 30, callouts: ['Keep it open! No crimping.', 'Open hand grip only!', 'Relax the fingers — drag, don\'t crimp.'] }),
      'intermediate', 0],

    ['grip-type-caller', 'Grip Type Caller', 'grip', null,
      'Random grip type callout before each hand move.',
      'A random prompt calls the required grip type before each hand move: "Half crimp!" "Open hand!" "Pinch!" Use the called grip on the next hold.',
      'Grip versatility, adaptability, awareness of grip positions',
      'callout', JSON.stringify({ mode: 'timed', interval: 6, pools: { grip: ['Half crimp!', 'Open hand!', 'Full crimp!', 'Pinch!', 'Sloper palm!', 'Three-finger drag!'] } }),
      'intermediate', 0],

    // Body Position (3)
    ['hip-in-drill', 'Hip-In Drill', 'position', null,
      'Press one hip against the wall before every reach.',
      'On every move, ensure one hip is pressed against the wall before reaching. Left hand reaches = left hip in. Exaggerate the hip rotation. Climb 2-3 grades below max.',
      'Hip positioning, wall proximity, reach extension, energy efficiency',
      'callout', JSON.stringify({ mode: 'timed', interval: 6, pools: { hip: ['Left hip IN!', 'Right hip IN!', 'Turn left hip to the wall!', 'Turn right hip to the wall!', 'Left hip in — feel the reach!', 'Right hip in — extend!'] } }),
      'beginner', 0],

    ['straight-arm-emphasis', 'Straight Arm Emphasis', 'position', null,
      'Arms must be fully extended whenever not actively making a hand move.',
      'Climb with the rule that arms must be straight whenever you\'re not reaching. Hang on skeleton, not muscles. Sink low on every hold.',
      'Energy conservation, weight on feet, efficient resting',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 20, reminderText: 'Straighten your arms! Hang on bone, not muscle.' }),
      'beginner', 0],

    ['high-feet', 'Exaggerated High Feet', 'position', null,
      'Place your foot as high as physically possible on every move.',
      'On every move, place your foot as high as physically possible, even if lower footholds exist. Forces open hips, flexibility, and standing through legs.',
      'Hip flexibility, high stepping, leg-driven movement',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 30, reminderText: 'Higher! Push those feet up!' }),
      'beginner', 0],

    // Session Structures (3)
    ['pyramid-session', 'Pyramid Session Builder', 'session', null,
      'Build and track a grade pyramid from max grade down.',
      'Start at your max redpoint grade (1 problem). Step down one grade for 2 problems. Continue down. Rest 1-3 minutes between attempts at the top, less at the base.',
      'Volume, stamina, grade consolidation, mental endurance',
      'session', JSON.stringify({ tiers: 5, problemsPerTier: [1, 2, 2, 3, 3], durationPerProblem: 300, restBetweenProblems: 120 }),
      'intermediate', 0],

    ['volume-session', 'Volume Session Counter', 'session', null,
      'Track problem count during a high-volume session — many problems, minimal rest.',
      'Climb 20-40 problems at 2-4 grades below your max. Rest only while walking to the next problem (30-60 seconds). Focus on clean, efficient movement and first-try sends. This is about quantity of quality movement, not pumping yourself out.',
      'Movement reinforcement, technique under mild fatigue, aerobic base, route reading',
      'session', JSON.stringify({ sessionDuration: 3600 }),
      'beginner', 0],

    ['projecting-coach', 'Projecting Coach', 'session', null,
      'Attempt logger with section tracking and rest enforcement for projects.',
      'Select your project. Log attempts, noting fall points. Break into sections and track links. Enforced rest (3-5 min) between attempts.',
      'Maximum strength, problem-solving, persistence',
      'session', JSON.stringify({ attempts: 10, attemptDuration: 300, restBetweenAttempts: 240 }),
      'advanced', 0],

    // Warm-Up (3)
    ['four-up-four-down', '4 Up 4 Down Warm-Up', 'warmup', null,
      'Guided 80-move warm-up: 4 easy problems, each climbed up and down.',
      'Select 4 easy problems spanning varied angles and hold types. Climb each up and down. Repeat the circuit once. Total: ~80 moves. Difficulty: very easy.',
      'Neuromuscular activation, downclimbing practice, warm-up',
      'session', JSON.stringify({ problems: 4, circuits: 2, problemDuration: 120, restBetweenProblems: 15 }),
      'beginner', 0],

    ['progressive-warmup', 'Progressive Pyramid Warm-Up', 'warmup', null,
      'Progressive grade increase from easy to near-max over 15-25 minutes.',
      'Start with 2-3 problems well below limit. Rest 2-3 min. Move to 2 problems slightly harder. Rest. Move to 1 problem just below max. Never jump more than 1-2 grades between stages.',
      'Progressive activation, grade acclimation, connective tissue prep',
      'session', JSON.stringify({ tiers: 4, problemsPerTier: [3, 2, 2, 1], durationPerProblem: 180, restBetweenTiers: 150 }),
      'beginner', 0],

    ['dynamic-stretching', 'Dynamic Stretching Routine', 'warmup', null,
      'Guided dynamic stretching with timed exercises.',
      'Arm circles, hip circles, wrist circles, shoulder rolls, leg swings, hip openers, finger flexion/extension, high knees. 30 seconds each exercise.',
      'Joint mobility, injury prevention, range of motion',
      'timer', JSON.stringify({
        exercises: [
          { name: 'Arm circles forward', duration: 30 },
          { name: 'Arm circles backward', duration: 30 },
          { name: 'Hip circles', duration: 30 },
          { name: 'Wrist circles', duration: 30 },
          { name: 'Shoulder rolls', duration: 30 },
          { name: 'Leg swings front-back', duration: 30 },
          { name: 'Leg swings side-to-side', duration: 30 },
          { name: 'Hip openers', duration: 30 },
          { name: 'Finger flexion and extension', duration: 30 },
          { name: 'High knees', duration: 30 }
        ]
      }),
      'beginner', 0],

    // Cool-Down (3)
    ['easy-traverse-cooldown', 'Easy Traversing Cool-Down', 'cooldown', null,
      'Easy traversing with shake-out and breathing reminders.',
      'After your main session, traverse easy terrain for 5-10 minutes. Move slowly, focus on breathing and relaxed grip. Shake out frequently.',
      'Active recovery, metabolic waste clearance, cool-down',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 60, reminderText: 'Shake out! Breathe deep and relax your grip.' }),
      'beginner', 0],

    ['antagonist-circuit', 'Antagonist Cool-Down Circuit', 'cooldown', null,
      'Push-ups, reverse wrist curls, external rotation, finger extension circuit.',
      'Perform 2-3 sets: push-ups (10-15), reverse wrist curls (15-20), external rotation with band (15/arm), finger extension (30s). Light intensity.',
      'Antagonist balance, injury prevention, shoulder health',
      'timer', JSON.stringify({
        sets: 2,
        exercises: [
          { name: 'Push-ups', duration: 45 },
          { name: 'Reverse wrist curls', duration: 45 },
          { name: 'External rotation (each arm)', duration: 45 },
          { name: 'Finger extensions', duration: 30 }
        ],
        restBetweenExercises: 10,
        restBetweenSets: 60
      }),
      'beginner', 0],

    ['static-stretching', 'Static Stretching Routine', 'cooldown', null,
      'Guided hold timers per stretch — 30-60 seconds each.',
      'Hold static stretches for 30-60s each: forearm flexors/extensors, chest/shoulders, lats, hip flexors, hamstrings, calves. Total: 10-15 minutes.',
      'Flexibility, injury prevention, recovery, range of motion',
      'timer', JSON.stringify({
        exercises: [
          { name: 'Forearm flexor stretch (prayer)', duration: 45 },
          { name: 'Forearm extensor stretch', duration: 45 },
          { name: 'Chest and shoulder stretch', duration: 45 },
          { name: 'Lat stretch (child\'s pose)', duration: 45 },
          { name: 'Hip flexor stretch (kneeling lunge)', duration: 45 },
          { name: 'Hamstring stretch', duration: 45 },
          { name: 'Calf stretch', duration: 45 },
          { name: 'Wrist circles and shakes', duration: 30 }
        ]
      }),
      'beginner', 0],

    // Competition (2)
    ['comp-simulator', 'Competition Simulator', 'competition', null,
      'IFSC-format boulder round — 4 minutes per problem with transition periods.',
      'Select 4-5 problems you haven\'t tried (ask a friend to set them, or pick unfamiliar ones). For each problem you have exactly 4 minutes to attempt it — log sends and falls. After each problem, rest 2 minutes while walking to the next. The pressure of the clock is the training stimulus. Practice reading quickly, committing to sequences, and managing attempts within the time limit.',
      'Competition readiness, performing under pressure, time management, flash ability',
      'session', JSON.stringify({ problems: 4, timePerProblem: 240, transitionTime: 120 }),
      'advanced', 0],

    ['isolation-sim', 'Isolation Simulation', 'competition', null,
      'Simulate competition isolation — approach problems cold with observation then attempt phases.',
      'Select 3-4 problems you haven\'t previewed. Warm up on other terrain first. Approach each problem cold: 2 minutes of observation (study the holds, plan your sequence, visualize), then 4 minutes to attempt it. Once your attempt time ends, move on — no returning to a previous problem. This simulates the IFSC isolation experience where you see a problem for the first time and must perform immediately.',
      'Onsight ability, route reading under pressure, visualization, competition readiness',
      'session', JSON.stringify({ problems: 4, observationTime: 120, timePerProblem: 240 }),
      'advanced', 0],

    // --- Breathing & Mental ---
    ['breathing-ladder', 'Breathing Ladder', 'technique', 'breathing',
      'Structured breathing patterns while climbing — exhale on every move, then every 2 moves, then every 3.',
      'Climb easy terrain (3-4 grades below max). Level 1: Exhale audibly on every single move. Level 2: Exhale every 2 moves, breathe normally between. Level 3: Exhale every 3 moves. The callout will guide your rhythm. If you catch yourself holding your breath, drop back a level. This drill teaches the habit of breathing under physical stress — the single most common mistake climbers make.',
      'Breathing under exertion, composure, pump management, oxygen delivery',
      'callout', JSON.stringify({ duration: 900, mode: 'timed', interval: 6, callouts: ['Breathe OUT on this move!', 'Exhale... let the air go.', 'Breathe! Don\'t hold it.', 'Big exhale as you pull.', 'Blow it out... stay relaxed.'] }),
      'beginner', 0],

    ['calm-under-pump', 'Calm Under Pump', 'technique', 'breathing',
      'Climb into a pump, then practice breathing and shaking out without coming off the wall.',
      'Climb continuous moderate terrain until you feel a solid pump (3-5 out of 10). Then STOP on a decent hold and practice: drop one arm, shake vigorously for 15 seconds while breathing deeply. Switch arms. Repeat until the pump drops to 1-2. Then continue climbing until pumped again. Repeat the cycle for the session duration. The goal is to learn that pump is manageable, not a reason to fall.',
      'Pump management, recovery while climbing, finding rest positions, mental composure',
      'timer', JSON.stringify({ duration: 900, reminderInterval: 120, reminderText: 'Find a stance! Drop an arm, shake, breathe deep. 15 seconds each arm.' }),
      'intermediate', 0],

    // --- Route Reading ---
    ['route-reading-practice', 'Route Reading Timer', 'technique', 'reading',
      'Structured ground-up observation: study the problem, plan your sequence, then execute.',
      'Stand in front of an untried problem. Spend 2 minutes studying it from the ground: identify the starting holds, trace the likely sequence, note the crux, plan your feet, identify rest positions. Then climb it. After the attempt, ask: What did I read correctly? What surprised me? Then move to the next problem. The observation phase is the training — don\'t skip it.',
      'Route reading, sequence planning, problem-solving efficiency, onsight ability',
      'session', JSON.stringify({ problems: 6, observationTime: 120, timePerProblem: 240, restBetweenProblems: 30 }),
      'beginner', 0],

    // --- Rest Position Practice ---
    ['shakeout-stations', 'Shake-Out Stations', 'endurance', 'recovery',
      'Practice finding and using rest positions mid-route — the skill that separates endurance climbers.',
      'On routes or long traverses, deliberately stop at every possible rest position. Spend 30 seconds at each stance: find the best body position, drop one arm, shake it out, switch arms, breathe. Then continue to the next rest. Don\'t rush through rests — the skill is recognizing WHERE to rest and HOW to rest efficiently. Most climbers blow through rest stances because they feel urgent to keep moving. Fight that instinct.',
      'Rest position identification, efficient recovery, pump management, patience',
      'timer', JSON.stringify({ duration: 1200, reminderInterval: 90, reminderText: 'Find a rest! Drop an arm, shake out, breathe deep. Don\'t rush.' }),
      'beginner', 0],

    // --- Body Tension ---
    ['roof-tension', 'Steep Terrain Tension Drill', 'position', 'tension',
      'Practice maintaining body tension on overhanging terrain — feet stay on, core stays engaged.',
      'On overhanging terrain (30-45 degrees), climb problems focusing exclusively on body tension. Pull your hips toward the wall. Press hard through your toes. Engage your core before every move. If your feet cut loose, the problem is too hard or your tension dropped — downclimb and reset. The goal is to never swing, never cut feet, never barn-door. Every move is controlled.',
      'Core tension, toe hooking, hip engagement, steep terrain technique, anti-swing control',
      'timer', JSON.stringify({ duration: 900, reminderInterval: 45, reminderText: 'Squeeze your core! Press through your toes! No swinging.' }),
      'intermediate', 0],

    ['quiet-body', 'Quiet Body (No Swing)', 'position', 'tension',
      'Climb without any visible swing, barn-door, or uncontrolled momentum.',
      'Climb problems 2-3 grades below max. The rule: your body must be completely still and controlled at every point. No swinging, no barn-dooring, no uncontrolled cutting of feet, no momentum. If any part of your body swings, downclimb one move and redo it. Imagine a glass of water balanced on your head — don\'t spill it.',
      'Body control, core tension, precise movement, balance, controlled climbing',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 30, reminderText: 'No swing! No barn-door! Stay perfectly controlled.' }),
      'beginner', 0],

    ['tension-board', 'Tension & Engagement Drill', 'position', 'tension',
      'Squeeze every hold and foothold like your life depends on it — maximum engagement, zero slack.',
      'On easy-to-moderate overhang, climb with maximum intentional engagement. Squeeze your core before reaching. Press toes down hard. Grip with intent. Pull shoulder blades down and in. The goal is to feel what full-body tension feels like, so you can recognize when it\'s absent. Every hold should feel solid because your whole body is working, not just your fingers.',
      'Full-body tension awareness, core-to-finger chain, engagement patterns, body position',
      'timer', JSON.stringify({ duration: 600, reminderInterval: 20, reminderText: 'Engage everything! Core tight, toes pressing, shoulders set.' }),
      'beginner', 0],

    // --- Beginner/Intermediate Power ---
    ['power-moves', 'Power Move Practice', 'power', null,
      'Structured practice of big, powerful moves on terrain you can control.',
      'Choose problems with 1-2 distinctly powerful moves (big reaches, dynamic throws, compression) but that are otherwise within your ability. The moves should be hard enough that you have to TRY, but not so hard that you can\'t do them within 3-4 attempts. Focus on generating force: pull hard, drive through legs, commit to the move. Rest 2-3 minutes between attempts. Track which moves you stick and which you miss.',
      'Power generation, commitment, dynamic movement, contact strength',
      'session', JSON.stringify({ attempts: 12, attemptDuration: 120, restBetweenAttempts: 150 }),
      'intermediate', 0],

    ['max-move-linking', 'Max Move Linking', 'power', null,
      'Link the hardest sequence of moves you can: start with 2 moves, then try 3, then 4.',
      'Find a section of hard moves (at or near your limit). Link 2 moves successfully. Then try to link 3. Then 4. Rest fully (3-5 min) between attempts. Stop when you can no longer link more moves or quality drops. This builds power by applying it over short, maximal sequences — harder than single moves but shorter than full problems.',
      'Move linking, sustained maximum effort, power over short sequences, contact strength',
      'session', JSON.stringify({ attempts: 8, attemptDuration: 180, restBetweenAttempts: 240 }),
      'intermediate', 0],

    // --- Finger Warm-Up ---
    ['finger-warmup', 'Finger Activation Warm-Up', 'warmup', 'fingers',
      'Progressive finger loading from zero to climbing-ready in 10 minutes.',
      'Do NOT start climbing on hard problems with cold fingers. This protocol progressively loads your finger tendons:\n\n1. Finger flexion/extension (open and close fists) — 30s\n2. Finger rolls with light pressure against thigh — 30s\n3. Easy jug pulls on the wall (large holds, easy angle) — 2 min\n4. Moderate holds, easy problems — 2 min\n5. Slightly smaller holds, still easy problems — 2 min\n6. Near-onsight-level holds on easy terrain — 2 min\n\nNow your fingers are warm. Don\'t skip this even if you\'re in a hurry — 10 minutes of warm-up prevents months of injury rehab.',
      'Tendon preparation, injury prevention, progressive finger loading, safe warm-up',
      'timer', JSON.stringify({
        exercises: [
          { name: 'Finger flexion and extension (open/close fists)', duration: 30 },
          { name: 'Finger rolls against thigh', duration: 30 },
          { name: 'Easy jug pulls — large holds, easy angle', duration: 120 },
          { name: 'Moderate holds — easy problems', duration: 120 },
          { name: 'Slightly smaller holds — easy problems', duration: 120 },
          { name: 'Near-onsight holds — easy terrain', duration: 120 }
        ]
      }),
      'beginner', 0],

    // --- Active Recovery ---
    ['active-recovery', 'Active Recovery Session', 'endurance', 'recovery',
      'Easy day on the wall: very low intensity climbing focused on movement quality and blood flow.',
      'This is for rest days when you want to move but not train hard. Climb at 50-60% effort — nothing should feel difficult. Focus on perfect footwork, smooth transitions, and breathing. If you feel any pump at all, you\'re climbing too hard. Between problems, do light stretching and mobility work. Total volume: 20-30 easy problems over 45-60 minutes. The goal is blood flow and movement quality, not fitness.',
      'Active recovery, blood flow, movement quality, technique reinforcement without fatigue',
      'timer', JSON.stringify({ duration: 2700, reminderInterval: 300, reminderText: 'Stay easy! No pump. Focus on perfect movement. Stretch between problems.' }),
      'beginner', 0],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(...item);
    }
  });
  insertMany(tools);
  console.log(`  Inserted ${tools.length} tool definitions`);
}

seed();

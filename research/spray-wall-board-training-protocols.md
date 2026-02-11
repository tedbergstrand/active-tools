# Spray Wall, Board Training, and Solo Climbing Protocols
## Comprehensive Research for Building Interactive Digital Tools

---

## 1. SPRAY WALL SPECIFIC DRILLS

### 1.1 Random Problem Generation

**Concept:** An algorithm selects a set of holds from a photographed or mapped wall to create a novel boulder problem on demand.

**How existing apps work:**
- **Stokt** (getstokt.com): Allows users to photograph their spray wall, tap holds on the image, and publish/share problems. Community-driven problem creation. Does NOT currently auto-generate problems -- users have requested this feature.
- **BoulderBot**: Uses procedural generation algorithms to create an infinite number of new climbs. Users customize parameters like difficulty and length. Holds are color-coded by function: green = start, blue = hand/foot, yellow = feet only, red = finish.
- **Crux App**: Uses AI-powered hold detection. User snaps a photo, the app highlights holds, and users tap to define the problem. Supports foot rules like "Feet Follow Hands," "Only Marked Feet," "Campus (No Feet)," and "Any Feet."

**Implementation requirements for a random generator:**
- **Hold database**: Each hold has properties: position (x, y), type (jug, crimp, sloper, pinch, pocket), size, orientation, angle of the wall section it sits on.
- **Reachability graph**: Pre-compute which holds can be reached from which other holds based on average arm span (adjustable for user height). Typical max dynamic reach ~1.8m, static reach ~1.4m.
- **Generation algorithm**:
  1. Select a start position (two holds at similar height, reachable from the ground).
  2. Generate a path upward using the reachability graph, choosing next holds that respect the target difficulty.
  3. Difficulty modifiers: distance between holds, hold type (jug=easy, crimp=hard), angle of wall, whether the move requires a cross-through, whether feet are restricted.
  4. Assign foot holds: either "any feet," "feet follow hands," or specific marked footholds.
  5. Designate a finish hold(s) at or near the top.
- **Difficulty calibration**: Use a scoring model: hold_quality_score + distance_score + angle_score + body_position_complexity. Map aggregate scores to V-grades.
- **Constraint parameters the user can set**: Number of moves (3-20), target grade (V0-V14), hold types to include/exclude, movement style (static, dynamic, compression), wall angle preference.

### 1.2 Feet-Follow-Hands Drill

**Definition:** The climber may only use footholds that their hands have previously touched. As you climb upward, each hand hold you release becomes an available foothold. No other footholds may be used.

**Detailed protocol:**
1. Select a route 2-3 grades below onsight level.
2. Begin climbing. The only legal footholds are holds your hands have already gripped and released.
3. This forces high stepping, flagging, backstepping, and creative hip positioning because foot options are severely limited.
4. **Variation A**: "Strict" -- feet can only go on holds hands have already left.
5. **Variation B**: "Match first" -- before moving a hand off a hold, you must match your foot to it (hand-foot match), then move the hand.
6. **Variation C**: "Tracking" -- your foot must go to the exact hold your same-side hand just left (right hand releases hold X, right foot goes to hold X).

**What an app would track:**
- Timer per move
- Total moves completed
- Whether the user self-reports any foot placement violations
- Session log with difficulty progression over time

### 1.3 Tracking Drill

**Definition:** "Tracking" means placing your foot precisely on the exact spot your hand just occupied. Right hand moves up, right foot goes to where right hand was. Left hand moves up, left foot goes to where left hand was. Same-side limbs follow each other.

**Protocol:**
1. Choose a moderate route on the spray wall.
2. Start with both hands on the start holds.
3. Move right hand to next hold. Move right foot to where right hand was.
4. Move left hand to next hold. Move left foot to where left hand was.
5. Repeat until topping out.
6. Focus on precision -- the foot should land on the exact same part of the hold the hand used.

**Training benefit:** Forces awareness of hand and foot sequencing, improves precision, develops the habit of high feet and weight transfer.

**App implementation:**
- Display the sequence order: "Right hand to Hold A -> Right foot to Hold A -> Left hand to Hold B -> Left foot to Hold B..."
- Metronome mode: beep on each expected limb movement to enforce rhythm.
- Difficulty scaling: add time pressure, reduce hold quality, increase wall angle.

### 1.4 Elimination Drill

**Definition:** After sending a problem, remove one hold from the sequence and re-send. Continue eliminating holds until the problem becomes impossible.

**Solo version protocol:**
1. Set or choose a spray wall problem with 8-12 hand holds.
2. Send the full problem.
3. On the next attempt, mentally eliminate one hold (do not touch it). Choose the hold that seems least critical.
4. Send the reduced problem.
5. Eliminate another hold. Repeat.
6. Continue until you cannot complete the problem.
7. Record how many holds you could eliminate.

**App implementation:**
- Display the problem with all holds highlighted.
- After each successful send, the app randomly selects a hold to eliminate (or lets the user choose).
- Track: number of eliminations achieved, which holds were removed, number of attempts per elimination level.
- Leaderboard: "Most holds eliminated on Problem X."
- **Auto-elimination mode**: The app chooses which hold to remove, prioritizing removing "easy" holds first to maximize the challenge escalation.

### 1.5 Add-On Solo

**Definition:** A solo version of the classic two-player Add-On game. The climber builds a problem one move at a time, adding a new move each attempt.

**Protocol:**
1. Start on two designated hand holds.
2. Make one move (hand to a new hold). Drop off.
3. Start again. Make the same first move, then add a second move. Drop off.
4. Start again. Make moves 1 and 2, then add move 3. Drop off.
5. Continue until you fall or reach a designated length (e.g., 10-15 moves).
6. The challenge: each attempt requires repeating the entire sequence from memory plus adding one new move.

**App implementation:**
- The app records each move as the user adds it (user taps the hold on a wall photo).
- On each attempt, the app displays the full sequence to memorize before starting.
- After the attempt, the user reports success/failure.
- **Randomized Add-On**: The app suggests the next hold to add (from available reachable holds), preventing the user from always choosing comfortable moves.
- Track: longest sequence achieved, number of attempts, session-over-session progression.

### 1.6 Hover Hand Drill

**Definition:** Before grabbing any handhold, the climber must pause and hover their hand 1-2 inches above the hold for 3-5 seconds without touching it, maintaining body position through core tension and the other three points of contact.

**Protocol:**
1. Choose a route 2-3 grades below onsight level.
2. Climb normally but before each hand placement, hold your reaching hand motionless 1-2 inches above the target hold.
3. Count 3-5 seconds (or wait for an audio cue).
4. Only then grab the hold.
5. **Variation**: Also hover feet -- pause your foot 1-2 inches above each foothold before placing it.

**Training benefits:** Builds lock-off strength, core tension, body awareness of center of mass, precision in hand targeting, awareness of efficient resting positions.

**App implementation:**
- Countdown timer with audio: when the user reaches for a hold, they tap a button (or the app uses a regular interval). A voice says "Hover..." then counts "3... 2... 1... Grab."
- Configurable hover duration: 2-10 seconds.
- Session tracking: number of successful hovers, grade of route, total time on wall.
- Progressive overload: increase hover time by 1 second each session, or increase route difficulty.

### 1.7 Compass Rose Movement Patterns

**Concept:** A directional movement drill where the climber practices reaching and moving in all eight cardinal/intercardinal directions (N, NE, E, SE, S, SW, W, NW) from a fixed body position, like the points of a compass.

**Protocol:**
1. Find a comfortable position on the wall with good hand and foot holds. This is your "center."
2. The app calls out a direction: "North" (reach directly up), "East" (reach right), "Southwest" (reach down-left), etc.
3. The climber reaches in that direction to touch or grab the nearest available hold in that direction.
4. Return to center position.
5. The app calls the next direction.
6. Complete a full compass cycle or random sequence.

**Variations:**
- **Hands only**: Feet stay fixed, one hand stays on a hold, the other reaches in the called direction.
- **Feet only**: Hands stay fixed, move feet to holds in the called direction.
- **Full body**: Move entire body position in the called direction by 1-2 holds.
- **Timed**: Each direction must be reached within X seconds.
- **Random vs. Sequential**: Call directions randomly for reaction training, or cycle through N-NE-E-SE-S-SW-W-NW for systematic range-of-motion work.

**App implementation:**
- Visual compass rose on screen showing the eight directions.
- Audio callout of each direction with configurable interval (3-10 seconds between calls).
- Random or sequential mode.
- Track: total directions completed, failures/misses, time per reach.
- Progressive difficulty: decrease time between calls, add holds-only restrictions (e.g., "reach North but only slopers allowed").

---

## 2. BOARD TRAINING PROTOCOLS

### 2.1 Benchmark Problems

**Definition:** Benchmark problems are community-vetted climbs on standardized boards (MoonBoard, Kilter, Tension) where the grade has been widely agreed upon by many ascensionists. They serve as standardized tests of climbing ability.

**Board-specific details:**

**MoonBoard:**
- Created in 2004 by Ben Moon. Standardized 40-degree overhanging board, 12 feet tall, 8 feet wide.
- Multiple hold sets (2016, 2017, 2019, 2024) with different layouts.
- Official benchmark problems marked with a star icon in the app.
- Grades: V4-V14+ (V3 on MoonBoard feels like commercial gym V5).
- Benchmarks have 3+ ascents with grade consensus.
- No problems below V3. Pure power and finger strength tool.

**Kilter Board:**
- Adjustable angle: 0-70 degrees (widest range of any board).
- Symmetric hold layout allows mirroring problems.
- LED-lit holds show the active problem.
- Grades: V0-V14+. Most beginner-friendly board.
- No formal "benchmark" system, but uses community ascent data and grade consensus. Problems with many ascents and stable grades serve as de facto benchmarks.
- App lets you filter by grade, angle, hold type, ascents, quality rating.

**Tension Board (TB2):**
- 30-50 degree angle range.
- Symmetric board -- every problem can be "flipped" (mirrored), doubling the training value.
- LED hold illumination.
- Grades: V1-V13+.
- Benchmark system based on community consensus.
- The symmetry feature is excellent for identifying and training side-to-side imbalances.

**How to use benchmarks for training:**
1. **Testing protocol**: Attempt all benchmarks at your current grade. Track send rate (percentage sent within 3 attempts).
2. **Progression metric**: When you send >80% of benchmarks at a grade, you are ready to move up.
3. **Weakness identification**: Benchmark problems that take many more attempts than average reveal style weaknesses (e.g., always failing on compression benchmarks = weak compression).
4. **Periodic retesting**: Every 4-6 weeks, re-attempt the same benchmark set to measure improvement.

**App implementation:**
- Curated benchmark list per board type and grade.
- Session logging: attempts, sends, quality rating.
- Analytics dashboard: send rate per grade, style breakdown, progression over time.
- Comparison to community averages.

### 2.2 Projecting Protocols

**Definition:** Projecting is the systematic process of working a climb that is too difficult to send immediately, involving breaking it into sections, learning individual moves, linking sections, and eventually completing the full send.

**Structured projecting protocol:**
1. **Inspection phase** (5-10 minutes): Study the problem from the ground. Identify hold types, likely sequences, potential cruxes. Visualize the full sequence.
2. **First attempt**: Flash attempt. Climb as far as possible without stopping to think. Note where you fall.
3. **Sectioning**: Break the problem into 2-4 sections. Work each section individually.
4. **Move-level work**: For the crux section, isolate the hardest 1-3 moves. Try different beta (body positions, hand sequences, foot placements). Find what works.
5. **Linking**: Link sections together starting from the bottom. Example: if problem has sections A-B-C-D, link A+B, then B+C, then C+D, then A+B+C, then B+C+D, then full send.
6. **Send burns**: Full attempts from the start. Maximum 3-5 quality send burns per session before fatigue degrades performance.
7. **Rest**: If not sent, rest 48-72 hours before the next projecting session on the same problem.

**Rest between attempts:**
- 3-5 minutes minimum between full send attempts.
- Take shoes off between attempts to resist rapid-fire re-trying.
- Quality over quantity: one 100% effort attempt > five 70% effort attempts.

**App implementation:**
- Project tracker: log the problem, sections, crux moves, beta notes.
- Attempt counter with built-in rest timer (enforced minimum rest).
- Section send tracking: "Section A sent, Section B sent, A+B linked, full send pending."
- Progress visualization: show which sections are solid, which need work.
- Session notes: record beta changes, hold sequences, body positions.
- Historical tracking: number of sessions to send, attempt count to send.

### 2.3 Volume Pyramids

**Definition:** A structured session where the climber completes a pyramid of problems across multiple grades, with more volume at lower grades and less at higher grades, building a broad base of fitness.

**Standard pyramid structure (2:1 ratio between levels):**
```
         1x V_max (flash or 2nd try)
        2x V_max - 1
       4x V_max - 2
      8x V_max - 3 (warm-up)
```

**Example for a V6 climber:**
```
         1x V6
        2x V5
       4x V4
      8x V3 (warm-up)
```

**Session protocol:**
1. Warm up with 8 problems at V3 (low effort, focus on movement quality).
2. Climb 4 problems at V4 (moderate effort, focus on precision).
3. Climb 2 problems at V5 (high effort, focus on executing learned beta).
4. Attempt 1 problem at V6 (maximum effort, send attempt).
5. Optional: reverse the pyramid (cooldown) -- 1x V5, 2x V4, 4x V3.

**Types of pyramids:**
- **Volume pyramid**: Focus on high number of problems at lower grades. Builds endurance, movement vocabulary, confidence. Effort stays at 5/10 or below.
- **Performance pyramid**: Focus on the top of the pyramid. More attempts at max grade. Builds power and project-level fitness.
- **Density pyramid**: Time-constrained. Complete the pyramid within a fixed time (e.g., 90 minutes). Rest only as needed.

**App implementation:**
- User sets their max grade. App auto-generates the pyramid.
- Checklist interface: tap to mark each problem sent.
- Timer tracking total session duration.
- Progression: when the pyramid is completed, suggest upgrading max grade by one.
- History: pyramids completed over time, success rate at each level.

### 2.4 Limit Session Structure

**Definition:** A session focused exclusively on maximum-effort, near-impossible moves or sequences (1-5 moves) to develop peak power and finger strength. This is NOT about sending -- it is about stimulating neuromuscular adaptation through maximal recruitment.

**Session structure:**
1. **Warm-up** (20-30 minutes): Progressive bouldering from easy to moderate. Include mobility work. Do NOT skip this.
2. **Activation** (10 minutes): 2-3 problems at 1-2 grades below max, sent clean. Purpose is neural activation.
3. **Limit bouldering** (45-60 minutes):
   - Select 3-5 boulder problems or isolated move sequences at or above your max grade.
   - Each "problem" is only 1-5 moves long.
   - Give maximum effort on each attempt.
   - **Rest**: 3-5 minutes between attempts on the same problem. If the problem took <5 seconds, rest at least 2 minutes (ratio of 1:20-1:50 work:rest).
   - **Attempts per problem**: 3-5 quality attempts. If not sent in 5 tries, move on.
   - **Total problems**: Work 3-5 different problems per session.
   - **Take shoes off** between attempts to enforce rest.
   - **Never feel pumped.** If you feel a pump, you are resting too little.
4. **Cool-down** (10-15 minutes): Easy traversing, stretching, antagonist exercises.

**Key rules:**
- Maximum 2 limit sessions per week on non-consecutive days.
- Never do limit sessions two days in a row.
- Stop the session if you notice declining performance (falling off moves you already did).
- No fatigue-based training in the same session.

**App implementation:**
- Session template with warm-up timer, activation checklist, limit phase timer.
- Attempt logger with automatic rest timer: starts counting when user logs an attempt, alerts when minimum rest has elapsed.
- Performance tracker: log highest move reached on each problem each attempt.
- Fatigue monitor: if the user logs 3 consecutive failed attempts on moves previously completed, suggest ending the session.
- Session summary: total attempts, rest compliance, peak performance achieved.

---

## 3. MOVEMENT RANDOMIZATION GAMES

### 3.1 How Apps Like Stokt and BoulderBot Work

**Stokt (getstokt.com):**
- User photographs their wall.
- Holds are manually identified by tapping on the image.
- Problems are created by selecting a sequence of holds and assigning start/finish.
- Community sharing: problems are published for others to try.
- Logging: users log sends and attempts with grades.
- Does NOT auto-generate problems (community-requested feature).

**BoulderBot:**
- Uses procedural generation algorithms.
- User maps their wall (photo + hold identification).
- Algorithm generates problems based on parameters: difficulty (1-10 scale), length (number of moves), hold type preferences.
- Color-coded hold roles: green=start, blue=hands+feet, yellow=feet-only, red=finish.
- Pro version allows drawing paths and specifying hold types and rules.

**Boulder Challenge:**
- Randomizer app for spray walls.
- Generates random hold selections based on wall configuration.
- Users can set constraints like difficulty and style.

**Crux App:**
- AI-powered hold detection from photos.
- Supports multiple foot rule presets.
- Community problem sharing.
- Gym integration for commercial spray walls.

### 3.2 Random Sequence Generation Logic

**Algorithm for generating random move sequences:**
1. **Input**: Wall map (hold positions, types, sizes), target difficulty, target length, movement restrictions.
2. **Start hold selection**: Pick 1-2 holds near the bottom of the wall within standing reach.
3. **Path generation**:
   - From current position, compute all reachable holds (within arm span, considering wall angle).
   - Score each option: hold_difficulty + move_distance + directional_variety + body_position_change.
   - Select next hold probabilistically weighted by target difficulty (harder target = more likely to pick harder moves).
4. **Termination**: Path ends when target length reached or a finish hold near the top is reached.
5. **Foot assignment**: Based on selected foot rule (any, feet-follow-hands, marked only, campus).
6. **Validation**: Check that the generated sequence is physically possible (no impossible reaches, no forced double-dyno from bad positions).

### 3.3 Calling Out Hold Colors

**Concept:** On a commercial spray wall with color-coded holds, an app randomly calls out hold colors to constrain which holds the climber can use.

**Protocol:**
1. The app announces a starting color: "Green holds only."
2. The climber must build a path using only green holds.
3. At intervals (every 30 seconds, or every 3 moves), the app calls a new color: "Switch to blue!"
4. The climber must transition to using only blue holds.
5. Feet may be unrestricted or follow the same color rule.

**Variations:**
- **Single color challenge**: Climb using only one color for the entire attempt.
- **Color switching**: App calls new colors at intervals.
- **Hand/foot split**: "Hands on red, feet on yellow."
- **Elimination by color**: "No more green holds!" -- removes an entire color from play.

### 3.4 Movement Restrictions

**Types of restrictions an app can generate:**
- **No matching**: Hands may never be on the same hold simultaneously.
- **Campus**: No feet allowed (hands only).
- **Feet only marked**: Only specific marked holds for feet.
- **One-arm emphasis**: Every other move must be made with the non-dominant hand leading.
- **No thumbs**: Cannot wrap thumbs around holds (open-hand only).
- **Static only**: No dynamic movement allowed -- all moves controlled.
- **Dyno only**: Every hand move must be a dyno (both hands leave the wall).
- **Cross-through required**: Every other move must be a cross-through (reaching across the body).
- **Directional restriction**: "Only move right for 3 moves, then only move up for 3 moves."

---

## 4. CLIMBING TWISTER

### 4.1 Core Mechanic

Based on the classic Twister game mechanic: a spinner randomly selects a body part (left hand, right hand, left foot, right foot) and a color (red, blue, green, yellow, etc.), and the player must place that limb on a hold of that color.

### 4.2 Climbing Twister Protocol

**Setup:**
- Requires a wall with color-coded holds (standard in most gyms/spray walls).
- The app serves as the "spinner."

**Gameplay:**
1. Climber starts on the wall on any two hand holds and two foot holds.
2. The app calls: "[Body part] [Color]" -- e.g., "Left hand, BLUE!"
3. The climber must move their left hand to a blue hold (any blue hold they can reach).
4. Once placed, the app calls the next combination: "Right foot, RED!"
5. The climber moves their right foot to a red hold.
6. Continue until the climber falls or completes a set number of moves (e.g., 20).

**Rules:**
- The called limb must move to a hold of the called color.
- Other limbs stay where they are (or may readjust minimally for balance).
- If no hold of the called color is reachable, the climber gets one "pass" (or the app re-rolls).
- The game ends when the climber falls, gets into an impossible position, or completes the target number of moves.

### 4.3 App Implementation

**Core features:**
- **Random generator**: Produces (body_part, color) pairs. Body parts: [left_hand, right_hand, left_foot, right_foot]. Colors: configurable based on holds available on the user's wall.
- **Voice callout**: Text-to-speech announces each combination clearly: "Right hand... Yellow!"
- **Configurable timing**: Time between callouts (5-15 seconds, adjustable). Faster = harder.
- **Anti-repetition logic**: Avoid calling the same limb 3+ times in a row. Weight toward limbs that haven't been called recently.
- **Difficulty modifiers**:
  - Easy: 10-second intervals, 4 common colors, holds are abundant.
  - Medium: 7-second intervals, include less common colors, add "any hand" or "any foot" calls.
  - Hard: 5-second intervals, add "campus" calls (remove a foot), add "match" calls (move two limbs to the same hold).
- **Score tracking**: Moves completed, time on wall, longest streak without falling.
- **History**: Track improvement over sessions.

### 4.4 Advanced Climbing Twister Variants

- **Direction Twister**: Instead of colors, call directions -- "Left hand UP", "Right foot RIGHT."
- **Hold-type Twister**: Call hold types -- "Left hand SLOPER", "Right foot CRIMP."
- **Elimination Twister**: After 10 moves, one color is "removed" -- no limbs may touch that color anymore.
- **Speed Twister**: Intervals decrease every 5 successful moves (start at 10 sec, drop to 8, 6, 4...).

---

## 5. SOLO PARTNER SIMULATION

### 5.1 What a Climbing Partner/Belayer Normally Provides

A climbing partner provides: encouragement, beta suggestions, pacing cues, rest reminders, objective observation of technique, accountability, move counting, and timing awareness.

### 5.2 Encouragement System

**Types of encouragement a partner gives:**
- General: "Nice!", "Come on!", "You got this!", "Keep going!"
- Effort-specific: "Try hard!", "One more move!", "Stick it!"
- Recovery: "Good shake!", "Breathe!", "Relax your grip!"
- Post-attempt: "That was your best attempt!", "You're so close!", "You stuck that move this time!"

**App implementation:**
- **Context-aware callouts**: Based on timer state:
  - During climbing (timer running): "Keep moving!", "Stay tight!", "Breathe!", "Trust your feet!"
  - During rest (timer stopped): "Shake it out", "Chalk up", "Visualize the next section", "Control your breathing"
  - After a fall: "Good effort!", "You got higher that time!", "Shake it off, go again"
  - Before a send attempt: "You've got this dialed", "Trust the beta", "Deep breath, and go"
- **Configurable personality**: Options from "Quiet/minimal" to "Enthusiastic/loud" to "Drill sergeant."
- **Frequency**: Every 10-30 seconds during climbing, every 60 seconds during rest.
- **Text-to-speech voice selection**: Allow user to choose voice that motivates them.

### 5.3 Move Beta Callouts

**What a partner calls out:**
- "Flag left!", "Heel hook!", "Drop knee!", "High right foot!", "Match!", "Breathe before the dyno!"
- Pre-recorded or user-recorded beta cues for specific moves on a project.

**App implementation:**
- **Project beta recorder**: For a project, user records voice notes tied to specific move numbers: "Move 3: drop knee hard left, then reach high right."
- **Playback during attempts**: App plays back the recorded beta at the appropriate time (user taps to advance through moves, or app uses time-based intervals).
- **Generic technique reminders**: Randomized callouts of general technique cues: "Straight arms!", "Hips to the wall!", "Look at your feet!", "Weight on your toes!"

### 5.4 Rest Reminders

**Protocol:**
- After the user completes an attempt (taps "off the wall"), a rest timer starts.
- Based on session type:
  - Limit bouldering: 3-5 minute rest. Voice: "Rest 3 more minutes. Shake your arms. Hydrate."
  - Power endurance: 1-2 minute rest. Voice: "90 seconds rest. Deep breaths."
  - Send attempt: 5-8 minute rest. Voice: "Full recovery. Visualize the sequence. Chalk up."
- **Countdown alerts**: "One minute left", "30 seconds", "Ready when you are."
- **Anti-impatience feature**: If user tries to start climbing before minimum rest, a warning: "You still have 2 minutes of rest. Rushing will waste an attempt."

### 5.5 Pacing Cues

**What a partner provides for pacing:**
- During endurance climbing: "Slow down, you're rushing", "Keep a steady pace", "Don't stop, keep moving"
- During projecting: "Take your time on the setup", "Fast through the crux", "Rest at the jug"
- During intervals: "30 seconds left!", "10 seconds!", "REST!"

**App implementation:**
- **Interval timer with voice**: Counts work/rest periods with voice announcements.
- **Pace monitor mode**: Set a target pace (e.g., 1 move every 5 seconds). Audio beep indicates when the next move should happen. Voice says "You're ahead of pace" or "Speed up, you're falling behind" based on user-tapped move markers.
- **Breathing pacer**: Rhythmic audio cue for breathing during rest or during sustained climbing: inhale (3 sec), exhale (3 sec) audio pattern.

---

## 6. STRUCTURED INTERVAL TRAINING ON THE WALL

### 6.1 Energy Systems Overview

| Energy System | Duration | Climbing Application | Intensity | Recovery Need |
|---|---|---|---|---|
| Alactic (ATP-CP) | 0-10 sec | Single hard bouldering move, limit moves | Maximum (100%) | 2-5 min (1:20-1:50 work:rest) |
| Anaerobic Lactic (Glycolytic) | 10 sec - 2 min | Hard boulder problems, crux sequences | Very High (85-95%) | 3-8 min (1:3-1:5 work:rest) |
| Aerobic (Oxidative) | >2 min | Route climbing, endurance traverses, ARC | Moderate (30-70%) | 1:1 to 1:2 work:rest |

### 6.2 Alactic Power Training (ATP-CP System)

**Goal:** Train maximum force production and explosive power for 1-5 move sequences.

**Protocol:**
- **Work duration**: 5-10 seconds (1-3 hard moves)
- **Rest duration**: 2-5 minutes (1:20 to 1:50 work:rest ratio)
- **Sets**: 8-12 attempts per session
- **Intensity**: 95-100% max effort
- **Frequency**: 1-4 sessions per week depending on training phase

**Session template:**
```
Warm-up: 20-30 min progressive bouldering
Activation: 3x near-max problems, 3 min rest between
Main set:
  Problem 1: 3-5 attempts, 3 min rest between each
  Problem 2: 3-5 attempts, 3 min rest between each
  Problem 3: 3-5 attempts, 3 min rest between each
Cool-down: 10 min easy traversing + stretching
Total session: 75-90 min
```

### 6.3 Anaerobic Lactic Training (Glycolytic System)

**Goal:** Train the ability to perform sustained hard climbing for 15-90 seconds while managing pump.

**Protocol A: 30/30 Intervals**
- 30 seconds all-out climbing (max intensity on the wall)
- 30 seconds off (shaking, chalking, breathing)
- 6 intervals = 1 set
- 5-10 minutes complete rest between sets
- 2-4 sets per session

**Protocol B: 4x4s**
- Select 4 boulder problems 2-4 grades below max (must be slightly overhanging)
- Climb all 4 back-to-back with minimal rest (ideally <30 seconds transition)
- Total climbing time per set: ~4-6 minutes
- Rest between sets: Start at 2:1 rest:climb ratio, progress to 1:1
- 3-4 sets per session
- Frequency: 1-2 sessions per week, 48-72 hours between sessions

**Protocol C: Linked Boulders**
- Link 3-5 boulder problems in sequence (traverse between them or climb down/walk to the next)
- Each problem should take 30-60 seconds
- Total continuous climbing: 2-5 minutes
- Rest: 5-10 minutes
- 3-4 sets

### 6.4 Aerobic Training (Oxidative System)

**Protocol A: ARC Training (Aerobic Restoration and Capillarity)**
- Continuous climbing for 20-45 minutes
- Intensity: Very low. No more than 30% of maximum strength.
- Hold a mild, sustainable forearm pump throughout. Never get fully pumped.
- Route selection: 2-3 grades below max onsight level. Easy terrain.
- Traverse, climb up, downclimb, traverse -- continuous movement.
- Frequency: 2-3 sessions per week during base building phase.

**Protocol B: 3:2 Diminishing Intervals**
- Set 1: 3 min climbing / 2 min rest
- Set 2: 2 min climbing / 80 sec rest
- Set 3: 1 min climbing / 40 sec rest
- Set 4: 30 sec climbing / 20 sec rest
- Full cycle takes ~12 minutes. Repeat 2-3 times.
- Intensity: moderate for set 1, progressively harder through set 4.

**Protocol C: Up-Down-Up**
- Climb to the top of the spray wall
- Downclimb to the bottom
- Climb back to the top
- All without resting or taking hands off the wall
- Use moderate holds. Target: 3-5 minutes of continuous climbing.
- Rest 3-5 minutes. Repeat 3-5 times.

### 6.5 App Implementation for Interval Training

**Core timer features:**
- Configurable work/rest intervals with voice announcements
- Protocol templates: "30/30", "4x4", "ARC", "3:2 Diminishing", "Up-Down-Up"
- Audio cues: "CLIMB!" (start), "5 seconds!", "REST!", "Next set in 60 seconds"
- Visual: large countdown timer visible from the wall, color-coded (green=climb, red=rest)
- Session logging: sets completed, total time on wall, total rest time
- Heart rate integration (optional): monitor recovery during rest periods
- Progressive overload suggestions: "Last session you did 3 sets. Try 4 today." or "Reduce rest by 15 seconds."

---

## 7. PROGRESSIVE OVERLOAD PROTOCOLS

### 7.1 The Principle

Progressive overload means systematically increasing training demand over time to force continued adaptation. In climbing, this is achieved by manipulating one variable at a time.

### 7.2 Overload Variables for Wall Training

| Variable | How to Increase | Best For |
|---|---|---|
| **Intensity** (grade) | Attempt harder problems | Strength, power |
| **Volume** (number of problems) | Climb more problems per session | Endurance, technique |
| **Density** (rest reduction) | Decrease rest between problems | Power endurance |
| **Duration** (time on wall) | Longer continuous climbing sets | Aerobic capacity |
| **Complexity** (movement difficulty) | Add restrictions, harder movement types | Technique, movement skill |
| **Angle** (wall steepness) | Increase wall angle on adjustable boards | Strength, power, core |
| **Added weight** (vest/belt) | Wear a weight vest | Strength, power |
| **Hold size** (smaller holds) | Use smaller holds or filter for crimps | Finger strength |

### 7.3 Periodized Progressive Overload Plan

**Week 1-2: Volume Phase**
- 3 sessions/week
- Pyramid sessions with emphasis on base (high volume at moderate grades)
- 20-30 problems per session
- No limit bouldering

**Week 3-4: Intensity Phase**
- 3 sessions/week
- Reduce volume, increase grade attempts
- 10-15 problems per session, higher average grade
- Introduce 1 limit session per week

**Week 5-6: Density Phase**
- 3 sessions/week
- Same grades as week 3-4 but reduce rest times by 20-30%
- Add 4x4 or interval sessions
- 2 limit sessions per week

**Week 7: Performance/Testing Phase**
- 2-3 sessions
- Attempt benchmark problems at new target grade
- Full rest between attempts
- Test whether overload has resulted in grade progression

**Week 8: Deload/Recovery**
- 1-2 sessions, easy volume only
- Focus on technique drills, mobility, and fun climbing

### 7.4 Session-to-Session Progression Examples

**For strength (limit bouldering):**
- Session 1: Work 3 problems at V_max, 3 attempts each
- Session 2: Work 3 problems at V_max, 4 attempts each
- Session 3: Work 4 problems at V_max, 3 attempts each
- Session 4: Work 3 problems at V_max+1, 3 attempts each

**For power endurance (4x4s):**
- Session 1: 4x4 at V_max-3, rest 8 min between sets
- Session 2: 4x4 at V_max-3, rest 7 min between sets
- Session 3: 4x4 at V_max-3, rest 6 min between sets
- Session 4: 4x4 at V_max-2, rest 8 min between sets (reset rest, increase difficulty)

**For endurance (ARC):**
- Session 1: 20 min continuous climbing
- Session 2: 25 min continuous climbing
- Session 3: 30 min continuous climbing
- Session 4: 20 min continuous climbing on slightly harder terrain

### 7.5 App Implementation

- **Overload tracker**: Automatically log session parameters (volume, intensity, density, duration).
- **Progression suggestions**: After each session, app suggests one variable to increase next session based on user's goals.
- **Periodization planner**: 8-week template with volume/intensity/density/performance/deload phases.
- **Fatigue monitoring**: If performance declines across 2+ sessions, suggest a deload.
- **Grade progression chart**: Visual graph of max grade sent over time, volume at each grade, density trends.

---

## 8. WEAKNESS IDENTIFICATION DRILLS

### 8.1 Anti-Style Climbing

**Definition:** Deliberately choosing problems that are the opposite of your preferred climbing style. If you love crimps on vertical walls, you train slopers on overhangs. If you love dynamic movement, you train slow static sequences.

**Style assessment questionnaire (for app):**
1. What wall angle do you prefer? (Slab / Vertical / Slight overhang / Steep overhang / Roof)
2. What hold types do you prefer? (Jugs / Crimps / Slopers / Pinches / Pockets)
3. Do you prefer static or dynamic movement?
4. Do you prefer power (few hard moves) or endurance (many moderate moves)?
5. Do you prefer left-leading or right-leading sequences?

**The app then prescribes the opposite:**
- Slab lover -> Assign steep overhang problems
- Crimp preference -> Assign sloper-heavy problems
- Dynamic preference -> Assign slow, static problems with hover-hand restriction
- Power preference -> Assign 4x4 endurance circuits

**Protocol:**
1. Spend 1-2 sessions per week specifically on anti-style problems.
2. Choose problems that feel uncomfortable and unfamiliar.
3. Target 60-70% of your max grade in your anti-style (you will be weaker in your weak style).
4. Track send rates in anti-style vs. preferred style to measure the gap closing over time.

### 8.2 Non-Dominant Hand Emphasis

**Observation:** Most climbers have a dominant side. They preferentially reach with their dominant hand, lead with their dominant foot, and are stronger pulling with their dominant arm.

**Identification drill:**
1. Climb 5 problems normally. Note which hand makes the first move on each problem and which direction crux moves go.
2. Most climbers will find 70-80% of their first moves and crux reaches are with the dominant hand.

**Training protocol:**
- **Mirror problems**: On the Tension Board (symmetric), climb every problem AND its mirror. Compare difficulty.
- **Non-dominant lead**: On the spray wall, force every crux move to be led by the non-dominant hand.
- **Non-dominant start**: Always start problems with the non-dominant hand reaching first.
- **Offset hangs**: On hangboard, non-dominant hand on a smaller edge, dominant hand on a larger edge or with fewer fingers.
- **One-arm emphasis traverses**: Traverse a wall using predominantly the non-dominant hand. Dominant hand may only touch holds briefly for balance, not pull.

**App implementation:**
- Track which hand the user reports as their "lead hand" on each problem.
- Calculate dominance ratio (% of moves led by dominant hand).
- Suggest specific problems or restrictions to balance the ratio.
- "Non-dominant challenge": app generates problems where key moves must be reached by the non-dominant hand.

### 8.3 Weakness Exposure Circuit

**Protocol:**
A circuit of 6-8 short problems, each targeting a different movement type:
1. Slab balance problem (footwork, trust)
2. Steep compression problem (body tension, squeezing)
3. Dynamic problem (coordination, timing, commitment)
4. Long-reach problem (flexibility, body positioning)
5. Crimp-intensive problem (finger strength)
6. Sloper-intensive problem (open-hand strength, body position)
7. Heel/toe hook problem (lower body pulling, flexibility)
8. Volume/macro traverse (endurance, flow)

**Scoring:** Rate each problem 1-5 on perceived difficulty relative to the grade. The highest-scoring problem types are your weaknesses.

**App implementation:**
- Guided circuit with voice prompts for each station.
- Self-assessment rating after each problem.
- Radar chart visualization of strengths/weaknesses across movement types.
- Over time, track whether weak areas improve.

---

## 9. PROPRIOCEPTION AND SPATIAL AWARENESS DRILLS

### 9.1 Blind Climbing

**Basic blind climbing drill:**
1. Choose a route 3-4 grades below onsight level. Climb it once with eyes open to memorize the holds.
2. Climb it again with eyes closed (or a blindfold).
3. Rely on: memory of hold positions, proprioceptive feel of body position, tactile feedback from hold shapes.

**Progressive blind climbing levels:**
- **Level 1 - Blinking**: Look at each hold, close eyes, place limb on hold by feel. Open eyes to check. Repeat for each move.
- **Level 2 - Eyes-closed sections**: Climb 3-5 moves with eyes closed, then open eyes to reset. Gradually increase the number of blind moves.
- **Level 3 - Full blind climb**: Complete an entire easy problem eyes closed.
- **Level 4 - Blind dynos**: Dyno between two holds with eyes open several times, then attempt with eyes closed. Start with small dynos on large holds.

**App implementation:**
- Voice-guided levels: "Close your eyes now... place your right hand... feel for the hold... got it? Good. Now left foot..."
- Timer to measure how long blind sections take (should decrease with practice).
- Track: total blind moves completed per session, grade achieved blind, improvement over time.
- Audio hold descriptions: for mapped problems, describe the next hold ("Reach up-right about two feet for a large jug").

### 9.2 Memory Sequence Drill

**Protocol:**
1. The app displays a sequence of 4-8 holds on the wall photo, numbered in order, for 15-30 seconds.
2. The display disappears.
3. The climber must reproduce the sequence from memory.
4. Start with 4 holds and add 1 hold each successful round.

**Variations:**
- **Visual memory only**: See holds briefly, then climb from memory.
- **Audio memory**: App reads hold descriptions aloud ("Start on the blue crimp at the left. Move right hand to the red sloper above. Left foot to the yellow edge..."). Climber listens, then climbs.
- **Reverse memory**: Memorize a sequence, then climb it in reverse.
- **Delayed recall**: Memorize the sequence, then wait 5 minutes before climbing it.

**App implementation:**
- Hold sequence generator tied to wall map.
- Timed display with countdown.
- Self-reporting of success/failure.
- Progressive difficulty: more holds, shorter display time, longer delay.
- Leaderboard: longest sequence recalled.

### 9.3 Feel-Based Movement Drills

**"Silent Feet" drill:**
1. Climb any route and place every foothold with zero audible sound.
2. If your foot makes any noise on contact, stop, remove the foot, and re-place it silently.
3. This forces precision, controlled hip positioning, and awareness of foot placement.

**"Soft Hands" drill:**
1. Climb using the minimum grip force necessary.
2. Imagine holding a raw egg on every hold.
3. Purpose: develops awareness of over-gripping and trains efficient force application.

**"Pause and Feel" drill:**
1. On every handhold, pause for 2 seconds and consciously feel: the texture, the angle, the best grip position.
2. Before weighting a foothold, feel the surface with your toe and find the best contact patch.
3. Purpose: develops tactile awareness and conscious hold reading.

**"Downclimb Everything" drill:**
1. Climb up a route, then downclimb it.
2. Downclimbing forces "feet first" thinking -- you must find footholds without seeing them (they are below you).
3. Develops proprioceptive foot placement and body awareness.

**App implementation:**
- Voice reminders at intervals: "Feel the hold...", "Quiet feet...", "Minimum grip..."
- Noise detection (using phone microphone) for silent feet: if impact noise is detected, play an alert sound.
- Drill timer with voice cues.
- Session log: number of "violations" (noisy feet, rushed placements).

---

## 10. RHYTHM AND FLOW TRAINING

### 10.1 Metronome Climbing

**Concept:** Use an audible metronome beat to control climbing pace. Each beat = one move (hand or foot placement).

**Protocol levels:**

**Level 1 - Slow Metronome (40-60 BPM):**
- One move per beat.
- Choose easy problems (3+ grades below max).
- Focus: smooth, continuous movement with no pauses between beats.
- Purpose: develops controlled, deliberate movement.

**Level 2 - Medium Metronome (60-90 BPM):**
- One move per beat.
- Choose moderate problems (1-2 grades below max).
- Focus: maintaining rhythm even when moves get harder.
- Purpose: prevents the tendency to stall and overthink on cruxes.

**Level 3 - Fast Metronome (90-140 BPM):**
- One move per beat.
- Choose easy to moderate problems.
- Focus: speed climbing with control. Every placement must still be precise.
- Purpose: develops fast, accurate movement for competition or onsighting.

**Level 4 - Variable Tempo:**
- The metronome changes tempo every 4-8 beats.
- Climber must adapt pace in real-time.
- Purpose: develops ability to switch between slow cautious and fast committed movement.

### 10.2 Sloth/Monkey Drill (Kris Hampton, Power Company Climbing)

**Phase 1 - Sloth:**
1. Choose a moderate boulder problem.
2. Climb with constant, very slow, uninterrupted movement. Never stop moving.
3. Each move takes 5-10 seconds.
4. No pausing, no adjusting, no chalking. Continuous slow motion.
5. Focus: body tension, precise placement under slow-motion load, breathing.

**Phase 2 - Monkey:**
1. Climb the same problem.
2. Climb as fast and fluidly as possible, using momentum and rhythm.
3. Movement should resemble brachiation -- swinging, flowing, using kinetic energy.
4. Focus: momentum management, dynamic efficiency, commitment.

**Phase 3 - Gradual Transition:**
1. Climb the same problem at a "medium" pace, blending sloth control with monkey flow.
2. Experiment with: sloth on easy sections, monkey through cruxes.
3. Then: monkey on easy sections, sloth through cruxes.
4. Find the optimal rhythm for each section.

**App implementation:**
- Metronome with configurable BPM.
- Voice-guided modes: "Sloth mode: move slowly and continuously" / "Monkey mode: flow and commit."
- Variable tempo mode: random BPM changes with audio cue.
- Sloth/Monkey drill template: guides user through the three phases with timers and voice prompts.
- Rhythm tracking: if user taps on each move, the app calculates their actual movement tempo and consistency.

### 10.3 Pace-Controlled Movement

**"Cadence" drill:**
1. Set a target cadence: e.g., 1 hand move every 4 seconds.
2. Climb a moderate route matching the cadence exactly.
3. The app beeps at the cadence rate. Each beep = one hand must move to a new hold.
4. Feet move freely but must support the hand cadence.

**"Surge and Cruise" drill:**
1. On a longer route or traverse:
   - "Cruise" section: 6 moves at slow pace (1 move/5 sec)
   - "Surge" section: 4 moves at fast pace (1 move/2 sec)
   - "Cruise" section: 6 moves at slow pace
   - "Surge" section: 4 moves at fast pace
2. Repeat the pattern.
3. Purpose: simulates the ebb and flow of a sport climbing route where cruxes require bursts of speed and easier sections allow recovery.

**"Deceleration" drill:**
1. Start climbing fast (1 move/2 sec).
2. Every 4 moves, slow down slightly.
3. By the last 4 moves, you should be moving at maximum slow-motion control.
4. Purpose: develops the ability to shift from dynamic to static smoothly.

**App implementation:**
- Programmable cadence patterns: constant, surge/cruise, accelerating, decelerating.
- Audio metronome with tempo changes.
- Visual pace indicator: screen flashes or changes color with each beat.
- Movement consistency score: how closely the user's actual tempo matched the target tempo (calculated from user taps).
- Session recording: save cadence patterns that worked well for specific routes.

---

## APPENDIX: APP ARCHITECTURE CONSIDERATIONS FOR BUILDING THESE TOOLS

### Data Models

**Wall:**
- wall_id, name, photo_url, angle, dimensions (height, width)
- holds[]: hold_id, position (x, y), color, type (jug/crimp/sloper/pinch/pocket), size

**Problem:**
- problem_id, wall_id, name, grade, setter, type (spray/board/generated)
- moves[]: order, hold_id, limb (LH/RH/LF/RF), move_type (static/dyno/match)
- foot_rule: enum (any/follow_hands/marked/campus)
- restrictions[]: text descriptions

**Session:**
- session_id, date, type (limit/volume/endurance/technique/interval)
- attempts[]: problem_id, timestamp, result (send/fall/move_reached), duration, rest_after
- drills[]: drill_type, parameters, metrics

**User Profile:**
- max_grade_flash, max_grade_project, preferred_style, weak_style
- dominance_ratio, grade_pyramid_history[]
- benchmark_sends[], weakness_scores{}

### Core Timer System

The timer system underpins most features:
- Work timer (climb phase)
- Rest timer (recovery phase)
- Interval timer (repeating work/rest cycles)
- Countdown alerts at configurable thresholds
- Voice announcements at timer events
- Background audio (continues when screen is off or phone is in pocket)

### Audio System

Critical for hands-free use while climbing:
- Text-to-speech for callouts (directions, colors, body parts, encouragement)
- Metronome/beep generator with variable BPM
- Pre-recorded audio cue library (encouragement phrases, technique reminders)
- Voice command recognition (optional): "Done", "Fall", "Start", "Rest"
- Audio must work through headphones/earbuds (Bluetooth) for gym use

### Randomization Engine

Shared across multiple features:
- Weighted random selection (avoid repeats, bias toward underrepresented options)
- Configurable constraints (colors available, body parts, directions, hold types)
- Seed-based randomization for reproducible problems
- Difficulty-aware generation (adjust output based on user level)

---

## SOURCES

- [Stokt App](https://www.getstokt.com/)
- [BoulderBot App](https://play.google.com/store/apps/details?id=com.boulderbot.app.android)
- [Crux Climbing App](https://www.cruxapp.ca/en)
- [KAYA Climbing App](https://kayaclimb.com/)
- [Spray Wall Training - The Nugget Climbing Podcast EP 236](https://thenuggetclimbing.com/episodes/fundamentals-s2-part-2)
- [How to Set Limit Boulders - Power Company Climbing](https://www.powercompanyclimbing.com/blog/set-limit-boulders)
- [Limit Bouldering - Training For Climbing (Eric Horst)](https://trainingforclimbing.com/limit-bouldering-for-building-max-climbing-strength-and-power/)
- [4 Keys to Limit Bouldering - TrainingBeta (Matt Pincus)](https://www.trainingbeta.com/4-keys-to-limit-bouldering/)
- [Volume Pyramids - Power Company Climbing](https://www.powercompanyclimbing.com/blog/2020/5/6/not-all-pyramids-are-built-the-same)
- [Building a Pyramid - Touchstone Climbing](https://touchstoneclimbing.com/building-a-pyramid-for-better-climbing/)
- [Power-Endurance Training Protocols - Training For Climbing](https://trainingforclimbing.com/power-endurance-training-protocols-for-climbers/)
- [Energy Systems Training - Lattice Training](https://latticetraining.com/blog/training-energy-systems-the-climbers-guide/)
- [Alactic Interval Training - ClimbStrong](https://www.climbstrong.com/resource-posts/alactic-interval-training---progression-and-transition)
- [3:2 Diminishing Intervals - ClimbStrong](https://www.climbstrong.com/resource-posts/build-big-endurance-with-3-2-intervals)
- [ARC Training - Keith Kubiesa](https://trainclimbsummit.com/train-aerobic-capacity-for-climbing-with-arcing/)
- [4x4 Training - Gripped Magazine](https://gripped.com/indoor-climbing/boost-your-power-endurance-with-bouldering-4x4s/)
- [4x4 Training - TrainingBeta](https://www.trainingbeta.com/4x4s/)
- [Progressive Overload - Climbing Collective](https://climbingcollective.co/training-progressive-overload)
- [Kilter vs MoonBoard vs Tension - Rock Climbing Realms](https://rockclimbingrealms.com/kilter-vs-moonboard-vs-tension-a-cost-training-test/)
- [Interactive Boards Explained - GearJunkie](https://gearjunkie.com/climbing/kilter-moon-grasshopper-more-interactive-climbing-training-boards-explained)
- [Board Meetings - Power Company Climbing](https://www.powercompanyclimbing.com/blog/board-climbing)
- [Footwork Drills - Climbing.com](https://www.climbing.com/skills/training-7-simple-drills-to-improve-footwork-and-technique/)
- [10 Footwork Drills - 99Boulders](https://www.99boulders.com/bouldering-footwork-drills)
- [Hover Hands Drill - Digit Doctor Climbing](https://www.tiktok.com/@digitdoctorclimbing/video/7149244859382123822)
- [21 Climbing Games - She Dreams of Alpine](https://www.shedreamsofalpine.com/blog/climbing-games)
- [16 Climbing Games - Climbing.com](https://www.climbing.com/skills/training-16-climbing-games/)
- [Climbing Games - KletterRetter](https://www.kletterretter.com/en/climbing-games-that-really-make-you-a-better-climber/)
- [Proprioception in Climbing - Training For Climbing](https://trainingforclimbing.com/mastering-climbing-movement-with-proprioception/)
- [Body Awareness - Moja Gear](https://mojagear.com/climbing-movement-techniques-perfecting-the-art-of-body-awareness-to-skyrocket-your-skill/)
- [Silent Feet - Moja Gear](https://mojagear.com/new-climber-tip-silent-feet/)
- [Sloth Monkey Drill - Kris Hampton / TrainingBeta](https://www.trainingbeta.com/media/kris-movement/)
- [Climbing Movement - Power Company Climbing](https://www.powercompanyclimbing.com/blog/exploring-climbing-movement)
- [Metronome Climbing - The Climbing Doctor](https://theclimbingdoctor.com/train-climbing-route-speed-movement-cadence-and-technique/)
- [Climbing Encouragement Study - Climbing.com](https://www.climbing.com/people/climbers-appreciate-verbal-encouragement/)
- [Cueing for Climbing - Jesse Firestone](https://jfireclimbing.com/2022/04/20/cueing-yourself-for-climbing-skill-power/)
- [Cueing in Climbing - Hooper's Beta](https://www.hoopersbeta.com/library/could-cueing-revolutionize-your-climbing-progression)
- [Rest Between Send Goes - Climbing.com](https://www.climbing.com/skills/rest-between-send-goes/)

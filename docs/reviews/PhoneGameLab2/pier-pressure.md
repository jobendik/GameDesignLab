---
id: PhoneGameLab2/pier-pressure
title: Pier Pressure
was: bumper-park (Bumper Park)
status: transformed
baseline: 2
score: 8
updated: 2026-11-27
---
## Original concept and core mechanics
Drive a bumper car around an arena and ram the opponents off it.

## Baseline assessment
40-line placeholder: circles in a rectangle; the player adds raw drag deltas to velocity; "bots" jitter randomly and
mostly wander off by themselves; equal-mass velocity swap with no heading; one win, no rounds, no sound. Overall 2/10.

## Weaknesses identified
No vehicle (no heading, grip or braking), no opponent intent, no arena pressure, no round structure, no feedback,
no character; winning happens to you.

## Creative opportunities
A funfair ride floating on the bay that sinks ring by ring; each pal driving exactly the way its personality says;
the dash as a single high-risk verb; dunked pals bobbing around the ride in swim rings as an audience.

## Planned improvements
Proper top-down car model; impulse collisions with mass and restitution; dash; five AI personalities; shrinking deck
with a sudden-death end; round modifiers (bumpers, waves); lives; knock-out credit and combos; thumb-stick + keyboard.

## Implemented improvements
- **Car physics** in resolution-independent world units, two sub-steps per frame: heading turns toward the stick at a
  capped rate, thrust along the heading (weaker when misaligned), separate forward drag and lateral grip, brake when
  the stick is released, and a 0.35 s skid (grip mostly gone) after any solid hit so knocked cars slide. Collisions
  are impulse-based with per-car mass, restitution 0.6 plus a small bumper kick and positional correction — a head-on
  ram hands over the momentum, a glancing one only its normal share, Momo (1.7×) barely budges, Bun (0.75×) flies.
- **Dash** (tap, second finger, or Space): +250 u/s along the heading on a 2.4 s cooldown shown as a ring around
  Pip — the knock-out punch and the classic way to drive yourself off the edge.
- **Rivals with personalities**: Bun flees everyone, hugs the middle, panics-dashes and only pokes someone already on
  the brink; Momo squats in the centre and shoulders anyone who comes close; Nori circles to your inside and shoves
  outward, dashing when lined up; Olli hunts whoever is nearest the edge; Bolt stops to "compute", then charges in a
  straight line with little fear of the edge. All share look-ahead edge avoidance scaled by a per-pal fear, and a skill
  value that rises each round. Faces show it: scared at the rim, dizzy after a bonk, gleeful after landing one.
- **The deck sinks**: seven painted rings; the outer one blinks red for 2.5 s, then drops with whoever is on it. The
  last stage is too small for two cars, so every round resolves; the centre-squatter must be dislodged before then.
- **Rounds**: 2 → 3 → 4 rivals; round 3 adds a pinball bumper in the middle, round 4 rolling waves (telegraphed
  swell + arrows, then a shove for everyone), later rounds mix three bumpers, waves, a faster sink and smarter rivals
  from a shuffled roster. Three lives; a swim respawns Pip in the middle with a shock ring and 1.8 s of grace.
- **Scoring**: 100 × combo for knock-outs you caused (last touch within 4 s), +10 for big bonks, round bonus
  150 × round + 50 per life. Rivals who dunk each other give you nothing.
- Presentation: baked bay and plank deck, candy cars with rubber rims, headlights and aerials, pals peeking out of the
  cockpits, dunked pals bobbing in swim rings (and waving), sparks/BONK!/hit-stop scaled by impact, engine loop pitched
  by speed, "bounce" music that intensifies as the deck shrinks. Self-playing attract mode.

## Test results
- Smoke (`tools/smoke.js pier-pressure`): pass.
- Gameplay test (`tests/PhoneGameLab2/pier-pressure.test.js`, 3 consecutive passes): real drag steers and release
  brakes; arrow keys; tap dash + cooldown; head-on vs glancing vs heavy-target collision outcomes; ramming Bun off the
  deck scores a KO (HUD matches); ring sink dunks Momo without credit → round clear → round 2 with three rivals;
  wave shove; fall → life lost → respawn; last life → game over + best; clean restart.
- Balance probes (scripted): with an idle player rivals finish a round in ~20 s; with a perfect AI driving Pip,
  rounds 1–3 take 20–35 s each and the stalemate vs Momo is broken by the sudden-death ring.
- Screenshots inspected at 390×844, 844×390, 1280×800 (rounds 4 and 5 mid-fight, ring sinking, wave, splash).
- Subjective assessment from scripted play and code reading only (no human playtest).

## Remaining issues
- Human difficulty of rounds 4+ is unverified; the AI may be too easy or gang up unfairly at times.
- In portrait the deck is limited by screen width (cars ≈ 38 px); bands of open water above and below.
- Rivals occasionally still slide off after their own dash when a wave arrives mid-charge (reads as slapstick).

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 8 | Bonking a pal into the bay with a lined-up dash is immediately funny and satisfying |
| Mechanical depth | 8 | Angle/mass/momentum matter, dash risk, positioning against a shrinking deck, bumpers and waves |
| Game feel | 8 | Skid after hits, sparks, hit-stop, splash rings, engine pitch, squash on bumps |
| Visual identity | 8 | Round plank ride on a teal bay, candy cars with pals peeking out |
| Animation quality | 8 | Expressive drivers, tumbling falls, swim-ring spectators, sinking ring, rolling wave |
| Audio quality | 7 | Impact pitch by speed and mass, engine loop, warnings; could use more character voices |
| Controls | 8 | Floating thumb-stick anywhere, tap/second-finger dash, WASD/arrows + Space, release to brake |
| Onboarding | 7 | "YOU" marker, 1.7 s intro, gentle round 1; dash is taught only by the hint and how-to |
| Replayability | 8 | Emergent fights, escalating rounds and modifiers, combo scoring |
| Performance | 9 | ≤ 5 cars, baked deck/bay; 60 fps in headless smoke |
| Technical robustness | 8 | World-unit physics independent of screen size, clean restart, loops stopped on death |
| Overall polish | 8 | Complete loop, attract demo, themed banners and end card |
## Next recommended action
Human playtest of rounds 4–6 for fairness; consider a visible dash prompt the first time a rival is near the edge.

---
id: PhoneGameLab2/sweet-circuit
title: Sweet Circuit
was: candy-connect / "Candy Connect"
status: transformed
baseline: 2
score: 7
updated: 2026-11-28
---
## Original concept and core mechanics
"Candy Connect": drag a line through 3+ touching candies of one colour (8 directions) on a 7×7 grid; they vanish,
the column refills, 15 moves, score = 10 per candy.

## Baseline assessment
A 33-line placeholder (2/10): flat circles on black, no feedback, no goal beyond "clear stuff", every move is
"find the biggest blob". Not wrapped in an IIFE, no splash/stats, no pal.

## Weaknesses identified
- Drawing the line was never a decision: no target, no reason to prefer one chain over another.
- No escalation, no identity, no sound, nothing for a Pocket Pal to do.
- Must not become Live Wires (non-crossing routing that covers a fixed board).

## Creative opportunities
- Make the line literally a *wire* that feeds a robot: Bolt (tinkerer, gadgets) runs on sweets.
- A loop that closes a circuit and zaps whatever it encloses (any colour) — a geometric twist on "same-colour loops",
  with the smallest loop a diamond around one cell thanks to diagonal links.

## Planned improvements
Orders + move battery, loop enclosure, long-wire refund, a blocker that wires interact with, pal as actor, falling
board with readable animation, full v2 loop with attract demo, tests.

## Implemented improvements
- **Rules**: each circuit Bolt orders N of two (sometimes three) sweet kinds; the battery holds 10–16 moves. A wire of
  n sweets scores n × (10 + 5(n−3)); a wire of 7+ refunds its move; dragging back onto the first sweet around other
  cells closes the circuit: every cell inside is zapped (30 each, 60 for a jawbreaker) and the move is free.
  Two-sweet wires cost nothing. Filling the order pays 25 per move left and moves to the next circuit.
- **Jawbreakers** (circuit 3+): grey blockers that never connect; a wire running past cracks one (two cracks), a loop
  around one shatters it; the order asks for all of them.
- **Curve**: circuit 1 has four kinds and a planted diamond (and a hint to loop it after the first wire); five kinds
  from circuit 2, orders grow by 2.5 per circuit, batteries shrink, jawbreakers 2→7, three-kind orders every third
  circuit. A greedy longest-wire bot (no loops) clears a median of 8 circuits over 12 seeds (2–11); humans find
  fewer long wires but can loop.
- **Feel**: wire drawn as an enamel cable with travelling current, rising pentatonic note per sweet, non-matching
  sweets dim while drawing, "×n · free!" label, closed loops glow and crackle; release pops the wire in sequence
  with a note ladder, order sweets arc into Bolt's bubble and tick the counters, loops flash + hit-stop + lightning
  from Bolt's antenna. Gravity refill with landing squash. Shuffle when no wire exists. Idle 7 s → hint shimmer.
- **Bolt as actor**: sits on the board edge reading the order from a speech bubble (talks when a new order arrives),
  watches the wire head, grins as the wire grows, gasps at loops, sweats on the last 3 moves, bounces on "Powered
  up!", droops and dozes when the battery dies.
- Strawberry-pink PCB with gold traces on a striped peach candy-shop wall; distinct shapes per kind (heart, star,
  drop, square, gumdrop) so colour is never the only cue. Funk music whose intensity follows battery drain.
  `orient:"any"` with a side panel in landscape.

## Test results
- Automated-technical: `node tools/smoke.js PhoneGameLab2/games/sweet-circuit` — pass (61 fps).
- Automated-gameplay: `node tools/run-tests.js sweet-circuit` — pass three consecutive runs (real mouse wire scores
  30, costs a move, cracks an adjacent jawbreaker; 2-sweet wire costs nothing; a drawn loop closes, shatters the
  jawbreaker inside and is free; order filled → level + 25/move bonus → fresh order; empty battery → game over,
  best recorded; Enter restart clean; a bot-found wire drawn with the mouse scores on the fresh board).
- Visual inspection: 390×844, 844×390, 1280×800, splash, closed-loop state and a circuit-3 board with cracked
  jawbreakers were captured and checked; layout fixed after the first round (landscape panel, portrait spacing,
  wire label instead of an illegible floating text).
- Subjective playtest: informed judgement from code and scripted play, not a human playtest.

## Remaining issues
- Loops on random boards are rare without setting them up; the game teaches them once (circuit 1) and relies on the
  player to engineer more.
- No keyboard play (drawing is pointer-only).
- Portrait leaves ~80 px of empty floor under the battery on tall phones.
- Chain-match boards are a well-worn genre; the enclosure rule and jawbreakers are the distinct part.

## Quality assessment
| Dimension | Score | Evidence / justification |
|---|---|---|
| Gameplay enjoyment | 7 | Orders make every wire a choice; closing a loop is a satisfying payoff |
| Mechanical depth | 7 | Target vs. length vs. setting up loops vs. routing past jawbreakers; refund rule rewards planning |
| Game feel | 8 | Note per sweet, sequenced pops, flying sweets into the order, loop flash + lightning |
| Visual identity | 8 | Candy PCB with gold traces, shaped sweets, robot on the board edge |
| Animation quality | 7 | Squash on landing, flyers, hop/joy states; board refills are simple gravity |
| Audio quality | 7 | Pitch ladders carry wire length; loop zap/powerup; music intensity tied to battery |
| Controls | 8 | Swept hit-testing (fast drags never skip a cell), backtrack by retracing, generous centres |
| Onboarding | 7 | First board has a planted loop and a contextual hint; idle shimmer shows a wire |
| Replayability | 7 | Random boards, escalating orders and jawbreakers, score chase with long wires/loops |
| Performance | 9 | Baked sprites and background, bounded DFS for hints; 61 fps in smoke |
| Technical robustness | 8 | Own game-clock timers, clean restart, resize re-layouts, exposed hooks |
| Overall polish | 7 | Complete loop with live attract demo; a few rough corners above |

## Next recommended action
Human playtest of the move budget (circuits 2–4) and of loop discoverability; consider a rare "spark" sweet that
lets a wire change colour once, to make loops more common in the late game.

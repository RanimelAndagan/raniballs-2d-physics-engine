/* =====================================================================
   RANIBALLS SIMULATOR  ·  main.ts
   a 2d physics sandbox project. small canvas thing im building to get
   the hang of 2d physics.
   balls fall + bounce off the walls. click, drag, release to throw one.
*/

interface Vec {
  x: number;
  y: number;
}


const GRAVITY     = 0.4;    // pull down per frame. bigger = drops faster
const RESTITUTION = 0.78;   // bounciness. 1 keeps bouncing, 0 = no bounce
const FRICTION    = 0.995;  // slows motion over time. keep just under 1

const FIELD_RADIUS   = 90;   // how far the cursor force field reaches
const FIELD_STRENGTH = 0.8;  // how hard it shoves balls away

const FLASH_STRENGTH = 0.85; // how bright the collision flash is (0 = none, 1 = pure white)
const FLASH_DECAY    = 0.85; // how fast it fades each frame. closer to 1 = slower fade

const SOUND_VOLUME = 0.3;    // loudest a single collision can be (0..1). keep it low = soft
const SOUND_PITCH  = 180;    // starting pitch of the thud in Hz. higher = more of a click
const MAX_VOICES   = 6;      // most sounds allowed at once, stops a pile-up turning to noise

const QUAKE_FORCE  = 18;     // how hard the earthquake flings every ball
const SHAKE_AMOUNT = 16;     // how far the screen jolts (pixels) right when it hits
const SHAKE_DECAY  = 0.9;    // how fast the shaking calms down. closer to 1 = longer rumble

const WIND_STRENGTH       = 0.25; // sideways push per frame while the wind is on
const BLACK_HOLE_STRENGTH = 0.9;  // how hard the black hole pulls. bigger = stronger suck
const BLACK_HOLE_REACH    = 900;  // how far its pull reaches (px). closer balls get pulled harder
const EXPLOSION_STRENGTH  = 22;   // blast speed at ground zero. fades to 0 at the edge
const EXPLOSION_RADIUS    = 260;  // how far the blast reaches (px)

const SLOWMO_FACTOR  = 0.25; // how slow slow-mo runs. 0.25 = quarter speed (lower = slower)
const TIMESCALE_EASE = 0.12; // how fast it glides between normal and slow. higher = snappier

const POUR_RATE      = 100;   // balls per second poured while you hold the pour key (P)
const MAX_BALLS      = 400;  // hard ceiling on total balls. protects performance


/* ---------------------------------------------------------------------
   2b. EFFECT STATE  (which effects are switched on right now)
   ---------------------------------------------------------------------
   these are the on/off switches the keys flip. declared up here so the
   Ball class can read `gravityFlipped` from inside update().
--------------------------------------------------------------------- */
let windOn = false;          // is the wind blowing?
let windDir = 1;             // +1 = blowing right, -1 = blowing left
let gravityFlipped = false;  // is gravity pointing up instead of down?
let blackHoleOn = false;     // is the cursor acting as a black hole?

// the time scale. 1 = normal speed. EVERYTHING time-based multiplies by this,
// so changing this one number slows (or speeds) the whole simulation at once.
let timeScale = 1;           // the value in use right now
let targetTimeScale = 1;     // what we're easing toward (1 or SLOWMO_FACTOR)

let lastFrameTime = performance.now();  // real time of the previous frame, for the pour
let pourCarry = 0;                      // ms banked toward spawning the next poured ball
let pourKeyDown = false;                // is the pour key (P) being held right now?


/* ---------------------------------------------------------------------
   3. THE CANVAS
--------------------------------------------------------------------- */
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;   // ! = telling ts this isnt null

// keep the canvas the full window size, and redo it when the window resizes
function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


/*
   4. A LITTLE HELPER

   grabs a random item from an array. the <T> just means it works
   on an array of anything, not only the colors below.
*/


const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9F45"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// takes a "#RRGGBB" color and mixes it toward white by `amount` (0..1).
// amount 0 = the original color, amount 1 = pure white. used for the flash.
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // for each channel, walk it part of the way toward 255 (white)
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}


/*
   5. THE BALL
   ---------------------------------------------------------------------
   one ball = one blueprint. each gets its own position, speed, size
   and color. it knows how to move itself and how to draw itself.
 */


class Ball {
  pos: Vec;      // where it is
  vel: Vec;      // speed + direction, per frame
  radius: number;
  color: string;   // the base color, never changes
  flash: number;   // how lit up it is right now (0 = normal, 1 = white). fades over time

  // runs once when i make a new ball
  constructor(x: number, y: number, vx = 0, vy = 0) {
    this.pos = { x, y };
    this.vel = { x: vx, y: vy };
    this.radius = 12 + Math.random() * 16;   // random-ish size
    this.color = pick(COLORS);
    this.flash = 0;   // starts un-flashed
  }

  // called every frame. all the physics happens here
  update(): void {
    // gravity adds to downward speed each frame, thats why falls speed up.
    // remember: on canvas y goes DOWN as it gets bigger, so +y is down.
    // when gravityFlipped is on we just flip the sign so they fall UP instead.
    // gravity is an acceleration, so it gets scaled by timeScale (slow-mo).
    this.vel.y += (gravityFlipped ? -GRAVITY : GRAVITY) * timeScale;

    // friction: shave a tiny bit off the speed so it eventually settles.
    // it's a per-time decay, so we raise it to the timeScale power. that keeps
    // the damping consistent: in slow-mo we run more frames, each losing less.
    this.vel.x *= Math.pow(FRICTION, timeScale);
    this.vel.y *= Math.pow(FRICTION, timeScale);

    // actually move it. distance this frame = speed * how much time passed
    this.pos.x += this.vel.x * timeScale;
    this.pos.y += this.vel.y * timeScale;

    // ease the collision flash back toward 0. scaled too, so the flash also
    // lingers longer in slow-mo and stays in step with everything else.
    this.flash *= Math.pow(FLASH_DECAY, timeScale);

    // stop it leaving the screen
    this.bounceOffWalls();
  }

  // for each wall: if the ball went past it, shove it back and flip
  // that direction so it heads back the other way
  private bounceOffWalls(): void {
    // floor (bottom)
    if (this.pos.y + this.radius > canvas.height) {
      this.pos.y = canvas.height - this.radius;  // park it right on the floor
      this.vel.y *= -RESTITUTION;                 // flip + drop some speed
    }
    // ceiling (top)
    if (this.pos.y - this.radius < 0) {
      this.pos.y = this.radius;
      this.vel.y *= -RESTITUTION;
    }
    // right wall
    if (this.pos.x + this.radius > canvas.width) {
      this.pos.x = canvas.width - this.radius;
      this.vel.x *= -RESTITUTION;
    }
    // left wall
    if (this.pos.x - this.radius < 0) {
      this.pos.x = this.radius;
      this.vel.x *= -RESTITUTION;
    }
  }

  // draws the ball for this frame
  draw(): void {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2); // full circle
    // if its flashing, draw a lightened version, otherwise the normal color.
    // the tiny 0.01 cutoff avoids pointless color math once the flash is basically gone
    ctx.fillStyle = this.flash > 0.01 ? lighten(this.color, this.flash) : this.color;
    ctx.fill();
  }
}


/* ---------------------------------------------------------------------
   6. THE WORLD
   ---------------------------------------------------------------------
   every ball thats alive right now lives in here
--------------------------------------------------------------------- */
const balls: Ball[] = [];


/* ---------------------------------------------------------------------
   7. THE SLINGSHOT (mouse controls)
   ---------------------------------------------------------------------
   press to aim, drag for direction + power, let go to fire.
   i save where the press started, longer drag = faster throw.
--------------------------------------------------------------------- */
let pressPos: Vec | null = null;  // where mouse went down (null = not pressing)
let dragPos: Vec | null = null;   // where the mouse is mid-drag
let mouse: Vec = { x: -9999, y: -9999 };  // live cursor pos, starts off-screen
let shake = 0;  // current screen-shake strength. set by the quake, fades to 0

canvas.addEventListener("mousedown", (e) => {
  unlockAudio();   // first real click is our chance to switch sound on

  // shift+click sets off an explosion right where you clicked, instead of
  // starting a sling. the `return` skips the aiming code below.
  if (e.shiftKey) {
    triggerExplosion(e.clientX, e.clientY);
    return;
  }

  pressPos = { x: e.clientX, y: e.clientY };
  dragPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mousemove", (e) => {
  mouse = { x: e.clientX, y: e.clientY };   // need this for the force field
  if (pressPos) dragPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mouseup", (e) => {
  if (!pressPos) return;

  // drag distance turns into launch speed.
  // 0.15 scales it down, full speed was way too fast
  const vx = (e.clientX - pressPos.x) * 0.15;
  const vy = (e.clientY - pressPos.y) * 0.15;

  if (balls.length < MAX_BALLS) {
    balls.push(new Ball(pressPos.x, pressPos.y, vx, vy));
  }

  pressPos = null;   // done aiming
  dragPos = null;
});

// keyboard shortcuts. a keypress is a real gesture too, so unlock audio here
// as well, otherwise an E-quake before your first click would be silent.
window.addEventListener("keydown", (e) => {
  unlockAudio();
  if (e.repeat) return;   // ignore the auto-fire while a key is held, so one press = one quake
  const key = e.key.toLowerCase();

  if (key === "c") balls.length = 0;                 // C  wipes everything
  if (key === "e") triggerQuake();                   // E  shakes the place up
  if (key === "w") { windOn = !windOn;               // W  toggle wind on/off
    console.log("WIND:", windOn ? "on" : "off"); }
  if (key === "f") { windDir *= -1;                  // F  flip wind direction
    console.log("WIND direction:", windDir > 0 ? "right" : "left"); }
  if (key === "g") { gravityFlipped = !gravityFlipped; // G  flip gravity up/down
    console.log("GRAVITY:", gravityFlipped ? "up" : "down"); }
  if (key === "h") { blackHoleOn = !blackHoleOn;     // H  toggle black hole at cursor
    console.log("BLACK HOLE:", blackHoleOn ? "on" : "off"); }
  if (key === "x") triggerExplosion(mouse.x, mouse.y); // X  explosion at the cursor
  if (key === "s") {                                   // S  toggle slow-motion
    // flip the TARGET only. the loop eases timeScale toward it for a smooth ramp.
    targetTimeScale = targetTimeScale === 1 ? SLOWMO_FACTOR : 1;
    console.log("SLOW-MO:", targetTimeScale === 1 ? "off" : "on");
  }
  if (key === "p") {                                   // P (held)  pour balls at cursor
    pourKeyDown = true;
    // prime the pour so the first ball drops next frame instead of after a gap
    pourCarry = 1000 / POUR_RATE;
  }
});

// stop pouring the moment the P key comes back up
window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "p") pourKeyDown = false;
});

// EARTHQUAKE: jolt the screen and fling every ball in a random direction.
// the balls smashing around afterwards set off the normal collisions,
// flashes and thuds on their own, so we dont have to add any of that here.
function triggerQuake(): void {
  shake = SHAKE_AMOUNT;
  for (const ball of balls) {
    ball.vel.x += (Math.random() * 2 - 1) * QUAKE_FORCE;  // random left/right shove
    ball.vel.y -= Math.random() * QUAKE_FORCE;            // an upward launch (-y is up)
  }
}

// POUR: while the P key is held, drip balls at the cursor at POUR_RATE per second.
// `dt` is the real milliseconds since the last frame. we bank that time in
// pourCarry and spend one interval per ball, so the rate stays steady no matter
// the frame rate. nothing happens unless the pour key is down.
function pourStream(dt: number): void {
  if (!pourKeyDown) return;

  pourCarry += dt;
  const interval = 1000 / POUR_RATE;   // ms between balls

  // spend the banked time. the loop handles several balls if a frame ran long.
  while (pourCarry >= interval) {
    pourCarry -= interval;

    if (balls.length >= MAX_BALLS) {   // hit the cap: stop pouring, drop the backlog
      pourCarry = 0;
      break;
    }

    // small random offset + a gentle downward trickle so the stream looks
    // natural and the balls dont all spawn stacked on the exact same pixel.
    const spread = () => (Math.random() * 2 - 1) * 4;
    balls.push(new Ball(mouse.x + spread(), mouse.y + spread(), spread() * 0.3, Math.random() * 1.5));
  }
}


/* ---------------------------------------------------------------------
   7b. BALLS HITTING EACH OTHER
   ---------------------------------------------------------------------
   check every pair once. if theyre overlapping, push them apart and
   trade the speed thats along the line between them. im treating every
   ball as the same weight, so the bounce is just a swap. close enough.
--------------------------------------------------------------------- */
function resolveCollisions(): void {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];

      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      // not touching (or exactly stacked, skip to avoid divide by zero)
      if (dist === 0 || dist >= minDist) continue;

      // unit direction pointing from a to b
      const nx = dx / dist;
      const ny = dy / dist;

      // shove each one out by half the overlap so they stop clipping
      const overlap = (minDist - dist) / 2;
      a.pos.x -= nx * overlap;
      a.pos.y -= ny * overlap;
      b.pos.x += nx * overlap;
      b.pos.y += ny * overlap;

      // how fast each is moving along that line
      const va = a.vel.x * nx + a.vel.y * ny;
      const vb = b.vel.x * nx + b.vel.y * ny;

      // only bounce if theyre actually closing in, else they stick
      const closing = va - vb;
      if (closing <= 0) continue;

      const impulse = closing * RESTITUTION;
      a.vel.x -= impulse * nx;
      a.vel.y -= impulse * ny;
      b.vel.x += impulse * nx;
      b.vel.y += impulse * ny;

      // they actually bounced, so light both of them up. from here the
      // flash decays on its own each frame (see update + draw)
      a.flash = FLASH_STRENGTH;
      b.flash = FLASH_STRENGTH;

      // play a thud. `closing` is the impact speed, so a gentle touch is
      // quiet and a hard smack is louder. /25 squashes the speed into a
      // 0..1 range (capped at 1) before scaling by our max volume.
      playClick(Math.min(closing / 25, 1) * SOUND_VOLUME);
    }
  }
}


/* ---------------------------------------------------------------------
   7c. THE CURSOR FORCE FIELD
   ---------------------------------------------------------------------
   any ball inside the ring round the cursor gets pushed away. the
   closer it is, the harder the shove.
--------------------------------------------------------------------- */
function applyForceField(): void {
  for (const ball of balls) {
    const dx = ball.pos.x - mouse.x;
    const dy = ball.pos.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    const reach = FIELD_RADIUS + ball.radius;

    if (dist === 0 || dist >= reach) continue;

    // 1 at the centre, fading to 0 at the edge of the ring.
    // * timeScale so the shove also eases off in slow-mo.
    const push = (1 - dist / reach) * FIELD_STRENGTH * timeScale;
    ball.vel.x += (dx / dist) * push;
    ball.vel.y += (dy / dist) * push;
  }
}


/* ---------------------------------------------------------------------
   7e. EXTRA FORCES  (wind, black hole, explosion)
   ---------------------------------------------------------------------
   all three follow the same recipe as the force field above: walk the
   balls and nudge each one's velocity. a constant nudge = a steady force.
--------------------------------------------------------------------- */

// WIND: a steady sideways push on everyone, same to all (like gravity, but x).
// runs every frame while on; windDir picks left (-1) or right (+1).
function applyWind(): void {
  if (!windOn) return;
  for (const ball of balls) {
    ball.vel.x += WIND_STRENGTH * windDir * timeScale;   // * timeScale = slows with everything
  }
}

// BLACK HOLE: pull every ball toward the cursor. note the dx/dy point FROM
// the ball TO the hole (opposite of the force field), so the nudge sucks in.
// the (1 - dist/reach) term means closer balls get pulled harder.
function applyBlackHole(): void {
  if (!blackHoleOn) return;
  for (const ball of balls) {
    const dx = mouse.x - ball.pos.x;
    const dy = mouse.y - ball.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0 || dist >= BLACK_HOLE_REACH) continue;

    const pull = (1 - dist / BLACK_HOLE_REACH) * BLACK_HOLE_STRENGTH * timeScale;
    ball.vel.x += (dx / dist) * pull;
    ball.vel.y += (dy / dist) * pull;
  }
}

// EXPLOSION: a one-off blast OUTWARD from (cx, cy). unlike wind/black hole
// this isnt a toggle, we call it once and it adds a single kick to velocity.
// power fades from full at ground zero to 0 at EXPLOSION_RADIUS.
function triggerExplosion(cx: number, cy: number): void {
  for (const ball of balls) {
    const dx = ball.pos.x - cx;   // direction points away from the blast
    const dy = ball.pos.y - cy;
    const dist = Math.hypot(dx, dy);

    if (dist >= EXPLOSION_RADIUS) continue;   // too far away to feel it

    // if a ball sits exactly on the blast point, dist is 0 and we cant
    // divide by it, so fling it in a random direction instead.
    const nx = dist === 0 ? Math.random() * 2 - 1 : dx / dist;
    const ny = dist === 0 ? Math.random() * 2 - 1 : dy / dist;

    const power = (1 - dist / EXPLOSION_RADIUS) * EXPLOSION_STRENGTH;
    ball.vel.x += nx * power;
    ball.vel.y += ny * power;
  }
}


/* ---------------------------------------------------------------------
   7d. COLLISION SOUND  (Web Audio API)
   ---------------------------------------------------------------------
   no sound files here. we build a short "thud" from scratch: an
   oscillator makes a tone, a gain node fades it out fast, and that
   quick fade is what makes it sound percussive instead of a long beep.
--------------------------------------------------------------------- */

// the audio engine. starts as null because browsers wont let us make it
// until the user has interacted with the page (see unlockAudio below).
let audioCtx: AudioContext | null = null;

// how many sounds are playing right now, so we can cap it (see MAX_VOICES)
let activeVoices = 0;

// called on the first click. creates the audio engine and wakes it up.
// browsers block audio until a real gesture, so this is the moment to do it.
function unlockAudio(): void {
  if (!audioCtx) audioCtx = new AudioContext();
  // a fresh context often starts "suspended"; resume() inside a click is allowed
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// plays one short thud. `volume` is 0..1 (already scaled by impact speed).
function playClick(volume: number): void {
  if (!audioCtx) return;                  // audio not unlocked yet, stay silent
  if (activeVoices >= MAX_VOICES) return; // too many at once, drop this one
  if (volume <= 0) return;                // nothing to hear

  const now = audioCtx.currentTime;       // "now" on the audio clock, in seconds

  // OSCILLATOR = the tone generator. sine is the softest, roundest wave.
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  // a quick downward pitch slide (SOUND_PITCH -> 80hz) gives that "thud" drop
  osc.frequency.setValueAtTime(SOUND_PITCH, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

  // GAIN = the volume knob, automated over time to shape the envelope.
  // jump to `volume` instantly, then fall to near-zero in 150ms = a sharp thud.
  // (exponential ramps cant hit exactly 0, so we aim for a tiny 0.0001.)
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  // wire it up: oscillator -> gain (volume) -> destination (your speakers)
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // track this voice, and free the slot again once the sound finishes
  activeVoices++;
  osc.onended = () => { activeVoices--; };

  osc.start(now);
  osc.stop(now + 0.15);   // the whole sound lasts about 150ms
}


/* ---------------------------------------------------------------------
   8. THE ANIMATION LOOP  (the engine)
   ---------------------------------------------------------------------
   requestAnimationFrame runs loop() again on the next screen refresh
   (~60x a second). loop calls itself at the end so it never stops.
--------------------------------------------------------------------- */
function loop(): void {
  // clear the last frame. solid fill keeps it sharp.
  // note to self: drop the "1" to 0.2 and you get trails
  ctx.fillStyle = "rgba(13, 13, 18, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // real time since last frame, in ms. capped at 100 so that coming back from
  // a backgrounded tab doesnt try to pour a giant backlog all at once.
  const now = performance.now();
  const dt = Math.min(now - lastFrameTime, 100);
  lastFrameTime = now;

  // pour new balls if the button is held (real-time rate, not affected by slow-mo)
  pourStream(dt);

  // glide the time scale toward its target (1 = normal, SLOWMO_FACTOR = slow).
  // doing this every frame is what makes slow-mo ramp in/out instead of snapping.
  timeScale += (targetTimeScale - timeScale) * TIMESCALE_EASE;

  // move everything first
  for (const ball of balls) ball.update();

  // then all the forces (each just nudges velocities), then the collisions
  applyForceField();
  applyWind();
  applyBlackHole();
  resolveCollisions();

  // earthquake shake: ease it back toward calm, then nudge the whole scene
  // by a random offset this frame. save/translate/restore so only the
  // drawing below is shifted, not the maths above.
  shake *= Math.pow(SHAKE_DECAY, timeScale);   // scaled so the rumble slows in slow-mo too
  ctx.save();
  ctx.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake);

  // if the black hole is on, mark its spot (the cursor) with a small ring
  // so you can see where the pull is coming from
  if (blackHoleOn) {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
  }

  // draw the balls
  for (const ball of balls) ball.draw();

  // while aiming, draw the line from press point to the cursor
  if (pressPos && dragPos) {
    ctx.beginPath();
    ctx.moveTo(pressPos.x, pressPos.y);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();   // undo the shake offset before the next frame

  requestAnimationFrame(loop);   // next frame
}


/* ---------------------------------------------------------------------
   9. START
   ---------------------------------------------------------------------
   throw a few balls in so it isnt empty on load, then kick off the loop
--------------------------------------------------------------------- */
for (let i = 0; i < 6; i++) {
  balls.push(new Ball(Math.random() * canvas.width, Math.random() * 200));
}

// dump the controls to the console so i dont forget them
console.log(
  "RANIBALLS controls:\n" +
  "  click+drag+release  throw a ball\n" +
  "  shift+click         explosion where you click\n" +
  "  P  (hold) pour balls at the cursor\n" +
  "  W  toggle wind      F  flip wind direction\n" +
  "  G  flip gravity     H  toggle black hole (at cursor)\n" +
  "  X  explosion at cursor   S  slow-motion toggle\n" +
  "  E  earthquake       C  clear"
);

loop();


/* =====================================================================
   TODO / ideas to try later
   ---------------------------------------------------------------------
   1. mess with GRAVITY, 0.1 feels like the moon, 1.5 feels heavy
   2. RESTITUTION 1 = balls never stop bouncing
   3. loop fill alpha 0.2 for the trail look
   4. DONE: balls bounce off each other now (see resolveCollisions).
      still treating them all as equal weight, could try mass = area later
   5. force field on the cursor is in too (applyForceField). maybe add a
      key to flip it to a pull instead of a push?
   ===================================================================== */

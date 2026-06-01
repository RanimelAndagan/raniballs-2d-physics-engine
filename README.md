<div align="center">

# RaniBalls — 2D Physics Engine

### Throw it, shake it, break the gravity.

*A from-scratch 2D physics engine and playground, hand-written in TypeScript on a single HTML canvas. No engine, no libraries. Just math, repeated very fast.*

<br>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-990000?style=for-the-badge)
![No Frameworks](https://img.shields.io/badge/No_Frameworks-0d0d12?style=for-the-badge)

<br>

[**🌐 Live Demo**](https://ranimelandagan.github.io/raniballs-2d-physics-engine/) &nbsp;·&nbsp; [**🎬 Video Walkthrough**](#-video-demo)

</div>

---

## 🪐 Overview

RaniBalls is a 2D physics playground I built to understand how physics engines actually work, by writing one myself instead of importing one.

Every part of the simulation is hand-coded: gravity, collisions between balls, bouncing off walls, friction, mass, the throwing, the chaos. There's no physics library doing the heavy lifting. The whole thing runs on one idea that powers nearly every game ever made: every frame, about sixty times a second, move everything a little, draw it, and do it again.

It started as a simple bouncing-ball demo. Then I kept asking "what if I added..." and didn't stop. Now you can fling balls around, trigger an earthquake, flip gravity, drop a black hole, and blow it all up.

---

## 🛠️ Tech Stack

| Layer | What I used |
|-------|-------------|
| **Language** | TypeScript (compiled to JavaScript with `tsc`) |
| **Rendering** | HTML5 Canvas 2D context |
| **Animation** | `requestAnimationFrame` game loop |
| **Sound** | Web Audio API (tones synthesized in code, no audio files) |
| **Physics** | Written from scratch: vectors, gravity, mass, momentum, collisions |
| **Dependencies** | None. No engine, no libraries, no framework. |
| **Hosting** | GitHub Pages |

---

## ✨ Features

- **Real ball-to-ball collisions** — balls don't just bounce off walls, they collide with *each other*, using conservation of momentum so impacts look believable.
- **Mass-based physics** — bigger balls are heavier. A large ball shoves a small one around far more than the reverse, because mass is factored into every collision.
- **Throw to spawn** — click, drag, and release to fling a new ball. The harder you flick, the faster it launches.
- **Mouse force field** — your cursor becomes a force that pushes or pulls every ball on screen.
- **Earthquake** — jolts every ball at once and shakes the whole canvas, with a rumble that decays naturally.
- **Wind & gravity flip** — push everything one direction, or invert gravity so the balls "fall" to the ceiling.
- **Black hole** — a point that sucks every ball toward it, pulling harder the closer they get.
- **Explosion** — blast all nearby balls outward from a point, with force that fades over distance.
- **Slow motion** — a global time-scale toggle that drops the whole simulation into smooth bullet-time.
- **Collision juice** — balls flash on contact and play a soft synthesized click, louder for harder hits.
- **Motion trails** — a translucent canvas clear leaves smooth glowing trails behind every ball.

---

## 🔨 The Process (How I Built It)

I didn't start with all of this. I started with one ball falling and bouncing off the floor, and built outward one piece at a time.

That order mattered more than I expected:

1. **The loop first.** Before any physics, I got the core cycle working: move, draw, repeat every frame. Everything else hangs off that one rhythm.
2. **Simple physics by hand.** Gravity as acceleration added to velocity. Walls as "if past the edge, flip the velocity and lose a little energy." Writing this myself is what made the concepts finally click.
3. **The hard part: balls hitting balls.** Wall collisions are easy. Making balls collide with each other meant real vector math, measuring the distance between centers, detecting overlap, and trading velocity between them. This was the leap from "toy" to "engine."
4. **Then the chaos.** Once the engine was solid, every new force, earthquake, wind, black hole, explosion, was a variation on the same idea: add an impulse to velocity. The foundation made the fun stuff cheap.

The biggest thing I learned to do here wasn't a formula. It was building in small, testable steps so that when something broke, I knew exactly which piece did it.

---

## 📚 What I Learned

The honest headline lesson: **if you want to make something great, it takes time.** The first bouncing ball took an afternoon. Making a pile of them jostle realistically without overlapping or sticking took a lot longer, and a lot of small fixes.

Some of the technical things that stuck:

- **A physics engine is just arithmetic in a loop.** Position changes by velocity, velocity changes by acceleration. Run it fast enough and it looks alive. There's no magic, just math repeated 60 times a second.
- **Collisions are vector math.** Detecting a hit is about distance between centers; resolving it is about conserving momentum. Understanding this once unlocked every other feature.
- **Mass changes everything.** The moment collisions accounted for mass, the whole simulation started *feeling* physical instead of like equal-sized bumper balls.
- **"Juice" is cheap and worth it.** A color flash and a tiny sound on impact cost almost nothing in code but transform how alive the thing feels.
- **The Web Audio API can make sound without any files.** You can synthesize a click from raw tones in code, which I had no idea was possible before this.
- **Build in small steps.** Adding one feature at a time, and checking it works before the next, is the difference between a project you can debug and a mess you can't.

---

## 🚀 How It Could Be Improved

Where I'd take it next if I keep going:

- **Stacking and resting** — right now a big pile can jitter. Real engines work hard to let objects settle and rest stably, and a simplified version would be a great challenge.
- **Different shapes** — boxes and placeable walls, which need different collision math than circle-to-circle.
- **A control panel** — on-screen sliders and buttons for gravity, bounciness, and ball count so anyone can play without knowing the keyboard shortcuts.
- **Springs and ropes** — connecting balls together for soft-body and chain effects.
- **Spatial optimization** — a grid or quadtree so collisions stay fast with hundreds of balls instead of checking every pair.

---

## 🎮 Controls

> ⚠️ **Update these to match the keys you actually set in the code.**

| Action | Control |
|--------|---------|
| Spawn / throw a ball | Click + drag + release |
| Force field | Move / hold the mouse |
| Earthquake | `Spacebar` |
| Wind | `W` |
| Gravity flip | `G` |
| Black hole | `B` |
| Explosion | `E` |
| Slow motion | `S` |
| Clear all | `C` |

---

## 💻 How to Run It

It's a static site. The TypeScript is already compiled to JavaScript, so it runs with no setup:

```bash
# 1. Clone the repo
git clone https://github.com/ranimelandagan/raniballs-2d-physics-engine.git

# 2. Open the folder
cd raniballs-2d-physics-engine

# 3. Open index.html in your browser
```

For the best experience (and live reloading while editing), use the **Live Server** extension in VS Code.

If you edit the TypeScript, recompile it back to JavaScript with:

```bash
npx tsc
```

---

## 🎬 Video Demo

<!-- Replace the link below with your video, and drop a thumbnail in an images/ folder -->
[![Watch the demo](images/video-thumbnail.png)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

<div align="center">

**Built by Ranimel B. Andagan**

Part builder, part finance nerd, full time entrepreneur!

[🌐 Live Demo](https://ranimelandagan.github.io/raniballs-2d-physics-engine/) &nbsp;·&nbsp; [💼 LinkedIn](#) &nbsp;·&nbsp; [📍 North Caloocan, PH]

*No engine. Just math, repeated very fast.*

</div>

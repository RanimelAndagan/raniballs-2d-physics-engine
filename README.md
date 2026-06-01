<div align="center">

# RaniBalls — 2D Physics Engine

### Throw it, shake it, break the gravity.

*A 2D physics engine I built from scratch in TypeScript. No physics library. Just math.*

<br>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-990000?style=for-the-badge)
![No Frameworks](https://img.shields.io/badge/No_Frameworks-0d0d12?style=for-the-badge)

<br>

[**🌐 Live Demo**](https://ranimelandagan.github.io/raniballs-2d-physics-engine/) &nbsp;·&nbsp; [**🎬 Video**](#-video-demo)

</div>

---

## ⁉️ What is this

It's a little physics playground. Balls fall, bounce off the walls, smash into each other, and you can fling them around with your mouse. Then it gets out of hand: there's an earthquake button, you can flip gravity, drop a black hole, and blow everything up.

The main thing I wanted was to actually build the physics myself instead of grabbing a library that does it for me. So all the gravity, the collisions, the bouncing, the throwing, I wrote all of it by hand. No physics engine.

---

## 🤔 What's in it

- **Balls that hit each other** — not just the walls. They actually collide and knock each other around.
- **Mass** — bigger balls are heavier, so they shove the small ones around way more than the other way around.
- **Throw to spawn** — click, drag, let go. Flick harder and it flies faster.
- **Mouse force field** — your cursor pushes (or pulls) every ball on screen.
- **Earthquake** — jolts all the balls and shakes the whole screen, then settles.
- **Wind and gravity flip** — push everything sideways, or flip gravity so they fall up.
- **Black hole** — a point that sucks all the balls in, harder the closer they get.
- **Explosion** — blast everything outward from one spot.
- **Slow motion** — drops the whole thing into bullet-time.
- **Little touches** — balls flash and make a click sound when they hit, and they leave glowing trails.

---

## 🤖 How I built it

I'm a beginner. I used AI along the way to explain stuff I hadn't learned yet and to help me figure out how to approach each part. But I wrote it, broke it, and fixed it myself, and I made sure I actually understood each piece before moving on. The AI was more like a tutor than autopilot. Building this is literally how I learned how a physics engine works, and that was the whole point.

I didn't plan all of this out. I built one piece, got it working, then added the next thing.

The order kind of mattered, though. First I got the loop going, the move-draw-repeat thing that everything else sits on. Then basic gravity and bouncing off the walls, which was simple enough. The hard part was making the balls hit *each other*. Walls are easy, you just flip the direction. But ball-on-ball needed actual vector math: checking the distance between them, seeing if they overlap, then trading their speed. That's the part that took the longest, and that's where it stopped being a toy and started being a real engine.

After that, the rest was kind of easy. Once the base was solid, the fun stuff was cheap to add.

The biggest thing I learned wasn't even a formula. It was this: build small, test it, THEN add the next thing. Every time I tried to do too much at once, something broke and I had no idea what.

---

## 📲 Stuff I'd add later

- **Stacking** — right now a big pile gets a little jittery. Real engines work hard to make stuff settle and rest properly.
- **Other shapes** — boxes, and walls you can place. They need different collision math than circles.
- **A control panel** — sliders and buttons so people can mess with gravity and ball count without knowing the keys.
- **Make it faster with lots of balls** — right now it checks every ball against every other ball, which gets slow. There's a smarter way (a grid) I want to try.

---

## 🎮 Controls

> Heads up: update these to whatever keys I actually set in the code.

| What | How |
|------|-----|
| Throw a ball | Click + drag + release |
| Force field | Move the mouse |
| Earthquake | `Space` |
| Wind | `W` |
| Flip gravity | `G` |
| Black hole | `B` |
| Explosion | `E` |
| Slow-mo | `S` |
| Clear everything | `C` |

---

## 🏃‍♂️‍➡️ How to run it

It's just a static site. The TypeScript is already compiled to JS, so it runs as-is:

```bash
git clone https://github.com/ranimelandagan/raniballs-2d-physics-engine.git
cd raniballs-2d-physics-engine
# open index.html in your browser
```

The easiest way is the Live Server extension in VS Code. If you edit the TypeScript, recompile it with `npx tsc`.

---

## 🎬 Video Demo

<!-- Swap in your video link and drop a thumbnail in an images/ folder -->
[![Watch the demo](images/video-thumbnail.png)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

<div align="center">

</div>
Part builder, part finance nerd, full time entrepreneur!

[🌐 Live Demo](https://ranimelandagan.github.io/raniballs-2d-physics-engine/) &nbsp;·&nbsp; [💼 LinkedIn](#) &nbsp;·&nbsp; 

</div>

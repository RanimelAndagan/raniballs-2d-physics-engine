# 🟡 Raniballs Simulator

*a 2d physics sandbox project*


COOOL ASSSS

A tiny 2D physics toy I built with **TypeScript** and the HTML Canvas. Balls fall down and bounce off the walls. You click, drag, and let go to throw new ones.

This was my learning project, so I left a lot of comments in `main.ts`. I wanted to be able to read it later and still remember why I did things.

## ▶️ Run it

It just works. Open `index.html` in your browser, or use the **Live Server** extension in VS Code (that's what I used).

The browser actually runs `main.js`, not the TypeScript. I read `main.ts` to learn from it. If you change `main.ts`, you have to turn it back into JavaScript with this:

```bash
npx tsc main.ts --target ES2017 --lib ES2017,DOM
```

It took me a while to figure out that part.

## 🎮 Controls

- **Click + drag + release** anywhere to throw a ball. Longer drag means faster throw.
- **Press C** to clear the screen.

## 🧠 What I learned

- The animation loop (`requestAnimationFrame`): move, draw, repeat about 60 times a second
- Velocity and acceleration. Gravity is basically velocity that keeps getting bigger.
- Bouncing: notice when a ball hits a wall, flip the velocity, and take away a little energy so it slows down
- Drawing on a Canvas
- My first real TypeScript stuff: an `interface`, a `class`, and a generic helper

## 🚀 Next step

Right now the balls bounce off the walls but go straight through each other. Getting them to hit each other looks like the hard part. I left a note about it at the bottom of `main.ts` for when I come back to it.

---

*Made this while learning. I wanted to understand every line, not just get it running.*

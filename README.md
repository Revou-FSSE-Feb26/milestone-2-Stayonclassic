# RevoFun — Interactive Browser Game Platform

## Overview

RevoFun is a browser-based gaming platform that showcases interactive mini games built using **HTML, CSS, and JavaScript**. The project focuses on delivering a clean user experience while demonstrating core front-end development concepts such as **DOM manipulation, event handling, and game logic implementation**.

The platform is designed for casual users who want to play simple yet engaging games directly in the browser without any installation.

---

## Features

### Landing Page

* Clean and modern UI design
* Hero section with branding and tagline
* Navigation to game pages
* Game preview cards with interactive hover effects

### Rock Paper Scissors Game

* Interactive gameplay with user vs computer
* Random computer choice using JavaScript logic
* Animated countdown: *Rock → Paper → Scissors → Shoot*
* Dynamic result display (win, loss, draw)
* Score tracking system
* Reset functionality
* Smooth UI animations and feedback

### Whack-a-Mole Game
* Time-based reflex game
* Random mole spawning system
* Score increases on successful hits
* Countdown timer (20 seconds)
* Visual feedback (hit, miss, urgency)
* Hammer cursor interaction
* Best score saving system

### UI/UX Enhancements

* Consistent design system (spacing, colors, typography)
* Responsive layout
* Smooth animations and transitions
* Hover and interaction feedback
* Accessible elements (focus states, semantic HTML)

### Footer Section

* Logo and tagline
* Quick navigation links
* Social media links

---

## Technologies Used

* **HTML5** — Structure and semantic layout
* **CSS3** — Styling, layout (Flexbox/Grid), animations
* **JavaScript (Vanilla)** — Game logic, DOM manipulation, event handling

---

## Key Concepts Implemented

### JavaScript

* Conditional statements (`if`, `switch`)
* Loops (`forEach`)
* Arrays and objects
* Functions and modular structure
* Event listeners (`addEventListener`)
* DOM manipulation (`querySelector`, `getElementById`)
* Timers (`setTimeout`) for animations

### CSS

* Flexbox & Grid layout
* Custom components (cards, buttons)
* Animations using `@keyframes`
* Transitions and hover effects
* Consistent design system

---

## Game Logic Flow

### Rock Paper Scissors Game
```text
User clicks a move (Rock / Paper / Scissors)
↓
playRound(playerChoice)
↓
Disable buttons + show player choice
↓
runCountdown()

Countdown sequence:
Rock → Paper → Scissors → Shoot

↓
resolveRound(playerChoice)
↓
getComputerChoice() (random move)
↓
decideRound(playerChoice, computerChoice)

IF same choice → Draw
IF player wins → Add player score
IF computer wins → Add computer score

↓
Update UI (status text + preview images)
↓
updateRpsScore() (wins / losses / draws)
↓
Enable buttons again
↓
Ready for next round

```

### Whack-a-Mole Game
```text
User Click "Start Game"
↓
startWhackGame()
↓
Reset score & time → Activate game
↓
scheduleNextHole()
↓
showNextMole()
↓
Random hole becomes active (mole appears)
↓
User clicks hole

IF correct hole:
→ Increase score
→ Hide mole
→ Show feedback ("Nice hit!")

IF wrong / missed:
→ No score added

↓
hideCurrentMole() (after delay)
↓
Next mole appears

↓
Countdown Timer (setInterval every 1s)
↓
Time reaches 0
↓
endWhackGame()
↓
Save best score + show result
```

---

## Project Structure

```
milestone-2-Stayonclassic/
│
├── index.html
├── pages/
│   ├── rps.html
│   └── whack.html
│
├── css/
│   ├── style.css
│   └── game.css
│
├── js/
│   ├── rps.js
│   └── whack.js
│
└── assets/
    ├── change.png
    ├── digimon.png
    ├── digimon1.png
    ├── digimon2.png
    ├── digimon3.png
    ├── hammer.png
    ├── Mole.png
    ├── Paper.png
    ├── read.png
    ├── revou-logo.png
    ├── Rock.png
    ├── Scissors.png
    ├── strike.png
    └── win.png
```

---

###  Live Demo

https://revou-fsse-feb26.github.io/milestone-2-Stayonclassic/

---

## Notes

This project was built as part of a learning assignment to strengthen fundamental web development skills, focusing on both **functionality and user experience**.

---

## Reference Links

### Rock Paper Scissors Game
* https://youtu.be/jaVNP3nIAv0?si=QTmXD67Biyqd01gJ
* https://youtu.be/1v-k3jhCY-Y?si=hHeR-bfVxhUlpz8w
* https://youtu.be/RC7NbjwP3QA?si=lOgY0SAHB0NI-gLZ

### Whack-a-Mole Game
* https://youtu.be/FwZV5yZZhfw?si=pmbzC2dADKwYhshv
* https://youtu.be/b20YueeXwZg?si=mnzO-lXh6wN4jhDd

### Memory Game
* https://youtu.be/dqqxkrKhfS4?si=4Y4z0pK79zyYSJQo
* https://youtu.be/wz9jeI9M9hI?si=eeZ5u1gx-AyfXUOe
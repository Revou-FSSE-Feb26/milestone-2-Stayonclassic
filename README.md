# RevoFun — Interactive Browser Game Platform

## Overview

RevoFun is a browser-based gaming platform that showcases interactive mini games built using **HTML, CSS, and JavaScript**.

This project focuses on:

* Clean UI/UX
* Interactive gameplay
* Core frontend concepts (DOM manipulation, event handling, game logic)

All games run directly in the browser — no installation needed.

---

## Features

### Landing Page

* Modern and clean UI design
* Hero section with branding and tagline
* Interactive game cards
* Smooth animations and hover effects
* Integrated leaderboard preview

---

## Games

### Rock Paper Scissors

* Player vs Computer gameplay
* Random computer logic
* Animated countdown (*Rock → Paper → Scissors → Shoot*)
* Dynamic result display (win / loss / draw)
* Score tracking system
* Reset functionality
* Interactive UI feedback

---

### Whack-a-Mole

* Time-based reflex game
* Random mole spawning system
* Score increases on successful hits
* Countdown timer (20 seconds)
* Visual feedback (hit, miss, urgency)
* Hammer cursor interaction
* Best score saving system

---

### Memory Match

* Card matching game using flip mechanics
* Grid-based layout with multiple cards
* Flip animation using CSS transform
* Match detection logic
* Move tracking system
* Game completion detection
* Reset and replay functionality

---

## Leaderboard System

* Shared leaderboard across all games
* Stores top scores using `localStorage`
* Displays:
  * Rock Paper Scissors results
  * Whack-a-Mole scores
  * Memory game performance
* Keeps top entries (best scores)
* Automatically updates after each game

---

## UI / UX Highlights

* Consistent design system (spacing, colors, typography)
* Responsive layout (desktop + smaller screens)
* Smooth animations and transitions
* Clear interaction feedback (hover, click, focus)
* Accessible elements (focus-visible, semantic HTML)

---

## Technologies Used

* **HTML5** → Structure and semantic layout
* **CSS3** → Styling, layout (Flexbox & Grid), animations
* **JavaScript (Vanilla)** → Game logic, DOM manipulation, event handling

---

## Key Concepts Implemented

### JavaScript

* DOM selection (`querySelector`, `getElementById`)
* Event handling (`addEventListener`)
* Conditional logic (`if`, `switch`)
* Arrays and objects
* Game state management
* Timers (`setTimeout`, `setInterval`)
* Local storage (`localStorage`)

### CSS

* Flexbox & Grid layout
* Component-based styling
* Animations (`@keyframes`)
* Transitions and hover effects
* Consistent UI system

---

## Game Logic Flow

### Rock Paper Scissors

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
Update UI (status + preview)
↓
updateRpsScore()
↓
Enable buttons
↓
Ready for next round
```

---

### Whack-a-Mole

```text
User clicks "Start Game"
↓
startWhackGame()
↓
Reset score & time → Activate game
↓
scheduleNextHole()
↓
showNextMole()
↓
Random mole appears
↓
User clicks hole

IF correct:
→ Increase score  
→ Hide mole  

IF wrong:
→ No score  

↓
Next mole appears
↓
Timer counts down
↓
Time = 0 → endWhackGame()
↓
Save best score
```

---

### Memory Match

```text
User clicks a card
↓
Flip card
↓
Select second card
↓
Check match

IF match:
→ Keep cards flipped  
→ Increase match count  

IF not match:
→ Flip back after delay  

↓
Repeat until all matched
↓
Game complete
↓
Show result / reset option
```

---

## Project Structure

```text
milestone-2-Stayonclassic/
│
├── index.html
├── pages/
│   ├── rps.html
│   ├── whack.html
│   └── memory.html
│
├── css/
│   ├── style.css
│   └── game.css
│
├── js/
│   ├── rps.js
│   ├── whack.js
│   ├── memory.js
│   └── leaderboard.js
│
└── assets/
    ├── change.png
    ├── digimon.png
    ├── digimon1.png
    ├── digimon2.png
    ├── digimon3.png
    ├── digimon4.png
    ├── digimon5.png
    ├── digimon6.png
    ├── digimon7.png
    ├── digimon8.png
    ├── digimon9.png
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

## Live Demo

https://revou-fsse-feb26.github.io/milestone-2-Stayonclassic/

---

## Notes

This project was built as a learning assignment to strengthen fundamental frontend skills while focusing on both **functionality and user experience**.

The goal is to create a simple but well-structured interactive web application that is easy to understand and explain.

---

## Author

Rio Leonardus

# ResQVision — AI-Powered Disaster Rescue Challenge

ResQVision is a browser-based rescue simulation built with Phaser 3 and MediaPipe Hand Landmarker. Hand tracking is the primary interaction; mouse controls remain available as a fallback.

## Project structure

```text
index.html          App screens and Phaser CDN entry point
styles.css          Responsive interface and visual theme
src/main.js         Screen flow, timer, score, and mission state
src/game.js         Phaser map drawing and mouse interactions
src/handTracking.js Camera lifecycle and pinch gesture recognition
src/leaderboard.js  LocalStorage score persistence
```

## Run locally

ES modules need to be served from a local web server. From this folder, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Phaser and MediaPipe are loaded from jsDelivr, with the hand landmark model hosted by Google, so the first page load needs an internet connection. Webcam access requires a user-granted browser permission and a secure context (localhost or HTTPS). The artwork is drawn in code.

## Controls and rules

- Click **Enable webcam** and allow camera access. Point with your index finger; pinch thumb and index finger to click or select.
- Pinch once to select a survivor, then pinch again to attempt a rescue. Pinch debris or fire symbols to clear them.
- Use **Switch to mouse controls** if the camera is unavailable.
- Survivors with a nearby uncleared hazard have a blocked route and cannot be rescued yet.
- Rescue as many people as possible before the two-minute mission clock expires.
- End a mission early with **End mission**. Results and the top five local scores are stored in browser LocalStorage.

import './style.css';
import { State } from './game/State.js';
import { GameEngine } from './game/Engine.js';
import { Dashboard } from './ui/Dashboard.js';
import { Controls } from './ui/Controls.js';

document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  const dashboard = new Dashboard('dashboard');
  const controls = new Controls('controls');

  // Initial render
  dashboard.render();

  // Start game button
  const startBtn = document.getElementById('start-game');
  startBtn.addEventListener('click', () => {
    if (engine.running) {
      engine.stop();
      startBtn.textContent = 'Resume Game';
    } else {
      engine.start();
      startBtn.textContent = 'Pause Game';
    }
  });

  // Game Over Listener
  State.subscribe(s => {
    if (s.gameOver) {
      alert("GAME OVER! You ran out of money!");
      startBtn.disabled = true;
      startBtn.textContent = "Bankrupt";
    }
  });
});

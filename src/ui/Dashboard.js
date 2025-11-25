import { State } from '../game/State.js';

export class Dashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    State.subscribe(() => this.render());
  }

  render() {
    const s = State;
    this.container.innerHTML = `
      <div class="stats-panel">
        <div class="stat-group">
          <h3>Finances</h3>
          <div class="stat-value" style="color: ${s.money < 0 ? 'var(--danger-color)' : 'inherit'}">$${s.money.toFixed(2)}</div>
        </div>
        <div class="stat-group">
          <h3>Time</h3>
          <div class="stat-value">Day ${s.time.day} - ${s.time.hour.toString().padStart(2, '0')}:${s.time.minute.toString().padStart(2, '0')}</div>
        </div>
        <div class="stat-group">
          <h3>Reputation</h3>
          <div class="stat-value">${Math.round(s.stats.reputation)}%</div>
        </div>
        <div class="stat-group">
          <h3>Sold</h3>
          <div class="stat-value">${s.stats.sold}</div>
        </div>
        <div class="stat-group">
          <h3>Daily Profit</h3>
          <div class="stat-value">$${s.stats.dailyProfit.toFixed(2)}</div>
        </div>
        <div class="stat-group">
          <h3>Total Profit</h3>
          <div class="stat-value">$${s.stats.totalProfit.toFixed(2)}</div>
        </div>
        <div class="stat-group">
          <h3>Staff</h3>
          <div class="stat-value">${s.staff.count}</div>
        </div>
        <div class="stat-group">
          <h3>Queue</h3>
          ${(() => {
        const maxQueue = s.staff.count * 6;
        const ratio = s.queue.length / maxQueue;
        let color = 'var(--success-color)'; // Green
        if (ratio > 0.5) color = 'var(--warning-color)'; // Orange
        if (ratio > 0.8) color = 'var(--danger-color)'; // Red

        return `
              <div class="stat-value" style="color: ${color}">
                ${s.queue.length} <span style="font-size: 0.5em; color: #888;">(Max: ${maxQueue})</span>
              </div>
            `;
      })()}
        </div>
      </div>
      
      <div class="inventory-panel">
        <div class="inv-item">
          <span>Beans</span>
          <span>${s.inventory.beans}g</span>
        </div>
        <div class="inv-item">
          <span>Milk</span>
          <span>${s.inventory.milk}ml</span>
        </div>
        <div class="inv-item">
          <span>Cups</span>
          <span>${s.inventory.cups}</span>
        </div>
      </div>

      <div class="log-panel">
        <h3>Recent Activity</h3>
        <ul class="activity-log">
          ${s.log.map(msg => `<li>${msg}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}

import { State } from '../game/State.js';

export class Controls {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        State.subscribe(() => this.updateButtons());
    }

    render() {
        this.container.innerHTML = `
      <div class="controls-section">
        <h3>Set Prices</h3>
        <div class="price-control">
          <label>Drip Coffee</label>
          <input type="number" id="price-drip" value="${State.prices.drip}" step="0.50">
        </div>
        <div class="price-control">
          <label>Milk Drink</label>
          <input type="number" id="price-milk" value="${State.prices.milk_drink}" step="0.50">
        </div>
        <div class="price-control">
          <label>Pourover</label>
          <input type="number" id="price-pourover" value="${State.prices.pourover}" step="0.50">
        </div>
      </div>

      <div class="controls-section">
        <h3>Supply</h3>
        <button id="buy-beans">Buy Beans (500g / $10)</button>
        <button id="buy-milk">Buy Milk (2L / $8)</button>
        <button id="buy-cups">Buy Cups (50 / $5)</button>
      </div>

      <div class="controls-section">
        <h3>Staffing ($10/hr)</h3>
        <button id="hire-staff">Hire Barista</button>
        <button id="fire-staff">Fire Barista</button>
      </div>
    `;

        this.attachListeners();
    }

    attachListeners() {
        // Price inputs
        document.getElementById('price-drip').addEventListener('change', (e) => {
            State.update(s => s.prices.drip = parseFloat(e.target.value));
        });
        document.getElementById('price-milk').addEventListener('change', (e) => {
            State.update(s => s.prices.milk_drink = parseFloat(e.target.value));
        });
        document.getElementById('price-pourover').addEventListener('change', (e) => {
            State.update(s => s.prices.pourover = parseFloat(e.target.value));
        });

        // Buy buttons
        document.getElementById('buy-beans').addEventListener('click', () => {
            State.update(s => {
                if (s.money >= 10) {
                    s.money -= 10;
                    s.inventory.beans += 500;
                }
            });
        });
        document.getElementById('buy-milk').addEventListener('click', () => {
            State.update(s => {
                if (s.money >= 8) {
                    s.money -= 8;
                    s.inventory.milk += 2000;
                }
            });
        });
        document.getElementById('buy-cups').addEventListener('click', () => {
            State.update(s => {
                if (s.money >= 5) {
                    s.money -= 5;
                    s.inventory.cups += 50;
                }
            });
        });

        // Staff buttons
        document.getElementById('hire-staff').addEventListener('click', () => {
            State.update(s => s.staff.count += 1);
        });
        document.getElementById('fire-staff').addEventListener('click', () => {
            State.update(s => {
                if (s.staff.count > 1) s.staff.count -= 1;
            });
        });

        // Initial button update
        this.updateButtons();
    }

    updateButtons() {
        const s = State;
        document.getElementById('buy-beans').disabled = s.money < 10;
        document.getElementById('buy-milk').disabled = s.money < 8;
        document.getElementById('buy-cups').disabled = s.money < 5;
    }
}

import { State } from './State.js';

export class GameEngine {
    constructor() {
        this.running = false;
        this.tickRate = 200; // 0.2 second per tick (10 game minutes)
        this.interval = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.interval = setInterval(() => this.tick(), this.tickRate);
        console.log("Game Started");
    }

    stop() {
        this.running = false;
        clearInterval(this.interval);
        console.log("Game Stopped");
    }

    tick() {
        State.update(state => {
            // Advance time
            state.time.minute += 10;
            if (state.time.minute >= 60) {
                state.time.minute = 0;
                state.time.hour += 1;
            }
            if (state.time.hour >= 18) { // Close at 6 PM
                state.time.hour = 8;
                state.time.day += 1;
                state.stats.dailyProfit = 0; // Reset daily profit
                // Daily costs
                // Wages are paid hourly, but maybe a daily summary?
            }

            // Hourly Wages
            if (state.time.minute === 0) {
                const hourlyWageCost = state.staff.count * state.staff.wage;
                state.money -= hourlyWageCost;
                state.stats.dailyProfit -= hourlyWageCost;
                state.stats.totalProfit -= hourlyWageCost;
            }

            // Game Over Check
            if (state.money < 0) {
                state.gameOver = true;
                this.stop();
            }

            if (!state.gameOver) {
                // Customer Logic
                this.attemptSale(state);

                // Service Logic
                this.processQueue(state);
            }
        });
    }

    attemptSale(state) {
        // Burst Traffic Logic
        // Max customers depends on reputation (e.g., 100 rep = max 3 customers per tick)
        // Ensure at least 1 potential customer even at 0 reputation to prevent death spiral
        const maxCustomers = Math.max(1, Math.ceil(state.stats.reputation / 35));

        // Randomly decide how many customers arrive (0 to max)
        // We skew it slightly so 0 is still possible
        const count = Math.floor(Math.random() * (maxCustomers + 1));

        for (let i = 0; i < count; i++) {
            this.addToQueue(state);
        }
    }

    addToQueue(state) {
        const types = ['drip', 'milk_drink', 'pourover'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Customer enters queue
        state.queue.push({
            type: type,
            patience: 60 // 60 minutes (6 ticks)
        });
    }

    processQueue(state) {
        // 1. Decrease patience of waiting customers
        // Filter out customers who ran out of patience
        const initialQueueLength = state.queue.length;
        state.queue = state.queue.filter(c => {
            c.patience -= 10; // Decrease by 10 minutes (1 tick)
            return c.patience > 0;
        });

        // Penalty for lost customers
        const lostCustomers = initialQueueLength - state.queue.length;
        if (lostCustomers > 0) {
            state.stats.reputation = Math.max(0, state.stats.reputation - (lostCustomers * 0.5));
            state.addLog(`${lostCustomers} customer(s) left in anger!`);
        }

        // 2. Assign baristas to customers
        // Available baristas = Total Staff - Active Orders
        const availableBaristas = state.staff.count - state.activeOrders.length;

        for (let i = 0; i < availableBaristas; i++) {
            if (state.queue.length > 0) {
                const customer = state.queue.shift();
                // Start order
                state.activeOrders.push({
                    customer: customer,
                    timer: 3 // 3 ticks (30 game minutes) to complete
                });
            }
        }

        // 3. Process active orders
        // We use a reverse loop or filter to safely remove completed orders
        const completedOrders = [];
        state.activeOrders = state.activeOrders.filter(order => {
            order.timer -= 1;
            if (order.timer <= 0) {
                completedOrders.push(order.customer);
                return false; // Remove from active
            }
            return true; // Keep in active
        });

        // 4. Finalize completed orders
        completedOrders.forEach(customer => {
            this.completeOrder(state, customer.type);
        });
    }

    completeOrder(state, type) {
        // Check supplies
        let costBeans = 0;
        let costMilk = 0;

        if (type === 'drip') costBeans = 20;
        if (type === 'milk_drink') { costBeans = 18; costMilk = 100; }
        if (type === 'pourover') costBeans = 25;

        if (state.inventory.cups >= 1 && state.inventory.beans >= costBeans && state.inventory.milk >= costMilk) {
            // Make sale
            state.inventory.cups -= 1;
            state.inventory.beans -= costBeans;
            state.inventory.milk -= costMilk;
            state.money += state.prices[type];
            state.stats.sold += 1;

            // Calculate Profit
            // COGS: Beans $0.02/g, Milk $0.005/ml, Cup $0.10
            const cost = (costBeans * 0.02) + (costMilk * 0.005) + 0.10;
            const profit = state.prices[type] - cost;
            state.stats.dailyProfit += profit;
            state.stats.totalProfit += profit;

            // Small reputation boost for successful sale
            state.stats.reputation = Math.min(100, state.stats.reputation + 0.1);
        } else {
            // Lost sale due to supplies
            state.stats.reputation = Math.max(0, state.stats.reputation - 1);

            let missing = [];
            if (state.inventory.cups < 1) missing.push("Cups");
            if (state.inventory.beans < costBeans) missing.push("Beans");
            if (state.inventory.milk < costMilk) missing.push("Milk");

            state.addLog(`Out of Stock: ${missing.join(', ')}`);
        }
    }
}

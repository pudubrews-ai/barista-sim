export const State = {
  money: 1000.00, // Seed Amount
  gameOver: false,
  inventory: {
    beans: 500, // grams
    milk: 2000, // ml
    cups: 50
  },
  prices: {
    drip: 3.00,
    milk_drink: 5.00,
    pourover: 6.00
  },
  stats: {
    sold: 0,
    reputation: 100,
    dailyProfit: 0,
    totalProfit: 0
  },
  staff: {
    count: 1,
    wage: 10.00 // $10/hr
  },
  queue: [], // Array of customers waiting
  activeOrders: [], // Array of { customer, timer } being served
  log: [], // Array of strings

  // Helper to add log message
  addLog(msg) {
    this.log.unshift(msg);
    if (this.log.length > 5) this.log.pop();
  },

  time: {
    day: 1,
    hour: 8, // 8 AM
    minute: 0
  },

  listeners: [],

  subscribe(callback) {
    this.listeners.push(callback);
  },

  notify() {
    this.listeners.forEach(cb => cb(this));
  },

  update(updater) {
    updater(this);
    this.notify();
  }
};

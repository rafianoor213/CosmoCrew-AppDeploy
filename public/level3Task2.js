/**
 * CosmoCrew - Level 3, Task 2: Verify and Pack Crew Supplies
 * Use the food harvested in Level 1 and survival supplies collected in Level 2.
 */
class Task3SupplyStore {
  constructor(callbacks) {
    this.callbacks = callbacks || {};
    this.active = false;
    this.paused = false;
    this.startedAt = 0;
    this.requirements = {
      fruit: 2,
      veggie: 2,
      oxygen: 3,
      protein: 1,
      water: 1
    };
    this.labels = {
      fruit: 'Cosmic Fruit',
      veggie: 'Vegetables',
      oxygen: 'Oxygen Canisters',
      protein: 'Protein Bars',
      water: 'Water Packs'
    };
  }

  get supplies() {
    return (window.game && window.game.resources) || {};
  }

  get complete() {
    return Object.keys(this.requirements).every(key =>
      (this.supplies[key] || 0) >= this.requirements[key]
    );
  }

  start() {
    this.active = true;
    this.paused = false;
    this.startedAt = Date.now();
    this.render();
    this.updateHUD();
  }

  render() {
    const list = document.getElementById('l3StoreItems');
    const feedback = document.getElementById('l3StoreFeedback');
    const checkout = document.getElementById('l3StoreCheckout');
    const wallet = document.getElementById('l3StoreWallet');
    if (!list) return;

    if (wallet) wallet.textContent = 'CARGO CHECK';
    list.innerHTML = Object.keys(this.requirements).map(key => {
      const required = this.requirements[key];
      const collected = this.supplies[key] || 0;
      const enough = collected >= required;
      const icon = { fruit: '🍎', veggie: '🥕', oxygen: '🫧', protein: '🍫', water: '💧' }[key];
      return `
        <article class="l3-store-item ${enough ? 'cargo-ready' : 'cargo-missing'}">
          <div class="l3-store-item-icon">${icon}</div>
          <div class="l3-store-item-copy">
            <h3>${this.labels[key]}</h3>
            <p>${key === 'fruit' || key === 'veggie' ? 'Collected in Level 1 • Grow & Harvest' : 'Collected in Level 2 • Space Runner'}</p>
            <strong>${collected} / ${required} collected ${enough ? '✓' : '— NEED MORE'}</strong>
          </div>
        </article>
      `;
    }).join('');

    if (checkout) checkout.disabled = !this.complete;
    if (feedback) {
      feedback.textContent = this.complete
        ? 'All crew supplies are ready! Pack the cargo and continue to the rescue mission.'
        : 'Some supplies are missing. Return to the earlier levels and collect the required amounts before packing.';
    }

    if (checkout) {
      checkout.onclick = () => {
        if (!this.active || this.paused || !this.complete) return;
        window.game.level3Supplies = { ...this.supplies };
        localStorage.setItem('cosmoCrewLevel3Supplies', JSON.stringify(window.game.level3Supplies));
        this.stop();
        if (this.callbacks.onWin) {
          this.callbacks.onWin({
            timeTaken: Math.round((Date.now() - this.startedAt) / 1000),
            supplies: window.game.level3Supplies
          });
        }
      };
    }
  }

  updateHUD() {
    if (this.callbacks.onUpdateHUD) {
      this.callbacks.onUpdateHUD({ timeLeft: 0, supplies: this.supplies });
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  stop() {
    this.active = false;
    const checkout = document.getElementById('l3StoreCheckout');
    if (checkout) checkout.onclick = null;
  }
}
window.Task3SupplyStore = Task3SupplyStore;

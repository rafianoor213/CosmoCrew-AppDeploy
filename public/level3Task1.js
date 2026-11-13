/**
 * CosmoCrew - Level 3, Task 1: Radiation Storm
 * Charge the three shield generators before the radiation meter reaches danger.
 */
class Task3RadiationStorm {
  constructor(callbacks) {
    this.callbacks = callbacks || {};
    this.active = false;
    this.paused = false;
    this.timer = null;
    this.timeLeft = 75;
    this.radiation = 24;
    this.shields = [
      { name: 'PORT SHIELD', icon: '🛡️', charge: 0 },
      { name: 'DOME SHIELD', icon: '🔵', charge: 0 },
      { name: 'ENGINE SHIELD', icon: '⚡', charge: 0 },
    ];
    this.startedAt = 0;
  }

  start() {
    this.active = true;
    this.paused = false;
    this.startedAt = Date.now();
    this.render();
    this.update();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  render() {
    const grid = document.getElementById('l3ShieldGrid');
    if (!grid) return;
    grid.innerHTML = this.shields.map((shield, index) => `
      <div class="l3-shield-card">
        <div class="l3-shield-icon">${shield.icon}</div>
        <h3>${shield.name}</h3>
        <div class="l3-charge-track"><span style="width:${shield.charge / 2 * 100}%"></span></div>
        <p>${shield.charge}/2 POWER CELLS</p>
        <button class="btn btn-primary l3-action-btn" data-shield="${index}" ${shield.charge >= 2 ? 'disabled' : ''}>
          ${shield.charge >= 2 ? 'SHIELD ONLINE ✓' : 'CHARGE SHIELD +'}
        </button>
      </div>
    `).join('');
    grid.onclick = event => {
      const button = event.target.closest('[data-shield]');
      if (!button || !this.active || this.paused) return;
      const index = Number(button.dataset.shield);
      const shield = this.shields[index];
      if (!shield || shield.charge >= 2) return;
      shield.charge += 1;
      this.radiation = Math.max(8, this.radiation - 7);
      if (window.soundSystem) window.soundSystem.playButtonClick();
      this.render();
      this.update();
      if (this.shields.every(item => item.charge >= 2)) {
        this.finish();
      }
    };
  }

  tick() {
    if (!this.active || this.paused) return;
    this.timeLeft -= 1;
    this.radiation = Math.min(100, this.radiation + 1.3);
    this.update();
    if (this.radiation >= 100 || this.timeLeft <= 0) {
      this.stop();
      if (this.callbacks.onLose) {
        this.callbacks.onLose({
          reason: 'The radiation storm overwhelmed the ship shields. Try charging all three generators faster!',
          taskName: 'Radiation Storm',
        });
      }
    }
  }

  update() {
    const fill = document.getElementById('l3RadiationFill');
    const value = document.getElementById('l3RadiationValue');
    const feedback = document.getElementById('l3RadiationFeedback');
    const completed = this.shields.filter(item => item.charge >= 2).length;
    if (fill) fill.style.width = `${this.radiation}%`;
    if (value) value.textContent = `${Math.round(this.radiation)}%`;
    if (feedback) {
      feedback.textContent = completed === 3
        ? 'All shields are online! The crew is safe.'
        : `Storm alert! Activate all 3 shields. ${completed}/3 online.`;
    }
    if (this.callbacks.onUpdateHUD) {
      this.callbacks.onUpdateHUD({
        timeLeft: this.timeLeft,
        radiation: Math.round(this.radiation),
        shieldsOnline: completed,
      });
    }
  }

  finish() {
    if (!this.active) return;
    const timeTaken = Math.round((Date.now() - this.startedAt) / 1000);
    this.stop();
    if (this.callbacks.onWin) {
      this.callbacks.onWin({ timeTaken, shieldsOnline: 3 });
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  stop() {
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const grid = document.getElementById('l3ShieldGrid');
    if (grid) grid.onclick = null;
  }
}
window.Task3RadiationStorm = Task3RadiationStorm;

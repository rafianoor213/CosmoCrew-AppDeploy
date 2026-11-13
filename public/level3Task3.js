/**
 * CosmoCrew - Level 3, Task 3: Rescue & Return to Earth
 * Complete the pre-flight checklist, pack cargo, then give each injured astronaut oxygen and food.
 */
class Task3RescueEarth {
  constructor(callbacks) {
    this.callbacks = callbacks || {};
    this.active = false;
    this.paused = false;
    this.startedAt = 0;
    this.packed = false;
    this.checks = [false, false, false, false];
    this.crew = [
      { id: 'nova', name: 'Captain Nova', emoji: '👩‍🚀', food: { fruit: 1, protein: 1 }, foodText: 'Cosmic fruit + protein bar', oxygen: false, fed: false },
      { id: 'orion', name: 'Pilot Orion', emoji: '🧑‍🚀', food: { veggie: 1, water: 1 }, foodText: 'Veggie wrap + water pack', oxygen: false, fed: false },
      { id: 'luna', name: 'Engineer Luna', emoji: '👩‍🚀', food: { fruit: 1, veggie: 1 }, foodText: 'Cosmic fruit + veggie wrap', oxygen: false, fed: false },
    ];
  }

  start() {
    this.active = true;
    this.paused = false;
    this.startedAt = Date.now();
    this.renderChecklist();
    this.renderCrew();
    this.updateHUD();
  }

  get supplies() {
    return (window.game && window.game.level3Supplies) || {};
  }

  hasFood(crewMember) {
    return Object.entries(crewMember.food).every(([key, count]) => (this.supplies[key] || 0) >= count);
  }

  renderChecklist() {
    const list = document.getElementById('l3Checklist');
    const pack = document.getElementById('l3PackSupplies');
    if (!list) return;
    const labels = [
      ['🚀', 'Rocket fuel and navigation checked'],
      ['🛡️', 'Radiation shields secured'],
      ['🍱', 'Crew food kits counted'],
      ['🫧', 'Oxygen canisters loaded'],
    ];
    list.innerHTML = labels.map((item, index) => `
      <button class="l3-check-item ${this.checks[index] ? 'checked' : ''}" data-check="${index}">
        <span class="l3-check-icon">${item[0]}</span>
        <span>${item[1]}</span>
        <strong>${this.checks[index] ? '✓' : '○'}</strong>
      </button>
    `).join('');
    if (pack) pack.disabled = !this.checks.every(Boolean);
    list.onclick = event => {
      const button = event.target.closest('[data-check]');
      if (!button || !this.active || this.paused || this.packed) return;
      const index = Number(button.dataset.check);
      this.checks[index] = !this.checks[index];
      this.renderChecklist();
      this.updateHUD();
    };
    if (pack) {
      pack.onclick = () => {
        if (!this.active || this.paused || !this.checks.every(Boolean)) return;
        const enoughOxygen = (this.supplies.oxygen || 0) >= 3;
        const enoughFood = this.crew.every(member => this.hasFood(member));
        const feedback = document.getElementById('l3RescueFeedback');
        if (!enoughOxygen || !enoughFood) {
          if (feedback) feedback.textContent = 'Cargo is missing! Return to the supply store and buy the crew food and 3 oxygen canisters.';
          return;
        }
        this.packed = true;
        pack.textContent = 'CARGO PACKED ✓';
        pack.disabled = true;
        const crewWrap = document.getElementById('l3RescueCrew');
        if (crewWrap) crewWrap.hidden = false;
        if (feedback) feedback.textContent = 'Cargo secured! Help all three injured astronauts before the Earth return launch.';
        this.renderCrew();
      };
    }
  }

  renderCrew() {
    const wrap = document.getElementById('l3RescueCrew');
    if (!wrap) return;
    wrap.hidden = !this.packed;
    wrap.innerHTML = this.crew.map(member => `
      <article class="l3-crew-card ${member.oxygen && member.fed ? 'rescued' : ''}">
        <div class="l3-crew-avatar">${member.emoji}</div>
        <div class="l3-crew-copy">
          <h3>${member.name}</h3>
          <p>Needs: ${member.foodText} + 1 oxygen canister</p>
          <div class="l3-crew-status">${member.oxygen ? 'Oxygen given ✓' : 'Oxygen needed'} · ${member.fed ? 'Food given ✓' : 'Food needed'}</div>
        </div>
        <div class="l3-crew-actions">
          <button class="btn btn-primary" data-oxygen="${member.id}" ${member.oxygen || (this.supplies.oxygen || 0) < 1 ? 'disabled' : ''}>
            ${member.oxygen ? 'OXYGEN GIVEN ✓' : 'GIVE OXYGEN'}
          </button>
          <button class="btn btn-gold" data-food="${member.id}" ${member.fed || !this.hasFood(member) ? 'disabled' : ''}>
            ${member.fed ? 'FOOD GIVEN ✓' : 'PREPARE & GIVE FOOD'}
          </button>
        </div>
      </article>
    `).join('');
    wrap.onclick = event => {
      if (!this.active || this.paused || !this.packed) return;
      const oxygenButton = event.target.closest('[data-oxygen]');
      const foodButton = event.target.closest('[data-food]');
      if (!oxygenButton && !foodButton) return;
      const member = this.crew.find(person => person.id === (oxygenButton || foodButton).dataset.oxygen || person.id === (oxygenButton || foodButton).dataset.food);
      if (!member) return;
      if (oxygenButton && !member.oxygen && (this.supplies.oxygen || 0) > 0) {
        this.supplies.oxygen -= 1;
        member.oxygen = true;
      }
      if (foodButton && !member.fed && this.hasFood(member)) {
        Object.entries(member.food).forEach(([key, count]) => {
          this.supplies[key] = (this.supplies[key] || 0) - count;
        });
        member.fed = true;
      }
      localStorage.setItem('cosmoCrewLevel3Supplies', JSON.stringify(this.supplies));
      if (window.soundSystem) window.soundSystem.playButtonClick();
      this.renderCrew();
      this.updateHUD();
      const rescued = this.crew.filter(person => person.oxygen && person.fed).length;
      if (rescued === 3) this.finish();
    };
  }

  updateHUD() {
    const rescued = this.crew.filter(person => person.oxygen && person.fed).length;
    const checklistDone = this.checks.filter(Boolean).length;
    if (this.callbacks.onUpdateHUD) {
      this.callbacks.onUpdateHUD({
        timeLeft: 0,
        rescued,
        checklistDone,
        checklistTotal: this.checks.length,
      });
    }
  }

  finish() {
    if (!this.active) return;
    const timeTaken = Math.round((Date.now() - this.startedAt) / 1000);
    const feedback = document.getElementById('l3RescueFeedback');
    if (feedback) feedback.textContent = 'All astronauts are safe! Earth is in sight. Great work, Cadet!';
    this.stop();
    if (this.callbacks.onWin) {
      this.callbacks.onWin({ timeTaken, rescued: 3 });
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  stop() {
    this.active = false;
    const list = document.getElementById('l3Checklist');
    const pack = document.getElementById('l3PackSupplies');
    const crew = document.getElementById('l3RescueCrew');
    if (list) list.onclick = null;
    if (pack) pack.onclick = null;
    if (crew) crew.onclick = null;
  }
}
window.Task3RescueEarth = Task3RescueEarth;

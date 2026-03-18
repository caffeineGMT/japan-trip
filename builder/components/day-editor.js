/**
 * Day Editor Web Component
 * Displays and manages a single day with sortable stops
 */

class DayEditor extends HTMLElement {
  constructor() {
    super();
    this.dayIndex = 0;
    this.dayData = null;
    this.sortable = null;
  }

  static get observedAttributes() {
    return ['day-index'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'day-index') {
      this.dayIndex = parseInt(newValue);
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.initializeSortable();
  }

  disconnectedCallback() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }

  setDayData(dayData) {
    this.dayData = dayData;
    this.render();
    this.initializeSortable();
  }

  render() {
    if (!this.dayData) return;

    this.innerHTML = `
      <div class="day-editor" data-day-id="${this.dayData.id}">
        <div class="day-header">
          <div class="day-header-left">
            <input
              type="text"
              class="day-title-input"
              value="${this.dayData.day}"
              placeholder="Day 1"
              data-field="day"
            />
            <input
              type="date"
              class="day-date-input"
              value="${this.dayData.date || ''}"
              data-field="date"
            />
          </div>
          <div class="day-header-right">
            <input
              type="color"
              class="day-color-picker"
              value="${this.dayData.color}"
              data-field="color"
              title="Day color"
            />
            <button class="btn-icon delete-day" title="Delete day">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="day-details">
          <input
            type="text"
            class="city-input"
            value="${this.dayData.city.en}"
            placeholder="City (e.g., Tokyo)"
            data-field="city"
            data-lang="en"
          />
          <input
            type="text"
            class="theme-input"
            value="${this.dayData.theme.en}"
            placeholder="Theme (e.g., Cherry Blossoms)"
            data-field="theme"
            data-lang="en"
          />
        </div>

        <div class="stops-container" data-sortable>
          ${this.dayData.stops.map((stop, idx) => this.renderStopCard(stop, idx)).join('')}
        </div>

        <button class="btn-secondary add-stop-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add Stop
        </button>
      </div>
    `;

    this.attachEventListeners();
  }

  renderStopCard(stop, index) {
    return `
      <div class="stop-card" data-stop-id="${stop.id}" draggable="true">
        <div class="stop-drag-handle">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </div>
        <div class="stop-content">
          <div class="stop-header">
            <input
              type="text"
              class="stop-name-input"
              value="${stop.name.en}"
              placeholder="Stop name"
              data-field="name"
              data-lang="en"
            />
            <button class="btn-icon delete-stop" title="Delete stop">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </button>
          </div>
          <input
            type="text"
            class="stop-time-input"
            value="${stop.time || ''}"
            placeholder="Time (e.g., 2:00 PM)"
            data-field="time"
          />
          <textarea
            class="stop-desc-input"
            placeholder="Description"
            data-field="desc"
            data-lang="en"
            rows="2"
          >${stop.desc.en || ''}</textarea>
          <div class="stop-meta">
            <select class="stop-icon-select" data-field="icon">
              <option value="attraction" ${stop.icon === 'attraction' ? 'selected' : ''}>🏛️ Attraction</option>
              <option value="food" ${stop.icon === 'food' ? 'selected' : ''}>🍜 Food</option>
              <option value="hotel" ${stop.icon === 'hotel' ? 'selected' : ''}>🏨 Hotel</option>
              <option value="transport" ${stop.icon === 'transport' ? 'selected' : ''}>🚆 Transport</option>
              <option value="nature" ${stop.icon === 'nature' ? 'selected' : ''}>🌸 Nature</option>
              <option value="shopping" ${stop.icon === 'shopping' ? 'selected' : ''}>🛍️ Shopping</option>
            </select>
            ${stop.lat && stop.lng ? `
              <span class="coords-badge" title="Geocoded">
                📍 ${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}
              </span>
            ` : `
              <button class="btn-text geocode-btn">📍 Add Location</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Day metadata inputs
    this.querySelectorAll('.day-header input, .day-details input').forEach(input => {
      input.addEventListener('input', (e) => this.handleDayUpdate(e));
    });

    // Delete day button
    this.querySelector('.delete-day')?.addEventListener('click', () => {
      if (confirm('Delete this day and all its stops?')) {
        this.dispatchEvent(new CustomEvent('day-delete', {
          bubbles: true,
          detail: { dayId: this.dayData.id }
        }));
      }
    });

    // Add stop button
    this.querySelector('.add-stop-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('stop-add-request', {
        bubbles: true,
        detail: { dayId: this.dayData.id }
      }));
    });

    // Stop inputs
    this.querySelectorAll('.stop-card').forEach(card => {
      const stopId = card.dataset.stopId;

      card.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', (e) => this.handleStopUpdate(stopId, e));
      });

      card.querySelector('.delete-stop')?.addEventListener('click', () => {
        if (confirm('Delete this stop?')) {
          this.dispatchEvent(new CustomEvent('stop-delete', {
            bubbles: true,
            detail: { dayId: this.dayData.id, stopId }
          }));
        }
      });

      card.querySelector('.geocode-btn')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('geocode-request', {
          bubbles: true,
          detail: { dayId: this.dayData.id, stopId }
        }));
      });
    });
  }

  handleDayUpdate(event) {
    const input = event.target;
    const field = input.dataset.field;
    const lang = input.dataset.lang;

    let value = input.value;

    // Build update object
    const updates = {};
    if (lang) {
      // i18n field
      updates[field] = { ...this.dayData[field], [lang]: value };
    } else {
      updates[field] = value;
    }

    this.dispatchEvent(new CustomEvent('day-update', {
      bubbles: true,
      detail: { dayId: this.dayData.id, updates }
    }));
  }

  handleStopUpdate(stopId, event) {
    const input = event.target;
    const field = input.dataset.field;
    const lang = input.dataset.lang;

    let value = input.value;

    const updates = {};
    if (lang) {
      const stop = this.dayData.stops.find(s => s.id === stopId);
      updates[field] = { ...stop[field], [lang]: value };
    } else {
      updates[field] = value;
    }

    this.dispatchEvent(new CustomEvent('stop-update', {
      bubbles: true,
      detail: { dayId: this.dayData.id, stopId, updates }
    }));
  }

  initializeSortable() {
    const container = this.querySelector('[data-sortable]');
    if (!container || !window.Sortable) return;

    if (this.sortable) {
      this.sortable.destroy();
    }

    this.sortable = new Sortable(container, {
      animation: 150,
      handle: '.stop-drag-handle',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        const stopIds = Array.from(container.querySelectorAll('.stop-card'))
          .map(card => card.dataset.stopId);

        this.dispatchEvent(new CustomEvent('stops-reorder', {
          bubbles: true,
          detail: { dayId: this.dayData.id, stopIds }
        }));
      }
    });
  }
}

customElements.define('day-editor', DayEditor);

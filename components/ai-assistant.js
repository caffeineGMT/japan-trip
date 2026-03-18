/**
 * AI Assistant Component
 * Floating chat interface for AI-powered itinerary optimization
 */

class AIAssistant {
  constructor() {
    this.isOpen = false;
    this.userId = null;
    this.userTier = 'free';
    this.chatHistory = [];
    this.init();
  }

  init() {
    this.createUI();
    this.attachEventListeners();
    this.loadUserData();
  }

  createUI() {
    // Create floating button
    const button = document.createElement('button');
    button.id = 'ai-assistant-button';
    button.className = 'ai-assistant-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
      <span class="ai-badge">AI</span>
    `;
    document.body.appendChild(button);

    // Create sidebar panel
    const sidebar = document.createElement('div');
    sidebar.id = 'ai-assistant-sidebar';
    sidebar.className = 'ai-assistant-sidebar';
    sidebar.innerHTML = `
      <div class="ai-assistant-header">
        <h3>🤖 AI Travel Assistant</h3>
        <button class="ai-close-btn" id="ai-close-btn">×</button>
      </div>

      <div class="ai-tabs">
        <button class="ai-tab active" data-tab="optimize">Optimize</button>
        <button class="ai-tab" data-tab="recommend">Discover</button>
        <button class="ai-tab" data-tab="edit">Edit</button>
        <button class="ai-tab" data-tab="checklist">Pack</button>
      </div>

      <div class="ai-content">
        <!-- Optimize Tab -->
        <div class="ai-tab-content active" id="optimize-tab">
          <p class="ai-description">Get AI-powered suggestions to optimize your itinerary for efficiency, timing, and experience.</p>
          <div id="optimization-results"></div>
          <button class="ai-action-btn" id="optimize-btn">
            <span class="btn-text">Analyze Itinerary</span>
            <span class="btn-loading" style="display:none;">Analyzing...</span>
          </button>
          <div class="ai-usage-info" id="usage-info"></div>
        </div>

        <!-- Discover Tab -->
        <div class="ai-tab-content" id="recommend-tab">
          <p class="ai-description">Discover nearby attractions and get personalized recommendations based on your location.</p>
          <div id="recommendation-results"></div>
          <button class="ai-action-btn" id="discover-btn">
            <span class="btn-text">Find Nearby</span>
            <span class="btn-loading" style="display:none;">Searching...</span>
          </button>
          <small class="ai-help-text">Enable location to get real-time suggestions</small>
        </div>

        <!-- Edit Tab -->
        <div class="ai-tab-content" id="edit-tab">
          <p class="ai-description">Edit your itinerary using natural language. Try "Add sushi dinner in Shibuya on Day 3"</p>
          <div class="ai-premium-badge" id="edit-premium-badge" style="display:none;">
            <span>✨ Premium Feature</span>
            <a href="/pricing.html">Upgrade</a>
          </div>
          <textarea
            id="ai-command-input"
            placeholder="Type your edit command..."
            rows="3"
          ></textarea>
          <button class="ai-action-btn" id="edit-btn">
            <span class="btn-text">Apply Edit</span>
            <span class="btn-loading" style="display:none;">Processing...</span>
          </button>
          <div class="ai-examples">
            <small>Examples:</small>
            <ul>
              <li>"Add ramen lunch in Harajuku on Day 2"</li>
              <li>"Remove teamLab visit"</li>
              <li>"Move Senso-ji to Day 3 morning"</li>
            </ul>
          </div>
        </div>

        <!-- Checklist Tab -->
        <div class="ai-tab-content" id="checklist-tab">
          <p class="ai-description">Generate a smart packing checklist tailored to your trip.</p>
          <div id="checklist-results"></div>
          <button class="ai-action-btn" id="checklist-btn">
            <span class="btn-text">Generate Checklist</span>
            <span class="btn-loading" style="display:none;">Creating...</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);

    // Add styles
    this.injectStyles();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ai-assistant-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 998;
      }

      .ai-assistant-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      .ai-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #f56565;
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
      }

      .ai-assistant-sidebar {
        position: fixed;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100vh;
        background: white;
        box-shadow: -2px 0 15px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 999;
        display: flex;
        flex-direction: column;
      }

      .ai-assistant-sidebar.open {
        right: 0;
      }

      .ai-assistant-header {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ai-assistant-header h3 {
        margin: 0;
        font-size: 18px;
      }

      .ai-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 32px;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
      }

      .ai-tabs {
        display: flex;
        background: #f7fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .ai-tab {
        flex: 1;
        padding: 12px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #718096;
        transition: all 0.2s;
      }

      .ai-tab.active {
        color: #667eea;
        background: white;
        border-bottom: 2px solid #667eea;
      }

      .ai-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .ai-tab-content {
        display: none;
      }

      .ai-tab-content.active {
        display: block;
      }

      .ai-description {
        color: #4a5568;
        font-size: 14px;
        margin-bottom: 20px;
        line-height: 1.6;
      }

      .ai-action-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 15px;
      }

      .ai-action-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .ai-action-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-loading {
        display: none;
      }

      .ai-action-btn.loading .btn-text {
        display: none;
      }

      .ai-action-btn.loading .btn-loading {
        display: inline;
      }

      #ai-command-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        transition: border-color 0.2s;
      }

      #ai-command-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .ai-examples {
        margin-top: 15px;
        padding: 12px;
        background: #f7fafc;
        border-radius: 8px;
        font-size: 12px;
      }

      .ai-examples ul {
        margin: 8px 0 0;
        padding-left: 20px;
        color: #718096;
      }

      .ai-examples li {
        margin: 4px 0;
      }

      .ai-help-text {
        display: block;
        margin-top: 10px;
        color: #718096;
        font-size: 12px;
      }

      .ai-premium-badge {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: #fef5e7;
        border: 1px solid #f9e79f;
        border-radius: 8px;
        margin-bottom: 15px;
        font-size: 13px;
      }

      .ai-premium-badge a {
        color: #667eea;
        font-weight: 600;
        text-decoration: none;
      }

      .ai-usage-info {
        margin-top: 10px;
        padding: 10px;
        background: #edf2f7;
        border-radius: 6px;
        font-size: 12px;
        color: #4a5568;
      }

      .suggestion-card {
        padding: 15px;
        background: #f7fafc;
        border-left: 4px solid #667eea;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .suggestion-card.priority-high {
        border-left-color: #f56565;
      }

      .suggestion-card.priority-medium {
        border-left-color: #ed8936;
      }

      .suggestion-card h4 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #2d3748;
      }

      .suggestion-card p {
        margin: 0;
        font-size: 13px;
        color: #4a5568;
        line-height: 1.5;
      }

      .suggestion-type {
        display: inline-block;
        padding: 2px 8px;
        background: #667eea;
        color: white;
        border-radius: 12px;
        font-size: 11px;
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .ai-assistant-sidebar {
          width: 100%;
          right: -100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    // Toggle sidebar
    document.getElementById('ai-assistant-button').addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('ai-close-btn').addEventListener('click', () => {
      this.close();
    });

    // Tab switching
    document.querySelectorAll('.ai-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Action buttons
    document.getElementById('optimize-btn').addEventListener('click', () => {
      this.optimizeItinerary();
    });

    document.getElementById('discover-btn').addEventListener('click', () => {
      this.discoverNearby();
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
      this.editItinerary();
    });

    document.getElementById('checklist-btn').addEventListener('click', () => {
      this.generateChecklist();
    });
  }

  async loadUserData() {
    // Load user data from auth system
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        this.userId = parsed.user_id;
        this.userTier = parsed.subscription_tier || 'free';

        // Update UI based on tier
        if (this.userTier !== 'premium') {
          document.getElementById('edit-premium-badge').style.display = 'flex';
        }

        // Load usage info
        await this.updateUsageInfo();
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  }

  async updateUsageInfo() {
    if (!this.userId) return;

    try {
      const response = await fetch(`/api/ai/usage?userId=${this.userId}`);
      if (response.ok) {
        const data = await response.json();
        const usageDiv = document.getElementById('usage-info');
        usageDiv.innerHTML = `
          <strong>${data.remaining}/${data.limit}</strong> optimizations remaining this month
          ${data.remaining === 0 ? '<br><a href="/pricing.html">Upgrade for unlimited</a>' : ''}
        `;
      }
    } catch (error) {
      console.error('Failed to load usage info:', error);
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const sidebar = document.getElementById('ai-assistant-sidebar');
    sidebar.classList.toggle('open', this.isOpen);
  }

  close() {
    this.isOpen = false;
    document.getElementById('ai-assistant-sidebar').classList.remove('open');
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.ai-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.ai-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
  }

  async optimizeItinerary() {
    const button = document.getElementById('optimize-btn');
    const resultsDiv = document.getElementById('optimization-results');

    button.classList.add('loading');
    button.disabled = true;
    resultsDiv.innerHTML = '';

    try {
      // Get current itinerary from window.TRIP_DATA or global state
      const itinerary = {
        destination: 'Japan',
        days: window.TRIP_DATA || [],
        startDate: '2025-03-31',
        endDate: '2025-04-13'
      };

      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary, userId: this.userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Optimization failed');
      }

      // Display suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        resultsDiv.innerHTML = data.suggestions.map(s => `
          <div class="suggestion-card priority-${s.priority}">
            <h4>
              <span class="suggestion-type">${s.type}</span>
              ${s.dayNumber ? `Day ${s.dayNumber}` : 'General'}
            </h4>
            <p><strong>${s.description}</strong></p>
            <p>💡 ${s.action}</p>
            ${s.estimatedTimeSaved ? `<small>⏱️ Saves ~${s.estimatedTimeSaved}</small>` : ''}
          </div>
        `).join('');
      } else {
        resultsDiv.innerHTML = '<p>✅ Your itinerary looks well-optimized!</p>';
      }

      await this.updateUsageInfo();

    } catch (error) {
      resultsDiv.innerHTML = `<p style="color: #f56565;">⚠️ ${error.message}</p>`;
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async discoverNearby() {
    const button = document.getElementById('discover-btn');
    const resultsDiv = document.getElementById('recommendation-results');

    button.classList.add('loading');
    button.disabled = true;

    try {
      // Get user location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `/api/ai/recommend?lat=${latitude}&lon=${longitude}&dayIndex=0&userId=${this.userId || 'guest'}&city=Tokyo`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get recommendations');
      }

      if (data.hasRecommendation) {
        resultsDiv.innerHTML = `
          <div class="suggestion-card">
            <h4>📍 ${data.poi.name}</h4>
            <p><small>${data.distance}m away • ${data.poi.category}</small></p>
            <p>${data.recommendation}</p>
            ${data.poi.rating ? `<small>⭐ ${data.poi.rating}/5</small>` : ''}
          </div>
        `;
      } else {
        resultsDiv.innerHTML = '<p>No nearby recommendations found.</p>';
      }

    } catch (error) {
      if (error.code === 1) {
        resultsDiv.innerHTML = '<p>📍 Please enable location access to discover nearby places.</p>';
      } else {
        resultsDiv.innerHTML = `<p style="color: #f56565;">⚠️ ${error.message}</p>`;
      }
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async editItinerary() {
    if (this.userTier !== 'premium') {
      alert('Natural language editing is a premium feature. Upgrade to use this!');
      window.location.href = '/pricing.html';
      return;
    }

    const button = document.getElementById('edit-btn');
    const input = document.getElementById('ai-command-input');
    const command = input.value.trim();

    if (!command) {
      alert('Please enter an edit command');
      return;
    }

    button.classList.add('loading');
    button.disabled = true;

    try {
      const itinerary = {
        destination: 'Japan',
        days: window.TRIP_DATA || []
      };

      const response = await fetch('/api/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, itinerary, userId: this.userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Edit failed');
      }

      // Apply the updated itinerary
      window.TRIP_DATA = data.updatedItinerary.days;

      // Refresh the UI
      if (typeof window.loadTrip === 'function') {
        window.loadTrip();
      }

      alert(`✅ ${data.message}`);
      input.value = '';

    } catch (error) {
      alert(`⚠️ ${error.message}`);
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async generateChecklist() {
    const button = document.getElementById('checklist-btn');
    const resultsDiv = document.getElementById('checklist-results');

    button.classList.add('loading');
    button.disabled = true;
    resultsDiv.innerHTML = '';

    try {
      const tripContext = {
        destination: 'Japan',
        durationDays: 14,
        season: 'spring',
        activities: ['temple visits', 'cherry blossom viewing', 'food tours', 'city exploration'],
        cities: ['Tokyo', 'Kyoto', 'Osaka', 'Nara'],
        startDate: '2025-03-31',
        userId: this.userId || null
      };

      const response = await fetch('/api/ai/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripContext)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checklist generation failed');
      }

      // Display checklist
      if (data.checklist && data.checklist.length > 0) {
        resultsDiv.innerHTML = data.checklist.map(category => `
          <div class="suggestion-card">
            <h4>${category.category}</h4>
            <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px;">
              ${category.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `).join('');
      }

    } catch (error) {
      resultsDiv.innerHTML = `<p style="color: #f56565;">⚠️ ${error.message}</p>`;
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }
}

// Initialize AI Assistant when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
  });
} else {
  window.aiAssistant = new AIAssistant();
}

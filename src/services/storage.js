const KEYS = {
  FAVORITES: 'currenx_favorites_v1',
  HISTORY: 'currenx_history_v1',
  THEME: 'currenx_theme_v1',
  SETTINGS: 'currenx_settings_v1',
  RATES_CACHE: 'currenx_rates_cache_v1',
  API_METRICS: 'currenx_api_metrics_v1',
  SIMULATED_RATES: 'currenx_simulated_rates_v1',
  TRAVEL_BUDGET: 'currenx_travel_budget_v1'
};

const DEFAULT_FAVORITES = [
  { id: '1', from: 'USD', to: 'INR', pinned: true },
  { id: '2', from: 'EUR', to: 'USD', pinned: true },
  { id: '3', from: 'GBP', to: 'INR', pinned: true },
  { id: '4', from: 'USD', to: 'AED', pinned: true },
  { id: '5', from: 'USD', to: 'SAR', pinned: true },
  { id: '6', from: 'BTC', to: 'USD', pinned: true }
];

export const storage = {
  getFavorites() {
    try {
      const data = localStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : DEFAULT_FAVORITES;
    } catch (e) {
      return DEFAULT_FAVORITES;
    }
  },

  saveFavorites(list) {
    try {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(list));
    } catch (e) {}
  },

  getHistory() {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addHistory(item) {
    try {
      const list = this.getHistory();
      const newItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      // Keep most recent 30 items
      const updated = [newItem, ...list.filter(x => !(x.from === item.from && x.to === item.to && Math.abs(x.amount - item.amount) < 0.001))].slice(0, 30);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(KEYS.HISTORY);
    } catch (e) {}
  },

  getTheme() {
    try {
      return localStorage.getItem(KEYS.THEME) || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {}
  },

  getRatesCache() {
    try {
      const data = localStorage.getItem(KEYS.RATES_CACHE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setRatesCache(data) {
    try {
      localStorage.setItem(KEYS.RATES_CACHE, JSON.stringify(data));
    } catch (e) {}
  },

  clearRatesCache() {
    try {
      localStorage.removeItem(KEYS.RATES_CACHE);
    } catch (e) {}
  },

  getSimulatedRates() {
    try {
      const data = localStorage.getItem(KEYS.SIMULATED_RATES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  setSimulatedRates(overrides) {
    try {
      localStorage.setItem(KEYS.SIMULATED_RATES, JSON.stringify(overrides));
    } catch (e) {}
  },

  getApiMetrics() {
    try {
      const data = localStorage.getItem(KEYS.API_METRICS);
      return data ? JSON.parse(data) : { totalCalls: 0, cacheHits: 0, latencyMs: 42, lastSync: null };
    } catch (e) {
      return { totalCalls: 0, cacheHits: 0, latencyMs: 42, lastSync: null };
    }
  },

  saveApiMetrics(metrics) {
    try {
      localStorage.setItem(KEYS.API_METRICS, JSON.stringify(metrics));
    } catch (e) {}
  },

  getTravelBudget() {
    try {
      const data = localStorage.getItem(KEYS.TRAVEL_BUDGET);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTravelBudget(list) {
    try {
      localStorage.setItem(KEYS.TRAVEL_BUDGET, JSON.stringify(list));
    } catch (e) {}
  }
};

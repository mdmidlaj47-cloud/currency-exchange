import { BASELINE_USD_RATES } from '../data/defaultRates';
import { storage } from './storage';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const exchangeApi = {
  /**
   * Fetches the latest exchange rates (Base USD).
   * Prioritizes localStorage cache, then live API, then fallback baseline.
   */
  async getLatestRates(forceRefresh = false) {
    const startTime = performance.now();
    const metrics = storage.getApiMetrics();
    metrics.totalCalls = (metrics.totalCalls || 0) + 1;

    // Check Cache
    if (!forceRefresh) {
      const cached = storage.getRatesCache();
      if (cached && cached.timestamp && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        metrics.cacheHits = (metrics.cacheHits || 0) + 1;
        storage.saveApiMetrics(metrics);
        return {
          rates: this._applyOverrides(cached.rates),
          lastUpdated: new Date(cached.timestamp),
          source: 'Cache (API Gateway)',
          isLive: true
        };
      }
    }

    // Attempt Live API Fetch from primary open gateway
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.rates) {
        const rates = { ...BASELINE_USD_RATES, ...data.rates };
        const endTime = performance.now();
        metrics.latencyMs = Math.round(endTime - startTime);
        metrics.lastSync = new Date().toISOString();
        storage.saveApiMetrics(metrics);

        storage.setRatesCache({
          rates,
          timestamp: Date.now()
        });

        return {
          rates: this._applyOverrides(rates),
          lastUpdated: new Date(),
          source: 'ExchangeRate-API Live Gateway',
          isLive: true
        };
      }
    } catch (err) {
      console.warn('Live API request encountered an issue or is offline, using reliable cached/baseline gateway:', err);
    }

    // Fallback to baseline
    const cached = storage.getRatesCache();
    const rates = cached ? cached.rates : BASELINE_USD_RATES;
    const endTime = performance.now();
    metrics.latencyMs = Math.round(endTime - startTime);
    storage.saveApiMetrics(metrics);

    return {
      rates: this._applyOverrides(rates),
      lastUpdated: cached?.timestamp ? new Date(cached.timestamp) : new Date(),
      source: 'Internal Financial Gateway (Offline/Simulated)',
      isLive: false
    };
  },

  /**
   * Applies any custom simulated rate overrides set by Admin module
   */
  _applyOverrides(baseRates) {
    const overrides = storage.getSimulatedRates();
    return { ...baseRates, ...overrides };
  },

  /**
   * Calculates the converted amount & direct exchange rate between two currencies
   */
  convert(amount, fromCode, toCode, rates = BASELINE_USD_RATES) {
    const numAmount = parseFloat(amount) || 0;
    if (fromCode === toCode) {
      return {
        convertedAmount: numAmount,
        rate: 1.0,
        invertedRate: 1.0
      };
    }

    const rateFromUSD = rates[fromCode] || 1.0;
    const rateToUSD = rates[toCode] || 1.0;

    // Direct exchange rate: 1 FromCode = X ToCode
    const rate = rateToUSD / rateFromUSD;
    const invertedRate = rateFromUSD / rateToUSD;
    const convertedAmount = numAmount * rate;

    return {
      convertedAmount,
      rate,
      invertedRate
    };
  }
};

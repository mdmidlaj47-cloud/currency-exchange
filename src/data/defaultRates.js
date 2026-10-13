export const BASELINE_USD_RATES = {
  USD: 1.0,
  EUR: 0.9224,
  GBP: 0.7712,
  INR: 83.95,
  AED: 3.6725,
  SAR: 3.7512,
  JPY: 149.35,
  CAD: 1.3824,
  AUD: 1.5052,
  CHF: 0.8654,
  CNY: 7.1245,
  SGD: 1.3155,
  QAR: 3.6415,
  KWD: 0.3068,
  OMR: 0.3845,
  BHD: 0.3760,
  MYR: 4.3120,
  THB: 33.48,
  NZD: 1.6425,
  HKD: 7.7718,
  KRW: 1358.40,
  TRY: 34.28,
  ZAR: 17.65,
  BRL: 5.624,
  MXN: 19.38,
  IDR: 15620,
  PHP: 57.65,
  VND: 25120,
  SEK: 10.45,
  NOK: 10.75,
  DKK: 6.882,
  PLN: 3.985,
  CZK: 23.35,
  HUF: 368.5,
  ILS: 3.752,
  CLP: 942.0,
  COP: 4210.0,
  EGP: 48.75,
  PKR: 277.60,
  BDT: 119.50,
  LKR: 293.20,
  NPR: 134.32,
  RUB: 96.50,
  BTC: 0.0000148,
  ETH: 0.000382
};

export const POPULAR_TICKERS = [
  { pair: 'USD / INR', from: 'USD', to: 'INR', change24h: 0.18 },
  { pair: 'EUR / USD', from: 'EUR', to: 'USD', change24h: -0.24 },
  { pair: 'GBP / USD', from: 'GBP', to: 'USD', change24h: 0.42 },
  { pair: 'USD / AED', from: 'USD', to: 'AED', change24h: 0.01 },
  { pair: 'USD / SAR', from: 'USD', to: 'SAR', change24h: 0.02 },
  { pair: 'USD / JPY', from: 'USD', to: 'JPY', change24h: -0.55 },
  { pair: 'USD / CAD', from: 'USD', to: 'CAD', change24h: 0.12 },
  { pair: 'BTC / USD', from: 'BTC', to: 'USD', change24h: 2.45 },
  { pair: 'ETH / USD', from: 'ETH', to: 'USD', change24h: 1.82 },
  { pair: 'EUR / INR', from: 'EUR', to: 'INR', change24h: -0.06 },
  { pair: 'GBP / INR', from: 'GBP', to: 'INR', change24h: 0.59 },
  { pair: 'AED / INR', from: 'AED', to: 'INR', change24h: 0.17 }
];

/**
 * Generates smooth historical data for a specific currency pair & timeframe
 */
export function generateHistoricalData(baseRate, period = '30D') {
  let points = 30;
  let volatility = 0.008; // 0.8%
  let labelFormat = 'day';

  if (period === '24H') {
    points = 24;
    volatility = 0.003;
    labelFormat = 'hour';
  } else if (period === '7D') {
    points = 14;
    volatility = 0.006;
  } else if (period === '30D') {
    points = 30;
    volatility = 0.015;
  } else if (period === '90D') {
    points = 45;
    volatility = 0.025;
  } else if (period === '1Y') {
    points = 52;
    volatility = 0.045;
    labelFormat = 'week';
  }

  const now = new Date();
  const data = [];
  
  // Seed a pseudo-random walking curve ending near the current base rate
  let currentVal = baseRate * (1 - volatility * 0.7);
  const drift = (baseRate - currentVal) / points;

  for (let i = 0; i < points; i++) {
    const fraction = (points - 1 - i);
    let date = new Date(now);

    if (period === '24H') {
      date.setHours(now.getHours() - fraction);
    } else if (period === '7D') {
      date.setDate(now.getDate() - Math.round(fraction * 0.5));
    } else if (period === '30D') {
      date.setDate(now.getDate() - fraction);
    } else if (period === '90D') {
      date.setDate(now.getDate() - fraction * 2);
    } else if (period === '1Y') {
      date.setDate(now.getDate() - fraction * 7);
    }

    // Gentle random walk
    const step = (Math.sin(i * 0.8) * 0.5 + (Math.random() - 0.48)) * (baseRate * volatility * 0.35);
    currentVal = (i === points - 1) ? baseRate : (currentVal + drift + step);
    if (currentVal <= 0) currentVal = baseRate;

    data.push({
      date: date.toISOString(),
      label: formatLabel(date, labelFormat),
      rate: Number(currentVal.toFixed(baseRate < 0.01 ? 6 : baseRate < 10 ? 4 : 2))
    });
  }

  return data;
}

function formatLabel(date, format) {
  if (format === 'hour') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

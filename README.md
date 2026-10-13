# Currenx — Real-Time Currency Exchange Application

A premium, modern Currency Exchange & Global Financial Intelligence Web Application. Engineered with high-standard fintech aesthetics, real-time live market rates, automated hidden bank fee audits, multi-currency basket conversions, and interactive trend charts.

---

## 🌟 Key Features

1. **Instant Real-Time Currency Converter**:
   - 160+ fiat currencies and major crypto assets (USD, EUR, GBP, INR, AED, SAR, JPY, CAD, AUD, BTC, ETH, etc.).
   - 180° animated currency swap, quick amount chips, instant copy with celebratory feedback.
2. **Smart Multi-Currency Basket**:
   - Convert 1 base currency against multiple world currencies simultaneously.
   - Customizable basket list, 1-click swap any basket item into base.
3. **Interactive Historical Trend Analysis**:
   - High-fidelity canvas chart tracking 24H, 7D, 30D, 90D, and 1Y fluctuations.
   - High, Low, and Average rate statistics with bull/bear percentage indicators.
4. **Hidden Bank Fee & Markup Calculator**:
   - Reveals hidden bank exchange spreads (1.5% to 8.5%).
   - Calculates exact savings using fair interbank mid-market rates.
5. **Traveler & Shopper Currency Toolkit**:
   - Dining tip & sales tax foreign calculator.
   - Daily trip budget allowance planner.
   - Pocket cash quick reference sheet.
6. **Watchlist & Live Ticker**:
   - Pinned favorite currency pairs with live percentage changes.
   - Marquee live forex ribbon at the top.
7. **API Gateway & Telemetry Control**:
   - Real-time latency (ms), cache hit ratios, and request counters.
   - Market stress tester / rate simulator to override exchange rates for demos.
8. **Dark & Light Mode**:
   - Seamless aesthetic theme switching with persistent local storage.

---

## 🚀 How to Host on GitHub Pages (1-Click Automated Setup)

This repository comes pre-configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. **Create a new repository on your GitHub account** (e.g., `currency-exchange`).
2. **Push this codebase to your repository**:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/currency-exchange.git
   git branch -M main
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - In your GitHub repository, navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub will automatically run the build workflow and publish your site live at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/currency-exchange/`

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

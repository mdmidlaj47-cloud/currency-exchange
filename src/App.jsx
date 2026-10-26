import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveTicker from './components/LiveTicker';
import MainConverter from './components/MainConverter';
import MultiConverter from './components/MultiConverter';
import TrendChart from './components/TrendChart';
import TravelBudgetTool from './components/TravelBudgetTool';
import WatchlistWidget from './components/WatchlistWidget';
import CurrencySelectModal from './components/CurrencySelectModal';
import ConversionHistoryModal from './components/ConversionHistoryModal';
import { exchangeApi } from './services/exchangeApi';
import { BASELINE_USD_RATES } from './data/defaultRates';
import { storage } from './services/storage';
import { ArrowLeftRight, Layers, LineChart, Plane } from 'lucide-react';

export default function App() {
  const [rates, setRates] = useState(BASELINE_USD_RATES);
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('INR');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState('converter'); // 'converter' | 'multi' | 'trends' | 'traveler'

  // Modals
  const [selectorTarget, setSelectorTarget] = useState(null); // 'from' | 'to' | 'multi_base' | 'basket_add'
  const [basketAddCallback, setBasketAddCallback] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => storage.getTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300';
    }
    storage.setTheme(theme);
  }, [theme]);

  // Load initial rates
  const fetchRates = async (force = false) => {
    const res = await exchangeApi.getLatestRates(force);
    setRates(res.rates);
    setLastUpdated(res.lastUpdated);
    setIsLive(res.isLive);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOpenSelector = (target, callback = null) => {
    setSelectorTarget(target);
    setBasketAddCallback(() => callback);
  };

  const handleSelectCurrency = (code) => {
    if (selectorTarget === 'from') {
      setFromCode(code);
    } else if (selectorTarget === 'to') {
      setToCode(code);
    } else if (selectorTarget === 'multi_base') {
      setFromCode(code);
    } else if (selectorTarget === 'basket_add' && basketAddCallback) {
      basketAddCallback(code);
    }
    setSelectorTarget(null);
  };

  const handleSelectPair = (newFrom, newTo) => {
    setFromCode(newFrom);
    setToCode(newTo);
    setActiveTab('converter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Forex Live Ticker */}
      <LiveTicker rates={rates} onSelectPair={handleSelectPair} />

      {/* Main Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        isLive={isLive}
      />

      {/* Hero Section & Navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
            Global Currency <span className="bg-gradient-to-r from-brand-600 to-emerald-500 dark:from-brand-400 dark:to-emerald-300 bg-clip-text text-transparent">Exchange</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium transition-colors">
            Real-time foreign exchange data, interactive market analytics, and multi-currency tools across 160+ global currencies.
          </p>

          {/* Clean Segmented Navigation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeTab === 'converter'
                  ? 'bg-brand-500 text-slate-950 shadow-brand-500/25 font-black scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Converter
            </button>

            <button
              onClick={() => setActiveTab('multi')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeTab === 'multi'
                  ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-slate-950 shadow-purple-500/25 font-black scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Multi-Currency Basket
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeTab === 'trends'
                  ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-blue-500/25 font-black scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LineChart className="w-4 h-4" />
              Historical Charts
            </button>

            <button
              onClick={() => setActiveTab('traveler')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeTab === 'traveler'
                  ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-teal-500/25 font-black scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Plane className="w-4 h-4" />
              Travel Calculator
            </button>
          </div>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'converter' && (
          <div className="space-y-8 animate-fadeIn">
            <MainConverter
              rates={rates}
              fromCode={fromCode}
              toCode={toCode}
              onChangeFrom={setFromCode}
              onChangeTo={setToCode}
              onOpenSelector={(target) => handleOpenSelector(target)}
              lastUpdated={lastUpdated}
              isLive={isLive}
              onRefreshRates={() => fetchRates(true)}
            />

            <TrendChart
              rates={rates}
              fromCode={fromCode}
              toCode={toCode}
            />

            <WatchlistWidget
              rates={rates}
              onSelectPair={handleSelectPair}
              onOpenSelector={(target) => handleOpenSelector(target)}
            />
          </div>
        )}

        {activeTab === 'multi' && (
          <div className="space-y-8 animate-fadeIn">
            <MultiConverter
              rates={rates}
              baseCode={fromCode}
              onChangeBase={setFromCode}
              onOpenSelector={(target, cb) => handleOpenSelector(target, cb)}
            />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8 animate-fadeIn">
            <TrendChart
              rates={rates}
              fromCode={fromCode}
              toCode={toCode}
            />
          </div>
        )}

        {activeTab === 'traveler' && (
          <div className="space-y-8 animate-fadeIn">
            <TravelBudgetTool
              rates={rates}
              homeCode={fromCode}
              destCode={toCode}
            />
          </div>
        )}
      </main>

      {/* Corporate Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 px-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Currenx</span>
            <span>•</span>
            <span>Global Financial Currency Platform</span>
          </div>

          <div>
            © 2026 Currenx Technologies. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Currency Selector Modal */}
      <CurrencySelectModal
        isOpen={!!selectorTarget}
        onClose={() => setSelectorTarget(null)}
        onSelect={handleSelectCurrency}
        currentCode={selectorTarget === 'from' ? fromCode : toCode}
      />

      {/* History Modal */}
      <ConversionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectPair={handleSelectPair}
      />
    </div>
  );
}

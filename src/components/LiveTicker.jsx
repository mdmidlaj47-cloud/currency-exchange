import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { POPULAR_TICKERS } from '../data/defaultRates';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

export default function LiveTicker({ rates, onSelectPair }) {
  const tickerItems = POPULAR_TICKERS.map(item => {
    const fromCurr = getCurrencyByCode(item.from);
    const toCurr = getCurrencyByCode(item.to);
    const { rate } = exchangeApi.convert(1, item.from, item.to, rates);
    const isPositive = item.change24h >= 0;

    return {
      ...item,
      fromCurr,
      toCurr,
      rateFormatted: rate < 0.01 ? rate.toFixed(6) : rate < 1 ? rate.toFixed(4) : rate.toFixed(2),
      isPositive
    };
  });

  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden select-none py-2 relative backdrop-blur-md transition-colors">
      <div className="flex items-center">
        {/* Left badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/60 z-10 shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>LIVE FOREX</span>
        </div>

        {/* Marquee */}
        <div className="flex overflow-hidden w-full group">
          <div className="flex shrink-0 animate-ticker group-hover:[animation-play-state:paused] gap-6 pl-4">
            {displayItems.map((item, idx) => (
              <button
                key={`${item.pair}-${idx}`}
                onClick={() => onSelectPair(item.from, item.to)}
                className="flex items-center gap-2.5 text-xs px-3 py-1 rounded-lg bg-white/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <span>{item.fromCurr.flag}</span>
                  <span>{item.pair}</span>
                </div>
                
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {item.toCurr.symbol}{item.rateFormatted}
                </span>

                <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  item.isPositive 
                    ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10' 
                    : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10'
                }`}>
                  {item.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(item.change24h)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

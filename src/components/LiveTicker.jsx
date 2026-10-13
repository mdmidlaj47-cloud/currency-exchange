import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { POPULAR_TICKERS } from '../data/defaultRates';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

export default function LiveTicker({ rates, onSelectPair }) {
  // Compute live rates for popular tickers
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

  // Duplicate list to create seamless infinite scrolling effect
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 overflow-hidden select-none py-2 relative backdrop-blur-md">
      <div className="flex items-center">
        {/* Left fixed badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1 bg-slate-800/90 border-r border-slate-700/60 z-10 shrink-0 text-xs font-semibold text-brand-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>LIVE FOREX</span>
        </div>

        {/* Marquee Container */}
        <div className="flex overflow-hidden w-full group">
          <div className="flex shrink-0 animate-ticker group-hover:[animation-play-state:paused] gap-6 pl-4">
            {displayItems.map((item, idx) => (
              <button
                key={`${item.pair}-${idx}`}
                onClick={() => onSelectPair(item.from, item.to)}
                className="flex items-center gap-2.5 text-xs px-3 py-1 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <span>{item.fromCurr.flag}</span>
                  <span>{item.pair}</span>
                </div>
                
                <span className="font-mono font-bold text-white">
                  {item.toCurr.symbol}{item.rateFormatted}
                </span>

                <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  item.isPositive 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : 'text-rose-400 bg-rose-500/10'
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

import React, { useState, useEffect } from 'react';
import { Star, Trash2, ArrowRight } from 'lucide-react';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';
import { storage } from '../services/storage';

export default function WatchlistWidget({
  rates,
  onSelectPair,
  onOpenSelector
}) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(storage.getFavorites());
  }, []);

  const handleRemove = (id) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    storage.saveFavorites(updated);
  };

  const formatRate = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    return val.toFixed(4);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl backdrop-blur-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Market Watchlist
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              {favorites.length} Pinned
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick access rate cards for your frequently referenced currency pairs
          </p>
        </div>
      </div>

      {/* Grid of Favorite Pairs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {favorites.map((fav) => {
          const fromCurr = getCurrencyByCode(fav.from);
          const toCurr = getCurrencyByCode(fav.to);
          const { rate } = exchangeApi.convert(1, fav.from, fav.to, rates);

          return (
            <div
              key={fav.id}
              className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all group relative hover:bg-slate-100/70 dark:hover:bg-slate-950"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{fromCurr.flag}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{fav.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xl leading-none">{toCurr.flag}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{fav.to}</span>
                </div>

                <button
                  onClick={() => handleRemove(fav.id)}
                  title="Remove from favorites"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 opacity-70 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rate & Load Button */}
              <div className="flex items-end justify-between mt-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Live Rate</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    1 {fav.from} = <span className="text-brand-600 dark:text-brand-400">{formatRate(rate)}</span> {fav.to}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPair(fav.from, fav.to)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-sm"
                >
                  Convert
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {favorites.length === 0 && (
        <div className="text-center py-10 text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <p className="text-sm">No pairs in your watchlist yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Click the star icon in the main converter to pin pairs here.
          </p>
        </div>
      )}
    </div>
  );
}

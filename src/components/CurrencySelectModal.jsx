import React, { useState, useMemo } from 'react';
import { Search, X, Check, Star } from 'lucide-react';
import { CURRENCIES } from '../data/currencies';

export default function CurrencySelectModal({ isOpen, onClose, onSelect, currentCode, title = "Select Currency" }) {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const filteredCurrencies = useMemo(() => {
    const q = query.toLowerCase().trim();
    return CURRENCIES.filter(curr => {
      const matchesFilter = filterMode === 'all' || (filterMode === 'popular' && curr.popular);
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        curr.code.toLowerCase().includes(q) ||
        curr.name.toLowerCase().includes(q) ||
        curr.country.toLowerCase().includes(q)
      );
    });
  }, [query, filterMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select from 160+ world currencies & digital assets</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 space-y-3 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by currency code, country, or name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'all' 
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Currencies ({CURRENCIES.length})
            </button>
            <button
              onClick={() => setFilterMode('popular')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                filterMode === 'popular' 
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Popular ({CURRENCIES.filter(c => c.popular).length})
            </button>
          </div>
        </div>

        {/* List of Currencies */}
        <div className="overflow-y-auto p-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredCurrencies.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No currencies matching "{query}"</p>
            </div>
          ) : (
            filteredCurrencies.map((curr) => {
              const isSelected = curr.code === currentCode;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    onSelect(curr.code);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-brand-50 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-500/30' 
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl leading-none select-none">{curr.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base tracking-wide">{curr.code}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
                          {curr.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {curr.name} <span className="text-slate-300 dark:text-slate-600">•</span> {curr.country}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-slate-950 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Layers, Plus, Trash2, ArrowUpDown, Sparkles } from 'lucide-react';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

const INITIAL_BASKET = ['INR', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF', 'BTC'];

export default function MultiConverter({
  rates,
  baseCode = 'USD',
  onChangeBase,
  onOpenSelector
}) {
  const [amount, setAmount] = useState('100');
  const [basket, setBasket] = useState(INITIAL_BASKET);
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const baseCurr = getCurrencyByCode(baseCode);

  const handleRemove = (code) => {
    setBasket(basket.filter(c => c !== code));
  };

  const handleMakeBase = (newBase) => {
    // Replace newBase with previous base in basket
    const updated = basket.filter(c => c !== newBase);
    if (!updated.includes(baseCode)) {
      updated.unshift(baseCode);
    }
    setBasket(updated);
    onChangeBase(newBase);
  };

  const handleAddCurrency = (code) => {
    if (code !== baseCode && !basket.includes(code)) {
      setBasket([...basket, code]);
    }
  };

  const formatNumber = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.0001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Smart Multi-Converter
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Simultaneous Basket
              </span>
            </h2>
            <p className="text-xs text-slate-400">Compare your base currency against multiple global currencies in real time</p>
          </div>
        </div>

        {/* Add Currency to Basket Button */}
        <button
          onClick={() => onOpenSelector('basket_add', handleAddCurrency)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4 text-brand-400" />
          Add Currency to Basket
        </button>
      </div>

      {/* Base Control Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-xs text-slate-400 font-medium block mb-1">Base Currency Amount</label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono text-slate-400 font-bold">{baseCurr.symbol}</span>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
          <button
            onClick={() => onOpenSelector('multi_base')}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition-all shadow-sm active:scale-95"
          >
            <span className="text-2xl leading-none">{baseCurr.flag}</span>
            <div className="text-left">
              <div className="text-xs text-slate-400 font-normal">Base Currency</div>
              <div className="text-sm font-bold tracking-wide">{baseCode}</div>
            </div>
            <span className="text-xs text-slate-400 font-mono ml-1">▼</span>
          </button>
        </div>
      </div>

      {/* Basket Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {basket.map((targetCode) => {
          const targetCurr = getCurrencyByCode(targetCode);
          const { convertedAmount, rate } = exchangeApi.convert(amount, baseCode, targetCode, rates);

          return (
            <div
              key={targetCode}
              className="bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all hover:bg-slate-950/90 group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl leading-none select-none">{targetCurr.flag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{targetCode}</span>
                      <span className="text-[10px] text-slate-400 font-mono px-1 rounded bg-slate-800">
                        {targetCurr.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                      {targetCurr.name}
                    </div>
                  </div>
                </div>

                {/* Quick actions: swap to base or remove */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMakeBase(targetCode)}
                    title="Make this the base currency"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(targetCode)}
                    title="Remove from comparison basket"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Converted Value */}
              <div className="mt-3">
                <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
                  <span className="text-slate-400 text-sm mr-1">{targetCurr.symbol}</span>
                  {formatNumber(convertedAmount)}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  1 {baseCode} = {rate < 0.001 ? rate.toFixed(6) : rate < 1 ? rate.toFixed(4) : rate.toFixed(4)} {targetCode}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {basket.length === 0 && (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-sm">Your comparison basket is empty.</p>
          <button
            onClick={() => setBasket(INITIAL_BASKET)}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition-all"
          >
            Reset to Default Basket
          </button>
        </div>
      )}
    </div>
  );
}

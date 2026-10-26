import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Copy, Check, Star, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';
import { storage } from '../services/storage';

export default function MainConverter({
  rates,
  fromCode,
  toCode,
  onChangeFrom,
  onChangeTo,
  onOpenSelector,
  lastUpdated,
  isLive,
  onRefreshRates
}) {
  const [amount, setAmount] = useState('1000');
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [recentList, setRecentList] = useState([]);
  const [isPinned, setIsPinned] = useState(false);

  const fromCurr = getCurrencyByCode(fromCode);
  const toCurr = getCurrencyByCode(toCode);

  const { convertedAmount, rate, invertedRate } = exchangeApi.convert(amount, fromCode, toCode, rates);

  // Check if current pair is pinned in favorites
  useEffect(() => {
    const favs = storage.getFavorites();
    const found = favs.some(f => f.from === fromCode && f.to === toCode);
    setIsPinned(found);
    setRecentList(storage.getHistory().slice(0, 5));
  }, [fromCode, toCode]);

  // Log conversion to history when amount changes (debounced)
  useEffect(() => {
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      const timeout = setTimeout(() => {
        const updated = storage.addHistory({
          from: fromCode,
          to: toCode,
          amount: parsed,
          result: convertedAmount,
          rate: rate
        });
        setRecentList(updated.slice(0, 5));
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [amount, fromCode, toCode, convertedAmount, rate]);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 350);
    const prevFrom = fromCode;
    onChangeFrom(toCode);
    onChangeTo(prevFrom);
  };

  const handleCopy = () => {
    const textToCopy = `${amount} ${fromCode} = ${formatNumber(convertedAmount)} ${toCode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    let favs = storage.getFavorites();
    if (isPinned) {
      favs = favs.filter(f => !(f.from === fromCode && f.to === toCode));
      setIsPinned(false);
    } else {
      favs.push({ id: Date.now().toString(), from: fromCode, to: toCode, pinned: true });
      setIsPinned(true);
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
    storage.saveFavorites(favs);
  };

  const formatNumber = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Real-Time Currency Converter
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interbank mid-market exchange rates updated in real time
          </p>
        </div>

        {/* Favorite & Refresh buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            title={isPinned ? "Remove from watchlist" : "Pin pair to watchlist"}
            className={`p-2.5 rounded-xl border transition-all ${
              isPinned
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onRefreshRates}
            title="Refresh latest exchange rates"
            className="p-2.5 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/80 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Converter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3.5 items-center relative z-10">
        {/* FROM CARD */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 transition-all focus-within:border-brand-500/70 focus-within:ring-1 focus-within:ring-brand-500/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Amount</span>
            <span className="font-mono text-slate-400">{fromCurr.country}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Currency Button */}
            <button
              onClick={() => onOpenSelector('from')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold transition-all shadow-sm shrink-0 hover:border-brand-500/50 active:scale-95"
            >
              <span className="text-xl select-none leading-none">{fromCurr.flag}</span>
              <span className="text-sm tracking-wide">{fromCurr.code}</span>
              <span className="text-xs text-slate-400 font-mono">▼</span>
            </button>
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
          <button
            onClick={handleSwap}
            title="Swap base and target currencies"
            className={`w-11 h-11 rounded-2xl bg-brand-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-brand-500/25 hover:bg-brand-400 transition-all duration-300 active:scale-90 ${
              isSwapping ? 'rotate-180 scale-105' : ''
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* TO CARD */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 transition-all focus-within:border-brand-500/70">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Converted to</span>
            <span className="font-mono text-slate-400">{toCurr.country}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 overflow-x-auto">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-brand-400 tracking-tight select-all">
                {formatNumber(convertedAmount)}
              </div>
            </div>

            {/* Currency Button */}
            <button
              onClick={() => onOpenSelector('to')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold transition-all shadow-sm shrink-0 hover:border-brand-500/50 active:scale-95"
            >
              <span className="text-xl select-none leading-none">{toCurr.flag}</span>
              <span className="text-sm tracking-wide">{toCurr.code}</span>
              <span className="text-xs text-slate-400 font-mono">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 relative z-10">
        <span className="text-xs text-slate-400 font-medium mr-1">Quick Select:</span>
        {quickAmounts.map(val => (
          <button
            key={val}
            onClick={() => setAmount(val.toString())}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-medium transition-all ${
              amount === val.toString()
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-bold'
                : 'bg-slate-800/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            {fromCurr.symbol}{val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Prominent Calculation Banner */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {amount || '0'} {fromCode} = <span className="text-brand-400">{formatNumber(convertedAmount)} {toCode}</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>1 {fromCode} = {rate < 0.01 ? rate.toFixed(6) : rate < 1 ? rate.toFixed(4) : rate.toFixed(4)} {toCode}</span>
            <span className="text-slate-600">|</span>
            <span>1 {toCode} = {invertedRate < 0.01 ? invertedRate.toFixed(6) : invertedRate < 1 ? invertedRate.toFixed(4) : invertedRate.toFixed(4)} {fromCode}</span>
          </div>
        </div>

        {/* Copy button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Result
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recents Bar */}
      {recentList.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs relative z-10">
          <span className="text-slate-400 font-medium">Recent Conversions:</span>
          {recentList.map((rec) => (
            <button
              key={rec.id}
              onClick={() => {
                onChangeFrom(rec.from);
                onChangeTo(rec.to);
                setAmount(rec.amount.toString());
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px] transition-all"
            >
              {rec.amount} {rec.from} → {rec.to}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

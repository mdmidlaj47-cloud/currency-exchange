import React, { useState } from 'react';
import { EyeOff, AlertTriangle, ShieldCheck, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

const PRESET_PROVIDERS = [
  { name: 'Traditional High-Street Bank', markup: 3.8, desc: 'Average retail bank foreign exchange spread' },
  { name: 'Credit Card Cross-Border Fee', markup: 2.75, desc: 'Typical international card processing markup' },
  { name: 'PayPal / Digital Wallet', markup: 4.25, desc: 'Standard checkout conversion markup' },
  { name: 'Airport Exchange Kiosk', markup: 8.5, desc: 'Heavy markup at tourist exchange booths' }
];

export default function BankFeeCalculator({
  rates,
  fromCode = 'USD',
  toCode = 'INR'
}) {
  const [sendAmount, setSendAmount] = useState('2000');
  const [selectedMarkup, setSelectedMarkup] = useState(3.8);
  const [customMarkup, setCustomMarkup] = useState('');

  const fromCurr = getCurrencyByCode(fromCode);
  const toCurr = getCurrencyByCode(toCode);

  const amountNum = parseFloat(sendAmount) || 0;
  const { convertedAmount: trueMidMarket, rate: midRate } = exchangeApi.convert(amountNum, fromCode, toCode, rates);

  const activeMarkup = customMarkup !== '' ? parseFloat(customMarkup) || 0 : selectedMarkup;

  // With bank markup, the exchange rate given to user is reduced by markup%
  const bankEffectiveRate = midRate * (1 - (activeMarkup / 100));
  const bankReceivedAmount = amountNum * bankEffectiveRate;
  const hiddenCostInTarget = trueMidMarket - bankReceivedAmount;
  const hiddenCostInBase = hiddenCostInTarget / midRate;

  const formatNumber = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Hidden Bank Fee Calculator
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Transparency Audit
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Uncover hidden foreign exchange rate markups and calculate true cross-border transaction savings
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Transfer Amount */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Amount You Plan to Convert ({fromCode})
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-slate-400">{fromCurr.symbol}</span>
            <input
              type="number"
              min="0"
              step="any"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Provider Preset Dropdown / Radio */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-medium block mb-1.5">
            Select Typical Bank / Provider Markup
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PROVIDERS.map((provider) => (
              <button
                key={provider.name}
                onClick={() => {
                  setSelectedMarkup(provider.markup);
                  setCustomMarkup('');
                }}
                className={`text-left p-2 rounded-xl border text-xs transition-all ${
                  selectedMarkup === provider.markup && customMarkup === ''
                    ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold truncate">{provider.name}</div>
                <div className="text-[11px] text-amber-400 font-mono mt-0.5">{provider.markup}% spread</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Showdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Mid-Market Rate (Currenx Standard) */}
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Real Interbank Mid-Market
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {toCurr.symbol}{formatNumber(trueMidMarket)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            100% of fair value. 0% markup. Exchange Rate: <span className="font-mono text-slate-300">1 {fromCode} = {midRate.toFixed(4)} {toCode}</span>
          </div>
        </div>

        {/* Traditional Bank with Hidden Markup */}
        <div className="bg-slate-950/90 border border-rose-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" /> Traditional Provider ({activeMarkup}% Markup)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-300">
            {toCurr.symbol}{formatNumber(bankReceivedAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Marked-down rate: <span className="font-mono text-rose-400">1 {fromCode} = {bankEffectiveRate.toFixed(4)} {toCode}</span>
          </div>
        </div>
      </div>

      {/* Hidden Loss Reveal Callout */}
      <div className="mt-5 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Hidden Profit Extracted by Bank
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {toCurr.symbol}{formatNumber(hiddenCostInTarget)} <span className="text-sm font-normal text-slate-400 font-sans">({fromCurr.symbol}{formatNumber(hiddenCostInBase)} {fromCode})</span>
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            That's <span className="font-bold text-amber-300">{activeMarkup}%</span> of your hard-earned money lost in invisible bank spread!
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          Transparency Advantage: Keep 100%
        </div>
      </div>
    </div>
  );
}

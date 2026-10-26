import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

const PRESET_PROVIDERS = [
  { name: 'Retail Bank', markup: 3.8, desc: 'Average retail bank markup' },
  { name: 'Credit Card', markup: 2.75, desc: 'International card markup' },
  { name: 'Online Wallet', markup: 4.25, desc: 'Standard checkout markup' },
  { name: 'Airport Exchange', markup: 8.5, desc: 'Kiosk exchange spread' }
];

export default function BankFeeCalculator({
  rates,
  fromCode = 'USD',
  toCode = 'INR'
}) {
  const [sendAmount, setSendAmount] = useState('2000');
  const [selectedMarkup, setSelectedMarkup] = useState(3.8);

  const fromCurr = getCurrencyByCode(fromCode);
  const toCurr = getCurrencyByCode(toCode);

  const amountNum = parseFloat(sendAmount) || 0;
  const { convertedAmount: trueMidMarket, rate: midRate } = exchangeApi.convert(amountNum, fromCode, toCode, rates);

  const bankEffectiveRate = midRate * (1 - (selectedMarkup / 100));
  const bankReceivedAmount = amountNum * bankEffectiveRate;
  const differenceInTarget = trueMidMarket - bankReceivedAmount;
  const differenceInBase = differenceInTarget / (midRate || 1);

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
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Bank Fee & Markup Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare the real interbank mid-market rate against typical retail bank margins and transaction fees
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Amount */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Amount to Convert ({fromCode})
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

        {/* Provider Presets */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-medium block mb-1.5">
            Select Provider / Channel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PROVIDERS.map((provider) => (
              <button
                key={provider.name}
                onClick={() => setSelectedMarkup(provider.markup)}
                className={`text-left p-2 rounded-xl border text-xs transition-all ${
                  selectedMarkup === provider.markup
                    ? 'bg-brand-500/15 border-brand-500/50 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold truncate">{provider.name}</div>
                <div className="text-[11px] text-brand-400 font-mono mt-0.5">{provider.markup}% spread</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Showdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mid-Market */}
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Real Mid-Market Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {toCurr.symbol}{formatNumber(trueMidMarket)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Fair value rate: <span className="font-mono text-slate-300">1 {fromCode} = {midRate.toFixed(4)} {toCode}</span>
          </div>
        </div>

        {/* Bank with Markup */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Typical Bank Rate ({selectedMarkup}% Spread)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-300">
            {toCurr.symbol}{formatNumber(bankReceivedAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Effective bank rate: <span className="font-mono text-slate-400">1 {fromCode} = {bankEffectiveRate.toFixed(4)} {toCode}</span>
          </div>
        </div>
      </div>

      {/* Difference Callout */}
      <div className="mt-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Estimated Cost of Hidden Spread
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {toCurr.symbol}{formatNumber(differenceInTarget)} <span className="text-sm font-normal text-slate-400 font-sans">({fromCurr.symbol}{formatNumber(differenceInBase)} {fromCode})</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Difference between real interbank mid-market rate and standard banking margins.
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          Zero Markup Transparency
        </div>
      </div>
    </div>
  );
}

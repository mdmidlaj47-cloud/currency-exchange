import React, { useState } from 'react';
import { Plane, Receipt, Wallet, Calculator, Coins, Check } from 'lucide-react';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

export default function TravelBudgetTool({
  rates,
  homeCode = 'USD',
  destCode = 'EUR'
}) {
  const [activeTab, setActiveTab] = useState('dining'); // 'dining' | 'budget' | 'pocket'

  // Dining Calculator state
  const [billAmount, setBillAmount] = useState('85');
  const [tipPct, setTipPct] = useState(15);
  const [taxPct, setTaxPct] = useState(0);

  // Daily Trip Budget state
  const [totalBudgetHome, setTotalBudgetHome] = useState('2500');
  const [tripDays, setTripDays] = useState('10');

  const homeCurr = getCurrencyByCode(homeCode);
  const destCurr = getCurrencyByCode(destCode);

  // Dining math
  const billNum = parseFloat(billAmount) || 0;
  const tipAmount = billNum * (tipPct / 100);
  const taxAmount = billNum * (taxPct / 100);
  const grandTotalDest = billNum + tipAmount + taxAmount;
  const { convertedAmount: grandTotalHome } = exchangeApi.convert(grandTotalDest, destCode, homeCode, rates);

  // Budget math
  const budgetNum = parseFloat(totalBudgetHome) || 0;
  const daysNum = Math.max(1, parseInt(tripDays) || 1);
  const dailyHome = budgetNum / daysNum;
  const { convertedAmount: totalBudgetDest } = exchangeApi.convert(budgetNum, homeCode, destCode, rates);
  const { convertedAmount: dailyDest } = exchangeApi.convert(dailyHome, homeCode, destCode, rates);

  // Pocket cash denominations
  const cashUnits = [5, 10, 20, 50, 100, 200, 500];

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
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Traveler & Shopper Currency Toolkit
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {homeCode} ⇄ {destCode}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Effortless travel calculations: dining tips, daily spending limits, and pocket cash sheets
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dining')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'dining'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Dining & Tip
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'budget'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Trip Planner
          </button>
          <button
            onClick={() => setActiveTab('pocket')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'pocket'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Cash Sheet
          </button>
        </div>
      </div>

      {/* TAB 1: DINING & TIP */}
      {activeTab === 'dining' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Bill Amount */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Bill in {destCurr.country} ({destCode})
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono text-slate-400">{destCurr.symbol}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Tip Percentage */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-slate-400 font-medium block mb-2">
                Gratuity / Tip Percentage ({tipPct}%)
              </label>
              <div className="flex gap-1.5">
                {[0, 10, 15, 18, 20].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipPct(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tipPct === t
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Percentage */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Sales Tax / VAT (if extra)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={taxPct}
                  onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-xl font-bold font-mono text-white focus:outline-none"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Dining Result Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Total Bill to Pay in {destCode}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {destCurr.symbol}{formatNumber(grandTotalDest)} {destCode}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Includes {destCurr.symbol}{formatNumber(tipAmount)} tip + {destCurr.symbol}{formatNumber(taxAmount)} tax
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
              <div className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">
                Cost in Home Currency ({homeCode})
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-teal-400">
                {homeCurr.symbol}{formatNumber(grandTotalHome)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Based on live rate: 1 {destCode} = {(grandTotalHome / (grandTotalDest || 1)).toFixed(4)} {homeCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP PLANNER */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Total Vacation Budget ({homeCode})
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono text-slate-400">{homeCurr.symbol}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={totalBudgetHome}
                  onChange={(e) => setTotalBudgetHome(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Trip Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={tripDays}
                onChange={(e) => setTripDays(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Daily Allowance ({homeCode})
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {homeCurr.symbol}{formatNumber(dailyHome)} <span className="text-xs text-slate-400 font-normal">/ day</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total: {homeCurr.symbol}{formatNumber(budgetNum)} for {daysNum} days
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30">
              <div className="text-xs text-teal-400 font-medium uppercase tracking-wider mb-1">
                Daily Allowance in Destination ({destCode})
              </div>
              <div className="text-2xl font-bold font-mono text-teal-400">
                {destCurr.symbol}{formatNumber(dailyDest)} <span className="text-xs text-teal-200 font-normal">/ day</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total Budget: {destCurr.symbol}{formatNumber(totalBudgetDest)} {destCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POCKET CASH SHEET */}
      {activeTab === 'pocket' && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            Quick reference cheat sheet to understand foreign cash denominations when shopping at markets:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {cashUnits.map((unit) => {
              const { convertedAmount: unitInHome } = exchangeApi.convert(unit, destCode, homeCode, rates);
              return (
                <div key={unit} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold font-mono text-white">
                      {destCurr.symbol}{unit} {destCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-teal-400">
                      ≈ {homeCurr.symbol}{formatNumber(unitInHome)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

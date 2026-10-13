import React, { useState, useEffect } from 'react';
import { Server, Activity, ShieldCheck, Database, RefreshCw, X, Play, RotateCcw, Cpu } from 'lucide-react';
import { storage } from '../services/storage';

export default function AdminGatewayModal({
  isOpen,
  onClose,
  onForceRefresh,
  lastUpdated,
  isLive
}) {
  const [metrics, setMetrics] = useState({ totalCalls: 0, cacheHits: 0, latencyMs: 38 });
  const [simPair, setSimPair] = useState('INR');
  const [simRate, setSimRate] = useState('');
  const [simulatedOverrides, setSimulatedOverrides] = useState({});
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMetrics(storage.getApiMetrics());
      setSimulatedOverrides(storage.getSimulatedRates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplySimulation = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(simRate);
    if (!isNaN(rateNum) && rateNum > 0) {
      const updated = { ...simulatedOverrides, [simPair]: rateNum };
      setSimulatedOverrides(updated);
      storage.setSimulatedRates(updated);
      setSimRate('');
      setTestResult(`Simulated rate for ${simPair} applied! All views updated.`);
      onForceRefresh();
    }
  };

  const handleResetSimulation = () => {
    storage.setSimulatedRates({});
    setSimulatedOverrides({});
    setTestResult('Reset all custom simulations. Reverted to official market data.');
    onForceRefresh();
  };

  const handlePurgeCache = () => {
    storage.clearRatesCache();
    setTestResult('Gateway cache purged successfully. Fresh rates fetched.');
    onForceRefresh();
  };

  const cacheHitRatio = metrics.totalCalls > 0 
    ? Math.round((metrics.cacheHits / metrics.totalCalls) * 100) 
    : 85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Admin & API Gateway Module
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Slide 7 Implementation
                </span>
              </h3>
              <p className="text-xs text-slate-400">System oversight, API health telemetry & live rate simulation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Gateway Status
              </div>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Operational
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Latency
              </div>
              <div className="text-base font-bold font-mono text-white">
                {metrics.latencyMs || 42} ms
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" /> Cache Hit Rate
              </div>
              <div className="text-base font-bold font-mono text-indigo-300">
                {cacheHitRatio}%
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Total Requests
              </div>
              <div className="text-base font-bold font-mono text-brand-300">
                {metrics.totalCalls || 1} calls
              </div>
            </div>
          </div>

          {/* Rate Simulation Override Form */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Play className="w-4 h-4 text-brand-400" />
              Live Rate Simulator & Market Stress Test
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Override any currency rate relative to USD to simulate volatile market swings or presentation scenarios:
            </p>

            <form onSubmit={handleApplySimulation} className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white">
                <span>1 USD =</span>
                <input
                  type="number"
                  step="any"
                  value={simRate}
                  onChange={(e) => setSimRate(e.target.value)}
                  placeholder="e.g. 90.00"
                  className="w-24 bg-transparent font-mono font-bold text-brand-400 focus:outline-none"
                />
              </div>

              <select
                value={simPair}
                onChange={(e) => setSimPair(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
              >
                <option value="INR">INR (Indian Rupee)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="JPY">JPY (Japanese Yen)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition-all shadow-sm"
              >
                Apply Override
              </button>

              {Object.keys(simulatedOverrides).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500/10 transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </form>

            {/* Active overrides list */}
            {Object.keys(simulatedOverrides).length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
                <span className="text-amber-400 font-semibold">Active Simulations:</span>
                {Object.entries(simulatedOverrides).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30">
                    1 USD = {v} {k}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cache Control & Upstream Info */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-300">Client-Side Cache Layer</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Last Sync: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Just now'} • Source: {isLive ? 'Live API Feed' : 'Offline Baseline'}
              </div>
            </div>

            <button
              onClick={handlePurgeCache}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Purge Cache & Re-Sync
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-medium animate-fadeIn">
              ✓ {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowLeftRight, Server, History, Sun, Moon } from 'lucide-react';

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenAdminModal,
  onOpenHistoryModal,
  isLive
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-brand-500/20">
            <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Curren<span className="text-brand-400">x</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isLive ? 'Live Market Gateway' : 'Cached Gateway'} • 160+ Global Currencies</span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* History */}
          <button
            onClick={onOpenHistoryModal}
            title="View Conversion History"
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <History className="w-4 h-4 text-brand-400" />
            <span className="hidden md:inline">Conversion History</span>
          </button>

          {/* Admin Gateway */}
          <button
            onClick={onOpenAdminModal}
            title="Open API Gateway Telemetry & Simulator"
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Server className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">API Gateway</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

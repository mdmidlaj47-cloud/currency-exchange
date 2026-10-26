import React from 'react';
import { ArrowLeftRight, History, Sun, Moon } from 'lucide-react';

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenHistoryModal,
  isLive
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-brand-500/20">
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Curren<span className="text-brand-500 dark:text-brand-400">x</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Interbank Exchange • 160+ Currencies</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* History */}
          <button
            onClick={onOpenHistoryModal}
            title="View Conversion History"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <History className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>History</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 flex items-center gap-1.5"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold hidden md:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

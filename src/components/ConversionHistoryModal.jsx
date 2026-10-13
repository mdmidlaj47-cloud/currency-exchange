import React, { useState, useEffect } from 'react';
import { History, Trash2, Download, X, ArrowRight, Clock } from 'lucide-react';
import { storage } from '../services/storage';
import { getCurrencyByCode } from '../data/currencies';

export default function ConversionHistoryModal({ isOpen, onClose, onSelectPair }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(storage.getHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    storage.clearHistory();
    setHistory([]);
  };

  const handleExportCSV = () => {
    if (!history.length) return;
    const header = "Date,From Currency,Amount,To Currency,Converted Result,Exchange Rate\n";
    const rows = history.map(h => 
      `"${new Date(h.timestamp).toLocaleString()}","${h.from}","${h.amount}","${h.to}","${h.result}","${h.rate}"`
    ).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currenx-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Conversion History</h3>
              <p className="text-xs text-slate-400">Logged conversions stored locally on your device</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">{history.length} records saved</span>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" /> Export CSV
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-14 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversion history yet.</p>
              <p className="text-xs text-slate-600 mt-1">Conversions you calculate will appear here automatically.</p>
            </div>
          ) : (
            history.map((item) => {
              const fromCurr = getCurrencyByCode(item.from);
              const toCurr = getCurrencyByCode(item.to);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPair(item.from, item.to, item.amount);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fromCurr.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span>{item.amount} {item.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-brand-400">{typeof item.result === 'number' ? item.result.toLocaleString(undefined, { maximumFractionDigits: 2 }) : item.result} {item.to}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Rate: 1 {item.from} = {Number(item.rate).toFixed(4)} {item.to} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-brand-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Load ➔
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

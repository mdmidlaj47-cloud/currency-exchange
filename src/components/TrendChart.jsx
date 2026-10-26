import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { generateHistoricalData } from '../data/defaultRates';
import { getCurrencyByCode } from '../data/currencies';
import { exchangeApi } from '../services/exchangeApi';

const TIMEFRAMES = [
  { id: '24H', label: '24 Hours' },
  { id: '7D', label: '7 Days' },
  { id: '30D', label: '30 Days' },
  { id: '90D', label: '90 Days' },
  { id: '1Y', label: '1 Year' }
];

export default function TrendChart({
  rates,
  fromCode = 'USD',
  toCode = 'INR'
}) {
  const [period, setPeriod] = useState('30D');
  const canvasRef = useRef(null);

  const fromCurr = getCurrencyByCode(fromCode);
  const toCurr = getCurrencyByCode(toCode);

  const { rate: currentRate } = exchangeApi.convert(1, fromCode, toCode, rates);

  const historyData = useMemo(() => {
    return generateHistoricalData(currentRate, period);
  }, [currentRate, period, fromCode, toCode]);

  const stats = useMemo(() => {
    if (!historyData.length) return { min: 0, max: 0, avg: 0, change: 0, changePct: 0 };
    const ratesArr = historyData.map(d => d.rate);
    const min = Math.min(...ratesArr);
    const max = Math.max(...ratesArr);
    const avg = ratesArr.reduce((a, b) => a + b, 0) / ratesArr.length;
    const firstRate = historyData[0].rate;
    const lastRate = historyData[historyData.length - 1].rate;
    const change = lastRate - firstRate;
    const changePct = (change / firstRate) * 100;

    return {
      min,
      max,
      avg,
      change,
      changePct,
      isPositive: change >= 0
    };
  }, [historyData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !historyData.length) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    const height = canvas.height = 320 * window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 40, bottom: 40, left: 20, right: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const min = stats.min * 0.998;
    const max = stats.max * 1.002;
    const range = (max - min) || 1;

    const points = historyData.map((d, i) => {
      const x = padding.left + (i / (historyData.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.rate - min) / range) * chartH;
      return { x, y, data: d };
    });

    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.8)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.setLineDash([4 * window.devicePixelRatio, 4 * window.devicePixelRatio]);

    for (let i = 1; i <= 3; i++) {
      const gy = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(width - padding.right, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (stats.isPositive) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
      }
    });

    ctx.strokeStyle = stats.isPositive ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 3 * window.devicePixelRatio;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const lastP = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 6 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = stats.isPositive ? '#10b981' : '#f43f5e';
    ctx.fill();
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.stroke();

  }, [historyData, stats]);

  const formatRate = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    return val.toFixed(4);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl backdrop-blur-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {fromCode} / {toCode} Historical Trend
            </h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              stats.isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>
              {stats.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stats.changePct >= 0 ? '+' : ''}{stats.changePct.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interbank rate fluctuation history and volatility tracking
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setPeriod(tf.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                period === tf.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              {tf.id}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Current Rate</div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {formatRate(currentRate)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} High</div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatRate(stats.max)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} Low</div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {formatRate(stats.min)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} Average</div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">
            {formatRate(stats.avg)}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[320px] bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden p-2">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pointer-events-none">
          <span>{historyData[0]?.label || ''}</span>
          <span>Midpoint</span>
          <span>Today (Live)</span>
        </div>
      </div>
    </div>
  );
}

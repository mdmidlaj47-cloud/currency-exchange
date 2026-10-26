import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
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
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

  const formatRate = (val) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.001) return val.toFixed(6);
    if (val < 1) return val.toFixed(4);
    if (val < 10) return val.toFixed(4);
    return val.toFixed(2);
  };

  // Draw chart with X & Y axes and hover markers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !historyData.length) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = canvas.width = rect.width * dpr;
    const height = canvas.height = 340 * dpr;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains('dark');

    // Layout margins
    const padding = { 
      top: 30 * dpr, 
      right: 70 * dpr, 
      bottom: 45 * dpr, 
      left: 20 * dpr 
    };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const min = stats.min * 0.998;
    const max = stats.max * 1.002;
    const range = (max - min) || 1;

    // Map points to canvas space
    const points = historyData.map((d, i) => {
      const x = padding.left + (i / (historyData.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.rate - min) / range) * chartH;
      return { x, y, data: d, index: i };
    });

    // 1. Draw Y-Axis Grid Lines & Price Labels (Horizontal)
    const ySteps = 4;
    ctx.textAlign = 'left';
    ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;

    for (let i = 0; i <= ySteps; i++) {
      const ratio = i / ySteps;
      const gy = padding.top + chartH * ratio;
      const rateVal = max - ratio * range;

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(width - padding.right, gy);
      ctx.stroke();

      // Y-axis Price Marking label on the right
      ctx.setLineDash([]);
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText(`${toCurr.symbol}${formatRate(rateVal)}`, width - padding.right + (8 * dpr), gy + (3 * dpr));
    }

    // 2. Draw X-Axis Ticks & Date Labels (Vertical Ticks)
    const xStepCount = Math.min(5, historyData.length);
    ctx.textAlign = 'center';
    ctx.font = `${10 * dpr}px 'Plus Jakarta Sans', sans-serif`;

    for (let i = 0; i < xStepCount; i++) {
      const idx = Math.round((i / (xStepCount - 1)) * (historyData.length - 1));
      const pt = points[idx];
      if (pt) {
        // Subtle tick line
        ctx.beginPath();
        ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.9)';
        ctx.lineWidth = 1 * dpr;
        ctx.moveTo(pt.x, padding.top + chartH);
        ctx.lineTo(pt.x, padding.top + chartH + (6 * dpr));
        ctx.stroke();

        // X-axis Date label
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.fillText(pt.data.label, pt.x, height - (15 * dpr));
      }
    }

    // 3. Draw Axis Lines
    ctx.beginPath();
    ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(203, 213, 225, 1)';
    ctx.lineWidth = 1.5 * dpr;
    // Bottom X-axis border
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(width - padding.right, padding.top + chartH);
    // Right Y-axis border
    ctx.moveTo(width - padding.right, padding.top);
    ctx.lineTo(width - padding.right, padding.top + chartH);
    ctx.stroke();

    // 4. Gradient Fill Under Line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    if (stats.isPositive) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 5. Draw Main Trend Line
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
    ctx.lineWidth = 2.5 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 6. Draw Interactive Touch/Hover Crosshair and Point
    if (hoveredPoint) {
      // Find canvas point corresponding to hovered index
      const activePt = points[hoveredPoint.index] || points[points.length - 1];

      // Vertical crosshair guide
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.moveTo(activePt.x, padding.top);
      ctx.lineTo(activePt.x, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizontal crosshair guide
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.moveTo(padding.left, activePt.y);
      ctx.lineTo(width - padding.right, activePt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Glowing outer ring on active point
      ctx.beginPath();
      ctx.arc(activePt.x, activePt.y, 9 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = stats.isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
      ctx.fill();

      // Solid inner point
      ctx.beginPath();
      ctx.arc(activePt.x, activePt.y, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = stats.isPositive ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.stroke();
    } else {
      // Default end marker
      const lastP = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastP.x, lastP.y, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = stats.isPositive ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.stroke();
    }

  }, [historyData, stats, hoveredPoint, toCurr.symbol]);

  // Handle Touch and Mouse interactions
  const handleInteraction = (clientX) => {
    const canvas = canvasRef.current;
    if (!canvas || !historyData.length) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const paddingLeft = 20;
    const paddingRight = 70;
    const chartW = rect.width - paddingLeft - paddingRight;

    const touchX = clientX - rect.left - paddingLeft;
    const ratio = Math.max(0, Math.min(1, touchX / chartW));
    const index = Math.round(ratio * (historyData.length - 1));
    const point = historyData[index];

    if (point) {
      setHoveredPoint({
        index,
        data: point,
        pixelX: paddingLeft + ratio * chartW,
        clientX
      });
    }
  };

  const onMouseMove = (e) => handleInteraction(e.clientX);
  const onTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleInteraction(e.touches[0].clientX);
    }
  };

  const onLeave = () => setHoveredPoint(null);

  // Active display values (hovered or latest)
  const activeRate = hoveredPoint ? hoveredPoint.data.rate : currentRate;
  const activeDateLabel = hoveredPoint 
    ? new Date(hoveredPoint.data.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Latest Market Price (Live)';

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
            Touch or hover anywhere on the chart to inspect exchange rates and timestamps
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                setPeriod(tf.id);
                setHoveredPoint(null);
              }}
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

      {/* Interactive Rate Inspector Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            {activeDateLabel}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
            1 {fromCode} = <span className="text-brand-600 dark:text-brand-400">{toCurr.symbol}{formatRate(activeRate)}</span> {toCode}
          </div>
        </div>

        {hoveredPoint ? (
          <div className="px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-bold animate-fadeIn">
            ✓ Inspected Point: {hoveredPoint.data.label}
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            👆 Tap or drag on the curve to inspect
          </div>
        )}
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Current Rate</div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {toCurr.symbol}{formatRate(currentRate)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} High</div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {toCurr.symbol}{formatRate(stats.max)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} Low</div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {toCurr.symbol}{formatRate(stats.min)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{period} Average</div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">
            {toCurr.symbol}{formatRate(stats.avg)}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area with Touch & Mouse Listeners */}
      <div 
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
        onTouchStart={onTouchMove}
        onTouchMove={onTouchMove}
        onTouchEnd={onLeave}
        className="relative w-full h-[340px] bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden cursor-crosshair select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Floating Tooltip Follower */}
        {hoveredPoint && (
          <div 
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 text-xs font-mono transition-transform duration-75 z-20"
            style={{ 
              left: `${Math.max(50, Math.min(containerRef.current?.clientWidth - 70 || 100, hoveredPoint.pixelX))}px`, 
              top: '55px' 
            }}
          >
            <div className="font-bold text-emerald-400 dark:text-emerald-600 text-sm">
              {toCurr.symbol}{formatRate(hoveredPoint.data.rate)} {toCode}
            </div>
            <div className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 whitespace-nowrap">
              {hoveredPoint.data.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { X, Activity, ShieldAlert, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { FinancialHealth } from '../types';

interface HealthBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: FinancialHealth;
  creditScoreDemo?: number;
}

export const HealthBreakdownModal: React.FC<HealthBreakdownModalProps> = ({
  isOpen,
  onClose,
  health,
  creditScoreDemo = 765,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Cash-Flow Health: <span className="text-cyan-400">{health.score}</span>/100
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical predictability of liquid cash flow across the 30-day horizon.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Essential Disclaimers */}
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Important Distinction: Not a Credit Score</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            Cash-Flow Health measures <strong>liquidity volatility and buffer resilience</strong> within your personal monthly cycle. It is <strong>NOT a CIBIL score</strong>, does NOT evaluate borrower creditworthiness, and is NOT a loan approval algorithm.
          </p>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contributing Factor Breakdown
          </div>

          {health.factors.map((factor, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{factor.name}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                    {factor.weight}% Weight
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      factor.impact === 'Positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : factor.impact === 'Neutral'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {factor.impact}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{factor.description}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-cyan-400 font-mono">{factor.value}</div>
                <div className="text-[10px] text-slate-500">{factor.score}/100 pts</div>
              </div>
            </div>
          ))}
        </div>

        {/* Separate Demo Credit Reference */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              Demo / User-Provided Credit Score
            </div>
            <p className="text-[11px] text-slate-500">
              Separately recorded reference; not calculated or recreated by CashFlow AI.
            </p>
          </div>
          <div className="text-right">
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
              {creditScoreDemo}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

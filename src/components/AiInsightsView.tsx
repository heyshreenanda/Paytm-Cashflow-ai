import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  TrendingDown,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { FinancialInsight } from '../types';

interface AiInsightsViewProps {
  insights: FinancialInsight[];
  onNavigateTab: (tab: any) => void;
  onOpenSimulator: () => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  insights,
  onNavigateTab,
  onOpenSimulator,
}) => {
  const [activeInsights, setActiveInsights] = useState<FinancialInsight[]>(insights);
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);

  const handleDismiss = (id: string) => {
    setActiveInsights((prev) => prev.filter((item) => item.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pressure':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'spending_change':
        return <TrendingDown className="h-5 w-5 text-pink-400" />;
      case 'commitment':
        return <CalendarClock className="h-5 w-5 text-sky-400" />;
      case 'insurance':
        return <ShieldCheck className="h-5 w-5 text-purple-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>AI Cash-Flow Insights</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              Cognee Cloud 3
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward-looking liquidity signals, spending velocity shifts, and commitment alerts.
          </p>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeInsights.map((ins) => {
          const isExpanded = expandedWhy === ins.id;
          return (
            <div
              key={ins.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5 flex flex-col justify-between space-y-4 shadow-lg transition hover:border-slate-700"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700">
                      {getIcon(ins.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {ins.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-0.5 leading-snug">
                        {ins.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismiss(ins.id)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ins.description}
                </p>

                {/* Impact summary pill */}
                {ins.impactSummary && (
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-[11px] text-cyan-300 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>{ins.impactSummary}</span>
                  </div>
                )}

                {/* Expanded "Why?" section */}
                {isExpanded && ins.whyDetails && (
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Detailed Root Cause (AI Explanation)
                    </div>
                    <p className="leading-relaxed text-[11px]">{ins.whyDetails}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Why?, View Impact, What If?, Dismiss */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedWhy(isExpanded ? null : ins.id)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    {isExpanded ? 'Close Why' : 'Why?'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('whatif')}
                    className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 font-semibold text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    What If?
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('cashflow')}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>View Trajectory</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

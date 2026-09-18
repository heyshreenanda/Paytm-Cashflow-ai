import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  HelpCircle,
  FileText,
  Bot,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenSimulator: () => void;
  onOpenCopilotWithQuery: (query: string) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSimulator,
  onOpenCopilotWithQuery,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Dashboard Overview: "How am I doing?"',
      desc: 'Observe starting balance ₹28,000, projected buffer ₹9,500, and Cash-Flow Health 72/100 with Week 3 pressure notice.',
      actionLabel: 'Go to Overview',
      action: () => {
        onNavigateTab('overview');
        onClose();
      },
    },
    {
      step: 2,
      title: 'Explainable AI: Click "Why?" on Week 3',
      desc: 'Understand why Week 3 is under pressure: Rent (₹12,000 on 5th) + EMI (₹6,500 on 12th) + Utilities (₹1,500 on 20th) + living expenses.',
      actionLabel: 'Explore Cash Flow',
      action: () => {
        onNavigateTab('cashflow');
        onClose();
      },
    },
    {
      step: 3,
      title: 'Hero Simulation: ₹3,000 Shopping',
      desc: 'Open the Live Transaction Simulator and simulate a ₹3,000 Shopping expense without moving real money.',
      actionLabel: 'Launch Simulator',
      action: () => {
        onOpenSimulator();
        onClose();
      },
    },
    {
      step: 4,
      title: 'Live Impact & AI Grounded Explanation',
      desc: 'Watch balance drop to ₹25,000 and projected buffer to ₹6,500. Read Groq AI explanation of why Week 3 pressure increases.',
      actionLabel: 'View What-If Engine',
      action: () => {
        onNavigateTab('whatif');
        onClose();
      },
    },
    {
      step: 5,
      title: 'Financial Commitments Timeline',
      desc: 'Inspect the upcoming visual timeline from Today → Rent (5th) → EMI (12th) → Utilities (20th) → Health Insurance (25th).',
      actionLabel: 'View Commitments',
      action: () => {
        onNavigateTab('commitments');
        onClose();
      },
    },
    {
      step: 6,
      title: 'Insurance Cash-Flow Impact',
      desc: 'Analyze how annual Health Insurance premium (₹12,000) causes a step-function reduction in projected buffer.',
      actionLabel: 'Review Commitments',
      action: () => {
        onNavigateTab('commitments');
        onClose();
      },
    },
    {
      step: 7,
      title: 'Interactive Loan / EMI What-If Slider',
      desc: 'Slide EMI from ₹4,500 to ₹7,500. Watch the forecast graph, lowest balance floor, and commitment burden recalculate in real-time.',
      actionLabel: 'Open Loan Simulator',
      action: () => {
        onNavigateTab('whatif');
        onClose();
      },
    },
    {
      step: 8,
      title: 'Ask AI Copilot: Grounded Inquiries',
      desc: 'Ask "What happens if I take a ₹2 lakh loan?" and receive an explanation grounded in actual synthetic finances without LLM arithmetic.',
      actionLabel: 'Ask AI Copilot',
      action: () => {
        onOpenCopilotWithQuery('What happens if I take a ₹2 lakh loan?');
        onClose();
      },
    },
    {
      step: 9,
      title: 'Generate Visual Financial PDF Report',
      desc: 'Select Monthly period, watch the 5-step compilation pipeline, and download an actual high-resolution vector PDF.',
      actionLabel: 'Open Reports',
      action: () => {
        onNavigateTab('reports');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">9-Step Hackathon Demo Script</h2>
                <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                  SECTION 37
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute the complete hero evaluation flow step-by-step.
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

        <div className="space-y-3 mb-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                  {s.step}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
              <button
                onClick={s.action}
                className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 px-3 py-1.5 text-[11px] font-semibold text-cyan-400 transition cursor-pointer"
              >
                <span>{s.actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            Paytm CashFlow AI • Predict. Explain. Plan.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

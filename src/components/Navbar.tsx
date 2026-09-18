import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Bell,
  Sliders,
  ShieldCheck,
  TrendingDown,
  Info,
} from 'lucide-react';
import { User, FinancialSnapshot } from '../types';

interface NavbarProps {
  user: User;
  snapshot: FinancialSnapshot;
  onOpenSimulator: () => void;
  onResetAll: () => void;
  onOpenCopilot: () => void;
  hasActiveSimulation: boolean;
  onOpenDemoTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  snapshot,
  onOpenSimulator,
  onResetAll,
  onOpenCopilot,
  hasActiveSimulation,
  onOpenDemoTour,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base sm:text-lg">
              PAYTM <span className="text-cyan-400">CASHFLOW AI</span>
            </span>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
              PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            Predict. Explain. Plan.
          </p>
        </div>
      </div>

      {/* Middle: Badges & Simulation alert */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">Demo Mode:</span>
          <span className="text-slate-400">Synthetic Data</span>
        </div>

        {hasActiveSimulation && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 animate-pulse">
            <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold">Simulated State Active</span>
            <button
              onClick={onResetAll}
              className="ml-1 text-[11px] underline hover:text-amber-200 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tour button */}
        <button
          onClick={onOpenDemoTour}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition cursor-pointer"
          title="Hackathon Demo Walkthrough"
        >
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Demo Guide</span>
        </button>

        {/* Hero Simulator Button */}
        <button
          id="btn-nav-simulate-tx"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Simulate Transaction</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
            RS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user.name}</div>
            <div className="text-[10px] text-slate-400">Balance: ₹{snapshot.availableBalance.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { TransactionCategory, TransactionType, ScenarioImpact, Transaction } from '../types';

interface LiveTransactionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currentBuffer: number;
  onApplySimulation: (simulatedTx: Transaction, impact: ScenarioImpact) => void;
  onResetSimulation: () => void;
  activeSimulationTx?: Transaction | null;
  onCalculateSimulation: (
    amount: number,
    category: TransactionCategory,
    date: string,
    type: TransactionType
  ) => Promise<{ impact: ScenarioImpact; simulatedTx: Transaction }>;
}

export const LiveTransactionSimulatorModal: React.FC<LiveTransactionSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  currentBuffer,
  onApplySimulation,
  onResetSimulation,
  activeSimulationTx,
  onCalculateSimulation,
}) => {
  const [amount, setAmount] = useState<number>(3000);
  const [category, setCategory] = useState<TransactionCategory>('Shopping');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [date, setDate] = useState<string>('Today');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ impact: ScenarioImpact; simulatedTx: Transaction } | null>(null);

  const categories: TransactionCategory[] = [
    'Shopping',
    'Food',
    'Travel',
    'Bills',
    'Entertainment',
    'Health',
    'Education',
    'Other',
  ];

  const presets = [1000, 2000, 3000, 5000, 8000];

  // Auto-run simulation preview on change
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    const runSimulation = async () => {
      setLoading(true);
      try {
        const res = await onCalculateSimulation(amount, category, date, txType);
        if (!isCancelled) {
          setResult(res);
        }
      } catch (err) {
        console.error('Simulation preview failed:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timer = setTimeout(runSimulation, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, amount, category, date, txType]);

  if (!isOpen) return null;

  const impact = result?.impact;
  const newBalance = impact ? impact.newBalance : currentBalance - (txType === 'expense' ? amount : -amount);
  const newBuffer = impact ? impact.newProjectedBuffer : currentBuffer - (txType === 'expense' ? amount : -amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50">
        {/* Top Header Banner */}
        <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Live Transaction Simulator</h2>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  HERO DEMO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instantly forecast how this transaction will alter your month-end cash flow.
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

        {/* Mandatory Safety Notice */}
        <div className="bg-amber-950/40 border-b border-amber-900/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="font-semibold tracking-wide">
              SIMULATION • NO REAL PAYMENT MADE
            </span>
          </div>
          <span className="text-[11px] text-amber-400/80 hidden sm:inline">
            Forecasts are estimates based on demo data.
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount & Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Transaction Amount (₹)</span>
                <span className="text-cyan-400 font-mono">₹{amount.toLocaleString('en-IN')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      amount === val
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <div className="grid grid-cols-4 gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg py-1.5 px-2 text-[11px] font-medium text-center truncate transition cursor-pointer ${
                      category === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type: Expense vs Income */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    txType === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                  Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    txType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Income Inflow
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Simulated Date</label>
              <div className="flex items-center gap-2">
                {['Today', 'In 2 Days', 'Next Week'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={`flex-1 rounded-xl py-2 text-xs font-medium transition cursor-pointer ${
                      date === d
                        ? 'bg-slate-700 text-white font-bold border border-slate-600'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC IMPACT BEFORE vs AFTER COMPARISON */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulated Financial Shift
              </span>
              <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Live Forecast Recalculated
              </span>
            </div>

            {/* Before vs After Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Metric 1: Available Balance */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Available Balance</div>
                <div className="text-xs text-slate-500 line-through">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </div>
                <div className="text-base font-extrabold text-white mt-0.5 transition-all duration-300">
                  ₹{newBalance.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-rose-400 mt-1">
                  {txType === 'expense' ? `-${amount.toLocaleString('en-IN')}` : `+${amount.toLocaleString('en-IN')}`}
                </div>
              </div>

              {/* Metric 2: Projected Buffer */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Projected Buffer</div>
                <div className="text-xs text-slate-500 line-through">
                  ₹{currentBuffer.toLocaleString('en-IN')}
                </div>
                <div className={`text-base font-extrabold mt-0.5 transition-all duration-300 ${
                  newBuffer < 4000 ? 'text-rose-400' : newBuffer < 7000 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  ₹{newBuffer.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">
                  Month-end safety floor
                </div>
              </div>

              {/* Metric 3: Week 3 Pressure */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                <div className="text-[11px] font-medium text-slate-400 mb-1">Week 3 Pressure</div>
                <div className="text-xs text-slate-500">
                  Moderate
                </div>
                <div className={`text-base font-extrabold mt-0.5 ${
                  amount >= 3000 && txType === 'expense' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {amount >= 3000 && txType === 'expense' ? 'Higher Pressure' : 'Moderate'}
                </div>
                <div className="text-[10px] font-medium text-slate-400 mt-1">
                  Days 15–21 cycle
                </div>
              </div>
            </div>

            {/* Impact Chain Flow Diagram */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                IMPACT OF THIS TRANSACTION
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-white font-semibold">
                  ₹{amount.toLocaleString('en-IN')} {category}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-rose-300">
                  Balance -₹{amount.toLocaleString('en-IN')}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-amber-300">
                  Projected buffer -₹{amount.toLocaleString('en-IN')}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="rounded-md bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-rose-300 font-bold">
                  Future cash-flow pressure increases
                </span>
              </div>
            </div>

            {/* AI Explanation Box (Groq AI / Fallback) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1.5">
                <Sparkles className="h-4 w-4" />
                <span>AI Cash-Flow Explanation</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {impact?.aiExplanation ||
                  `Your simulated ₹${amount.toLocaleString('en-IN')} ${category.toLowerCase()} expense reduces your projected buffer by ₹${amount.toLocaleString('en-IN')}. Because existing commitments already create pressure around Week 3, this leaves less room for discretionary spending.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onResetSimulation();
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-750 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Simulation
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (result) {
                    onApplySimulation(result.simulatedTx, result.impact);
                    onClose();
                  }
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply to Demo Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

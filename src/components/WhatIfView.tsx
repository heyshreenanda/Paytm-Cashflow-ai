import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Percent,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  ScenarioImpact,
  ForecastPoint,
  Commitment,
  TransactionCategory,
} from '../types';
import {
  calculateEMI,
  calculateTotalInterest,
  calculateScenarioImpact,
} from '../services/financialEngine';

interface WhatIfViewProps {
  currentBalance: number;
  currentBuffer: number;
  monthlyIncome: number;
  commitments: Commitment[];
  onOpenSimulator: () => void;
}

export const WhatIfView: React.FC<WhatIfViewProps> = ({
  currentBalance,
  currentBuffer,
  monthlyIncome,
  commitments,
  onOpenSimulator,
}) => {
  const [scenarioTab, setScenarioTab] = useState<'loan' | 'transaction' | 'insurance' | 'income' | 'spending'>(
    'loan'
  );

  // Loan simulator inputs
  const [loanPrincipal, setLoanPrincipal] = useState<number>(150000);
  const [loanInterest, setLoanInterest] = useState<number>(12);
  const [loanTenure, setLoanTenure] = useState<number>(36);
  const [customEmiSlider, setCustomEmiSlider] = useState<number>(6500);

  // Transaction scenario inputs
  const [txAmount, setTxAmount] = useState<number>(3000);
  const [txCategory, setTxCategory] = useState<TransactionCategory>('Shopping');

  // Insurance scenario inputs
  const [insPremium, setInsPremium] = useState<number>(12000);

  // Income scenario inputs
  const [inflowAmount, setInflowAmount] = useState<number>(10000);

  // Spending shift scenario inputs
  const [spendingChangePct, setSpendingChangePct] = useState<number>(10);

  // Impact calculation state
  const [impact, setImpact] = useState<ScenarioImpact | null>(null);

  // Calculated EMI
  const calculatedEmi = calculateEMI(loanPrincipal, loanInterest, loanTenure);
  const totalInterest = calculateTotalInterest(loanPrincipal, calculatedEmi, loanTenure);
  const totalRepayment = loanPrincipal + totalInterest;

  // Run calculation whenever active tab or parameters change
  useEffect(() => {
    let result: ScenarioImpact;

    if (scenarioTab === 'loan') {
      // Use slider EMI or calculated
      const effectiveEmi = customEmiSlider;
      result = calculateScenarioImpact('loan', loanPrincipal, {
        loanInterest,
        loanTenure,
        currentBalance,
        currentBuffer,
        monthlyIncome,
        commitments,
      });
      // Override with slider EMI
      result.projectedBufferDelta = -effectiveEmi;
      result.newProjectedBuffer = currentBuffer - effectiveEmi;
      result.title = `New Loan EMI: ₹${effectiveEmi.toLocaleString('en-IN')}/mo (₹${loanPrincipal.toLocaleString('en-IN')})`;
      result.aiExplanation = `Adding an EMI of ₹${effectiveEmi.toLocaleString(
        'en-IN'
      )} directly reduces your projected monthly buffer from ₹${currentBuffer.toLocaleString(
        'en-IN'
      )} to ₹${(currentBuffer - effectiveEmi).toLocaleString(
        'en-IN'
      )}. Your total monthly fixed debt burden increases to ${(
        ((6500 + effectiveEmi) / monthlyIncome) *
        100
      ).toFixed(1)}% of salary.`;
    } else if (scenarioTab === 'transaction') {
      result = calculateScenarioImpact('transaction', txAmount, {
        category: txCategory,
        currentBalance,
        currentBuffer,
        monthlyIncome,
        commitments,
      });
    } else if (scenarioTab === 'insurance') {
      result = calculateScenarioImpact('insurance', insPremium, {
        currentBalance,
        currentBuffer,
        monthlyIncome,
        commitments,
      });
    } else if (scenarioTab === 'income') {
      result = calculateScenarioImpact('income', inflowAmount, {
        currentBalance,
        currentBuffer,
        monthlyIncome,
        commitments,
      });
    } else {
      result = calculateScenarioImpact('spending_change', 0, {
        spendingChangePct,
        currentBalance,
        currentBuffer,
        monthlyIncome,
        commitments,
      });
    }

    setImpact(result);
  }, [
    scenarioTab,
    loanPrincipal,
    loanInterest,
    loanTenure,
    customEmiSlider,
    txAmount,
    txCategory,
    insPremium,
    inflowAmount,
    spendingChangePct,
    currentBalance,
    currentBuffer,
    monthlyIncome,
    commitments,
  ]);

  const emiSliderPresets = [4500, 5000, 5500, 6000, 6500, 7000, 7500];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>Unified What-If Scenario Engine</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              DETERMINISTIC
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test "What happens to my future cash flow if I..." with immediate side-by-side recalculations.
          </p>
        </div>

        <div className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          No real money moves • Informative forecast only
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'loan', label: 'Loan / EMI What-If' },
          { id: 'transaction', label: 'Spend ₹3,000' },
          { id: 'insurance', label: 'Insurance Due' },
          { id: 'income', label: 'Inflow ₹10,000' },
          { id: 'spending', label: 'Spending Shift ±10%' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setScenarioTab(t.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              scenarioTab === t.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Controls (Left) & Side-By-Side Visual Impact (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
          <div className="border-b border-slate-800/80 pb-2">
            <h3 className="text-sm font-bold text-white">
              {scenarioTab === 'loan' && 'Configure Loan & EMI Scenario'}
              {scenarioTab === 'transaction' && 'Configure Discretionary Spend'}
              {scenarioTab === 'insurance' && 'Configure Insurance Premium'}
              {scenarioTab === 'income' && 'Configure Inflow / Bonus'}
              {scenarioTab === 'spending' && 'Adjust Monthly Variable Pacing'}
            </h3>
            <p className="text-xs text-slate-400">Deterministic scenario parameters.</p>
          </div>

          {/* LOAN SCENARIO INPUTS (Section 9) */}
          {scenarioTab === 'loan' && (
            <div className="space-y-4 text-xs">
              {/* Principal */}
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Loan Principal (₹)</span>
                  <span className="text-cyan-400 font-mono">₹{loanPrincipal.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Interest & Tenure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={loanInterest}
                    onChange={(e) => setLoanInterest(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Deterministic EMI result */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Calculated EMI</div>
                  <div className="text-sm font-bold text-white font-mono">₹{calculatedEmi.toLocaleString('en-IN')}/mo</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Total Interest</div>
                  <div className="text-sm font-bold text-slate-300 font-mono">₹{totalInterest.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* SECTION 9: INTERACTIVE EMI SLIDER */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Test Different Monthly EMIs</span>
                  <span className="text-cyan-400 font-mono text-sm">₹{customEmiSlider.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="12000"
                  step="500"
                  value={customEmiSlider}
                  onChange={(e) => setCustomEmiSlider(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {emiSliderPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCustomEmiSlider(val)}
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                        customEmiSlider === val
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTION SCENARIO */}
          {scenarioTab === 'transaction' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Expense Amount (₹)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                {[1500, 3000, 5000, 8000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTxAmount(v)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      txAmount === v ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ₹{v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INSURANCE SCENARIO */}
          {scenarioTab === 'insurance' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Insurance Premium (₹)</label>
                <input
                  type="number"
                  value={insPremium}
                  onChange={(e) => setInsPremium(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono text-sm"
                />
              </div>
              <p className="text-slate-400 leading-relaxed">
                Evaluates how executing the ₹12,000 Care Health annual premium immediately shifts month-end liquid reserves.
              </p>
            </div>
          )}

          {/* INCOME SCENARIO */}
          {scenarioTab === 'income' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Inflow / Bonus / Freelance (₹)</label>
                <input
                  type="number"
                  value={inflowAmount}
                  onChange={(e) => setInflowAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                {[5000, 10000, 20000, 35000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setInflowAmount(v)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      inflowAmount === v ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    +₹{v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SPENDING SHIFT */}
          {scenarioTab === 'spending' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Discretionary Spending Shift</span>
                <span className="text-cyan-400 font-bold">{spendingChangePct > 0 ? `+${spendingChangePct}%` : `${spendingChangePct}%`}</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="5"
                value={spendingChangePct}
                onChange={(e) => setSpendingChangePct(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>-30% (Frugal)</span>
                <span>0% (Current)</span>
                <span>+30% (Elevated)</span>
              </div>
            </div>
          )}

          {/* Neutral Responsibility Disclaimer */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Responsible Scenario Notice
            </div>
            <p>
              Projected cash-flow impact is not a lending or insurance underwriting decision. The AI informs the user; it does not decide affordability.
            </p>
          </div>
        </div>

        {/* Right: Side-by-Side Current vs Scenario (7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Side-by-Side Impact Comparison</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              impact?.cashFlowImpact === 'High'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : impact?.cashFlowImpact === 'Moderate'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {impact?.cashFlowImpact || 'Moderate'} Cash-Flow Impact
            </span>
          </div>

          {/* Side by Side Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* CURRENT Column */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                CURRENT BASELINE
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Projected Buffer</div>
                <div className="text-xl font-bold text-white font-mono">
                  ₹{currentBuffer.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Lowest Balance</div>
                <div className="text-sm font-bold text-slate-300 font-mono">₹6,400 (Week 3)</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Cash-Flow Health</div>
                <div className="text-sm font-bold text-cyan-400 font-mono">72/100</div>
              </div>
            </div>

            {/* WITH SCENARIO Column */}
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                WITH THIS SCENARIO
              </div>
              <div>
                <div className="text-[11px] text-cyan-400/80 font-medium">Scenario Buffer</div>
                <div className={`text-xl font-bold font-mono ${
                  (impact?.newProjectedBuffer || 0) < 4000 ? 'text-rose-400' : 'text-cyan-300'
                }`}>
                  ₹{(impact?.newProjectedBuffer ?? currentBuffer).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-cyan-400/80 font-medium">Lowest Liquidity Floor</div>
                <div className="text-sm font-bold text-white font-mono">
                  ₹{(impact?.lowestBalance ?? 6400).toLocaleString('en-IN')} ({impact?.lowestBalancePeriod || 'Week 3'})
                </div>
              </div>
              <div>
                <div className="text-[11px] text-cyan-400/80 font-medium">New Health Index</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  {impact?.newHealthScore || 72}/100
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Forecast Live Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Forecast Trajectory Comparison</span>
              <div className="flex gap-3 text-[11px]">
                <span className="text-cyan-400">● Baseline</span>
                <span className="text-amber-400">● Scenario</span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={impact?.forecastPoints || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as ForecastPoint;
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs shadow-md">
                            <div className="font-bold text-white">{d.period}</div>
                            <div className="text-cyan-400">Baseline: ₹{d.projectedBalance.toLocaleString('en-IN')}</div>
                            <div className="text-amber-400">Scenario: ₹{(d.scenarioBalance ?? d.projectedBalance).toLocaleString('en-IN')}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={5000} stroke="#f43f5e" strokeDasharray="2 2" />
                  <Area type="monotone" dataKey="projectedBalance" stroke="#06b6d4" strokeWidth={2} fillOpacity={0.1} fill="#06b6d4" />
                  <Area type="monotone" dataKey="scenarioBalance" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" fillOpacity={0.2} fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Grounded Explanation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Cognee Cloud 3 Financial Reasoning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {impact?.aiExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

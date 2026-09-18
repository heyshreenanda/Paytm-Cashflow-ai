import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  HelpCircle,
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
  FinancialSnapshot,
  ForecastPoint,
  MoneyFlowData,
  Commitment,
} from '../types';

interface CashFlowViewProps {
  snapshot: FinancialSnapshot;
  forecast: ForecastPoint[];
  moneyFlow: MoneyFlowData;
  commitments: Commitment[];
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  snapshot,
  forecast,
  moneyFlow,
  commitments,
  onOpenSimulator,
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'7days' | '10days' | '30days'>('30days');
  const [showWeek3Details, setShowWeek3Details] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
            Cash-Flow Trajectory & Pressure Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Understand how each payment timing event shapes your liquid liquidity floor.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1">
          {(['7days', '10days', '30days'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                activeFilter === filter
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter === '7days' ? '7 Days' : filter === '10days' ? '10 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Week 3 Pressure Spotlight Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Week 3 Pressure Period (15 Sep – 21 Sep)
                </h3>
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  CRITICAL OBSERVATION
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Liquid cash-flow reaches its lowest buffer margin of <strong>₹6,400</strong> during this period.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWeek3Details(!showWeek3Details)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
          >
            <span>{showWeek3Details ? 'Hide Root Cause' : 'Why Week 3?'}</span>
            {showWeek3Details ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {showWeek3Details && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Root-Cause Decomposition: Why Week 3 Compresses
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400 text-[10px] font-semibold">1. Rent Execution</div>
                <div className="font-bold text-white mt-1">₹12,000 on 5th</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cleared, large one-time deduction.</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400 text-[10px] font-semibold">2. Appliance Loan EMI</div>
                <div className="font-bold text-white mt-1">₹6,500 on 12th</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cleared, leaves lower mid-month liquidity.</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400 text-[10px] font-semibold">3. Scheduled Utilities</div>
                <div className="font-bold text-amber-300 mt-1">₹1,500 on 20th</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Broadband bill due in Week 3.</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400 text-[10px] font-semibold">4. Living Run-Rate</div>
                <div className="font-bold text-rose-300 mt-1">~₹3,800 Variable</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cumulative food, grocery & commute pace.</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              "Because these obligations occur prior to late-month annual insurance renewals (₹12,000 on 25 Sep), discretionary spending during Days 15–21 must remain disciplined."
            </p>
          </div>
        )}
      </div>

      {/* Main Forecast Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>Projected Balance Across Forecast Cycle</span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulated trajectory showing liquid balance and remaining buffer at each critical milestone.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-cyan-400 font-semibold">Projected Buffer: ₹{snapshot.projectedBuffer.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="flowCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ForecastPoint;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-md">
                        <div className="font-bold text-white mb-1">
                          {data.period} ({data.date})
                        </div>
                        <div className="text-cyan-400 font-bold text-sm">
                          Balance: ₹{data.projectedBalance.toLocaleString('en-IN')}
                        </div>
                        <div className="text-slate-300 mt-1">
                          Fixed Outflow: ₹{data.fixedCommitments.toLocaleString('en-IN')}
                        </div>
                        <div className="text-slate-400">
                          Variable Outflow: ₹{data.variableSpending.toLocaleString('en-IN')}
                        </div>
                        <div className="mt-1 font-semibold text-amber-400">
                          Pressure Level: {data.pressureLevel}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={5000} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Floor ₹5k', fill: '#f43f5e', fontSize: 10 }} />
              <Area type="monotone" dataKey="projectedBalance" stroke="#06b6d4" strokeWidth={3} fill="url(#flowCyan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 12: MONEY-FLOW VISUALIZATION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
        <div className="border-b border-slate-800/80 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Money-Flow Breakdown: "Where did my money go?"</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400">
              ₹52,000 Monthly Income
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured diagrammatic decomposition from monthly salary credit into commitments, living expenses, and liquid buffer.
          </p>
        </div>

        {/* Diagrammatic Tree Structure */}
        <div className="space-y-2.5 font-sans">
          {/* Root Node: Income */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-44 items-center justify-between rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-300 shadow-md">
              <span>SALARY INCOME</span>
              <span>₹52,000</span>
            </div>
            <div className="h-0.5 flex-1 bg-slate-800 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600">▶</div>
            </div>
          </div>

          {/* Connectors & Branches */}
          <div className="pl-6 border-l-2 border-slate-800 space-y-2 ml-4">
            {/* Branch 1: Rent */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                  Apartment Rent (5th)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">23% of income</span>
                  <span className="font-bold text-white font-mono">₹12,000</span>
                </div>
              </div>
            </div>

            {/* Branch 2: EMI */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                  Appliance Loan EMI (12th)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">12.5% of income</span>
                  <span className="font-bold text-white font-mono">₹6,500</span>
                </div>
              </div>
            </div>

            {/* Branch 3: Food */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Food & Dining (Swiggy, Zomato, Groceries)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">11% of income</span>
                  <span className="font-bold text-white font-mono">₹5,800</span>
                </div>
              </div>
            </div>

            {/* Branch 4: Shopping */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-400"></span>
                  Shopping (Amazon, Flipkart)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">8% of income (+18% velocity)</span>
                  <span className="font-bold text-white font-mono">₹4,200</span>
                </div>
              </div>
            </div>

            {/* Branch 5: Travel */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Travel & Commute (Metro, Fuel, BMTC)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">6% of income</span>
                  <span className="font-bold text-white font-mono">₹3,000</span>
                </div>
              </div>
            </div>

            {/* Branch 6: Insurance Amortization */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-slate-800"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                  Health Insurance (Monthly Amortized / Due 25th)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">2% of income</span>
                  <span className="font-bold text-white font-mono">₹1,000</span>
                </div>
              </div>
            </div>

            {/* Branch 7: Remaining Buffer */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-cyan-500"></div>
              <div className="flex-1 flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  REMAINING PROJECTED BUFFER
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400/80 font-semibold">18% month-end liquidity</span>
                  <span className="font-extrabold text-cyan-300 font-mono text-sm">₹9,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

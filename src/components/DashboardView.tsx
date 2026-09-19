import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Sparkles,
  Sliders,
  ChevronRight,
  Receipt,
  Calendar,
  Info,
  Clock,
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
  Commitment,
  Transaction,
  FinancialInsight,
} from '../types';

interface DashboardViewProps {
  snapshot: FinancialSnapshot;
  forecast: ForecastPoint[];
  commitments: Commitment[];
  transactions: Transaction[];
  insights: FinancialInsight[];
  onOpenSimulator: () => void;
  onOpenHealthModal: () => void;
  onNavigateTab: (tab: any) => void;
  hasActiveSimulation: boolean;
  activeSimulationTx?: Transaction | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  snapshot,
  forecast,
  commitments,
  transactions,
  insights,
  onOpenSimulator,
  onOpenHealthModal,
  onNavigateTab,
  hasActiveSimulation,
  activeSimulationTx,
}) => {
  // Chart formatting
  const chartData = forecast.map((f) => ({
    period: f.period,
    label: f.label,
    date: f.date,
    current: f.projectedBalance,
    scenario: f.scenarioBalance ?? f.projectedBalance,
    buffer: f.remainingBuffer,
    pressure: f.pressureLevel,
  }));

  const activeInsight = insights[0] || {
    title: 'Potential cash-flow pressure may rise in Week 3.',
    description: 'Rent on 5th and EMI on 12th cleared, utility due on 20th + living expenses.',
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>Financial Snapshot</span>
            {hasActiveSimulation && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                SIMULATION ACTIVE
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward-looking cash flow forecast & obligation timelines for September 2026.
          </p>
        </div>

        {/* Hero Quick Simulate Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="h-4 w-4" />
          <span>Simulate Transaction</span>
        </button>
      </div>

      {/* Hero 5 Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Available Balance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Available Balance</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            ₹{snapshot.availableBalance.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-[10px] text-slate-400">
            {hasActiveSimulation && snapshot.baselineBalance !== undefined ? (
              <span className="font-semibold text-amber-400">
                Baseline: ₹{snapshot.baselineBalance.toLocaleString('en-IN')} ({snapshot.simulatedDelta && snapshot.simulatedDelta < 0 ? `-₹${Math.abs(snapshot.simulatedDelta).toLocaleString('en-IN')}` : `+₹${(snapshot.simulatedDelta || 0).toLocaleString('en-IN')}`})
              </span>
            ) : (
              <span>Liquid in demo account</span>
            )}
          </div>
        </div>

        {/* 2. Monthly Income */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Monthly Income</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 tracking-tight">
            ₹{snapshot.monthlyIncome.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-[10px] text-slate-400">
            <span>Credited 1st Sep (Salary)</span>
          </div>
        </div>

        {/* 3. Monthly Spending */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Monthly Spending</span>
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            ₹{snapshot.monthlyExpenses.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-[10px] text-slate-400">
            {hasActiveSimulation && activeSimulationTx && activeSimulationTx.type === 'expense' ? (
              <span className="font-semibold text-rose-400">
                Includes +₹{activeSimulationTx.amount.toLocaleString('en-IN')} simulated
              </span>
            ) : (
              <span>Fixed + Discretionary</span>
            )}
          </div>
        </div>

        {/* 4. Projected Buffer */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-4 relative overflow-hidden shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-bold">Projected Buffer</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-300 tracking-tight">
            ₹{snapshot.projectedBuffer.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-[10px] text-slate-300 font-medium">
            {hasActiveSimulation && snapshot.baselineBuffer !== undefined ? (
              <span className="font-semibold text-amber-400">
                Baseline: ₹{snapshot.baselineBuffer.toLocaleString('en-IN')} ({snapshot.simulatedDelta && snapshot.simulatedDelta < 0 ? `-₹${Math.abs(snapshot.simulatedDelta).toLocaleString('en-IN')}` : `+₹${(snapshot.simulatedDelta || 0).toLocaleString('en-IN')}`})
              </span>
            ) : (
              <span>Safety margin at month-end</span>
            )}
          </div>
        </div>

        {/* 5. Cash-Flow Health */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Cash-Flow Health</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white tracking-tight">
              {snapshot.cashFlowHealth}
            </span>
            <span className="text-xs font-bold text-slate-500">/100</span>
            {hasActiveSimulation && (
              <span className="ml-1 text-[10px] font-bold text-amber-400">
                (Simulated)
              </span>
            )}
          </div>
          <button
            onClick={onOpenHealthModal}
            className="mt-2 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            How is this calculated?
          </button>
        </div>
      </div>

      {/* Week 3 Pressure Alert / AI Insight Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">
                WEEK 3 FORECAST: {hasActiveSimulation ? 'ELEVATED SIMULATION PRESSURE' : 'POTENTIAL CASH-FLOW PRESSURE'}
              </span>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                AI PREDICTION
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {hasActiveSimulation && activeSimulationTx
                ? `Active simulation (₹${activeSimulationTx.amount.toLocaleString('en-IN')} ${activeSimulationTx.category}) adjusts your Week 3 lowest balance floor to ₹${snapshot.lowestProjectedBalance.toLocaleString('en-IN')}. ${snapshot.peakPressureReason}`
                : 'Upcoming obligations (Utility ₹1,500 on 20th) + existing EMI (₹6,500 on 12th) + typical mid-month living spending reduce liquidity before late-month health insurance (₹12,000 on 25th).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => onNavigateTab('cashflow')}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer"
          >
            Why?
          </button>
          <button
            onClick={() => onNavigateTab('whatif')}
            className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
          >
            What If?
          </button>
        </div>
      </div>

      {/* Main Grid: Forecast Chart (Left 2/3) + Upcoming Commitments (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>30-Day Cash-Flow Forecast</span>
                <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                  (Today → Week 4)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Projected available balance and remaining buffer over time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                Baseline
              </span>
              {hasActiveSimulation && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  With Simulation
                </span>
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-md">
                          <div className="font-bold text-white mb-1 flex items-center justify-between gap-4">
                            <span>{data.period} ({data.date})</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              data.pressure === 'High' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {data.pressure} Pressure
                            </span>
                          </div>
                          <div className="text-cyan-400 font-semibold">
                            Projected Balance: ₹{data.current.toLocaleString('en-IN')}
                          </div>
                          {hasActiveSimulation && (
                            <div className="text-amber-400 font-semibold">
                              Scenario Balance: ₹{data.scenario.toLocaleString('en-IN')}
                            </div>
                          )}
                          <div className="text-slate-400 text-[11px] mt-1">
                            {data.label}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={5000} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Safety Floor ₹5k', fill: '#f43f5e', fontSize: 10, position: 'insideBottomRight' }} />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                />
                {hasActiveSimulation && (
                  <Area
                    type="monotone"
                    dataKey="scenario"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#amberGradient)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Disclaimer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Forecasts are estimates based on demo data.</span>
            <button
              onClick={() => onNavigateTab('cashflow')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              Detailed Breakdown <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Commitments Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>Upcoming Commitments</span>
              </h3>
              <button
                onClick={() => onNavigateTab('commitments')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {commitments.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{c.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          c.status === 'PAID'
                            ? 'bg-slate-800 text-slate-400'
                            : c.status === 'DUE SOON'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due {c.dueDate}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-slate-500">{c.frequency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
            <span className="font-semibold text-cyan-400">Total Obligations:</span> ₹32,000 scheduled this month.
          </div>
        </div>
      </div>

      {/* Recent Transactions List with SIMULATED Badge */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-cyan-400" />
              <span>Recent Transactions & Simulations</span>
            </h3>
            <p className="text-xs text-slate-400">
              Activity log with explicit separation between demo data and active simulations.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            View All ({transactions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {transactions.slice(0, 6).map((tx) => (
            <div
              key={tx.id}
              className={`py-3 flex items-center justify-between gap-4 transition ${
                tx.isSimulated ? 'bg-amber-500/5 px-2 rounded-xl' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.isSimulated
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : tx.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tx.isSimulated ? 'SIM' : tx.category.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{tx.merchant}</span>
                    {tx.isSimulated && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                        SIMULATED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-bold font-mono ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

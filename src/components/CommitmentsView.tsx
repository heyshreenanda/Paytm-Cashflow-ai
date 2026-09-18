import React, { useState } from 'react';
import {
  CalendarClock,
  ShieldCheck,
  Plus,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
} from 'lucide-react';
import { Commitment, InsurancePolicy, FrequencyType } from '../types';

interface CommitmentsViewProps {
  commitments: Commitment[];
  insurance: InsurancePolicy[];
  projectedBuffer: number;
  onAddCommitment: (commitment: Partial<Commitment>) => void;
  onNavigateWhatIf: (scenarioType: string, payload?: any) => void;
}

export const CommitmentsView: React.FC<CommitmentsViewProps> = ({
  commitments,
  insurance,
  projectedBuffer,
  onAddCommitment,
  onNavigateWhatIf,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCmtName, setNewCmtName] = useState<string>('');
  const [newCmtAmount, setNewCmtAmount] = useState<number>(1500);
  const [newCmtCategory, setNewCmtCategory] = useState<string>('Bills');
  const [newCmtDate, setNewCmtDate] = useState<string>('24 Sep');
  const [newCmtFreq, setNewCmtFreq] = useState<FrequencyType>('Monthly');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmtName || newCmtAmount <= 0) return;
    onAddCommitment({
      name: newCmtName,
      amount: newCmtAmount,
      category: newCmtCategory,
      dueDate: newCmtDate,
      dueDay: 24,
      frequency: newCmtFreq,
      status: 'UPCOMING',
      projectedImpact: 'Custom added financial commitment.',
    });
    setNewCmtName('');
    setShowAddModal(false);
  };

  // Dedicated Insurance calculations (Section 8)
  const healthInsurance = insurance.find((i) => i.type === 'Health') || insurance[0];
  const upcomingPremium = healthInsurance ? healthInsurance.premium : 12000;
  const bufferBefore = projectedBuffer;
  const bufferAfter = bufferBefore - upcomingPremium;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>Financial Obligations & Commitments</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              {commitments.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fixed obligations that shape your monthly liquidity schedule and feed directly into the forecast engine.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* SECTION 7: VISUAL TIMELINE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-cyan-400" />
            <span>Visual Calendar Timeline (September 2026)</span>
          </h3>
          <span className="text-xs text-slate-400">Chronological execution order</span>
        </div>

        {/* Visual Timeline Diagram */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/40 ml-4 py-2 space-y-6">
          {/* Today Indicator */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1 h-5 w-5 rounded-full bg-cyan-500 border-4 border-slate-950 flex items-center justify-center"></div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                TODAY • 18 SEP
              </span>
              <span className="text-xs text-slate-400">Mid-cycle review milestone</span>
            </div>
          </div>

          {/* 5 Sep: Rent */}
          <div className="relative">
            <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 rounded-full bg-slate-700 border-2 border-slate-900"></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">5 Sep: Apartment Rent</span>
                  <span className="rounded bg-slate-800 px-2 py-0.2 text-[9px] font-bold text-slate-400">
                    PAID
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Transferred via UPI to landlord. Major outflow at month open.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white font-mono">₹12,000</div>
                <div className="text-[10px] text-slate-500">Monthly</div>
              </div>
            </div>
          </div>

          {/* 12 Sep: EMI */}
          <div className="relative">
            <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 rounded-full bg-slate-700 border-2 border-slate-900"></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">12 Sep: Appliance Loan EMI</span>
                  <span className="rounded bg-slate-800 px-2 py-0.2 text-[9px] font-bold text-slate-400">
                    PAID
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  HDFC auto-debit executed. Fixed obligation through 2026.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white font-mono">₹6,500</div>
                <div className="text-[10px] text-slate-500">Monthly</div>
              </div>
            </div>
          </div>

          {/* 20 Sep: Recurring Bill */}
          <div className="relative">
            <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 rounded-full bg-amber-500 border-2 border-slate-900 animate-pulse"></div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">20 Sep: Broadband & Utilities</span>
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.2 text-[9px] font-bold text-amber-300">
                    DUE SOON
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Scheduled during Week 3 pressure window. Auto-pay pending.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-300 font-mono">₹1,500</div>
                <div className="text-[10px] text-slate-400">Monthly</div>
              </div>
            </div>
          </div>

          {/* 25 Sep: Insurance */}
          <div className="relative">
            <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 rounded-full bg-cyan-400 border-2 border-slate-900"></div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300">25 Sep: Care Health Insurance Renewal</span>
                  <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.2 text-[9px] font-bold text-cyan-300">
                    UPCOMING
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Annual policy premium. Creates substantial temporary step-down.
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-cyan-300 font-mono">₹12,000</div>
                <div className="text-[10px] text-cyan-400/80">Annual</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: INSURANCE COMMITMENT CASH-FLOW MODULE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Insurance Cash-Flow Impact Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Understanding liquidity buffer shifts before & after scheduled insurance premiums.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateWhatIf('insurance', { amount: upcomingPremium })}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer"
          >
            <span>What-If Model</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Neutral Insurance Cash Flow Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium text-slate-400 mb-1">Upcoming Premium</div>
            <div className="text-lg font-extrabold text-white">
              ₹{upcomingPremium.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Care Health (Annual) • Due 25 Sep
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium text-slate-400 mb-1">Projected Buffer Before</div>
            <div className="text-lg font-extrabold text-cyan-400">
              ₹{bufferBefore.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Baseline liquid reserve
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium text-slate-400 mb-1">Projected Buffer After</div>
            <div className={`text-lg font-extrabold ${bufferAfter < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              ₹{bufferAfter.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Temporary deficit window
            </div>
          </div>
        </div>

        {/* Neutral Non-Promotional Explanation */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Info className="h-4 w-4 text-cyan-400" />
            Neutral Cash-Flow Assessment
          </div>
          <p className="leading-relaxed text-slate-300">
            "This payment creates a temporary reduction in your projected buffer. Its timing overlaps with existing commitments."
          </p>
          <p className="text-[11px] text-slate-500 italic">
            Disclaimer: Does not recommend buying or not buying insurance. Does not predict insurance eligibility or claim recovery.
          </p>
        </div>
      </div>

      {/* Add Commitment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Add Financial Commitment</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Commitment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym Membership, Child School Fee"
                  value={newCmtName}
                  onChange={(e) => setNewCmtName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={newCmtAmount}
                    onChange={(e) => setNewCmtAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Due Date</label>
                  <input
                    type="text"
                    value={newCmtDate}
                    onChange={(e) => setNewCmtDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Monthly', 'Quarterly', 'Annual'] as FrequencyType[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setNewCmtFreq(f)}
                      className={`rounded-xl py-2 font-medium transition cursor-pointer ${
                        newCmtFreq === f ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 font-bold text-slate-950 transition cursor-pointer"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

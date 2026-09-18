import React, { useState } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  Receipt,
  RotateCw,
} from 'lucide-react';
import { ReportData, ReportPeriod } from '../types';
import { generateFinancialPDF } from '../services/pdfGenerator';

interface ReportsViewProps {
  onFetchReportData: (period: ReportPeriod) => Promise<ReportData>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onFetchReportData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [report, setReport] = useState<ReportData | null>(null);

  const steps = [
    'Analyzing transactions',
    'Calculating cash flow',
    'Preparing visualizations',
    'Generating AI summary (Cognee Cloud 3)',
    'Creating PDF vector document',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStep(0);

    // Step animation for polish
    for (let i = 0; i < 4; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 220));
    }

    try {
      const data = await onFetchReportData(selectedPeriod);
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 200));
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const doc = generateFinancialPDF(report);
    doc.save(`Paytm_CashFlow_AI_${report.period}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>Visual Financial Reports & PDF Export</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              ACTUAL PDF
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile your multi-layered financial cash-flow story into an executive PDF briefing.
          </p>
        </div>

        {report && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-4 w-4" />
            <span>Download Vector PDF</span>
          </button>
        )}
      </div>

      {/* Period Selection & Generation Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Reporting Horizon
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'last10days', label: 'Last 10 Days' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly (Sep 2026)' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  disabled={isGenerating}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    selectedPeriod === p.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 px-5 py-2.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer self-stretch sm:self-auto justify-center"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Compiling Financial Report...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Generate Financial Report</span>
              </>
            )}
          </button>
        </div>

        {/* 5-Step Animated Progress State */}
        {isGenerating && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                Report Compilation Engine
              </span>
              <span>Step {currentStep + 1} of 5</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              />
            </div>

            <div className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>{steps[currentStep]}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Generated Report Preview (10 Sections) */}
      {report ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-8">
          {/* Top Report Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">PAYTM CASHFLOW AI</span>
                <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  {report.periodLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generated {report.generatedAt} • User: Rahul Sharma
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF File</span>
            </button>
          </div>

          {/* Section 1: Financial Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              1. Financial Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[10px] text-slate-400 font-semibold">Available Balance</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ₹{report.snapshot.availableBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[10px] text-slate-400 font-semibold">Monthly Income</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  ₹{report.snapshot.monthlyIncome.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[10px] text-slate-400 font-semibold">Monthly Expenses</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                  ₹{report.snapshot.monthlyExpenses.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-[10px] text-slate-400 font-semibold">Projected Buffer</div>
                <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
                  ₹{report.snapshot.projectedBuffer.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AI Financial Brief */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              2. AI Financial Brief (Cognee Cloud 3)
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{report.aiFinancialBrief}</p>
            </div>
          </div>

          {/* Section 3: Notable Changes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              3. Notable Changes & Cash-Flow Behavior
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {report.notableChanges.map((change, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-slate-300 flex items-start gap-2"
                >
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Spending Analysis */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              4. Spending Breakdown by Category
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">% of Outflow</th>
                    <th className="p-3">Velocity Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
                  {report.spendingByCategory.map((c, i) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold text-white">{c.category}</td>
                      <td className="p-3 font-mono font-bold">₹{c.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3">{c.percentage}%</td>
                      <td className="p-3 font-bold">
                        <span className={c.changeVsPrior > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {c.changeVsPrior > 0 ? `+${c.changeVsPrior}%` : `${c.changeVsPrior}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Commitments Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              5. Scheduled Obligations & Commitments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {report.commitments.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">Due {c.dueDate} • {c.frequency}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">₹{c.amount.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-cyan-400">{c.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Forecast & Pressure Periods */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              6. Forecast & Pressure Periods
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
              {report.pressurePeriods.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 border-b border-slate-800/80 last:border-0 pb-2 last:pb-0">
                  <div>
                    <div className="font-bold text-white">{p.period}</div>
                    <div className="text-slate-400 text-[11px]">{p.reason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                      {p.level}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Buffer: ₹{p.buffer.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Simulation Isolation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              7. Simulation Isolation Status
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400">
              {report.hasSimulation
                ? 'Active simulation was included in session calculations. It is strictly segregated from settled financial logs.'
                : 'Default baseline synthetic demo report. No active simulation was merged into the review period.'}
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="border-t border-slate-800 pt-4 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">CashFlow AI — Predict. Explain. Plan.</p>
            <p>Prototype using synthetic/demo data. Forecasts are estimates and are not financial advice.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
          <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          Click <strong>"Generate Financial Report"</strong> to compile a 10-section financial story with vector PDF export.
        </div>
      )}
    </div>
  );
};

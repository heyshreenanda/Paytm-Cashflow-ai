import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CashFlowView } from './components/CashFlowView';
import { CommitmentsView } from './components/CommitmentsView';
import { WhatIfView } from './components/WhatIfView';
import { TransactionsView } from './components/TransactionsView';
import { AiInsightsView } from './components/AiInsightsView';
import { ReportsView } from './components/ReportsView';
import { AiCopilotView } from './components/AiCopilotView';
import { LiveTransactionSimulatorModal } from './components/LiveTransactionSimulatorModal';
import { HealthBreakdownModal } from './components/HealthBreakdownModal';
import { DemoTourModal } from './components/DemoTourModal';
import {
  FinancialSnapshot,
  ForecastPoint,
  Commitment,
  Transaction,
  InsurancePolicy,
  MoneyFlowData,
  FinancialInsight,
  ReportData,
  ReportPeriod,
  TransactionCategory,
  TransactionType,
  User,
  ScenarioImpact,
} from './types';
import {
  DEMO_USER,
  initialSnapshot,
  initialForecast,
  initialCommitments,
  initialTransactions,
  initialInsurance,
  initialMoneyFlow,
  initialInsights,
} from './data/demoData';
import {
  calculateFinancialHealth,
  calculateScenarioImpact,
} from './services/financialEngine';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [copilotQuery, setCopilotQuery] = useState<string>('');

  // Core Financial State
  const [user] = useState<User>(DEMO_USER);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot>(initialSnapshot);
  const [forecast, setForecast] = useState<ForecastPoint[]>(initialForecast);
  const [commitments, setCommitments] = useState<Commitment[]>(initialCommitments);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [insurance, setInsurance] = useState<InsurancePolicy[]>(initialInsurance);
  const [moneyFlow, setMoneyFlow] = useState<MoneyFlowData>(initialMoneyFlow);
  const [insights, setInsights] = useState<FinancialInsight[]>(initialInsights);
  const [hasActiveSimulation, setHasActiveSimulation] = useState<boolean>(false);
  const [activeSimulationTx, setActiveSimulationTx] = useState<Transaction | null>(null);

  // Derive structured health factors for breakdown modal
  const financialHealth = useMemo(() => {
    return calculateFinancialHealth(
      snapshot.availableBalance,
      snapshot.projectedBuffer,
      snapshot.monthlyIncome,
      commitments,
      snapshot.lowestProjectedBalance
    );
  }, [snapshot, commitments]);

  // Fetch state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setSnapshot(data.snapshot);
        setForecast(data.forecast);
        setCommitments(data.commitments);
        setTransactions(data.transactions);
        setInsurance(data.insurance);
        setMoneyFlow(data.moneyFlow);
        setInsights(data.insights);
        setHasActiveSimulation(Boolean(data.activeSimulationTx));
        setActiveSimulationTx(data.activeSimulationTx);
      }
    } catch (err) {
      console.warn('Backend loading, using local synthetic state:', err);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Calculate transaction simulation before applying
  const handleCalculateSimulation = async (
    amount: number,
    category: TransactionCategory,
    date: string,
    type: TransactionType
  ): Promise<{ impact: ScenarioImpact; simulatedTx: Transaction }> => {
    try {
      const res = await fetch('/api/simulate-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, date, type }),
      });
      if (res.ok) {
        const data = await res.json();
        return { impact: data.impact, simulatedTx: data.simulatedTx };
      }
    } catch (err) {
      console.warn('Calculating client-side deterministic impact:', err);
    }

    const impact = calculateScenarioImpact('transaction', amount, {
      category,
      currentBalance: snapshot.availableBalance,
      currentBuffer: snapshot.projectedBuffer,
      monthlyIncome: snapshot.monthlyIncome,
      commitments,
    });

    const simulatedTx: Transaction = {
      id: `sim_tx_${Date.now()}`,
      date: `${date}, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      merchant: `Simulated: ${category} Payment`,
      category,
      amount,
      type,
      status: 'simulated',
      isSimulated: true,
    };

    return { impact, simulatedTx };
  };

  // Apply simulated transaction to session
  const handleApplySimulation = async (simulatedTx: Transaction, _impact: ScenarioImpact) => {
    try {
      await fetch('/api/apply-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulatedTx }),
      });
      await fetchState();
    } catch (err) {
      console.error('Apply simulation error:', err);
      // Fallback local update
      setActiveSimulationTx(simulatedTx);
      setHasActiveSimulation(true);
      setTransactions((prev) => [simulatedTx, ...prev]);
      setSnapshot((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - simulatedTx.amount,
        projectedBuffer: prev.projectedBuffer - simulatedTx.amount,
      }));
    }
  };

  // Reset Simulation
  const handleResetSimulation = async () => {
    try {
      await fetch('/api/reset-simulation', { method: 'POST' });
      await fetchState();
    } catch (err) {
      console.error('Reset simulation error:', err);
      setHasActiveSimulation(false);
      setActiveSimulationTx(null);
      setSnapshot(initialSnapshot);
      setTransactions(initialTransactions);
      setForecast(initialForecast);
    }
  };

  // Reset Entire Demo
  const handleResetAll = async () => {
    await handleResetSimulation();
  };

  // Add commitment
  const handleAddCommitment = async (cmt: Partial<Commitment>) => {
    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmt),
      });
      if (res.ok) {
        await fetchState();
        return;
      }
    } catch (err) {
      console.error('Add commitment error:', err);
    }

    const newCommitment: Commitment = {
      id: `cmt_custom_${Date.now()}`,
      name: cmt.name || 'New Commitment',
      amount: cmt.amount || 1500,
      category: cmt.category || 'Bills',
      frequency: cmt.frequency || 'Monthly',
      dueDate: cmt.dueDate || '24 Sep',
      dueDay: cmt.dueDay || 24,
      status: 'UPCOMING',
      projectedImpact: cmt.projectedImpact || 'Custom obligation added to forecast schedule.',
    };
    setCommitments((prev) => [...prev, newCommitment]);
  };

  // Fetch Report Data
  const handleFetchReportData = async (period: ReportPeriod): Promise<ReportData> => {
    try {
      const res = await fetch(`/api/report?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        return data.report;
      }
    } catch (err) {
      console.error('Fetch report error:', err);
    }

    // Deterministic fallback report object
    return {
      period,
      periodLabel: period === 'today' ? 'Today' : period === 'weekly' ? 'Weekly' : 'Monthly (September 2026)',
      generatedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      snapshot,
      aiFinancialBrief:
        'Your cash flow for September 2026 reflects disciplined fixed obligation management with available balance standing at ₹28,000 and month-end projected buffer at ₹9,500. Week 3 constitutes the primary pressure period.',
      notableChanges: [
        'Shopping category velocity is +18% higher than typical bi-weekly pace.',
        'Rent (₹12,000) and EMI (₹6,500) successfully completed in Weeks 1 & 2.',
        'Health Insurance annual renewal (₹12,000) upcoming on 25 Sep.',
      ],
      spendingByCategory: [
        { category: 'Apartment Rent', amount: 12000, percentage: 28, changeVsPrior: 0 },
        { category: 'Appliance EMI', amount: 6500, percentage: 15, changeVsPrior: 0 },
        { category: 'Food & Dining', amount: 5800, percentage: 14, changeVsPrior: -4 },
        { category: 'Shopping', amount: 4200, percentage: 10, changeVsPrior: 18 },
        { category: 'Travel & Commute', amount: 3000, percentage: 7, changeVsPrior: 2 },
        { category: 'Broadband & Utilities', amount: 1500, percentage: 4, changeVsPrior: 0 },
      ],
      commitments,
      insurancePolicies: insurance,
      forecast,
      moneyFlow,
      pressurePeriods: [
        {
          period: 'Week 3 (Days 15–21)',
          reason: 'Accumulated outflows from Rent & EMI with utility bills and living pace.',
          level: 'High',
          buffer: 6400,
        },
      ],
      transactions: transactions.slice(0, 15),
      hasSimulation: hasActiveSimulation,
      simulationDetails: null,
    };
  };

  // Copilot Query Handler
  const handleCopilotQuery = async (query: string) => {
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Using client-side copilot reasoning fallback:', err);
    }

    // Grounded fallback
    if (query.toLowerCase().includes('week 3') || query.toLowerCase().includes('pressure')) {
      return {
        answer:
          'Week 3 is your primary pressure period because Rent (₹12,000 on 5th) and your appliance EMI (₹6,500 on 12th) have cleared, while your broadband bill (₹1,500 on 20th) and normal daily living expenses reduce your liquid liquidity to its lowest projected floor of ₹6,400.',
        groundedFacts: [
          'Rent paid: ₹12,000',
          'EMI paid: ₹6,500',
          'Upcoming utility: ₹1,500 on 20 Sep',
          'Lowest balance floor: ₹6,400',
        ],
        actionSuggestion: {
          type: 'view_forecast',
          label: 'Inspect Forecast Trajectory',
        },
      };
    }

    if (query.toLowerCase().includes('loan') || query.toLowerCase().includes('lakh')) {
      return {
        answer:
          'A ₹2,00,000 loan at 12% over 36 months requires an EMI of approximately ₹6,643/month. Adding this to your existing EMI (₹6,500) brings total monthly debt obligations to ₹13,143 (25.3% of salary), reducing your monthly buffer from ₹9,500 to ~₹2,857.',
        groundedFacts: [
          'Calculated EMI: ~₹6,643/month',
          'Existing EMI: ₹6,500/month',
          'Combined Debt: ₹13,143/month',
          'New buffer: ~₹2,857',
        ],
        actionSuggestion: {
          type: 'simulate_loan',
          label: 'Open Loan What-If Simulator',
        },
      };
    }

    return {
      answer: `Your available liquid balance is ₹${snapshot.availableBalance.toLocaleString(
        'en-IN'
      )}, with a projected month-end safety buffer of ₹${snapshot.projectedBuffer.toLocaleString(
        'en-IN'
      )}. Scheduled commitments for this cycle total ₹32,000.`,
      groundedFacts: [
        `Available Balance: ₹${snapshot.availableBalance.toLocaleString('en-IN')}`,
        `Projected Buffer: ₹${snapshot.projectedBuffer.toLocaleString('en-IN')}`,
        'Cash-Flow Health: 72/100',
      ],
      actionSuggestion: {
        type: 'simulate_tx',
        label: 'Test Transaction Impact',
      },
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Global Navbar */}
      <Navbar
        user={user}
        snapshot={snapshot}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onResetAll={handleResetAll}
        onOpenCopilot={() => setActiveTab('copilot')}
        hasActiveSimulation={hasActiveSimulation}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          healthScore={snapshot.cashFlowHealth}
          onOpenHealthModal={() => setIsHealthModalOpen(true)}
          hasActiveSimulation={hasActiveSimulation}
          className="hidden md:flex"
        />

        {/* Mobile Drawer Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 bg-slate-900 border-r border-slate-800 p-4">
              <Sidebar
                currentTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                healthScore={snapshot.cashFlowHealth}
                onOpenHealthModal={() => {
                  setIsHealthModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                hasActiveSimulation={hasActiveSimulation}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Active Simulation Floating Banner (Section 5) */}
          {hasActiveSimulation && (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-300">
                      SIMULATION ACTIVE: NO REAL PAYMENT MADE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Testing ₹{activeSimulationTx?.amount.toLocaleString('en-IN')} spend at{' '}
                    {activeSimulationTx?.merchant}. Your live balance reflects this scenario.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  Modify Spend
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 transition cursor-pointer"
                >
                  Reset to Baseline
                </button>
              </div>
            </div>
          )}

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <DashboardView
              snapshot={snapshot}
              forecast={forecast}
              commitments={commitments}
              transactions={transactions}
              insights={insights}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
              onNavigateTab={setActiveTab}
              hasActiveSimulation={hasActiveSimulation}
              activeSimulationTx={activeSimulationTx}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowView
              snapshot={snapshot}
              forecast={forecast}
              moneyFlow={moneyFlow}
              commitments={commitments}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'commitments' && (
            <CommitmentsView
              commitments={commitments}
              insurance={insurance}
              projectedBuffer={snapshot.projectedBuffer}
              onAddCommitment={handleAddCommitment}
              onNavigateWhatIf={(_type, _payload) => {
                setActiveTab('whatif');
              }}
            />
          )}

          {activeTab === 'whatif' && (
            <WhatIfView
              currentBalance={snapshot.availableBalance}
              currentBuffer={snapshot.projectedBuffer}
              monthlyIncome={snapshot.monthlyIncome}
              commitments={commitments}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'insights' && (
            <AiInsightsView
              insights={insights}
              onNavigateTab={setActiveTab}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView onFetchReportData={handleFetchReportData} />
          )}

          {activeTab === 'copilot' && (
            <AiCopilotView
              onSendQuery={handleCopilotQuery}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onNavigateTab={setActiveTab}
              initialQuery={copilotQuery}
            />
          )}
        </main>
      </div>

      {/* Hero Live Simulator Modal */}
      <LiveTransactionSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentBalance={snapshot.availableBalance}
        currentBuffer={snapshot.projectedBuffer}
        onApplySimulation={handleApplySimulation}
        onResetSimulation={handleResetSimulation}
        activeSimulationTx={activeSimulationTx}
        onCalculateSimulation={handleCalculateSimulation}
      />

      {/* Health Breakdown Modal */}
      <HealthBreakdownModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        health={financialHealth}
        creditScoreDemo={user.creditScoreDemo}
      />

      {/* 9-Step Hackathon Demo Tour Guide Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenCopilotWithQuery={(q) => {
          setCopilotQuery(q);
          setActiveTab('copilot');
        }}
      />
    </div>
  );
}

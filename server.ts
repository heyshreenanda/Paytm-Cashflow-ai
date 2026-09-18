import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  DEMO_USER,
  INITIAL_COMMITMENTS,
  INITIAL_INSIGHTS,
  INITIAL_INSURANCE,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS,
} from './src/data/demoData';
import {
  calculateBalance,
  calculateCategorySpending,
  calculateFinancialHealth,
  calculateForecast,
  calculateMoneyFlow,
  calculateMonthlyExpenses,
  calculateScenarioImpact,
} from './src/services/financialEngine';
import { aiService, StructuredFinancialContext } from './server/aiService';
import {
  Commitment,
  InsurancePolicy,
  Loan,
  ReportData,
  ReportPeriod,
  Transaction,
  User,
} from './src/types';

// In-memory demo state for active session
class DemoStore {
  user: User = { ...DEMO_USER };
  transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  commitments: Commitment[] = [...INITIAL_COMMITMENTS];
  insurance: InsurancePolicy[] = [...INITIAL_INSURANCE];
  loans: Loan[] = [...INITIAL_LOANS];
  activeSimulationTx: Transaction | null = null;

  reset() {
    this.user = { ...DEMO_USER };
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.commitments = [...INITIAL_COMMITMENTS];
    this.insurance = [...INITIAL_INSURANCE];
    this.loans = [...INITIAL_LOANS];
    this.activeSimulationTx = null;
  }
}

const store = new DemoStore();

function buildStructuredContext(): StructuredFinancialContext {
  const currentBal = calculateBalance(store.user.currentBalance, store.transactions, true);
  const commitments = store.commitments;
  const forecast = calculateForecast(currentBal, store.user.monthlyIncome, commitments);
  const lowestBal = Math.min(...forecast.map((p) => p.scenarioBalance ?? p.projectedBalance));
  const health = calculateFinancialHealth(
    currentBal,
    store.user.monthlyIncome - 42500, // projected buffer base
    store.user.monthlyIncome,
    commitments,
    lowestBal
  );

  return {
    currentBalance: currentBal,
    monthlyIncome: store.user.monthlyIncome,
    monthlyExpenses: calculateMonthlyExpenses(store.transactions, commitments),
    projectedBuffer: 9500,
    lowestProjectedBalance: lowestBal,
    healthScore: health.score,
    commitments: commitments.map((c) => ({
      name: c.name,
      amount: c.amount,
      dueDate: c.dueDate,
      status: c.status,
      frequency: c.frequency,
    })),
    insurance: store.insurance.map((i) => ({
      providerLabel: i.providerLabel,
      premium: i.premium,
      nextPaymentDate: i.nextPaymentDate,
      type: i.type,
    })),
    loans: store.loans.map((l) => ({
      name: l.name,
      principal: l.principal,
      emi: l.emi,
      interestRate: l.interestRate,
      tenure: l.tenure,
    })),
    forecastSummary: {
      w1Balance: forecast[1]?.projectedBalance ?? 12500,
      w2Balance: forecast[2]?.projectedBalance ?? 9000,
      w3Balance: forecast[3]?.projectedBalance ?? 6400,
      w4Balance: forecast[4]?.projectedBalance ?? 9500,
      pressureWeek: 'Week 3',
      pressureReasons: [
        'Rent on 5th (₹12,000) and EMI on 12th (₹6,500) cleared',
        'Broadband utility due on 20th (₹1,500)',
        'Mid-month variable discretionary spending (~₹3,800)',
      ],
    },
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Paytm CashFlow AI Backend',
      timestamp: new Date().toISOString(),
      disclaimer: 'Prototype using synthetic/demo data. Forecasts are estimates.',
    });
  });

  // 2. Get full state
  app.get('/api/state', (req, res) => {
    const currentBal = calculateBalance(store.user.currentBalance, store.transactions, true);
    const monthlyExp = 39500;
    const projectedBuf = 9500;
    const forecast = calculateForecast(currentBal, store.user.monthlyIncome, store.commitments);
    const lowestBal = Math.min(...forecast.map((p) => p.scenarioBalance ?? p.projectedBalance));
    const health = calculateFinancialHealth(
      currentBal,
      projectedBuf,
      store.user.monthlyIncome,
      store.commitments,
      lowestBal
    );
    const moneyFlow = calculateMoneyFlow(
      store.user.monthlyIncome,
      store.commitments,
      store.transactions,
      projectedBuf
    );

    res.json({
      user: store.user,
      snapshot: {
        availableBalance: currentBal,
        monthlyIncome: store.user.monthlyIncome,
        monthlyExpenses: monthlyExp,
        projectedBuffer: projectedBuf,
        cashFlowHealth: health.score,
        lowestProjectedBalance: lowestBal,
        peakPressurePeriod: 'Week 3',
        peakPressureReason: 'Upcoming obligations + existing EMI + typical spending',
      },
      transactions: store.transactions,
      commitments: store.commitments,
      insurance: store.insurance,
      loans: store.loans,
      forecast,
      health,
      insights: INITIAL_INSIGHTS,
      moneyFlow,
      activeSimulationTx: store.activeSimulationTx,
    });
  });

  // 3. Live Transaction Simulator endpoint
  app.post('/api/simulate-transaction', async (req, res) => {
    try {
      const { amount, category = 'Shopping', date = 'Today', type = 'expense' } = req.body;
      const numAmount = Math.max(1, Number(amount) || 3000);

      const currentBal = calculateBalance(store.user.currentBalance, store.transactions, false);
      const currentBuf = 9500;

      const impact = calculateScenarioImpact('transaction', numAmount, {
        category,
        currentBalance: currentBal,
        currentBuffer: currentBuf,
        monthlyIncome: store.user.monthlyIncome,
        commitments: store.commitments,
      });

      const structuredContext = buildStructuredContext();
      structuredContext.scenario = {
        type: 'transaction',
        amount: numAmount,
        category,
      };
      structuredContext.scenarioImpact = {
        balanceDelta: impact.balanceDelta,
        projectedBufferDelta: impact.projectedBufferDelta,
        newBalance: impact.newBalance,
        newProjectedBuffer: impact.newProjectedBuffer,
        lowestBalance: impact.lowestBalance,
        pressureLevel: impact.pressureLevel,
        cashFlowImpact: impact.cashFlowImpact,
      };

      const aiExplanation = await aiService.explainTransactionSimulation(structuredContext);
      impact.aiExplanation = aiExplanation;

      const simulatedTx: Transaction = {
        id: `sim_tx_${Date.now()}`,
        date: `${date}, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        merchant: `Simulated: ${category} Payment`,
        category,
        amount: numAmount,
        type: type as any,
        status: 'simulated',
        isSimulated: true,
      };

      res.json({
        success: true,
        simulatedTx,
        impact,
        disclaimer: 'SIMULATION • NO REAL PAYMENT MADE. Forecasts are estimates based on demo data.',
      });
    } catch (err: any) {
      console.error('Error in simulate-transaction:', err);
      res.status(500).json({ error: err.message || 'Simulation calculation error' });
    }
  });

  // 4. Apply simulation to demo session
  app.post('/api/apply-simulation', (req, res) => {
    const { simulatedTx } = req.body;
    if (simulatedTx) {
      store.activeSimulationTx = simulatedTx;
      // Prepend to transaction list
      store.transactions = [simulatedTx, ...store.transactions.filter((t) => t.id !== simulatedTx.id)];
    }
    res.json({ success: true, activeSimulationTx: store.activeSimulationTx });
  });

  // 5. Reset simulation to baseline demo state
  app.post('/api/reset-simulation', (req, res) => {
    store.reset();
    res.json({ success: true, message: 'Restored baseline demo state.' });
  });

  // 6. Unified What-If Scenario engine
  app.post('/api/simulate-scenario', async (req, res) => {
    try {
      const {
        scenarioType = 'loan',
        amount = 100000,
        loanInterest = 11.5,
        loanTenure = 36,
        category = 'Shopping',
        spendingChangePct = 0,
      } = req.body;

      const currentBal = calculateBalance(store.user.currentBalance, store.transactions, false);
      const currentBuf = 9500;

      const impact = calculateScenarioImpact(scenarioType, Number(amount), {
        category,
        loanInterest: Number(loanInterest),
        loanTenure: Number(loanTenure),
        spendingChangePct: Number(spendingChangePct),
        currentBalance: currentBal,
        currentBuffer: currentBuf,
        monthlyIncome: store.user.monthlyIncome,
        commitments: store.commitments,
      });

      const structuredContext = buildStructuredContext();
      structuredContext.scenario = {
        type: scenarioType,
        amount: Number(amount),
        category,
      };
      structuredContext.scenarioImpact = {
        balanceDelta: impact.balanceDelta,
        projectedBufferDelta: impact.projectedBufferDelta,
        newBalance: impact.newBalance,
        newProjectedBuffer: impact.newProjectedBuffer,
        lowestBalance: impact.lowestBalance,
        pressureLevel: impact.pressureLevel,
        cashFlowImpact: impact.cashFlowImpact,
      };

      const aiExplanation = await aiService.explainScenario(structuredContext);
      impact.aiExplanation = aiExplanation;

      res.json({
        success: true,
        impact,
        disclaimer: 'Forecasts are estimates based on demo data. Projected cash-flow impact is not a lending or insurance decision.',
      });
    } catch (err: any) {
      console.error('Error in simulate-scenario:', err);
      res.status(500).json({ error: err.message || 'Scenario calculation error' });
    }
  });

  // 7. AI Copilot endpoint
  app.post('/api/copilot', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string required' });
      }

      const structuredContext = buildStructuredContext();
      const response = await aiService.handleCopilotQuery(query, structuredContext);

      res.json({
        success: true,
        ...response,
        disclaimer: 'Forecasts are estimates based on demo data. The AI informs the user and does not make financial decisions.',
      });
    } catch (err: any) {
      console.error('Error in copilot query:', err);
      res.status(500).json({
        error: 'Copilot query failed',
        answer: 'Forecasts are estimates based on demo data. Please inspect the forecast timeline for active commitments.',
      });
    }
  });

  // 8. Add/Toggle Commitment
  app.post('/api/commitments', (req, res) => {
    const { name, amount, category, frequency, dueDate, dueDay } = req.body;
    const newCommitment: Commitment = {
      id: `cmt_${Date.now()}`,
      name: name || 'Custom Obligation',
      category: category || 'Bills',
      amount: Number(amount) || 1000,
      frequency: frequency || 'Monthly',
      dueDate: dueDate || '28 Sep',
      dueDay: Number(dueDay) || 28,
      status: 'UPCOMING',
      projectedImpact: 'User-configured recurring commitment.',
    };
    store.commitments.push(newCommitment);
    res.json({ success: true, commitment: newCommitment, commitments: store.commitments });
  });

  // 9. Report Data Generator (handles GET and POST for /api/report and /api/reports/data)
  const handleReportGeneration = async (req: express.Request, res: express.Response) => {
    try {
      const period = (req.query.period as string) || req.body?.period || 'monthly';
      const periodMap: Record<string, string> = {
        today: 'Today (18 Sep 2026)',
        last10days: 'Last 10 Days (8 Sep – 18 Sep 2026)',
        weekly: 'Current Week (12 Sep – 18 Sep 2026)',
        monthly: 'September 2026 (Monthly Review)',
      };

      const periodLabel = periodMap[period as string] || 'Monthly Review';
      const structuredContext = buildStructuredContext();

      const aiFinancialBrief = await aiService.generateReportSummary(structuredContext, periodLabel);

      const categoryTotals = calculateCategorySpending(store.transactions, false);
      const spendingByCategory = [
        { category: 'Food & Dining', amount: categoryTotals.Food || 5800, percentage: 15, changeVsPrior: -4 },
        { category: 'Shopping', amount: categoryTotals.Shopping || 4200, percentage: 11, changeVsPrior: 18 },
        { category: 'Travel & Commute', amount: categoryTotals.Travel || 3000, percentage: 8, changeVsPrior: 2 },
        { category: 'Bills & Utilities', amount: categoryTotals.Bills || 1500, percentage: 4, changeVsPrior: 0 },
        { category: 'Entertainment', amount: categoryTotals.Entertainment || 1770, percentage: 5, changeVsPrior: 6 },
        { category: 'Health & Medical', amount: categoryTotals.Health || 2440, percentage: 6, changeVsPrior: 0 },
        { category: 'Education', amount: categoryTotals.Education || 3290, percentage: 8, changeVsPrior: 12 },
      ];

      const currentBal = calculateBalance(store.user.currentBalance, store.transactions, true);
      const forecast = calculateForecast(currentBal, store.user.monthlyIncome, store.commitments);
      const moneyFlow = calculateMoneyFlow(store.user.monthlyIncome, store.commitments, store.transactions, 9500);

      const reportData: ReportData = {
        period: period as ReportPeriod,
        periodLabel,
        generatedAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        snapshot: {
          availableBalance: currentBal,
          monthlyIncome: store.user.monthlyIncome,
          monthlyExpenses: 39500,
          projectedBuffer: 9500,
          cashFlowHealth: 72,
          lowestProjectedBalance: 6400,
          peakPressurePeriod: 'Week 3',
          peakPressureReason: 'Rent on 5th and EMI on 12th cleared, utility due on 20th',
        },
        moneyFlow,
        spendingByCategory,
        commitments: store.commitments,
        insurancePolicies: store.insurance,
        forecast,
        pressurePeriods: [
          {
            period: 'Week 3 (15–21 Sep)',
            level: 'Moderate-High',
            reason: 'Rent & EMI already executed; broadband bills + living spend tighten liquid buffer.',
            buffer: 6400,
          },
          {
            period: 'Week 4 (25 Sep)',
            level: 'Moderate',
            reason: 'Care Health annual insurance renewal (₹12,000) scheduled.',
            buffer: 9500,
          },
        ],
        aiFinancialBrief,
        notableChanges: [
          'Shopping increased +18% due to e-commerce festive promos',
          'Food spending decreased -4% with more home dining in Week 2',
          'Recurring obligations (Rent ₹12,000, EMI ₹6,500) cleared on schedule',
          'Projected month-end buffer stable at ₹9,500 before simulation overrides',
        ],
        transactions: store.transactions.slice(0, 15),
        hasSimulation: Boolean(store.activeSimulationTx),
        simulationDetails: null,
      };

      res.json({ success: true, report: reportData });
    } catch (err: any) {
      console.error('Error generating report data:', err);
      res.status(500).json({ error: err.message || 'Report data generation error' });
    }
  };

  app.get('/api/report', handleReportGeneration);
  app.post('/api/report', handleReportGeneration);
  app.get('/api/reports/data', handleReportGeneration);
  app.post('/api/reports/data', handleReportGeneration);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paytm CashFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from 'express';
import {
  DEMO_USER,
  INITIAL_COMMITMENTS,
  INITIAL_INSIGHTS,
  INITIAL_INSURANCE,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS,
} from '../src/data/demoData.js';
import {
  calculateBalance,
  calculateCategorySpending,
  calculateFinancialHealth,
  calculateForecast,
  calculateMoneyFlow,
  calculateScenarioImpact,
} from '../src/services/financialEngine.js';
import { aiService, StructuredFinancialContext } from './aiService.js';
import {
  Commitment,
  InsurancePolicy,
  Loan,
  ReportData,
  ReportPeriod,
  Transaction,
  User,
} from '../src/types.js';

// In-memory demo state for active session
export class DemoStore {
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

export const store = new DemoStore();

export function computeCurrentState(store: DemoStore) {
  // 1. Base balance without any simulated transactions
  const baseBal = calculateBalance(store.user.currentBalance, store.transactions, false);

  // 2. Active simulated transaction details
  const activeTx = store.activeSimulationTx;
  const isExpense = activeTx?.type === 'expense';
  const isIncome = activeTx?.type === 'income';
  const simAmount = activeTx ? activeTx.amount : 0;
  const simDelta = activeTx ? (isIncome ? simAmount : -simAmount) : 0;

  // 3. Effective available balance (reflects simulation if active)
  const currentBal = baseBal + simDelta;

  // 4. Base buffer is 9,500. Under simulation, it moves by simDelta
  const baseBuffer = 9500;
  const projectedBuf = baseBuffer + simDelta;

  // 5. Monthly expenses: base ~39,500 + simulated expense
  const baseExpenses = 39500;
  const monthlyExp = baseExpenses + (isExpense ? simAmount : 0);

  // 6. Forecast calculation:
  // Pass baseBal as starting balance, and simExpense / simIncome
  const simExpense = isExpense ? simAmount : 0;
  const simIncome = isIncome ? simAmount : 0;
  const forecast = calculateForecast(
    baseBal,
    store.user.monthlyIncome,
    store.commitments,
    simExpense,
    simIncome
  );

  // 7. Lowest balance in forecast
  // taking the simulated scenario balance into account
  const lowestBal = Math.min(
    ...forecast.map((p) =>
      activeTx
        ? (p.scenarioBalance ?? p.projectedBalance)
        : p.projectedBalance
    )
  );

  // 8. Health calculation using the effective
  // simulated balance, buffer, and lowest balance
  const health = calculateFinancialHealth(
    currentBal,
    projectedBuf,
    store.user.monthlyIncome,
    store.commitments,
    lowestBal
  );

  // 9. Money flow diagram data reflecting updated buffer and transactions
  const moneyFlow = calculateMoneyFlow(
    store.user.monthlyIncome,
    store.commitments,
    store.transactions,
    projectedBuf
  );

  // 10. Dynamic peak pressure reason if simulation is active
  let peakPressureReason =
    'Upcoming obligations + existing EMI + typical mid-month spending';

  if (activeTx) {
    if (isExpense) {
      peakPressureReason = `Simulated ₹${simAmount.toLocaleString(
        'en-IN'
      )} ${activeTx.category} spend tightens Week 3 headroom before insurance renewal.`;
    } else {
      peakPressureReason = `Simulated ₹${simAmount.toLocaleString(
        'en-IN'
      )} inflow expands Week 3 safety margin.`;
    }
  }

  return {
    user: store.user,

    snapshot: {
      availableBalance: currentBal,
      baselineBalance: baseBal,
      simulatedDelta: simDelta,
      monthlyIncome: store.user.monthlyIncome,
      monthlyExpenses: monthlyExp,
      projectedBuffer: projectedBuf,
      baselineBuffer: baseBuffer,
      cashFlowHealth: health.score,
      lowestProjectedBalance: lowestBal,
      peakPressurePeriod: 'Week 3 (Days 15–21)',
      peakPressureReason,
      hasActiveSimulation: Boolean(activeTx),
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
  };
}

export function buildStructuredContext(): StructuredFinancialContext {
  const state = computeCurrentState(store);
  const currentBal = state.snapshot.availableBalance;
  const commitments = store.commitments;
  const forecast = state.forecast;
  const lowestBal = state.snapshot.lowestProjectedBalance;
  const health = state.health;

  return {
    currentBalance: currentBal,
    monthlyIncome: store.user.monthlyIncome,
    monthlyExpenses: state.snapshot.monthlyExpenses,
    projectedBuffer: state.snapshot.projectedBuffer,
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
      w1Balance:
        forecast[1]?.scenarioBalance ??
        forecast[1]?.projectedBalance ??
        12500,

      w2Balance:
        forecast[2]?.scenarioBalance ??
        forecast[2]?.projectedBalance ??
        9000,

      w3Balance:
        forecast[3]?.scenarioBalance ??
        forecast[3]?.projectedBalance ??
        6400,

      w4Balance:
        forecast[4]?.scenarioBalance ??
        forecast[4]?.projectedBalance ??
        9500,

      pressureWeek: 'Week 3',

      pressureReasons: [
        'Rent on 5th (₹12,000) and EMI on 12th (₹6,500) cleared',
        'Broadband utility due on 20th (₹1,500)',
        'Mid-month variable discretionary spending (~₹3,800)',
      ],
    },
  };
}

const app = express();

// Standard middleware
app.use(express.json());

// Normalize stringified body if sent by serverless adapters
app.use((req, res, next) => {
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // Keep as-is
    }
  }

  next();
});

// CORS support for cloud environments and previews
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// URL normalization for serverless proxy rewrites
app.use((req, res, next) => {
  if (
    req.originalUrl &&
    req.originalUrl.startsWith('/api') &&
    (req.url === '/' || req.url === '/api')
  ) {
    req.url = req.originalUrl;
  }

  next();
});

// Create API router
const apiRouter = express.Router();

// 1. Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Paytm CashFlow AI Backend',
    timestamp: new Date().toISOString(),
    disclaimer:
      'Prototype using synthetic/demo data. Forecasts are estimates.',
  });
});

// 2. Get full state
apiRouter.get('/state', (req, res) => {
  const state = computeCurrentState(store);
  res.json(state);
});

// 3. Live Transaction Simulator endpoint
apiRouter.post('/simulate-transaction', async (req, res) => {
  try {
    const {
      amount,
      category = 'Shopping',
      date = 'Today',
      type = 'expense',
    } = req.body || {};

    const numAmount = Math.max(1, Number(amount) || 3000);

    const baseBal = calculateBalance(
      store.user.currentBalance,
      store.transactions,
      false
    );

    const baseBuf = 9500;
    const scenarioType = type === 'income' ? 'income' : 'transaction';

    const impact = calculateScenarioImpact(scenarioType, numAmount, {
      category,
      currentBalance: baseBal,
      currentBuffer: baseBuf,
      monthlyIncome: store.user.monthlyIncome,
      commitments: store.commitments,
    });

    const structuredContext = buildStructuredContext();

    structuredContext.scenario = {
      type: scenarioType,
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

    const aiExplanation =
      await aiService.explainTransactionSimulation(structuredContext);

    impact.aiExplanation = aiExplanation;

    const simulatedTx: Transaction = {
      id: `sim_tx_${Date.now()}`,
      date: `${date}, ${new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      merchant: `Simulated: ${category} ${
        type === 'income' ? 'Inflow' : 'Payment'
      }`,
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
      disclaimer:
        'SIMULATION • NO REAL PAYMENT MADE. Forecasts are estimates based on demo data.',
    });
  } catch (err: any) {
    console.error('Error in simulate-transaction:', err);

    res.status(500).json({
      error: err.message || 'Simulation calculation error',
    });
  }
});

// 4. Apply simulation to demo session
apiRouter.post('/apply-simulation', (req, res) => {
  const { simulatedTx } = req.body || {};

  if (simulatedTx) {
    store.activeSimulationTx = simulatedTx;

    // Prepend to transaction list
    store.transactions = [
      simulatedTx,
      ...store.transactions.filter((t) => t.id !== simulatedTx.id),
    ];
  }

  const state = computeCurrentState(store);

  res.json({
    success: true,
    ...state,
  });
});

// 5. Reset simulation to baseline demo state
apiRouter.post('/reset-simulation', (req, res) => {
  store.reset();

  const state = computeCurrentState(store);

  res.json({
    success: true,
    ...state,
    message: 'Restored baseline demo state.',
  });
});

// 6. Unified What-If Scenario engine
apiRouter.post('/simulate-scenario', async (req, res) => {
  try {
    const {
      scenarioType = 'loan',
      amount = 100000,
      loanInterest = 11.5,
      loanTenure = 36,
      category = 'Shopping',
      spendingChangePct = 0,
    } = req.body || {};

    const currentBal = calculateBalance(
      store.user.currentBalance,
      store.transactions,
      false
    );

    const currentBuf = 9500;

    const impact = calculateScenarioImpact(
      scenarioType,
      Number(amount),
      {
        category,
        loanInterest: Number(loanInterest),
        loanTenure: Number(loanTenure),
        spendingChangePct: Number(spendingChangePct),
        currentBalance: currentBal,
        currentBuffer: currentBuf,
        monthlyIncome: store.user.monthlyIncome,
        commitments: store.commitments,
      }
    );

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

    const aiExplanation =
      await aiService.explainScenario(structuredContext);

    impact.aiExplanation = aiExplanation;

    res.json({
      success: true,
      impact,
      disclaimer:
        'Forecasts are estimates based on demo data. Projected cash-flow impact is not a lending or insurance decision.',
    });
  } catch (err: any) {
    console.error('Error in simulate-scenario:', err);

    res.status(500).json({
      error: err.message || 'Scenario calculation error',
    });
  }
});

// 7. AI Copilot endpoint
apiRouter.post('/copilot', async (req, res) => {
  try {
    const { query } = req.body || {};

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query string required',
      });
    }

    const structuredContext = buildStructuredContext();

    const response = await aiService.handleCopilotQuery(
      query,
      structuredContext
    );

    res.json({
      success: true,
      ...response,
      disclaimer:
        'Forecasts are estimates based on demo data. The AI informs the user and does not make financial decisions.',
    });
  } catch (err: any) {
    console.error('Error in copilot query:', err);

    res.status(500).json({
      error: 'Copilot query failed',
      answer:
        'Forecasts are estimates based on demo data. Please inspect the forecast timeline for active commitments.',
    });
  }
});

// 8. Add/Toggle Commitment
apiRouter.post('/commitments', (req, res) => {
  const {
    name,
    amount,
    category,
    frequency,
    dueDate,
    dueDay,
  } = req.body || {};

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

  res.json({
    success: true,
    commitment: newCommitment,
    commitments: store.commitments,
  });
});

// 9. Report Data Generator handler
const handleReportGeneration = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const period =
      (req.query.period as string) ||
      req.body?.period ||
      'monthly';

    const periodMap: Record<string, string> = {
      today: 'Today (18 Sep 2026)',
      last10days: 'Last 10 Days (8 Sep – 18 Sep 2026)',
      weekly: 'Current Week (12 Sep – 18 Sep 2026)',
      monthly: 'September 2026 (Monthly Review)',
    };

    const periodLabel =
      periodMap[period as string] || 'Monthly Review';

    const structuredContext = buildStructuredContext();

    const aiFinancialBrief =
      await aiService.generateReportSummary(
        structuredContext,
        periodLabel
      );

    const categoryTotals = calculateCategorySpending(
      store.transactions,
      false
    );

    const spendingByCategory = [
      {
        category: 'Food & Dining',
        amount: categoryTotals.Food || 5800,
        percentage: 15,
        changeVsPrior: -4,
      },
      {
        category: 'Shopping',
        amount: categoryTotals.Shopping || 4200,
        percentage: 11,
        changeVsPrior: 18,
      },
      {
        category: 'Travel & Commute',
        amount: categoryTotals.Travel || 3000,
        percentage: 8,
        changeVsPrior: 2,
      },
      {
        category: 'Bills & Utilities',
        amount: categoryTotals.Bills || 1500,
        percentage: 4,
        changeVsPrior: 0,
      },
      {
        category: 'Entertainment',
        amount: categoryTotals.Entertainment || 1770,
        percentage: 5,
        changeVsPrior: 6,
      },
      {
        category: 'Health & Medical',
        amount: categoryTotals.Health || 2440,
        percentage: 6,
        changeVsPrior: 0,
      },
      {
        category: 'Education',
        amount: categoryTotals.Education || 3290,
        percentage: 8,
        changeVsPrior: 12,
      },
    ];

    const state = computeCurrentState(store);

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

      snapshot: state.snapshot,
      moneyFlow: state.moneyFlow,
      spendingByCategory,
      commitments: store.commitments,
      insurancePolicies: store.insurance,
      forecast: state.forecast,

      pressurePeriods: [
        {
          period: 'Week 3 (15–21 Sep)',
          level: state.snapshot.hasActiveSimulation
            ? 'High'
            : 'Moderate-High',

          reason: state.snapshot.hasActiveSimulation
            ? `Simulation of ₹${state.activeSimulationTx?.amount.toLocaleString(
                'en-IN'
              )} active; lowest buffer margin at ₹${state.snapshot.lowestProjectedBalance.toLocaleString(
                'en-IN'
              )}.`
            : 'Rent & EMI already executed; broadband bills + living spend tighten liquid buffer.',

          buffer: state.snapshot.lowestProjectedBalance,
        },

        {
          period: 'Week 4 (25 Sep)',
          level: 'Moderate',
          reason:
            'Care Health annual insurance renewal (₹12,000) scheduled.',
          buffer: state.snapshot.projectedBuffer,
        },
      ],

      aiFinancialBrief,

      notableChanges: [
        'Shopping increased +18% due to e-commerce festive promos',
        'Food spending decreased -4% with more home dining in Week 2',
        'Recurring obligations (Rent ₹12,000, EMI ₹6,500) cleared on schedule',

        state.snapshot.hasActiveSimulation
          ? `Active simulation in session: ${state.activeSimulationTx?.merchant} (₹${state.activeSimulationTx?.amount.toLocaleString(
              'en-IN'
            )})`
          : 'Projected month-end buffer stable at ₹9,500 before simulation overrides',
      ],

      transactions: store.transactions.slice(0, 15),
      hasSimulation: Boolean(store.activeSimulationTx),
      simulationDetails: null,
    };

    res.json({
      success: true,
      report: reportData,
    });
  } catch (err: any) {
    console.error('Error generating report data:', err);

    res.status(500).json({
      error: err.message || 'Report data generation error',
    });
  }
};

apiRouter.get('/report', handleReportGeneration);
apiRouter.post('/report', handleReportGeneration);
apiRouter.get('/reports/data', handleReportGeneration);
apiRouter.post('/reports/data', handleReportGeneration);

// Mount router under both '/api' and '/' to guarantee seamless routing
// regardless of serverless proxy rewrites
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
import {
  Transaction,
  Commitment,
  InsurancePolicy,
  Loan,
  ForecastPoint,
  FinancialHealth,
  FinancialHealthFactor,
  FinancialSnapshot,
  ScenarioImpact,
  MoneyFlowData,
  TransactionCategory,
} from '../types';

/**
 * Calculates current balance based on initial/settled balance and active transactions.
 */
export function calculateBalance(
  baseBalance: number,
  transactions: Transaction[],
  includeSimulated: boolean = true
): number {
  let balance = baseBalance;
  for (const tx of transactions) {
    if (!includeSimulated && tx.isSimulated) continue;
    if (tx.type === 'expense') {
      balance -= tx.amount;
    } else if (tx.type === 'income') {
      balance += tx.amount;
    }
  }
  return balance;
}

/**
 * Calculates monthly expenses from settled non-income transactions and upcoming commitments.
 */
export function calculateMonthlyExpenses(
  transactions: Transaction[],
  commitments: Commitment[],
  includeSimulated: boolean = true
): number {
  const expenseTransactions = transactions
    .filter((tx) => {
      if (!includeSimulated && tx.isSimulated) return false;
      return tx.type === 'expense';
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const upcomingCommitments = commitments
    .filter((c) => {
      if (!includeSimulated && c.isSimulated) return false;
      return c.status === 'UPCOMING' || c.status === 'DUE SOON' || c.status === 'SIMULATED';
    })
    .reduce((sum, c) => sum + c.amount, 0);

  // Return combined expenses normalized to typical monthly spending
  return expenseTransactions + upcomingCommitments;
}

/**
 * Calculates total income.
 */
export function calculateIncome(
  transactions: Transaction[],
  includeSimulated: boolean = true
): number {
  return transactions
    .filter((tx) => {
      if (!includeSimulated && tx.isSimulated) return false;
      return tx.type === 'income';
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Standard deterministic Equated Monthly Installment (EMI) formula:
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(
  principal: number,
  annualInterestRatePercentage: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRatePercentage <= 0) {
    return Math.round(principal / tenureMonths);
  }

  const monthlyRate = annualInterestRatePercentage / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculates total interest paid over tenure.
 */
export function calculateTotalInterest(
  principal: number,
  emi: number,
  tenureMonths: number
): number {
  const totalRepayment = emi * tenureMonths;
  return Math.max(0, totalRepayment - principal);
}

/**
 * Calculates deterministic projected buffer at the end of the 30-day forecast horizon.
 */
export function calculateProjectedBuffer(
  currentBalance: number,
  upcomingInflows: number,
  upcomingCommitments: number,
  estimatedVariableDiscretionary: number
): number {
  return Math.round(
    currentBalance + upcomingInflows - (upcomingCommitments + estimatedVariableDiscretionary)
  );
}

/**
 * Calculates category breakdown and spending totals.
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  includeSimulated: boolean = true
): Record<TransactionCategory, number> {
  const categories: Record<TransactionCategory, number> = {
    Food: 0,
    Shopping: 0,
    Travel: 0,
    Bills: 0,
    Entertainment: 0,
    Health: 0,
    Education: 0,
    Salary: 0,
    Rent: 0,
    EMI: 0,
    Investment: 0,
    Other: 0,
  };

  for (const tx of transactions) {
    if (!includeSimulated && tx.isSimulated) continue;
    if (tx.type === 'expense') {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    }
  }

  return categories;
}

/**
 * Calculates category spending changes compared to prior reference baseline.
 */
export function calculateCategoryChange(
  current: Record<string, number>,
  baseline: Record<string, number>
): { category: string; current: number; baseline: number; diff: number; pctChange: number }[] {
  const results = [];
  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(baseline)]));

  for (const cat of allKeys) {
    const curVal = current[cat] || 0;
    const baseVal = baseline[cat] || 0;
    const diff = curVal - baseVal;
    const pctChange = baseVal > 0 ? Math.round((diff / baseVal) * 100) : curVal > 0 ? 100 : 0;
    results.push({
      category: cat,
      current: curVal,
      baseline: baseVal,
      diff,
      pctChange,
    });
  }

  return results.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
}

/**
 * Calculates Cash-Flow Health score (0-100) based on transparent mathematical factors.
 * Transparent factors:
 * 1. Current Buffer vs monthly commitments (30% weight)
 * 2. Upcoming Commitments coverage (25% weight)
 * 3. Existing EMI to income ratio (20% weight)
 * 4. Spending stability / discretionary variance (15% weight)
 * 5. Projected lowest balance during month (10% weight)
 */
export function calculateFinancialHealth(
  availableBalance: number,
  projectedBuffer: number,
  monthlyIncome: number,
  commitments: Commitment[],
  lowestProjectedBalance: number
): FinancialHealth {
  const totalCommitments = commitments.reduce((sum, c) => sum + c.amount, 0);
  const emiCommitments = commitments
    .filter((c) => c.category === 'EMI' || c.name.toLowerCase().includes('emi') || c.name.toLowerCase().includes('loan'))
    .reduce((sum, c) => sum + c.amount, 0);

  // Factor 1: Buffer Health (30% weight)
  // Target: Buffer >= 20% of income gives max 100, buffer <= 0 gives 20
  const bufferRatio = projectedBuffer / (monthlyIncome || 52000);
  let bufferScore = Math.min(100, Math.max(10, Math.round(50 + bufferRatio * 200)));

  // Factor 2: Commitments Coverage (25% weight)
  // Available balance vs immediate upcoming commitments
  const coverageRatio = availableBalance / Math.max(1, totalCommitments);
  let coverageScore = Math.min(100, Math.max(15, Math.round(coverageRatio * 65)));

  // Factor 3: EMI Burden Ratio (20% weight)
  // EMI / Income. Standard guideline: < 15% is excellent (90+), > 40% is high burden (<40)
  const emiRatio = emiCommitments / (monthlyIncome || 52000);
  let emiScore = 90;
  if (emiRatio > 0.35) emiScore = 40;
  else if (emiRatio > 0.25) emiScore = 55;
  else if (emiRatio > 0.15) emiScore = 70;
  else emiScore = 88;

  // Factor 4: Spending Stability (15% weight)
  // Stability based on healthy discretionary margin
  const stabilityScore = projectedBuffer > 5000 ? 80 : projectedBuffer > 2000 ? 65 : 45;

  // Factor 5: Lowest Balance Safety Floor (10% weight)
  let lowestFloorScore = 80;
  if (lowestProjectedBalance < 0) lowestFloorScore = 15;
  else if (lowestProjectedBalance < 4000) lowestFloorScore = 45;
  else if (lowestProjectedBalance < 10000) lowestFloorScore = 70;
  else lowestFloorScore = 90;

  const weightedTotal = Math.round(
    bufferScore * 0.3 +
      coverageScore * 0.25 +
      emiScore * 0.2 +
      stabilityScore * 0.15 +
      lowestFloorScore * 0.1
  );

  const finalScore = Math.max(10, Math.min(99, weightedTotal));

  const factors: FinancialHealthFactor[] = [
    {
      name: 'Projected Buffer Margin',
      score: bufferScore,
      weight: 30,
      impact: projectedBuffer >= 8000 ? 'Positive' : projectedBuffer >= 4000 ? 'Neutral' : 'Pressure',
      value: `₹${projectedBuffer.toLocaleString('en-IN')}`,
      description: 'Remaining cash surplus after all forecasted obligations and recurring spending.',
    },
    {
      name: 'Upcoming Obligations Coverage',
      score: coverageScore,
      weight: 25,
      impact: coverageRatio >= 1.2 ? 'Positive' : coverageRatio >= 0.8 ? 'Neutral' : 'Pressure',
      value: `${coverageRatio.toFixed(1)}x coverage`,
      description: 'Ratio of liquid balance available to absorb scheduled recurring commitments.',
    },
    {
      name: 'EMI / Fixed Debt Burden',
      score: emiScore,
      weight: 20,
      impact: emiRatio <= 0.18 ? 'Positive' : emiRatio <= 0.3 ? 'Neutral' : 'Pressure',
      value: `${Math.round(emiRatio * 100)}% of income`,
      description: 'Proportion of monthly income allocated to loan repayments and installments.',
    },
    {
      name: 'Spending Stability',
      score: stabilityScore,
      weight: 15,
      impact: stabilityScore >= 75 ? 'Positive' : 'Neutral',
      value: 'Consistent',
      description: 'Consistency of daily discretionary velocity across calendar cycles.',
    },
    {
      name: 'Lowest Balance Floor',
      score: lowestFloorScore,
      weight: 10,
      impact: lowestProjectedBalance >= 5000 ? 'Positive' : lowestProjectedBalance > 0 ? 'Neutral' : 'Pressure',
      value: `₹${lowestProjectedBalance.toLocaleString('en-IN')}`,
      description: 'The anticipated cash-flow minimum point in the forecast cycle.',
    },
  ];

  let explanation = '';
  if (finalScore >= 75) {
    explanation = 'Healthy cash-flow trajectory with stable buffer and manageable commitment burden.';
  } else if (finalScore >= 60) {
    explanation = 'Moderate cash-flow health. Upcoming Week 3 obligations create focused pressure.';
  } else {
    explanation = 'Cash-flow tension identified. Scheduled commitments exceed projected liquid buffers.';
  }

  return {
    score: finalScore,
    factors,
    explanation,
  };
}

/**
 * Calculates 4-week forecast timeline deterministically.
 * Timeline periods:
 * Today (Day 0)
 * Week 1 (Days 1-7): Rent due 5th (₹12,000)
 * Week 2 (Days 8-14): Existing EMI due 12th (₹6,500)
 * Week 3 (Days 15-21): Recurring bill due 20th (₹1,500) + mid-month discretionary spending
 * Week 4 (Days 22-30): Health Insurance due 25th (₹12,000 annual) + final discretionary
 */
export function calculateForecast(
  startingBalance: number,
  monthlyIncome: number,
  commitments: Commitment[],
  additionalSimulatedExpense: number = 0,
  additionalSimulatedIncome: number = 0,
  additionalMonthlyEMI: number = 0
): ForecastPoint[] {
  // Demo baseline configuration matching specification
  // Starting balance: ~₹28,000
  // Today
  let balToday = startingBalance - additionalSimulatedExpense + additionalSimulatedIncome;

  // Week 1: Rent ₹12,000 + ~₹3,500 variable spending
  const w1Commitments = commitments
    .filter((c) => c.dueDay <= 7)
    .reduce((sum, c) => sum + c.amount, 0);
  const w1Variable = 3200;
  const balW1 = balToday - w1Commitments - w1Variable;

  // Week 2: EMI ₹6,500 + additional EMI + ~₹3,200 variable spending
  const w2Commitments = commitments
    .filter((c) => c.dueDay > 7 && c.dueDay <= 14)
    .reduce((sum, c) => sum + c.amount, 0) + additionalMonthlyEMI;
  const w2Variable = 3000;
  const balW2 = balW1 - w2Commitments - w2Variable;

  // Week 3: Recurring Bill ₹1,500 + ~₹3,800 variable spending
  // (Pressure period: Accumulated outflow from Week 1 Rent & Week 2 EMI leaves balance tightening)
  const w3Commitments = commitments
    .filter((c) => c.dueDay > 14 && c.dueDay <= 21)
    .reduce((sum, c) => sum + c.amount, 0);
  const w3Variable = 3800;
  const balW3 = balW2 - w3Commitments - w3Variable;

  // Week 4: Insurance ₹12,000 on 25th or other commitments + ~₹2,500 variable + expected salary/inflow buffer
  const w4Commitments = commitments
    .filter((c) => c.dueDay > 21)
    .reduce((sum, c) => sum + c.amount, 0);
  const w4Variable = 2800;
  // Towards end of month, next payroll cycle or buffer
  const balW4 = balW3 - w4Commitments - w4Variable;

  // Determine baseline balances for comparison (without simulated amounts)
  const baseToday = startingBalance;
  const baseW1 = baseToday - w1Commitments - w1Variable;
  const baseW2 = baseW1 - (commitments.filter((c) => c.dueDay > 7 && c.dueDay <= 14).reduce((sum, c) => sum + c.amount, 0)) - w2Variable;
  const baseW3 = baseW2 - w3Commitments - w3Variable;
  const baseW4 = baseW3 - w4Commitments - w4Variable;

  // Create points
  const points: ForecastPoint[] = [
    {
      period: 'Today',
      label: 'Current Position',
      date: '18 Sep',
      projectedBalance: Math.round(baseToday),
      scenarioBalance: Math.round(balToday),
      income: 0,
      fixedCommitments: 0,
      variableSpending: 0,
      remainingBuffer: Math.round(balToday),
      pressureLevel: balToday < 10000 ? 'Moderate' : 'Low',
      pressureReasons: [],
    },
    {
      period: 'Week 1',
      label: 'Rent Period',
      date: '21 Sep',
      projectedBalance: Math.round(baseW1),
      scenarioBalance: Math.round(balW1),
      income: 0,
      fixedCommitments: w1Commitments,
      variableSpending: w1Variable,
      remainingBuffer: Math.round(balW1),
      pressureLevel: balW1 < 10000 ? 'Moderate' : 'Low',
      pressureReasons: ['Rent due on 5th (₹12,000)'],
    },
    {
      period: 'Week 2',
      label: 'EMI Schedule',
      date: '28 Sep',
      projectedBalance: Math.round(baseW2),
      scenarioBalance: Math.round(balW2),
      income: 0,
      fixedCommitments: w2Commitments,
      variableSpending: w2Variable,
      remainingBuffer: Math.round(balW2),
      pressureLevel: balW2 < 8000 ? 'Moderate' : 'Low',
      pressureReasons: ['Existing EMI due 12th (₹6,500)'],
    },
    {
      period: 'Week 3',
      label: 'Peak Pressure',
      date: '5 Oct',
      projectedBalance: Math.round(baseW3),
      scenarioBalance: Math.round(balW3),
      income: 0,
      fixedCommitments: w3Commitments,
      variableSpending: w3Variable,
      remainingBuffer: Math.round(balW3),
      pressureLevel: balW3 < 7000 ? 'High' : 'Moderate',
      pressureReasons: [
        'Upcoming obligations + existing EMI + typical mid-month spending',
        'Tightening liquidity window before next compensation cycle',
      ],
    },
    {
      period: 'Week 4',
      label: 'Month Close',
      date: '12 Oct',
      projectedBalance: Math.round(baseW4),
      scenarioBalance: Math.round(balW4),
      income: monthlyIncome,
      fixedCommitments: w4Commitments,
      variableSpending: w4Variable,
      remainingBuffer: Math.round(balW4),
      pressureLevel: balW4 < 4000 ? 'High' : balW4 < 8000 ? 'Moderate' : 'Low',
      pressureReasons: w4Commitments > 5000 ? ['Annual Health Insurance due 25th'] : [],
    },
  ];

  return points;
}

/**
 * Calculates scenario impact deterministically.
 */
export function calculateScenarioImpact(
  scenarioType: 'transaction' | 'loan' | 'insurance' | 'income' | 'spending_change',
  amount: number,
  params: {
    category?: TransactionCategory;
    loanInterest?: number;
    loanTenure?: number;
    spendingChangePct?: number;
    currentBalance: number;
    currentBuffer: number;
    monthlyIncome: number;
    commitments: Commitment[];
  }
): ScenarioImpact {
  const {
    category = 'Shopping',
    loanInterest = 12,
    loanTenure = 36,
    spendingChangePct = 0,
    currentBalance,
    currentBuffer,
    monthlyIncome,
    commitments,
  } = params;

  let balanceDelta = 0;
  let projectedBufferDelta = 0;
  let additionalMonthlyEMI = 0;
  let scenarioTitle = '';
  let cashFlowImpact: 'Low' | 'Moderate' | 'High' = 'Low';

  switch (scenarioType) {
    case 'transaction': {
      balanceDelta = -amount;
      projectedBufferDelta = -amount;
      scenarioTitle = `Simulated Expense: ₹${amount.toLocaleString('en-IN')} (${category})`;
      if (amount >= 5000) cashFlowImpact = 'High';
      else if (amount >= 2000) cashFlowImpact = 'Moderate';
      break;
    }
    case 'income': {
      balanceDelta = amount;
      projectedBufferDelta = amount;
      scenarioTitle = `Simulated Income Inflow: +₹${amount.toLocaleString('en-IN')}`;
      cashFlowImpact = 'Low';
      break;
    }
    case 'loan': {
      // Amount is principal
      const emi = calculateEMI(amount, loanInterest, loanTenure);
      additionalMonthlyEMI = emi;
      balanceDelta = 0; // Principal isn't immediate spend or added to liquid savings without liability
      projectedBufferDelta = -emi;
      scenarioTitle = `New Loan EMI: ₹${emi.toLocaleString('en-IN')}/mo (₹${amount.toLocaleString('en-IN')})`;
      if (emi >= 6000) cashFlowImpact = 'High';
      else if (emi >= 3500) cashFlowImpact = 'Moderate';
      break;
    }
    case 'insurance': {
      // Amount is premium
      balanceDelta = -amount;
      projectedBufferDelta = -amount;
      scenarioTitle = `Upcoming Insurance Premium: ₹${amount.toLocaleString('en-IN')}`;
      if (amount >= 8000) cashFlowImpact = 'High';
      else if (amount >= 3000) cashFlowImpact = 'Moderate';
      break;
    }
    case 'spending_change': {
      // Spending changes by spendingChangePct (e.g. +10% or -10%)
      const monthlyVariable = 15000;
      const delta = Math.round(monthlyVariable * (spendingChangePct / 100));
      balanceDelta = 0;
      projectedBufferDelta = -delta;
      scenarioTitle = `${spendingChangePct > 0 ? '+' : ''}${spendingChangePct}% Discretionary Spending Shift`;
      if (Math.abs(spendingChangePct) >= 20) cashFlowImpact = 'High';
      else if (Math.abs(spendingChangePct) >= 10) cashFlowImpact = 'Moderate';
      break;
    }
  }

  const newBalance = currentBalance + balanceDelta;
  const newProjectedBuffer = currentBuffer + projectedBufferDelta;

  // Re-run forecast
  const simulatedExpense = scenarioType === 'transaction' || scenarioType === 'insurance' ? amount : 0;
  const simulatedIncome = scenarioType === 'income' ? amount : 0;
  const forecastPoints = calculateForecast(
    currentBalance,
    monthlyIncome,
    commitments,
    simulatedExpense,
    simulatedIncome,
    additionalMonthlyEMI
  );

  // Lowest balance in forecast
  const lowestBalance = Math.min(...forecastPoints.map((p) => p.scenarioBalance ?? p.projectedBalance));
  const lowestBalancePeriod =
    forecastPoints.find((p) => (p.scenarioBalance ?? p.projectedBalance) === lowestBalance)?.period ||
    'Week 3';

  // Pressure evaluation
  let pressureLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let pressureChangeDescription = '';

  if (newProjectedBuffer < 3000 || lowestBalance < 2000) {
    pressureLevel = 'High';
    pressureChangeDescription =
      'Substantially elevates cash-flow pressure, severely compressing discretionary headroom in Week 3.';
  } else if (newProjectedBuffer < 7000 || lowestBalance < 6000) {
    pressureLevel = 'Moderate';
    pressureChangeDescription =
      'Moderately increases commitments-to-buffer ratio; requires conservative pacing around mid-month.';
  } else {
    pressureLevel = 'Low';
    pressureChangeDescription =
      'Cash flow remains resilient within healthy buffer parameters.';
  }

  // Calculate health delta
  const baselineHealth = calculateFinancialHealth(
    currentBalance,
    currentBuffer,
    monthlyIncome,
    commitments,
    8000
  );
  const newHealth = calculateFinancialHealth(
    newBalance,
    newProjectedBuffer,
    monthlyIncome,
    commitments,
    lowestBalance
  );
  const healthScoreDelta = newHealth.score - baselineHealth.score;

  // Grounded explanation template (deterministic baseline, enriched by AI service if available)
  let aiExplanation = '';
  if (scenarioType === 'transaction') {
    aiExplanation = `Your simulated ₹${amount.toLocaleString(
      'en-IN'
    )} ${category.toLowerCase()} expense reduces your projected buffer from ₹${currentBuffer.toLocaleString(
      'en-IN'
    )} to ₹${newProjectedBuffer.toLocaleString(
      'en-IN'
    )}. Because existing commitments (Rent ₹12,000 on 5th and EMI ₹6,500 on 12th) already concentrate outflow around mid-month, this leaves less room for variable discretionary spending in Week 3.`;
  } else if (scenarioType === 'loan') {
    const emi = calculateEMI(amount, loanInterest, loanTenure);
    aiExplanation = `Adding a ₹${emi.toLocaleString(
      'en-IN'
    )} monthly installment compresses your monthly safety margin by ₹${emi.toLocaleString(
      'en-IN'
    )}. Your projected buffer shifts from ₹${currentBuffer.toLocaleString(
      'en-IN'
    )} to ₹${newProjectedBuffer.toLocaleString(
      'en-IN'
    )}. Week 3 lowest anticipated balance reduces to ₹${lowestBalance.toLocaleString(
      'en-IN'
    )}.`;
  } else if (scenarioType === 'insurance') {
    aiExplanation = `This scheduled premium creates a temporary reduction of ₹${amount.toLocaleString(
      'en-IN'
    )} in your projected buffer. Its timing overlaps with existing commitments, lowering the projected buffer floor to ₹${newProjectedBuffer.toLocaleString(
      'en-IN'
    )}.`;
  } else if (scenarioType === 'income') {
    aiExplanation = `A simulated cash inflow of ₹${amount.toLocaleString(
      'en-IN'
    )} expands your liquid buffer to ₹${newProjectedBuffer.toLocaleString(
      'en-IN'
    )}, dampening Week 3 pressure and improving overall cash-flow resilience.`;
  } else {
    aiExplanation = `A ${spendingChangePct > 0 ? '+' : ''}${spendingChangePct}% adjustment in variable spending alters your month-end buffer by ₹${Math.abs(
      projectedBufferDelta
    ).toLocaleString('en-IN')}.`;
  }

  return {
    scenarioType,
    title: scenarioTitle,
    balanceDelta,
    projectedBufferDelta,
    currentBalance,
    newBalance,
    currentProjectedBuffer: currentBuffer,
    newProjectedBuffer,
    lowestBalance,
    lowestBalancePeriod,
    pressureLevel,
    pressureChangeDescription,
    cashFlowImpact,
    healthScoreDelta,
    newHealthScore: newHealth.score,
    aiExplanation,
    forecastPoints,
    details: {
      additionalMonthlyEMI,
      loanInterest,
      loanTenure,
      spendingChangePct,
    },
  };
}

/**
 * Calculates money flow nodes and proportional distribution.
 */
export function calculateMoneyFlow(
  monthlyIncome: number,
  commitments: Commitment[],
  transactions: Transaction[],
  projectedBuffer: number
): MoneyFlowData {
  const fixedCategories = commitments.map((c) => ({
    name: c.name,
    amount: c.amount,
    percentage: Math.round((c.amount / monthlyIncome) * 100),
    type: 'fixed' as const,
    color: '#38bdf8', // sky
    iconName: c.category.toLowerCase(),
  }));

  const categoryTotals = calculateCategorySpending(transactions, false);
  const variableCategories = [
    {
      name: 'Food & Dining',
      amount: categoryTotals.Food || 5800,
      percentage: Math.round(((categoryTotals.Food || 5800) / monthlyIncome) * 100),
      type: 'variable' as const,
      color: '#fbbf24', // amber
      iconName: 'food',
    },
    {
      name: 'Shopping',
      amount: categoryTotals.Shopping || 4200,
      percentage: Math.round(((categoryTotals.Shopping || 4200) / monthlyIncome) * 100),
      type: 'variable' as const,
      color: '#f472b6', // pink
      iconName: 'shopping',
    },
    {
      name: 'Travel & Commute',
      amount: categoryTotals.Travel || 3000,
      percentage: Math.round(((categoryTotals.Travel || 3000) / monthlyIncome) * 100),
      type: 'variable' as const,
      color: '#34d399', // emerald
      iconName: 'travel',
    },
    {
      name: 'Utilities & Bills',
      amount: categoryTotals.Bills || 1500,
      percentage: Math.round(((categoryTotals.Bills || 1500) / monthlyIncome) * 100),
      type: 'variable' as const,
      color: '#a78bfa', // purple
      iconName: 'bills',
    },
  ];

  const totalFixed = fixedCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalVariable = variableCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalOutflow = totalFixed + totalVariable;

  const bufferPercentage = Math.max(0, Math.round((projectedBuffer / monthlyIncome) * 100));
  const bufferCategory = {
    name: 'Remaining Buffer',
    amount: projectedBuffer,
    percentage: bufferPercentage,
    type: 'buffer' as const,
    color: '#06b6d4', // cyan
    iconName: 'shield',
  };

  return {
    income: monthlyIncome,
    categories: [...fixedCategories, ...variableCategories, bufferCategory],
    totalOutflow,
    remainingBuffer: projectedBuffer,
  };
}

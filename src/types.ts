export type TransactionCategory =
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Salary'
  | 'Rent'
  | 'EMI'
  | 'Investment'
  | 'Other';

export type TransactionType = 'expense' | 'income';
export type TransactionStatus = 'completed' | 'pending' | 'simulated';

export interface User {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  currentBalance: number;
  typicalDiscretionarySpending: number;
  creditScoreDemo?: number; // Labeled clearly as Demo/User-provided
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  isSimulated?: boolean;
}

export type CommitmentStatus = 'PAID' | 'UPCOMING' | 'DUE SOON' | 'SIMULATED';
export type FrequencyType = 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Annual';

export interface Commitment {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: FrequencyType;
  dueDate: string;
  dueDay: number;
  status: CommitmentStatus;
  projectedImpact: string;
  isSimulated?: boolean;
}

export interface InsurancePolicy {
  id: string;
  providerLabel: string;
  type: 'Health' | 'Life' | 'Vehicle' | 'Other';
  premium: number;
  frequency: FrequencyType;
  nextPaymentDate: string;
  status: 'ACTIVE' | 'UPCOMING_RENEWAL' | 'SIMULATED';
  notes?: string;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenure: number; // months
  emi: number;
  startDate: string;
  remainingTenure?: number;
}

export interface ForecastPoint {
  period: string; // 'Today' | 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4'
  label: string;
  date: string;
  projectedBalance: number;
  scenarioBalance?: number;
  income: number;
  fixedCommitments: number;
  variableSpending: number;
  remainingBuffer: number;
  pressureLevel: 'Low' | 'Moderate' | 'High';
  pressureReasons: string[];
}

export interface FinancialHealthFactor {
  name: string;
  score: number;
  weight: number;
  impact: 'Positive' | 'Neutral' | 'Pressure';
  value: string;
  description: string;
}

export interface FinancialHealth {
  score: number;
  factors: FinancialHealthFactor[];
  explanation: string;
}

export interface FinancialInsight {
  id: string;
  type: 'pressure' | 'spending_change' | 'commitment' | 'insurance' | 'simulation';
  title: string;
  description: string;
  whyDetails?: string;
  impactSummary?: string;
  actionType?: 'simulate' | 'view_commitments' | 'view_whatif' | 'dismiss';
  actionLabel?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  dismissed?: boolean;
  date?: string;
}

export interface FinancialSnapshot {
  availableBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  projectedBuffer: number;
  cashFlowHealth: number;
  lowestProjectedBalance: number;
  peakPressurePeriod: string;
  peakPressureReason: string;
}

export interface ScenarioImpact {
  scenarioType: 'transaction' | 'loan' | 'insurance' | 'income' | 'spending_change';
  title: string;
  balanceDelta: number;
  projectedBufferDelta: number;
  currentBalance: number;
  newBalance: number;
  currentProjectedBuffer: number;
  newProjectedBuffer: number;
  lowestBalance: number;
  lowestBalancePeriod: string;
  pressureLevel: 'Low' | 'Moderate' | 'High';
  pressureChangeDescription: string;
  cashFlowImpact: 'Low' | 'Moderate' | 'High';
  healthScoreDelta: number;
  newHealthScore: number;
  aiExplanation: string;
  forecastPoints: ForecastPoint[];
  details?: Record<string, any>;
}

export interface Scenario {
  id: string;
  type: 'transaction' | 'loan' | 'insurance' | 'income' | 'spending_change';
  amount: number;
  category?: string;
  createdAt: string;
  impact: ScenarioImpact;
}

export interface MoneyFlowCategory {
  name: string;
  amount: number;
  percentage: number;
  type: 'fixed' | 'variable' | 'buffer';
  color: string;
  iconName: string;
}

export interface MoneyFlowData {
  income: number;
  categories: MoneyFlowCategory[];
  totalOutflow: number;
  remainingBuffer: number;
}

export type ReportPeriod = 'today' | 'last10days' | 'weekly' | 'monthly';

export interface ReportData {
  period: ReportPeriod;
  periodLabel: string;
  generatedAt: string;
  snapshot: FinancialSnapshot;
  moneyFlow: MoneyFlowData;
  spendingByCategory: { category: string; amount: number; percentage: number; changeVsPrior: number }[];
  commitments: Commitment[];
  insurancePolicies: InsurancePolicy[];
  forecast: ForecastPoint[];
  pressurePeriods: { period: string; level: string; reason: string; buffer: number }[];
  aiFinancialBrief: string;
  notableChanges: string[];
  transactions: Transaction[];
  hasSimulation: boolean;
  simulationDetails?: ScenarioImpact | null;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    type: 'simulate_tx' | 'simulate_loan' | 'view_commitments' | 'view_forecast';
    payload?: any;
    label: string;
  };
  groundedFacts?: string[];
}

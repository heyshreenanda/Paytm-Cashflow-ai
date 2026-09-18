import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  CalendarClock,
  HelpCircle,
  Lightbulb,
  FileText,
  Bot,
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'transactions'
  | 'cashflow'
  | 'commitments'
  | 'whatif'
  | 'insights'
  | 'reports'
  | 'copilot';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  healthScore: number;
  onOpenHealthModal: () => void;
  className?: string;
  hasActiveSimulation?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  healthScore,
  onOpenHealthModal,
  className = '',
  hasActiveSimulation = false,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Transactions', icon: Receipt },
    { id: 'cashflow' as NavTab, label: 'Cash Flow', icon: TrendingUp },
    { id: 'commitments' as NavTab, label: 'Commitments', icon: CalendarClock },
    { id: 'whatif' as NavTab, label: 'What If Engine', icon: HelpCircle },
    { id: 'insights' as NavTab, label: 'AI Insights', icon: Lightbulb },
    { id: 'reports' as NavTab, label: 'Financial Reports', icon: FileText },
    { id: 'copilot' as NavTab, label: 'AI Copilot', icon: Bot },
  ];

  return (
    <aside className={`w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)] ${className}`}>
      <div className="space-y-6">
        {/* Navigation items */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cash-Flow Health Quick Pill Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Cash-Flow Health
            </span>
            <span className="text-sm font-bold text-white">
              <span className="text-cyan-400">{healthScore}</span>/100
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 75
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : healthScore >= 60
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400 mb-2">
            Calculated from buffer margin, commitments, and Week 3 liquidity floor.
          </p>

          <button
            onClick={onOpenHealthModal}
            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            How is this calculated?
          </button>
        </div>
      </div>

      {/* Safety & Demo Footer */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1 font-semibold text-slate-400">
          <ShieldAlert className="h-3 w-3 text-cyan-400" />
          <span>Safety & Sandbox Rules</span>
        </div>
        <p>• Prototype using synthetic/demo data</p>
        <p>• Forecasts are estimates, not financial advice</p>
        <p>• Simulations do NOT execute real payments</p>
        <p>• No CIBIL score or lending approvals</p>
      </div>
    </aside>
  );
};

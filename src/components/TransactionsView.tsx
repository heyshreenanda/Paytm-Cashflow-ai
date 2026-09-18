import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenSimulator: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenSimulator,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');

  const categories: string[] = [
    'All',
    'Food',
    'Shopping',
    'Travel',
    'Bills',
    'Entertainment',
    'Health',
    'Education',
    'Salary',
    'Rent',
    'EMI',
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || tx.category === selectedCategory;
      const matchType = selectedType === 'all' || tx.type === selectedType;
      return matchSearch && matchCat && matchType;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>Transaction Activity & Log</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {filteredTransactions.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthetic banking and UPI transaction ledger for September 2026.
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="h-4 w-4" />
          <span>Simulate Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, category (e.g. Swiggy, Amazon, Metro)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-9 pr-4 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 p-1 w-full sm:w-auto">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 sm:flex-initial rounded-lg px-3 py-1 text-xs font-semibold capitalize transition cursor-pointer ${
                  selectedType === t ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="divide-y divide-slate-800/70">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions match your search criteria.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 flex items-center justify-between gap-4 transition hover:bg-slate-800/40 ${
                  tx.isSimulated ? 'bg-amber-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.isSimulated
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : tx.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tx.isSimulated ? 'SIM' : tx.category.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{tx.merchant}</span>
                      {tx.isSimulated && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-extrabold text-amber-300 tracking-wider">
                          SIMULATED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-slate-300">{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold font-mono ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{tx.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

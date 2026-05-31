import { CHANNEL_LABELS } from "../data/constants";
import type { Transaction } from "../types/transaction";
import { ChannelStats } from "../components/ChannelStats";
import { SummaryCards } from "../components/SummaryCards";
import { TransactionList } from "../components/TransactionList";
import {
  getExpenseStatsByChannel,
  getSummaryStats,
  sortTransactionsByDate,
} from "../utils/statistics";
import { getCurrentMonthKey } from "../utils/format";

interface DashboardPageProps {
  transactions: Transaction[];
  onNavigateToTransactions: () => void;
}

export function DashboardPage({
  transactions,
  onNavigateToTransactions,
}: DashboardPageProps) {
  const monthKey = getCurrentMonthKey();
  const stats = getSummaryStats(transactions, monthKey);
  const recentTransactions = sortTransactionsByDate(transactions).slice(0, 5);
  const channelStats = getExpenseStatsByChannel(transactions, CHANNEL_LABELS);

  return (
    <div className="space-y-6">
      <SummaryCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">最近 5 条账单</h2>
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
              type="button"
              onClick={onNavigateToTransactions}
            >
              管理账单
            </button>
          </div>
          <TransactionList
            transactions={recentTransactions}
            emptyText="还没有账单，去账单管理页新增第一笔记录。"
          />
        </section>

        <ChannelStats stats={channelStats} />
      </div>
    </div>
  );
}

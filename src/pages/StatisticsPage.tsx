import { CHANNEL_LABELS } from "../data/constants";
import type { Transaction } from "../types/transaction";
import { CategoryStats } from "../components/CategoryStats";
import { ChannelStats } from "../components/ChannelStats";
import { SummaryCards } from "../components/SummaryCards";
import {
  getExpenseStatsByCategory,
  getExpenseStatsByChannel,
  getSummaryStats,
} from "../utils/statistics";
import { getCurrentMonthKey } from "../utils/format";

interface StatisticsPageProps {
  transactions: Transaction[];
}

export function StatisticsPage({ transactions }: StatisticsPageProps) {
  const stats = getSummaryStats(transactions, getCurrentMonthKey());
  const channelStats = getExpenseStatsByChannel(transactions, CHANNEL_LABELS);
  const categoryStats = getExpenseStatsByCategory(transactions);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">统计</h2>
        <p className="mt-1 text-sm text-slate-500">
          汇总所有收入、支出、结余，以及支出在渠道和分类上的分布。
        </p>
      </div>

      <SummaryCards stats={stats} scope="total" />
      <SummaryCards stats={stats} scope="month" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelStats stats={channelStats} />
        <CategoryStats stats={categoryStats} />
      </div>
    </div>
  );
}

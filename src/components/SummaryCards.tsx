import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import type { PeriodSummaryStats, SummaryStats } from "../utils/statistics";
import { formatCurrency } from "../utils/format";

interface SummaryCardsProps {
  stats: SummaryStats;
  scope?: "month" | "total";
}

export function SummaryCards({ stats, scope = "month" }: SummaryCardsProps) {
  const cards =
    scope === "month"
      ? [
          {
            label: "本月收入",
            value: stats.monthIncome,
            tone: "text-emerald-700",
            icon: ArrowUpRight,
          },
          {
            label: "本月支出",
            value: stats.monthExpense,
            tone: "text-rose-700",
            icon: ArrowDownLeft,
          },
          {
            label: "本月结余",
            value: stats.monthBalance,
            tone: stats.monthBalance >= 0 ? "text-slate-900" : "text-rose-700",
            icon: Wallet,
          },
        ]
      : [
          {
            label: "总收入",
            value: stats.totalIncome,
            tone: "text-emerald-700",
            icon: ArrowUpRight,
          },
          {
            label: "总支出",
            value: stats.totalExpense,
            tone: "text-rose-700",
            icon: ArrowDownLeft,
          },
          {
            label: "总结余",
            value: stats.balance,
            tone: stats.balance >= 0 ? "text-slate-900" : "text-rose-700",
            icon: Wallet,
          },
        ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{card.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className={`mt-4 text-2xl font-semibold ${card.tone}`}>
              {formatCurrency(card.value)}
            </p>
          </section>
        );
      })}
    </div>
  );
}

interface PeriodSummaryCardsProps {
  stats: PeriodSummaryStats;
  labels?: {
    income: string;
    expense: string;
    balance: string;
  };
}

export function PeriodSummaryCards({
  stats,
  labels = {
    income: "收入",
    expense: "支出",
    balance: "结余",
  },
}: PeriodSummaryCardsProps) {
  const cards = [
    {
      label: labels.income,
      value: stats.income,
      tone: "text-emerald-700",
      icon: ArrowUpRight,
    },
    {
      label: labels.expense,
      value: stats.expense,
      tone: "text-rose-700",
      icon: ArrowDownLeft,
    },
    {
      label: labels.balance,
      value: stats.balance,
      tone: stats.balance >= 0 ? "text-slate-900" : "text-rose-700",
      icon: Wallet,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{card.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className={`mt-4 text-2xl font-semibold ${card.tone}`}>
              {formatCurrency(card.value)}
            </p>
          </section>
        );
      })}
    </div>
  );
}

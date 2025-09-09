// src/components/time-off/Balances.tsx
import React, { useState } from 'react';
import { Clock, Battery, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations
import type { TimeOffBalance } from '@/types/timeoff';

interface TimeOffBalancesProps {
  balances: TimeOffBalance[];
  loading?: boolean;
}

interface GroupedBalance extends TimeOffBalance {
  yearlyBalances: TimeOffBalance[];
  accumulatedTotal: number;
  accumulatedUsed: number;
}

interface BalanceCardProps {
  balance: GroupedBalance;
}

function BalanceCard({ balance }: BalanceCardProps) {
  const t = useTranslations('TimeOffPage');
  const [expanded, setExpanded] = useState(false);
  const totalRemaining = balance.accumulatedTotal - balance.accumulatedUsed;
  const percentageUsed = balance.accumulatedTotal 
    ? (balance.accumulatedUsed / balance.accumulatedTotal) * 100 
    : 0;

  return (
    <div className="bg-card rounded-xl border border-card-border p-5 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-platinum">{t(`balances.balanceTypes.${balance.policy?.type}`)}</h3> {/* Translated Policy Type */}
          <p className="text-sm text-sunset mt-0.5">
            {balance.employee?.first_name} {balance.employee?.last_name}
          </p>
        </div>
        <Battery size={20} className="text-primary" />
      </div>

      {/* Accumulated Totals */}
      <div className="space-y-4">
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sunset mb-1">
              <Clock size={14} />
              <span className="text-sm">{t('balances.labels.total')}</span> {/* Translated "Total" */}
            </div>
            <p className="font-semibold text-platinum">{balance.accumulatedTotal.toFixed(1)} {t('balances.units.days')}</p> {/* Translated "days" */}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sunset mb-1">
              <CheckCircle size={14} />
              <span className="text-sm">{t('balances.labels.used')}</span> {/* Translated "Used" */}
            </div>
            <p className="font-semibold text-platinum">{balance.accumulatedUsed.toFixed(1)} {t('balances.units.days')}</p> {/* Translated "days" */}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sunset mb-1">
              <Battery size={14} />
              <span className="text-sm">{t('balances.labels.left')}</span> {/* Translated "Left" */}
            </div>
            <p className="font-semibold text-platinum">{totalRemaining.toFixed(1)} {t('balances.units.days')}</p> {/* Translated "days" */}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-sunset hover:text-primary transition-colors w-full justify-center mt-2"
        >
          {expanded ? (
            <>
              <span>{t('balances.buttons.hideYearlyBreakdown')}</span> {/* Translated "Hide yearly breakdown" */}
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>{t('balances.buttons.showYearlyBreakdown')}</span> {/* Translated "Show yearly breakdown" */}
              <ChevronDown size={16} />
            </>
          )}
        </button>

        {/* Yearly Breakdown */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-card-border pt-4">
            <h4 className="text-sm font-medium text-sunset">{t('balances.labels.yearlyBreakdown')}</h4> {/* Translated "Yearly Breakdown" */}
            <div className="space-y-3">
              {balance.yearlyBalances.map((yearBalance) => (
                <div 
                  key={yearBalance.year} 
                  className="grid grid-cols-4 gap-4 text-sm bg-background/50 p-3 rounded-lg"
                >
                  <div className="text-sunset">{yearBalance.year}</div>
                  <div className="text-platinum">
                    {(Number(yearBalance.total_days) + Number(yearBalance.carried_over)).toFixed(1)} {t('balances.units.days')}
                  </div>
                  <div className="text-platinum">{yearBalance.used_days.toFixed(1)} {t('balances.labels.used')}</div> {/* Translated "used" */}
                  <div className="text-platinum">
                    {(Number(yearBalance.total_days) + Number(yearBalance.carried_over) - Number(yearBalance.used_days)).toFixed(1)} {t('balances.labels.left')}
                  </div> {/* Translated "left" */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimeOffBalances({ balances, loading }: TimeOffBalancesProps) {
  const t = useTranslations('TimeOffPage'); // Use 'TimeOffPage' namespace

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-background rounded-xl h-32" />
        ))}
      </div>
    );
  }

  if (!balances.length) {
    return (
      <div className="text-center py-8 text-sunset">
        {t('balances.messages.noBalances')} {/* Translated "No balances available." */}
      </div>
    );
  }

  // Group balances by employee and policy
  const groupedBalances = balances.reduce((acc, balance) => {
    const key = `${balance.employee_id}-${balance.policy_id}`;
    if (!acc[key]) {
      acc[key] = {
        ...balance,
        yearlyBalances: [balance],
        accumulatedTotal: Number(balance.total_days) + Number(balance.carried_over),
        accumulatedUsed: Number(balance.used_days)
      };
    } else {
      acc[key].yearlyBalances.push(balance);
      acc[key].accumulatedTotal += Number(balance.total_days) + Number(balance.carried_over);
      acc[key].accumulatedUsed += Number(balance.used_days);
    }
    return acc;
  }, {} as Record<string, GroupedBalance>);

  // Sort yearly balances by year in descending order
  Object.values(groupedBalances).forEach(balance => {
    balance.yearlyBalances.sort((a, b) => b.year - a.year);
  });

  return (
    <div className="space-y-4">
      {Object.values(groupedBalances).map((balance) => (
        <BalanceCard key={`${balance.employee_id}-${balance.policy_id}`} balance={balance} />
      ))}
    </div>
  );
}

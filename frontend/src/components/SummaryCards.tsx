import React from 'react';
import { InspectionSummary, Severity } from '../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';

interface SummaryCardsProps {
  summary: InspectionSummary | null;
  activeSeverityFilter: string;
  onSelectSeverity: (sev: string) => void;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  activeSeverityFilter,
  onSelectSeverity,
  isLoading,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-3 gap-2 animate-pulse my-3">
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!summary) return null;

  const cards: {
    key: Severity;
    label: string;
    icon: React.ReactNode;
    counts: { open: number; resolved: number; total: number };
    borderClass: string;
    badgeBg: string;
    badgeText: string;
    activeClass: string;
  }[] = [
    {
      key: 'Critical',
      label: 'Critical',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      counts: summary.critical,
      borderClass: 'border-rose-200 bg-rose-50/70',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      activeClass: 'ring-2 ring-rose-500 shadow-sm',
    },
    {
      key: 'Major',
      label: 'Major',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      counts: summary.major,
      borderClass: 'border-amber-200 bg-amber-50/70',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      activeClass: 'ring-2 ring-amber-500 shadow-sm',
    },
    {
      key: 'Minor',
      label: 'Minor',
      icon: <Info className="w-4 h-4 text-sky-600" />,
      counts: summary.minor,
      borderClass: 'border-sky-200 bg-sky-50/70',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      activeClass: 'ring-2 ring-sky-500 shadow-sm',
    },
  ];

  return (
    <section className="my-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>Defect Severity Summary</span>
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> {summary.open_total} Open
          </span>
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> {summary.resolved_total} Resolved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const isSelected = activeSeverityFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => onSelectSeverity(isSelected ? 'All' : card.key)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                card.borderClass
              } ${isSelected ? card.activeClass : 'hover:border-slate-300'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {card.icon}
                  {card.label}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${card.badgeBg} ${card.badgeText}`}
                >
                  {card.counts.total}
                </span>
              </div>

              {/* Open vs Resolved Breakdown */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-amber-900 font-medium">Open</span>
                  <span className="font-extrabold text-amber-950 text-sm">
                    {card.counts.open}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-emerald-800 font-medium">Resolved</span>
                  <span className="font-bold text-emerald-900 text-xs">
                    {card.counts.resolved}
                  </span>
                </div>
              </div>

              {/* Ratio micro-bar */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{
                    width: card.counts.total > 0
                      ? `${(card.counts.open / card.counts.total) * 100}%`
                      : '0%',
                  }}
                  title={`Open: ${card.counts.open}`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: card.counts.total > 0
                      ? `${(card.counts.resolved / card.counts.total) * 100}%`
                      : '0%',
                  }}
                  title={`Resolved: ${card.counts.resolved}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

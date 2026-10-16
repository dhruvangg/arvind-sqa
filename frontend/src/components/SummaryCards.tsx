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
      <div className="grid grid-cols-3 gap-2.5 animate-pulse my-3">
        <div className="h-28 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="h-28 bg-white border border-slate-200 rounded-2xl"></div>
        <div className="h-28 bg-white border border-slate-200 rounded-2xl"></div>
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
    accentBarBg: string;
  }[] = [
    {
      key: 'Critical',
      label: 'Critical',
      icon: <AlertCircle className="w-4 h-4 text-arvind-700" />,
      counts: summary.critical,
      borderClass: 'border-slate-200 hover:border-arvind-300 bg-white',
      badgeBg: 'bg-arvind-50 border border-arvind-200',
      badgeText: 'text-arvind-800',
      activeClass: 'ring-2 ring-arvind-700 border-arvind-700 shadow-sm',
      accentBarBg: 'bg-arvind-700',
    },
    {
      key: 'Major',
      label: 'Major',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      counts: summary.major,
      borderClass: 'border-slate-200 hover:border-amber-300 bg-white',
      badgeBg: 'bg-amber-50 border border-amber-200',
      badgeText: 'text-amber-800',
      activeClass: 'ring-2 ring-amber-600 border-amber-600 shadow-sm',
      accentBarBg: 'bg-amber-500',
    },
    {
      key: 'Minor',
      label: 'Minor',
      icon: <Info className="w-4 h-4 text-slate-600" />,
      counts: summary.minor,
      borderClass: 'border-slate-200 hover:border-slate-400 bg-white',
      badgeBg: 'bg-slate-100 border border-slate-200',
      badgeText: 'text-slate-800',
      activeClass: 'ring-2 ring-slate-700 border-slate-700 shadow-sm',
      accentBarBg: 'bg-slate-500',
    },
  ];

  return (
    <section className="my-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Defect Severity Summary
          </h2>
          <span className="text-[10px] text-slate-400 font-medium lowercase">
            (click card to filter)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" /> {summary.open_total} Open
          </span>
          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {summary.resolved_total} Resolved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card) => {
          const isSelected = activeSeverityFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => onSelectSeverity(isSelected ? 'All' : card.key)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden shadow-2xs ${
                card.borderClass
              } ${isSelected ? card.activeClass : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {card.icon}
                  {card.label}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${card.badgeBg} ${card.badgeText} tabular-nums`}
                >
                  {card.counts.total}
                </span>
              </div>

              {/* Counts Breakdown */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Open</span>
                  <span className="font-extrabold text-amber-700 text-sm tabular-nums">
                    {card.counts.open}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Resolved</span>
                  <span className="font-bold text-emerald-700 text-xs tabular-nums">
                    {card.counts.resolved}
                  </span>
                </div>
              </div>

              {/* Progress split bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden flex">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{
                    width:
                      card.counts.total > 0
                        ? `${(card.counts.open / card.counts.total) * 100}%`
                        : '0%',
                  }}
                  title={`Open: ${card.counts.open}`}
                />
                <div
                  className="bg-emerald-600 h-full transition-all"
                  style={{
                    width:
                      card.counts.total > 0
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

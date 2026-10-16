import React, { useState } from 'react';
import { Inspection, Severity, Status } from '../types';
import {
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Calendar,
  X,
  Cpu,
} from 'lucide-react';

interface InspectionListProps {
  inspections: Inspection[];
  isLoading: boolean;
  onOpenResolveModal: (inspection: Inspection) => void;
  onSyncOffline?: () => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
}

export const InspectionList: React.FC<InspectionListProps> = ({
  inspections,
  isLoading,
  onOpenResolveModal,
  onSyncOffline,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-arvind-50 text-arvind-700 border border-arvind-200">
            <AlertCircle className="w-3 h-3 text-arvind-700" />
            Critical
          </span>
        );
      case 'Major':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Major
          </span>
        );
      case 'Minor':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3 h-3 text-slate-500" />
            Minor
          </span>
        );
    }
  };

  const getStatusBadge = (status: Status) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
        Open
      </span>
    );
  };

  const hasActiveFilters =
    severityFilter !== 'All' ||
    statusFilter !== 'All' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(searchQuery);

  const resetFilters = () => {
    setSeverityFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search machine ID, defect, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none placeholder-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Collapse Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hasActiveFilters || showFilters
                ? 'bg-arvind-50 border-arvind-200 text-arvind-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-arvind-700" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-arvind-700"></span>
            )}
          </button>

          {/* Sort Direction Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] uppercase font-bold text-slate-600">{sortOrder}</span>
          </button>
        </div>

        {/* Quick Filter Status Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1">
            {['All', 'Open', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-arvind-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold border-none bg-slate-100 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="severity">Severity</option>
              <option value="line_id">Machine ID</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filters Drawer */}
        {showFilters && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 pt-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-arvind-700" /> Detailed Filter Parameters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-arvind-700 hover:underline font-bold"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Severity:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Critical', 'Major', 'Minor'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      severityFilter === sev
                        ? 'bg-arvind-700 text-white border-arvind-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  From Date:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <Calendar className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                  To Date:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <Calendar className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="space-y-2.5 animate-pulse">
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No inspections matched</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? 'No logged defects match your active filter criteria.'
              : 'No defect records logged yet.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 px-3 py-1.5 text-xs font-bold rounded-xl bg-arvind-50 text-arvind-700 hover:bg-arvind-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {inspections.map((insp) => (
            <div
              key={insp.id}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                insp.status === 'Open'
                  ? insp.severity === 'Critical'
                    ? 'border-l-4 border-l-arvind-700 border-slate-200'
                    : 'border-l-4 border-l-amber-500 border-slate-200'
                  : 'border-l-4 border-l-emerald-600 border-slate-200'
              }`}
            >
              {/* Header: Machine & Badges */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight font-mono">
                      {insp.line_id}
                    </span>
                    {insp.source === 'SAP_WEBHOOK' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-arvind-navy-50 text-arvind-navy-700 border border-arvind-navy-200">
                        <Cpu className="w-2.5 h-2.5" /> SAP QM
                      </span>
                    )}
                    {insp.source === 'OFFLINE_PENDING' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Pending Sync
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                    Logged on {insp.date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {getSeverityBadge(insp.severity)}
                  {getStatusBadge(insp.status)}
                </div>
              </div>

              {/* Defect Type & Remarks */}
              <div className="mb-2.5">
                <div className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-800 mb-1.5 border border-slate-200/80">
                  {insp.defect_type}
                </div>
                {insp.remarks && (
                  <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {insp.remarks}
                  </p>
                )}
              </div>

              {/* Card Footer: Resolve Action or Resolution Details */}
              {insp.status === 'Resolved' ? (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 bg-emerald-50/40 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolution Action:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      Signed: <strong>{insp.resolved_by || 'Supervisor'}</strong>
                    </span>
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    {insp.resolution_note}
                  </p>
                </div>
              ) : (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Shift Supervisor: <strong className="text-slate-600 font-semibold">{insp.supervisor_name || 'Supervisor'}</strong>
                  </span>
                  {insp.source === 'OFFLINE_PENDING' ? (
                    <button
                      onClick={onSyncOffline}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 touch-target"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenResolveModal(insp)}
                      className="px-3.5 py-1.5 rounded-xl bg-arvind-700 hover:bg-arvind-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 touch-target"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-arvind-100" />
                      <span>Resolve Defect</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

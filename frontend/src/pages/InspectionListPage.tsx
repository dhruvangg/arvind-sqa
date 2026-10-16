import React, { useState, useEffect, useCallback } from 'react';
import {
  Inspection,
  InspectionSummary,
  PaginatedInspections,
} from '../types';
import { getInspections, getInspectionSummary } from '../services/api';
import { getOfflineQueue } from '../services/offlineSync';
import { SummaryCards } from '../components/SummaryCards';
import { InspectionList } from '../components/InspectionList';
import { Pagination } from '../components/Pagination';

interface InspectionListPageProps {
  onOpenResolveModal: (insp: Inspection) => void;
  onSyncOffline: () => void;
  refreshTrigger: number;
}

export const InspectionListPage: React.FC<InspectionListPageProps> = ({
  onOpenResolveModal,
  onSyncOffline,
  refreshTrigger,
}) => {
  const [paginatedData, setPaginatedData] = useState<PaginatedInspections>({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
  });
  const [summary, setSummary] = useState<InspectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Sorting state
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchInspections = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listResult, summaryResult] = await Promise.all([
        getInspections({
          severity: severityFilter,
          status: statusFilter,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
          page,
          page_size: pageSize,
        }),
        getInspectionSummary(),
      ]);

      setPaginatedData(listResult);
      setSummary(summaryResult);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter, statusFilter, startDate, endDate, searchQuery, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections, refreshTrigger]);

  // When filters or search change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [severityFilter, statusFilter, startDate, endDate, searchQuery, sortBy, sortOrder]);

  // Offline items from local queue to prepend if on page 1
  const offlineQueue = getOfflineQueue();
  const offlineInspections: Inspection[] = offlineQueue.map((item, idx) => ({
    id: -(idx + 1),
    date: item.payload.date,
    line_id: item.payload.line_id,
    defect_type: item.payload.defect_type,
    severity: item.payload.severity,
    remarks: item.payload.remarks,
    status: 'Open',
    supervisor_name: item.payload.supervisor_name,
    source: 'OFFLINE_PENDING',
    created_at: new Date(item.queuedAt).toISOString(),
    updated_at: new Date(item.queuedAt).toISOString(),
  }));

  const filteredOfflineItems = offlineInspections.filter((item) => {
    if (statusFilter !== 'All' && statusFilter !== 'Open') return false;
    if (severityFilter !== 'All' && item.severity !== severityFilter) return false;
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.line_id.toLowerCase().includes(q) ||
        item.defect_type.toLowerCase().includes(q) ||
        (item.remarks && item.remarks.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const displayItems =
    page === 1 ? [...filteredOfflineItems, ...paginatedData.items] : paginatedData.items;

  const displayTotal = paginatedData.total + (page === 1 ? filteredOfflineItems.length : 0);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Defect Severity Summary Matrix (Included strictly on listing page) */}
      <SummaryCards
        summary={summary}
        activeSeverityFilter={severityFilter}
        onSelectSeverity={(sev) => {
          setSeverityFilter(sev);
          setPage(1);
        }}
        isLoading={isLoading}
      />

      {/* Filterable, Sortable Inspection List */}
      <InspectionList
        inspections={displayItems}
        isLoading={isLoading}
        onOpenResolveModal={onOpenResolveModal}
        onSyncOffline={onSyncOffline}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Server-Side Pagination Controls */}
      <Pagination
        currentPage={paginatedData.page}
        totalPages={paginatedData.total_pages}
        totalItems={displayTotal}
        pageSize={paginatedData.page_size}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

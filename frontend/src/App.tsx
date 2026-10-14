import React, { useState, useEffect, useCallback } from 'react';
import {
  Inspection,
  InspectionSummary,
  InspectionCreatePayload,
  InspectionResolvePayload,
  SupervisorProfile,
} from './types';
import {
  getInspections,
  getInspectionSummary,
  createInspection,
  resolveInspection,
} from './services/api';
import {
  getOfflineQueue,
  enqueueOfflineInspection,
  flushOfflineQueue,
} from './services/offlineSync';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { InspectionForm } from './components/InspectionForm';
import { InspectionList } from './components/InspectionList';
import { ResolveModal } from './components/ResolveModal';
import { SapWebhookModal } from './components/SapWebhookModal';
import { LoginModal } from './components/LoginModal';
import { Plus, ListFilter, BarChart3, RefreshCw } from 'lucide-react';

const DEFAULT_SUPERVISOR: SupervisorProfile = {
  username: 'ramesh',
  name: 'Ramesh Patel',
  role: 'Weaving Shift Supervisor',
  plant: 'Naroda Weaving Unit',
  token: 'tok_ramesh_naroda_supervisor',
};

export const App: React.FC = () => {
  // Navigation tabs for mobile screen
  const [activeTab, setActiveTab] = useState<'feed' | 'create'>('feed');

  // Core Data State
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [summary, setSummary] = useState<InspectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters & Sorting State
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Offline & Network State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState<number>(() => getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals & Supervisor State
  const [supervisor, setSupervisor] = useState<SupervisorProfile>(() => {
    try {
      const stored = localStorage.getItem('arvind_supervisor_profile');
      return stored ? JSON.parse(stored) : DEFAULT_SUPERVISOR;
    } catch {
      return DEFAULT_SUPERVISOR;
    }
  });
  const [selectedForResolve, setSelectedForResolve] = useState<Inspection | null>(null);
  const [isSapModalOpen, setIsSapModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Load inspections and summary from API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listData, summaryData] = await Promise.all([
        getInspections({
          severity: severityFilter,
          status: statusFilter,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        getInspectionSummary(),
      ]);
      setInspections(listData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter, statusFilter, startDate, endDate, searchQuery, sortBy, sortOrder]);

  // Initial load & filter changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Offline / Online Listeners
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await triggerOfflineSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      setOfflineCount(getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('arvind_offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('arvind_offline_queue_changed', handleQueueChange);
    };
  }, []);

  const triggerOfflineSync = async () => {
    if (getOfflineQueue().length === 0) return;
    setIsSyncing(true);
    try {
      const { syncedCount } = await flushOfflineQueue();
      setOfflineCount(getOfflineQueue().length);
      if (syncedCount > 0) {
        await refreshData();
      }
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Defect Handler
  const handleCreateInspection = async (payload: InspectionCreatePayload): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (!isOnline) {
        // Queue offline
        enqueueOfflineInspection(payload);
        setOfflineCount(getOfflineQueue().length);
        setActiveTab('feed');
        return true;
      }

      await createInspection(payload);
      await refreshData();
      setActiveTab('feed');
      return true;
    } catch (err: any) {
      console.warn('API submission failed, queuing offline:', err);
      // Fallback to offline queue on network/server error
      enqueueOfflineInspection(payload);
      setOfflineCount(getOfflineQueue().length);
      setActiveTab('feed');
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve Defect Handler
  const handleResolveInspection = async (
    id: number,
    payload: InspectionResolvePayload
  ): Promise<boolean> => {
    try {
      await resolveInspection(id, payload);
      await refreshData();
      return true;
    } catch (err) {
      console.error('Failed to resolve inspection:', err);
      throw err;
    }
  };

  // Supervisor select
  const handleSelectSupervisor = (newSup: SupervisorProfile) => {
    setSupervisor(newSup);
    localStorage.setItem('arvind_supervisor_profile', JSON.stringify(newSup));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Mobile viewport wrapper constrained to max-w-md (390px - 448px) */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl border-x border-slate-200/80">
        {/* Arvind Branded Header */}
        <Header
          isOnline={isOnline}
          offlineCount={offlineCount}
          onSyncOffline={triggerOfflineSync}
          isSyncing={isSyncing}
          supervisor={supervisor}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSapModal={() => setIsSapModalOpen(true)}
        />

        {/* Tab Toggle Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-white text-arvind-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Inspection Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-arvind-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Log Defect</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-2 space-y-4 pb-20 overflow-y-auto">
          {/* Defect Severity Summary (Always visible or in feed tab) */}
          <SummaryCards
            summary={summary}
            activeSeverityFilter={severityFilter}
            onSelectSeverity={(sev) => {
              setSeverityFilter(sev);
              setActiveTab('feed');
            }}
            isLoading={isLoading}
          />

          {activeTab === 'create' ? (
            <div className="animate-fadeIn">
              <InspectionForm
                onSubmit={handleCreateInspection}
                supervisor={supervisor}
                isSubmitting={isSubmitting}
              />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <InspectionList
                inspections={inspections}
                isLoading={isLoading}
                onOpenResolveModal={(insp) => setSelectedForResolve(insp)}
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
            </div>
          )}
        </main>

        {/* Fixed Mobile Bottom Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
          <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                activeTab === 'feed' ? 'text-arvind-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Feed & Stats</span>
            </button>

            {/* Prominent Quick-Add Circle Button */}
            <button
              onClick={() => setActiveTab('create')}
              className={`-mt-6 p-3.5 rounded-full shadow-lg border-2 border-white transition-all transform active:scale-95 ${
                activeTab === 'create'
                  ? 'bg-arvind-900 text-white'
                  : 'bg-arvind-700 hover:bg-arvind-800 text-white'
              }`}
              title="Log New Defect"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-arvind-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Modals */}
      <ResolveModal
        inspection={selectedForResolve}
        isOpen={Boolean(selectedForResolve)}
        onClose={() => setSelectedForResolve(null)}
        onResolve={handleResolveInspection}
        supervisor={supervisor}
      />

      <SapWebhookModal
        isOpen={isSapModalOpen}
        onClose={() => setIsSapModalOpen(false)}
        onSuccess={refreshData}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSupervisor={supervisor}
        onSelectSupervisor={handleSelectSupervisor}
      />
    </div>
  );
};

export default App;

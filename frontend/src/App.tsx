import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Inspection,
  InspectionCreatePayload,
  InspectionResolvePayload,
  SupervisorProfile,
} from './types';
import { createInspection, resolveInspection } from './services/api';
import {
  getOfflineQueue,
  enqueueOfflineInspection,
  flushOfflineQueue,
} from './services/offlineSync';
import { Header } from './components/Header';
import { ResolveModal } from './components/ResolveModal';
import { SapWebhookModal } from './components/SapWebhookModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { InspectionListPage } from './pages/InspectionListPage';
import { InspectionCreatePage } from './pages/InspectionCreatePage';
import { Plus, ListFilter, RefreshCw } from 'lucide-react';

const DEFAULT_SUPERVISOR: SupervisorProfile = {
  username: 'ramesh',
  name: 'Ramesh Patel',
  role: 'Weaving Shift Supervisor',
  plant: 'Naroda Weaving Unit',
  token: 'tok_ramesh_naroda_supervisor',
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isCreateRoute = location.pathname === '/new';

  // Network & Offline Queue
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState<number>(() => getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Supervisor Profile
  const [supervisor, setSupervisor] = useState<SupervisorProfile>(() => {
    try {
      const stored = localStorage.getItem('arvind_supervisor_profile');
      return stored ? JSON.parse(stored) : DEFAULT_SUPERVISOR;
    } catch {
      return DEFAULT_SUPERVISOR;
    }
  });

  // Modals & UI
  const [selectedForResolve, setSelectedForResolve] = useState<Inspection | null>(null);
  const [isSapModalOpen, setIsSapModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Offline Queue
  const triggerOfflineSync = useCallback(async () => {
    if (getOfflineQueue().length === 0) return;
    setIsSyncing(true);
    try {
      const { syncedCount, errors } = await flushOfflineQueue();
      setOfflineCount(getOfflineQueue().length);
      if (syncedCount > 0) {
        addToast('success', `${syncedCount} offline defect(s) synchronized successfully`);
        setRefreshTrigger((prev) => prev + 1);
      }
      if (errors.length > 0) {
        addToast('error', `Sync issues: ${errors[0]}`);
      }
    } catch (e: any) {
      console.error('Sync failed', e);
      addToast('error', 'Synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Listeners for network & storage
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await triggerOfflineSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('info', 'Offline mode active. Inspections will queue locally.');
    };

    const handleQueueChange = () => {
      setOfflineCount(getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('arvind_offline_queue_changed', handleQueueChange);

    // Auto-sync on startup if online
    if (navigator.onLine && getOfflineQueue().length > 0) {
      triggerOfflineSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('arvind_offline_queue_changed', handleQueueChange);
    };
  }, [triggerOfflineSync]);

  // Create Defect Handler
  const handleCreateInspection = async (payload: InspectionCreatePayload): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (!isOnline) {
        enqueueOfflineInspection(payload);
        setOfflineCount(getOfflineQueue().length);
        addToast('info', 'Defect saved locally (Offline mode)');
        setRefreshTrigger((prev) => prev + 1);
        return true;
      }

      await createInspection(payload);
      addToast('success', `Defect on ${payload.line_id} logged successfully`);
      setRefreshTrigger((prev) => prev + 1);
      return true;
    } catch (err: any) {
      console.warn('API submission failed, queuing offline:', err);
      enqueueOfflineInspection(payload);
      setOfflineCount(getOfflineQueue().length);
      addToast('info', 'Defect saved locally (Pending sync)');
      setRefreshTrigger((prev) => prev + 1);
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
      addToast('success', `Inspection #${id} marked as Resolved`);
      setRefreshTrigger((prev) => prev + 1);
      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Failed to resolve defect');
      throw err;
    }
  };

  const handleSelectSupervisor = (newSup: SupervisorProfile) => {
    setSupervisor(newSup);
    localStorage.setItem('arvind_supervisor_profile', JSON.stringify(newSup));
    addToast('info', `Active supervisor switched to ${newSup.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Centered responsive container (optimized for 390px, expands gracefully on tablet/desktop) */}
      <div className="w-full max-w-xl mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl border-x border-slate-200">
        {/* Arvind Official Header */}
        <Header
          isOnline={isOnline}
          offlineCount={offlineCount}
          onSyncOffline={triggerOfflineSync}
          isSyncing={isSyncing}
          supervisor={supervisor}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSapModal={() => setIsSapModalOpen(true)}
        />

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center border border-slate-200">
            <Link
              to="/"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isCreateRoute
                  ? 'bg-white text-arvind-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Inspection Feed</span>
            </Link>
            <Link
              to="/new"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isCreateRoute
                  ? 'bg-arvind-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Log Defect</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 px-4 py-2 pb-24 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <InspectionListPage
                  onOpenResolveModal={(insp) => setSelectedForResolve(insp)}
                  onSyncOffline={triggerOfflineSync}
                  refreshTrigger={refreshTrigger}
                />
              }
            />
            <Route
              path="/new"
              element={
                <InspectionCreatePage
                  onSubmit={handleCreateInspection}
                  supervisor={supervisor}
                  isSubmitting={isSubmitting}
                />
              }
            />
          </Routes>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
          <div className="max-w-xl mx-auto px-6 py-2.5 flex items-center justify-between">
            <Link
              to="/"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                !isCreateRoute ? 'text-arvind-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ListFilter className="w-5 h-5" />
              <span>Inspections</span>
            </Link>

            {/* Quick-Add Circle Button */}
            <Link
              to="/new"
              className={`-mt-6 p-3.5 rounded-full shadow-md border-2 border-white transition-all transform active:scale-95 ${
                isCreateRoute
                  ? 'bg-arvind-900 text-white'
                  : 'bg-arvind-700 hover:bg-arvind-800 text-white'
              }`}
              title="Log New Defect"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </Link>

            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Modals & Dialogs */}
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
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSupervisor={supervisor}
        onSelectSupervisor={handleSelectSupervisor}
      />

      {/* Production Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

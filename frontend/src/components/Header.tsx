import { Wifi, WifiOff, RefreshCw, UserCheck, Cpu } from 'lucide-react';
import { SupervisorProfile } from '../types';

interface HeaderProps {
  isOnline: boolean;
  offlineCount: number;
  onSyncOffline: () => void;
  isSyncing: boolean;
  supervisor: SupervisorProfile;
  onOpenLogin: () => void;
  onOpenSapModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  offlineCount,
  onSyncOffline,
  isSyncing,
  supervisor,
  onOpenLogin,
  onOpenSapModal,
}) => {
  return (
    <header className="bg-arvind-700 text-white sticky top-0 z-30 shadow-md">
      {/* Top corporate bar */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-arvind-500 border border-blue-300/30 flex items-center justify-center font-extrabold text-base tracking-wider text-white shadow-inner">
            A
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight flex items-center gap-1.5">
              Arvind Limited
              <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/20">
                AI & SQA
              </span>
            </h1>
            <p className="text-[11px] text-blue-200/80 font-medium">
              Shop-floor Quality Inspection
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-1.5">
          {/* SAP Webhook Simulation Button */}
          <button
            onClick={onOpenSapModal}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/30 text-blue-100 transition-colors"
            title="Simulate SAP QM Webhook"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden xs:inline">SAP</span>
          </button>

          {/* Supervisor Switch */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1 px-2 py-1 text-xs rounded-md bg-arvind-800/80 hover:bg-arvind-800 border border-blue-400/20 text-slate-200"
            title="Switch Supervisor"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            <span className="truncate max-w-[85px] text-[11px] font-medium">
              {supervisor.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Network & Offline Status Banner */}
      {(!isOnline || offlineCount > 0) && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-all">
          <div className="flex items-center space-x-1.5">
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-900 animate-pulse" />
                <span>Offline Mode (Local Storage active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-800" />
                <span>Online · {offlineCount} pending local inspection{offlineCount > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          {offlineCount > 0 && (
            <button
              onClick={onSyncOffline}
              disabled={!isOnline || isSyncing}
              className="ml-2 px-2 py-0.5 rounded bg-amber-900 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-black disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync (${offlineCount})`}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

import { InspectionCreatePayload, OfflineQueuedInspection } from '../types';
import { createInspection } from './api';

const STORAGE_KEY = 'arvind_offline_inspections_v1';

export function getOfflineQueue(): OfflineQueuedInspection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue from localStorage', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueuedInspection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    // Trigger custom event so components can update sync badge
    window.dispatchEvent(new CustomEvent('arvind_offline_queue_changed', { detail: queue }));
  } catch (e) {
    console.error('Failed to save offline queue', e);
  }
}

export function enqueueOfflineInspection(payload: InspectionCreatePayload): OfflineQueuedInspection {
  const queue = getOfflineQueue();
  const newItem: OfflineQueuedInspection = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    payload,
    queuedAt: Date.now(),
  };
  queue.push(newItem);
  saveOfflineQueue(queue);
  return newItem;
}

export async function flushOfflineQueue(): Promise<{
  syncedCount: number;
  errors: string[];
}> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, errors: [] };
  }

  const remaining: OfflineQueuedInspection[] = [];
  let syncedCount = 0;
  const errors: string[] = [];

  for (const item of queue) {
    try {
      await createInspection(item.payload);
      syncedCount++;
    } catch (err: any) {
      console.error(`Failed to sync queued inspection ${item.id}:`, err);
      remaining.push(item);
      errors.push(err.message || 'Network sync failed');
    }
  }

  saveOfflineQueue(remaining);
  return { syncedCount, errors };
}

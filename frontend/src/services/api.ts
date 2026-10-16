import {
  Inspection,
  InspectionCreatePayload,
  InspectionResolvePayload,
  InspectionSummary,
  PaginatedInspections,
  SapWebhookPayload,
  SupervisorProfile,
} from '../types';

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    // In local development (port 3000 / 5173), direct connect to backend on port 8000
    if (window.location.port === '3000' || window.location.port === '5173') {
      const hostname = window.location.hostname || '127.0.0.1';
      return `http://${hostname}:8000/api`;
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

export interface InspectionFilterParams {
  severity?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export async function getInspections(params?: InspectionFilterParams): Promise<PaginatedInspections> {
  const query = new URLSearchParams();
  if (params) {
    if (params.severity && params.severity !== 'All') query.append('severity', params.severity);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    if (params.search) query.append('search', params.search);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
  }

  const url = `${API_BASE}/inspections${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch inspections' }));
    throw new Error(err.detail || 'Failed to fetch inspections');
  }
  return response.json();
}

export async function getInspectionSummary(): Promise<InspectionSummary> {
  const response = await fetch(`${API_BASE}/inspections/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch inspection summary');
  }
  return response.json();
}

export async function createInspection(payload: InspectionCreatePayload): Promise<Inspection> {
  const response = await fetch(`${API_BASE}/inspections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create inspection' }));
    throw new Error(err.detail || 'Failed to create inspection');
  }
  return response.json();
}

export async function resolveInspection(
  id: number,
  payload: InspectionResolvePayload
): Promise<Inspection> {
  const response = await fetch(`${API_BASE}/inspections/${id}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to resolve inspection' }));
    throw new Error(err.detail || 'Failed to resolve inspection');
  }
  return response.json();
}

export async function postSapWebhook(payload: SapWebhookPayload): Promise<any> {
  const response = await fetch(`${API_BASE}/sap-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to post SAP webhook' }));
    throw new Error(err.detail || 'Failed to post SAP webhook');
  }
  return response.json();
}

export async function loginSupervisor(
  username: string,
  pin: string = '1234'
): Promise<SupervisorProfile> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, pin }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

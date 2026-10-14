export type DefectType =
  | 'Weave Defect'
  | 'Shade Variation'
  | 'Hole/Tear'
  | 'Count Deviation'
  | 'Other';

export type Severity = 'Critical' | 'Major' | 'Minor';

export type Status = 'Open' | 'Resolved';

export interface Inspection {
  id: number;
  date: string; // YYYY-MM-DD
  line_id: string;
  defect_type: DefectType;
  severity: Severity;
  remarks?: string | null;
  status: Status;
  resolution_note?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  supervisor_name?: string | null;
  source: 'MANUAL' | 'SAP_WEBHOOK' | string;
  sap_notification_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionCreatePayload {
  date: string;
  line_id: string;
  defect_type: DefectType;
  severity: Severity;
  remarks?: string;
  supervisor_name?: string;
}

export interface InspectionResolvePayload {
  resolution_note: string;
  resolved_by?: string;
}

export interface SeverityCount {
  open: number;
  resolved: number;
  total: number;
}

export interface InspectionSummary {
  critical: SeverityCount;
  major: SeverityCount;
  minor: SeverityCount;
  total: SeverityCount;
  open_total: number;
  resolved_total: number;
  grand_total: number;
}

export interface SapWebhookPayload {
  notification_id?: string;
  plant_code?: string;
  work_center: string;
  material_code?: string;
  defect_code?: string;
  defect_description?: string;
  severity?: string;
  notes?: string;
}

export interface SupervisorProfile {
  username: string;
  name: string;
  role: string;
  plant: string;
  token: string;
}

export interface OfflineQueuedInspection {
  id: string; // local temporary uuid
  payload: InspectionCreatePayload;
  queuedAt: number;
}

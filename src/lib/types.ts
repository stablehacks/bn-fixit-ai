// Core Type Definitions for FixIt AI

export type UrgencyLevel = 'low' | 'normal' | 'high' | 'emergency';

export type RequestStatus =
  | 'submitted'
  | 'triaged'
  | 'work_order_created'
  | 'in_progress'
  | 'resolved'
  | 'cancelled';

export type WorkOrderStatus =
  | 'New'
  | 'Needs Information'
  | 'Awaiting Approval'
  | 'Approved'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type IssueCategory =
  | 'plumbing'
  | 'electrical'
  | 'heating_and_cooling'
  | 'appliances'
  | 'structural'
  | 'pest_control'
  | 'general_maintenance'
  | 'other';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface UserMembership {
  id: string;
  organization_id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'operator' | 'viewer' | 'tenant';
  created_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  unit_count: number;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  organization_id: string;
  property_id: string;
  unit_number: string;
  category: IssueCategory;
  description: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  reported_at: string;
  created_by: string;
  tenant_name?: string;
  tenant_phone?: string;
  photo_url?: string;
  ai_triage?: AITriageResult;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  organization_id: string;
  name: string;
  company: string;
  service_categories: IssueCategory[];
  service_area: string;
  availability_status: 'available' | 'busy' | 'on_call';
  contact_details: {
    phone: string;
    email: string;
  };
  response_time_est?: string;
  active: boolean;
  rating?: number;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  organization_id: string;
  request_id: string;
  contractor_id?: string;
  issue_summary: string;
  description: string;
  priority: UrgencyLevel;
  status: WorkOrderStatus;
  assigned_manager: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completion_notes?: string;
  approval_history: {
    approved_by?: string;
    approved_at?: string;
    notes?: string;
  }[];
  simulated_actions?: string[];
}

export interface AuditEvent {
  id: string;
  organization_id: string;
  actor_type: 'system' | 'agent' | 'user';
  actor_id: string;
  event_type:
    | 'request_received'
    | 'agent_triage_started'
    | 'classification_generated'
    | 'memories_retrieved'
    | 'contractor_recommended'
    | 'work_order_draft_created'
    | 'human_approval_recorded'
    | 'work_order_status_changed'
    | 'memory_recorded';
  entity_type: 'request' | 'work_order' | 'memory' | 'contractor';
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  organization_id: string;
  property_id: string;
  unit_number: string;
  source: 'repair_completion' | 'tenant_report' | 'operator_note';
  memory_type: 'confirmed_history' | 'agent_inference' | 'manager_preference';
  summary: string;
  details: string;
  confidence: number;
  created_at: string;
}

export interface ContractorRecommendation {
  contractor_id: string;
  contractor_name: string;
  company: string;
  service_area: string;
  match_score: number;
  match_reasons: string[];
  availability: 'available' | 'busy' | 'on_call';
  estimated_response_time: string;
}

export interface AITriageResult {
  issue_summary: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  confidence: number;
  missing_information: string[];
  safety_flags: string[];
  recommended_actions: string[];
  contractor_requirements: IssueCategory[];
  requires_human_review: boolean;
  reasoning_summary: string;
  is_emergency: boolean;
  emergency_guidance?: string;
  deterministic_safety_applied: boolean;
  recommended_contractor?: ContractorRecommendation;
  relevant_memories_found?: {
    memory_id: string;
    summary: string;
    influence: string;
  }[];
}

export interface EvaluationScenario {
  id: string;
  title: string;
  description: string;
  property_id: string;
  unit_number: string;
  tenant_category_input?: IssueCategory;
  input_text: string;
  expected_category: IssueCategory;
  expected_urgency: UrgencyLevel;
  expect_safety_escalation: boolean;
  expect_missing_info: boolean;
  expect_memory_retrieval: boolean;
  expected_memory_unit?: string;
  expect_contractor_found: boolean;
  expected_contractor_trade?: IssueCategory;
  test_unauthorized_org_access?: boolean;
}

export interface EvaluationResultItem {
  scenario_id: string;
  title: string;
  category_correct: boolean;
  urgency_correct: boolean;
  safety_escalated_correctly: boolean;
  contractor_matched_correctly: boolean;
  memory_relevance_correct: boolean;
  schema_valid: boolean;
  authorization_protected: boolean;
  passed: boolean;
  latency_ms: number;
  actual_summary: string;
  details: string;
}

export interface EvaluationSuiteReport {
  timestamp: string;
  total_scenarios: number;
  passed_scenarios: number;
  failed_scenarios: number;
  pass_rate: number;
  results: EvaluationResultItem[];
}

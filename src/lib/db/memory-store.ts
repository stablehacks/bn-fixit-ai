import {
  AgentMemory,
  AuditEvent,
  Contractor,
  MaintenanceRequest,
  Organization,
  Property,
  WorkOrder,
  WorkOrderStatus,
} from '../types';
import {
  DEMO_ORG_ID,
  SEED_AGENT_MEMORIES,
  SEED_AUDIT_EVENTS,
  SEED_CONTRACTORS,
  SEED_MAINTENANCE_REQUESTS,
  SEED_ORGANIZATION,
  SEED_PROPERTIES,
  SEED_WORK_ORDERS,
} from './seed-data';
import { generateId } from '../utils';

/**
 * Storage interface matching the SurrealDB data layer
 */
export interface IDataStore {
  // Organizations
  getOrganization(orgId: string): Promise<Organization | null>;

  // Properties
  getProperties(orgId: string): Promise<Property[]>;
  getProperty(orgId: string, propertyId: string): Promise<Property | null>;

  // Maintenance Requests
  getMaintenanceRequests(orgId: string): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(orgId: string, requestId: string): Promise<MaintenanceRequest | null>;
  createMaintenanceRequest(req: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(orgId: string, requestId: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null>;

  // Contractors
  getContractors(orgId: string): Promise<Contractor[]>;
  getContractor(orgId: string, contractorId: string): Promise<Contractor | null>;

  // Work Orders
  getWorkOrders(orgId: string): Promise<WorkOrder[]>;
  getWorkOrder(orgId: string, workOrderId: string): Promise<WorkOrder | null>;
  createWorkOrder(wo: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrder>;
  updateWorkOrderStatus(
    orgId: string,
    workOrderId: string,
    status: WorkOrderStatus,
    managerName: string,
    notes?: string
  ): Promise<WorkOrder | null>;

  // Agent Memory
  getMemories(orgId: string): Promise<AgentMemory[]>;
  createMemory(mem: Omit<AgentMemory, 'id' | 'created_at'>): Promise<AgentMemory>;

  // Audit Events
  getAuditEvents(orgId: string): Promise<AuditEvent[]>;
  createAuditEvent(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<AuditEvent>;

  // Reset / Reseed
  resetToSeed(): Promise<void>;
  isSurrealDbConnected(): boolean;
}

/**
 * Robust Local Adapter with Multi-Tenant Isolation
 * Automatically used when SurrealDB daemon is offline or unconfigured
 */
class LocalDataStore implements IDataStore {
  private organizations: Map<string, Organization> = new Map();
  private properties: Map<string, Property> = new Map();
  private contractors: Map<string, Contractor> = new Map();
  private requests: Map<string, MaintenanceRequest> = new Map();
  private workOrders: Map<string, WorkOrder> = new Map();
  private memories: Map<string, AgentMemory> = new Map();
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    this.organizations.set(SEED_ORGANIZATION.id, { ...SEED_ORGANIZATION });
    SEED_PROPERTIES.forEach(p => this.properties.set(p.id, { ...p }));
    SEED_CONTRACTORS.forEach(c => this.contractors.set(c.id, { ...c }));
    SEED_MAINTENANCE_REQUESTS.forEach(r => this.requests.set(r.id, { ...r }));
    SEED_WORK_ORDERS.forEach(w => this.workOrders.set(w.id, { ...w }));
    SEED_AGENT_MEMORIES.forEach(m => this.memories.set(m.id, { ...m }));
    this.auditEvents = SEED_AUDIT_EVENTS.map(a => ({ ...a }));
  }

  async resetToSeed(): Promise<void> {
    this.organizations.clear();
    this.properties.clear();
    this.contractors.clear();
    this.requests.clear();
    this.workOrders.clear();
    this.memories.clear();
    this.auditEvents = [];
    this.seed();
  }

  isSurrealDbConnected(): boolean {
    return false;
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    return this.organizations.get(orgId) || null;
  }

  async getProperties(orgId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.organization_id === orgId);
  }

  async getProperty(orgId: string, propertyId: string): Promise<Property | null> {
    const prop = this.properties.get(propertyId);
    if (!prop || prop.organization_id !== orgId) return null;
    return prop;
  }

  async getMaintenanceRequests(orgId: string): Promise<MaintenanceRequest[]> {
    return Array.from(this.requests.values())
      .filter(r => r.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getMaintenanceRequest(orgId: string, requestId: string): Promise<MaintenanceRequest | null> {
    const req = this.requests.get(requestId);
    if (!req || req.organization_id !== orgId) return null;
    return req;
  }

  async createMaintenanceRequest(
    data: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MaintenanceRequest> {
    const id = generateId('req');
    const now = new Date().toISOString();
    const newReq: MaintenanceRequest = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    this.requests.set(id, newReq);

    // Record audit event
    await this.createAuditEvent({
      organization_id: data.organization_id,
      actor_type: 'user',
      actor_id: data.created_by,
      event_type: 'request_received',
      entity_type: 'request',
      entity_id: id,
      metadata: { unit: data.unit_number, category: data.category, urgency: data.urgency },
    });

    return newReq;
  }

  async updateMaintenanceRequest(
    orgId: string,
    requestId: string,
    updates: Partial<MaintenanceRequest>
  ): Promise<MaintenanceRequest | null> {
    const existing = await this.getMaintenanceRequest(orgId, requestId);
    if (!existing) return null;

    const updated: MaintenanceRequest = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.requests.set(requestId, updated);
    return updated;
  }

  async getContractors(orgId: string): Promise<Contractor[]> {
    return Array.from(this.contractors.values()).filter(c => c.organization_id === orgId);
  }

  async getContractor(orgId: string, contractorId: string): Promise<Contractor | null> {
    const cont = this.contractors.get(contractorId);
    if (!cont || cont.organization_id !== orgId) return null;
    return cont;
  }

  async getWorkOrders(orgId: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values())
      .filter(w => w.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getWorkOrder(orgId: string, workOrderId: string): Promise<WorkOrder | null> {
    const wo = this.workOrders.get(workOrderId);
    if (!wo || wo.organization_id !== orgId) return null;
    return wo;
  }

  async createWorkOrder(data: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrder> {
    // Idempotency check: prevent duplicate work orders for same request
    const existingForRequest = Array.from(this.workOrders.values()).find(
      w => w.organization_id === data.organization_id && w.request_id === data.request_id
    );
    if (existingForRequest) {
      return existingForRequest;
    }

    const id = generateId('wo');
    const now = new Date().toISOString();
    const newWo: WorkOrder = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    this.workOrders.set(id, newWo);

    // Update maintenance request status
    await this.updateMaintenanceRequest(data.organization_id, data.request_id, {
      status: 'work_order_created',
    });

    // Record audit event
    await this.createAuditEvent({
      organization_id: data.organization_id,
      actor_type: 'agent',
      actor_id: 'agent_fixit',
      event_type: 'work_order_draft_created',
      entity_type: 'work_order',
      entity_id: id,
      metadata: { priority: data.priority, status: data.status, contractor_id: data.contractor_id },
    });

    return newWo;
  }

  async updateWorkOrderStatus(
    orgId: string,
    workOrderId: string,
    status: WorkOrderStatus,
    managerName: string,
    notes?: string
  ): Promise<WorkOrder | null> {
    const existing = await this.getWorkOrder(orgId, workOrderId);
    if (!existing) return null;

    // Validate status transition rules
    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      'New': ['Needs Information', 'Awaiting Approval', 'Approved', 'Cancelled'],
      'Needs Information': ['Awaiting Approval', 'Cancelled'],
      'Awaiting Approval': ['Approved', 'Needs Information', 'Cancelled'],
      'Approved': ['Scheduled', 'In Progress', 'Cancelled'],
      'Scheduled': ['In Progress', 'Cancelled'],
      'In Progress': ['Completed', 'Cancelled'],
      'Completed': [], // Terminal state
      'Cancelled': [], // Terminal state
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status transition from '${existing.status}' to '${status}'.`);
    }

    // Require completion notes if marking completed
    if (status === 'Completed' && (!notes || notes.trim() === '')) {
      throw new Error('Completion notes are required when marking a work order as Completed.');
    }

    const now = new Date().toISOString();
    const approvalHistory = [...existing.approval_history];

    if (status === 'Approved') {
      approvalHistory.push({
        approved_by: managerName,
        approved_at: now,
        notes: notes || 'Work order approved by manager',
      });
    }

    const updated: WorkOrder = {
      ...existing,
      status,
      updated_at: now,
      completed_at: status === 'Completed' ? now : existing.completed_at,
      completion_notes: notes || existing.completion_notes,
      approval_history: approvalHistory,
    };

    this.workOrders.set(workOrderId, updated);

    // Record audit event
    const eventType = status === 'Approved' ? 'human_approval_recorded' : 'work_order_status_changed';
    await this.createAuditEvent({
      organization_id: orgId,
      actor_type: 'user',
      actor_id: managerName,
      event_type: eventType,
      entity_type: 'work_order',
      entity_id: workOrderId,
      metadata: { previous_status: existing.status, new_status: status, notes },
    });

    // If completed, record a new memory in SurrealDB Agent Memory!
    if (status === 'Completed') {
      const relatedReq = await this.getMaintenanceRequest(orgId, existing.request_id);
      if (relatedReq) {
        await this.createMemory({
          organization_id: orgId,
          property_id: relatedReq.property_id,
          unit_number: relatedReq.unit_number,
          source: 'repair_completion',
          memory_type: 'confirmed_history',
          summary: `Completed repair: ${existing.issue_summary}`,
          details: `Work Order ${existing.id} marked Completed by ${managerName}. Completion Notes: ${notes || 'None'}. Contractor: ${existing.contractor_id || 'Internal'}`,
          confidence: 1.0,
        });
      }
    }

    return updated;
  }

  async getMemories(orgId: string): Promise<AgentMemory[]> {
    return Array.from(this.memories.values())
      .filter(m => m.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createMemory(data: Omit<AgentMemory, 'id' | 'created_at'>): Promise<AgentMemory> {
    const id = generateId('mem');
    const now = new Date().toISOString();
    const newMem: AgentMemory = {
      ...data,
      id,
      created_at: now,
    };
    this.memories.set(id, newMem);

    // Record audit event
    await this.createAuditEvent({
      organization_id: data.organization_id,
      actor_type: 'agent',
      actor_id: 'agent_memory_subsystem',
      event_type: 'memory_recorded',
      entity_type: 'memory',
      entity_id: id,
      metadata: { unit: data.unit_number, summary: data.summary, source: data.source },
    });

    return newMem;
  }

  async getAuditEvents(orgId: string): Promise<AuditEvent[]> {
    return this.auditEvents
      .filter(a => a.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createAuditEvent(data: Omit<AuditEvent, 'id' | 'created_at'>): Promise<AuditEvent> {
    const id = generateId('audit');
    const now = new Date().toISOString();
    const newAudit: AuditEvent = {
      ...data,
      id,
      created_at: now,
    };
    this.auditEvents.unshift(newAudit);
    return newAudit;
  }
}

// Global Singleton Instance
declare global {
  // eslint-disable-next-line no-var
  var __fixit_datastore: IDataStore | undefined;
}

export const memoryStore: IDataStore = global.__fixit_datastore || new LocalDataStore();

if (process.env.NODE_ENV !== 'production') {
  global.__fixit_datastore = memoryStore;
}

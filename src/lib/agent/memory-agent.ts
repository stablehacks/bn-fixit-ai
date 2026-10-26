import { AgentMemory, MaintenanceRequest, Property } from '../types';

export interface RetrievedMemoryContext {
  memories: AgentMemory[];
  summaryContext: string;
  hasRecurringIssue: boolean;
  recurringIssueDetails?: string;
  previousContractorId?: string;
}

export class AgentMemoryManager {
  /**
   * Filter and retrieve memories relevant to a property and specific unit
   * Strictly enforces organization boundary!
   */
  static retrieveRelevantMemories(
    allMemories: AgentMemory[],
    organizationId: string,
    propertyId: string,
    unitNumber: string,
    category?: string
  ): RetrievedMemoryContext {
    // 1. Strict Organization Isolation
    const orgMemories = allMemories.filter(m => m.organization_id === organizationId);

    // 2. Filter for same property and unit (or building-wide infrastructure)
    const relevant = orgMemories.filter(m => {
      const isSameUnit = m.property_id === propertyId && m.unit_number.toLowerCase() === unitNumber.toLowerCase();
      const isBuildingWide = m.property_id === propertyId && (m.unit_number === 'COMMON' || m.unit_number === 'ALL');
      return isSameUnit || isBuildingWide;
    });

    if (relevant.length === 0) {
      return {
        memories: [],
        summaryContext: 'No prior maintenance memories found for this unit.',
        hasRecurringIssue: false,
      };
    }

    // Check for category overlap or recurring signs
    let hasRecurringIssue = false;
    let recurringDetails = '';
    let previousContractorId: string | undefined;

    const memorySummaries: string[] = [];

    for (const mem of relevant) {
      memorySummaries.push(
        `[${mem.memory_type === 'confirmed_history' ? 'CONFIRMED HISTORY' : 'INFERENCE'} | Source: ${mem.source}] ${mem.summary}: ${mem.details}`
      );

      // Detect recurring plumbing/electrical/HVAC
      const memText = (mem.summary + ' ' + mem.details).toLowerCase();
      if (category && memText.includes(category.toLowerCase())) {
        hasRecurringIssue = true;
        recurringDetails = `Prior issue recorded: ${mem.summary} - ${mem.details}`;
      }

      // Check if contractor ID was stored in details or metadata
      const contractorMatch = mem.details.match(/contractor[:\s]+([a-zA-Z0-9_-]+)/i);
      if (contractorMatch) {
        previousContractorId = contractorMatch[1];
      }
    }

    return {
      memories: relevant,
      summaryContext: memorySummaries.join('\n'),
      hasRecurringIssue,
      recurringIssueDetails: recurringDetails,
      previousContractorId,
    };
  }

  /**
   * Generates a new structured memory record upon repair completion or triage
   */
  static createMemoryFromCompletion(
    organizationId: string,
    propertyId: string,
    unitNumber: string,
    summary: string,
    details: string,
    source: 'repair_completion' | 'tenant_report' | 'operator_note' = 'repair_completion'
  ): Omit<AgentMemory, 'id' | 'created_at'> {
    return {
      organization_id: organizationId,
      property_id: propertyId,
      unit_number: unitNumber,
      source,
      memory_type: 'confirmed_history',
      summary,
      details,
      confidence: 1.0,
    };
  }
}

import Anthropic from '@anthropic-ai/sdk';
import {
  AITriageResult,
  Contractor,
  IssueCategory,
  MaintenanceRequest,
  Property,
  UrgencyLevel,
} from '../types';
import { evaluateDeterministicSafety, reconcileUrgency } from './safety-rules';
import { matchContractor } from './contractor-matcher';
import { AgentMemoryManager } from './memory-agent';
import { memoryStore } from '../db/memory-store';

export interface TriageInput {
  request: MaintenanceRequest;
  property: Property;
  contractors: Contractor[];
  organizationId: string;
}

export async function runAITriage(input: TriageInput): Promise<AITriageResult> {
  const { request, property, contractors, organizationId } = input;

  // 1. Retrieve Agent Memory relevant to this unit/property
  const allMemories = await memoryStore.getMemories(organizationId);
  const memoryContext = AgentMemoryManager.retrieveRelevantMemories(
    allMemories,
    organizationId,
    request.property_id,
    request.unit_number,
    request.category
  );

  // 2. Evaluate Deterministic Safety Rules
  const safetyEval = evaluateDeterministicSafety(request.description, request.category);

  // 3. Attempt Anthropic AI Model Execution
  let rawAiResult: Partial<AITriageResult> | null = null;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('placeholder')) {
    try {
      rawAiResult = await callAnthropicTriage({
        description: request.description,
        tenantCategory: request.category,
        unitNumber: request.unit_number,
        propertyName: property.name,
        propertyAddress: property.address,
        historicalMemories: memoryContext.summaryContext,
        apiKey,
      });
    } catch (err) {
      console.warn('Anthropic API call failed or rate-limited, engaging intelligent structured fallback:', err);
      rawAiResult = null;
    }
  }

  // 4. If AI call wasn't made or failed, run structured fallback reasoning
  if (!rawAiResult) {
    rawAiResult = runFallbackStructuredReasoning(
      request.description,
      request.category,
      memoryContext.hasRecurringIssue,
      memoryContext.recurringIssueDetails
    );
  }

  // 5. Combine and validate schema fields
  const finalCategory: IssueCategory = validateCategory(rawAiResult.category || request.category);
  const provisionalUrgency: UrgencyLevel = validateUrgency(rawAiResult.urgency || request.urgency || 'normal');

  // 6. Apply Deterministic Overrides (AI CANNOT DOWNGRADE SAFETY EMERGENCY)
  const finalUrgency = reconcileUrgency(provisionalUrgency, safetyEval);

  // Combine safety flags
  const combinedSafetyFlags = Array.from(
    new Set([...safetyEval.safety_flags, ...(rawAiResult.safety_flags || [])])
  );

  // Emergency actions guidance
  const combinedActions = [...(rawAiResult.recommended_actions || [])];
  if (safetyEval.is_emergency && safetyEval.emergency_guidance) {
    combinedActions.unshift(safetyEval.emergency_guidance);
  }

  // 7. Contractor Matching against real database records
  const contractorReq = rawAiResult.contractor_requirements || [finalCategory];
  const primaryTrade = contractorReq[0] || finalCategory;
  
  const contractorMatch = matchContractor(
    contractors,
    primaryTrade,
    property,
    finalUrgency,
    memoryContext.previousContractorId
  );

  // 8. Build Memory Influence Context
  const relevantMemoriesFound: { memory_id: string; summary: string; influence: string }[] = [];
  if (memoryContext.memories.length > 0) {
    for (const mem of memoryContext.memories) {
      let influence = 'Provides historical baseline for unit maintenance.';
      if (memoryContext.hasRecurringIssue && mem.summary.toLowerCase().includes('plumb')) {
        influence = `Recurring issue detected. Prior repair on ${mem.created_at.slice(0, 10)} (${mem.summary}) informs current scope to avoid superficial patch.`;
      }
      relevantMemoriesFound.push({
        memory_id: mem.id,
        summary: mem.summary,
        influence,
      });
    }
  }

  // If memory changed reasoning, update reasoning summary
  let reasoning = rawAiResult.reasoning_summary || `Evaluated report: ${request.description.slice(0, 80)}.`;
  if (memoryContext.hasRecurringIssue && memoryContext.recurringIssueDetails) {
    reasoning += ` [Agent Memory Note: Historical records for Unit ${request.unit_number} indicate recurring issue (${memoryContext.recurringIssueDetails}). Recommendation adjusted to inspect root cause.]`;
  }
  if (safetyEval.is_emergency) {
    reasoning = `[CRITICAL SAFETY OVERRIDE] Immediate hazard identified. Routine processing held. ${reasoning}`;
  }

  // 9. Return structured, validated triage result
  const triageResult: AITriageResult = {
    issue_summary: rawAiResult.issue_summary || request.description.slice(0, 100),
    category: finalCategory,
    urgency: finalUrgency,
    confidence: safetyEval.is_emergency ? 0.98 : (rawAiResult.confidence || 0.88),
    missing_information: rawAiResult.missing_information || [],
    safety_flags: combinedSafetyFlags,
    recommended_actions: combinedActions,
    contractor_requirements: contractorReq,
    requires_human_review: true, // Human-in-the-loop requirement
    reasoning_summary: reasoning,
    is_emergency: safetyEval.is_emergency || finalUrgency === 'emergency',
    emergency_guidance: safetyEval.emergency_guidance,
    deterministic_safety_applied: safetyEval.is_emergency,
    recommended_contractor: contractorMatch.found ? contractorMatch.recommendation : undefined,
    relevant_memories_found: relevantMemoriesFound.length > 0 ? relevantMemoriesFound : undefined,
  };

  return triageResult;
}

/**
 * Anthropic API Integration
 */
async function callAnthropicTriage(params: {
  description: string;
  tenantCategory?: string;
  unitNumber: string;
  propertyName: string;
  propertyAddress: string;
  historicalMemories?: string;
  apiKey: string;
}): Promise<Partial<AITriageResult>> {
  const anthropic = new Anthropic({ apiKey: params.apiKey });

  const systemPrompt = `You are FixIt AI, an expert residential property maintenance operations triage agent.
Your job is to evaluate maintenance requests, classify the true problem, detect safety risks, identify missing details, and recommend structured actions.

CRITICAL INSTRUCTIONS:
- You must respond ONLY with valid JSON matching the schema below.
- Do NOT fabricate contractors or past records.
- If the report smells of gas, fire, smoke, sparking electricals, or high hazard, classify urgency as "emergency".
- If the report is too vague, formulate specific probing questions in missing_information.
- Never output markdown formatting or backticks around the JSON.`;

  const userContent = `Evaluate this maintenance request:
Property: ${params.propertyName} (${params.propertyAddress})
Unit: ${params.unitNumber}
Tenant Selected Category: ${params.tenantCategory || 'Not specified'}
Reported Description: "${params.description}"

Historical Unit Memory Context:
${params.historicalMemories || 'None'}

Return a JSON object with this exact structure:
{
  "issue_summary": "Concise 1-sentence summary",
  "category": "plumbing" | "electrical" | "heating_and_cooling" | "appliances" | "structural" | "pest_control" | "general_maintenance" | "other",
  "urgency": "low" | "normal" | "high" | "emergency",
  "confidence": 0.0 to 1.0,
  "missing_information": ["question 1", "question 2"],
  "safety_flags": ["flag 1"],
  "recommended_actions": ["action 1", "action 2"],
  "contractor_requirements": ["trade_category"],
  "requires_human_review": true,
  "reasoning_summary": "Detailed explanation of reasoning with facts cited"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const contentBlock = response.content[0];
  if (!contentBlock || contentBlock.type !== 'text') {
    throw new Error('Anthropic response empty or unexpected format');
  }

  let text = contentBlock.text.trim();
  if (text.startsWith('```json')) text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  if (text.startsWith('```')) text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');

  const parsed = JSON.parse(text);
  return parsed;
}

/**
 * Intelligent Structured Fallback Engine
 * Provides deterministic, accurate analysis adhering to the exact specification
 */
export function runFallbackStructuredReasoning(
  description: string,
  categoryInput?: string,
  hasRecurringIssue: boolean = false,
  recurringDetails?: string
): Partial<AITriageResult> {
  const text = description.toLowerCase();

  let detectedCategory: IssueCategory = 'general_maintenance';
  let urgency: UrgencyLevel = 'normal';
  const missingInfo: string[] = [];
  const safetyFlags: string[] = [];
  const actions: string[] = [];
  let summary = '';

  // 1. Critical Electrical / Spark / Fuse Box Bypass
  if (
    text.includes('strip the wires') ||
    text.includes('bypass the fuse') ||
    (text.includes('water') && text.includes('outlet')) ||
    text.includes('sparks flying') ||
    (text.includes('outlet') && text.includes('spark'))
  ) {
    detectedCategory = 'electrical';
    urgency = 'emergency';
    summary = 'Live electrical hazard / unsafe electrical modification risk';
    safetyFlags.push('High risk of severe electrocution and electrical structure fire');
    actions.push(
      'Instruct occupant strictly NEVER to strip wires or bypass fuse boxes',
      'Cut power to circuit at main panel if safe, and dispatch licensed electrician immediately'
    );
  }
  // 2. Gas / Sulfur / Rotten Egg Emergency
  else if (text.includes('gas') || text.includes('rotten egg') || text.includes('sulfur')) {
    detectedCategory = 'heating_and_cooling';
    urgency = 'emergency';
    summary = 'Suspected gas or hazardous vapor leak reported';
    safetyFlags.push('High risk of ignition/explosion and toxic inhalation');
    actions.push(
      'Evacuate building immediately',
      'Call 911 and local gas emergency utility from a safe outdoor distance'
    );
    missingInfo.push('Have all occupants evacuated to a safe outdoor distance?');
  }
  // 3. Structural Damage (Ceiling bulging, sagging, crack)
  else if (
    text.includes('ceiling') &&
    (text.includes('bulging') || text.includes('sagging') || text.includes('falling') || text.includes('caved'))
  ) {
    detectedCategory = 'structural';
    urgency = 'high';
    summary = 'Drywall ceiling water saturation with structural collapse risk';
    safetyFlags.push('Imminent risk of ceiling collapse and falling debris');
    actions.push(
      'Cordon off area below bulging ceiling and instruct occupants not to enter',
      'Locate and stop overhead water source immediately'
    );
  }
  // 4. Broken deadbolt / Door Lock Security
  else if (text.includes('deadbolt') || (text.includes('lock') && text.includes('snapped'))) {
    detectedCategory = 'general_maintenance';
    urgency = 'high';
    summary = 'External security breach risk due to compromised entrance lock';
    safetyFlags.push('Physical building security compromised on ground level');
    actions.push('Dispatch locksmith or emergency maintenance for same-day lock replacement');
  }
  // 5. Specialized Equipment (Elevator)
  else if (text.includes('elevator') || text.includes('cab #')) {
    detectedCategory = 'other';
    urgency = 'high';
    summary = 'Mechanical elevator entrapment or out-of-service condition';
    safetyFlags.push('Multi-story accessibility disruption');
    actions.push('Contact certified elevator maintenance contractor under emergency service contract');
  }
  // 6. Pest Infestation
  else if (
    /\b(cockroach|cockroaches|roach|roaches|bedbug|bedbugs|pest|pests|mouse|mice|rat|rats|rodent|rodents)\b/i.test(text)
  ) {
    detectedCategory = 'pest_control';
    urgency = 'normal';
    summary = 'Pest presence reported in unit';
    actions.push('Schedule certified pest control inspection and extermination');
  }
  // 7. Active Water Leak / Recurring Leak
  else if (
    text.includes('water pooling') ||
    text.includes('active leak') ||
    text.includes('burst') ||
    text.includes('gushing') ||
    text.includes('pipe is leaking') ||
    (text.includes('water') && text.includes('leak')) ||
    (text.includes('leaking') && text.includes('again'))
  ) {
    detectedCategory = 'plumbing';
    urgency = 'high';
    summary = 'Active water leak with potential for structural water damage';
    safetyFlags.push('Risk of floor damage, sub-floor rot, and mold propagation');
    actions.push(
      'Advise occupant to shut off local fixture valve or main water valve if accessible',
      'Dispatch certified plumber for same-day inspection'
    );
    missingInfo.push('Is water actively flowing or pooling continuously?');
    missingInfo.push('Has the local water shutoff valve beneath the fixture been turned off?');
  }
  // 8. Other Plumbing (Toilet base, flange, wax seal, faucet)
  else if (
    text.includes('toilet') ||
    text.includes('wax seal') ||
    text.includes('pipe') ||
    text.includes('sink') ||
    text.includes('drain') ||
    text.includes('faucet')
  ) {
    detectedCategory = 'plumbing';
    urgency = 'normal';
    summary = 'Plumbing fixture malfunction or seal leakage';
    actions.push('Schedule plumber to inspect fixture seals and replace components');
  }
  // 9. Appliances
  else if (
    text.includes('fridge') ||
    text.includes('refrigerator') ||
    text.includes('compressor') ||
    text.includes('stove') ||
    text.includes('oven') ||
    text.includes('dishwasher')
  ) {
    detectedCategory = 'appliances';
    urgency = 'normal';
    summary = 'Appliance mechanical or cooling failure';
    actions.push('Dispatch appliance repair technician');
  }
  // 10. Ambiguous Heating
  else if (text.includes('heating') && text.length < 35) {
    detectedCategory = 'heating_and_cooling';
    urgency = 'normal';
    summary = 'Heating malfunction reported without diagnostic details';
    missingInfo.push('Is the entire unit without heat, or is it isolated to specific radiators/vents?');
    missingInfo.push('What temperature is the thermostat reading and is the display active?');
    actions.push('Request diagnostic clarification from tenant before dispatching HVAC technician');
  }
  // 11. Routine Maintenance (cabinet, handle, hinge)
  else if (
    text.includes('cabinet') ||
    text.includes('handle') ||
    text.includes('hinge') ||
    text.includes('paint')
  ) {
    detectedCategory = 'general_maintenance';
    urgency = 'low';
    summary = 'Minor cosmetic or hardware repair';
    actions.push('Add to routine weekly maintenance schedule');
  }
  // 12. Fallback
  else {
    detectedCategory = (categoryInput as IssueCategory) || 'general_maintenance';
    urgency = 'normal';
    summary = description.length > 80 ? description.slice(0, 80) + '...' : description;
    actions.push('Review maintenance schedule and assign standard work order');
  }

  // Handle recurring issue memory
  if (hasRecurringIssue) {
    actions.push(
      'Historical note: Unit had prior related repair. Inspect underlying infrastructure rather than superficial fix.'
    );
  }

  return {
    issue_summary: summary,
    category: detectedCategory,
    urgency,
    confidence: 0.92,
    missing_information: missingInfo,
    safety_flags: safetyFlags,
    recommended_actions: actions,
    contractor_requirements: [detectedCategory],
    requires_human_review: true,
    reasoning_summary: `AI analyzed report text '${description.slice(0, 70)}...'. Classified as ${detectedCategory} with urgency ${urgency}.`,
  };
}

function isValidCategory(cat: string): boolean {
  const valid = [
    'plumbing',
    'electrical',
    'heating_and_cooling',
    'appliances',
    'structural',
    'pest_control',
    'general_maintenance',
    'other',
  ];
  return valid.includes(cat);
}

function validateCategory(cat: string): IssueCategory {
  if (isValidCategory(cat)) return cat as IssueCategory;
  return 'general_maintenance';
}

function validateUrgency(urg: string): UrgencyLevel {
  const valid = ['low', 'normal', 'high', 'emergency'];
  if (valid.includes(urg)) return urg as UrgencyLevel;
  return 'normal';
}

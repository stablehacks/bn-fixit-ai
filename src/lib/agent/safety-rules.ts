import { UrgencyLevel } from '../types';

export interface DeterministicSafetyEvaluation {
  is_emergency: boolean;
  forced_urgency?: UrgencyLevel;
  safety_flags: string[];
  emergency_guidance?: string;
  prevent_routine_scheduling: boolean;
  requires_immediate_human_dispatch: boolean;
  detected_hazard_type?: 'gas_leak' | 'electrical_hazard' | 'fire_or_smoke' | 'major_flooding' | 'structural_collapse' | 'carbon_monoxide';
}

export function evaluateDeterministicSafety(description: string, category?: string): DeterministicSafetyEvaluation {
  const text = (description + ' ' + (category || '')).toLowerCase();

  // 1. Gas Leak / Rotten Egg Smell / Natural Gas / Hissing pipe
  const gasKeywords = ['gas leak', 'smell gas', 'rotten egg', 'sulfur smell', 'natural gas', 'gas odour', 'gas odor', 'carbon monoxide'];
  const hasGas = gasKeywords.some(kw => text.includes(kw));

  if (hasGas) {
    return {
      is_emergency: true,
      forced_urgency: 'emergency',
      safety_flags: [
        'CRITICAL: Suspected gas or hazardous vapor leak detected',
        'High explosion and inhalation risk',
        'Occupant evacuation advised immediately'
      ],
      emergency_guidance:
        'EMERGENCY GAS PROTOCOL: 1. Do NOT operate light switches, doorbells, phones, or any electrical devices. 2. Do NOT light matches or create open flames. 3. Immediately evacuate all occupants from the building. 4. Call 911 and the emergency gas utility immediately from an outside phone. 5. Prevent entry to the building until cleared by emergency authorities.',
      prevent_routine_scheduling: true,
      requires_immediate_human_dispatch: true,
      detected_hazard_type: text.includes('carbon monoxide') ? 'carbon_monoxide' : 'gas_leak',
    };
  }

  // 2. Fire, Smoke, Sparks, Burning Smell
  const fireKeywords = ['smoke', 'fire', 'flames', 'sparks flying', 'burning smell', 'electrical burning', 'outlet sparking'];
  const hasFireOrSparks = fireKeywords.some(kw => text.includes(kw));

  if (hasFireOrSparks) {
    return {
      is_emergency: true,
      forced_urgency: 'emergency',
      safety_flags: [
        'CRITICAL: Fire or live electrical sparking detected',
        'Immediate threat to life and structure',
      ],
      emergency_guidance:
        'EMERGENCY FIRE / ELECTRICAL HAZARD: 1. If there is active flame or heavy smoke, evacuate immediately and call 911. 2. Do NOT touch sparking outlets or electrical equipment. 3. If safely accessible from the main breaker panel without stepping in water, cut power to the affected circuit. 4. Dispatch certified emergency electrician immediately.',
      prevent_routine_scheduling: true,
      requires_immediate_human_dispatch: true,
      detected_hazard_type: 'fire_or_smoke',
    };
  }

  // 3. Water contacting Electrical Outlets / Breakers / Wiring
  const waterElectKeywords = [
    'water near outlet', 'water in electrical', 'outlet wet', 'breaker wet',
    'water dripping on outlet', 'panel sparking', 'water touching wires', 'leak on light fixture'
  ];
  const hasWaterElectrical = waterElectKeywords.some(kw => text.includes(kw)) ||
    (text.includes('water') && text.includes('outlet')) ||
    (text.includes('leak') && text.includes('light fixture')) ||
    (text.includes('water') && text.includes('breaker'));

  if (hasWaterElectrical) {
    return {
      is_emergency: true,
      forced_urgency: 'emergency',
      safety_flags: [
        'CRITICAL: Water contacting electrical infrastructure',
        'Extreme electrocution and electrical fire hazard',
      ],
      emergency_guidance:
        'CRITICAL SAFETY WARNING: Water is contacting electrical systems. Do NOT touch wet switches, appliances, or standing water near outlets. Keep occupants away from the room. Safely shut down power from the main panel only if the panel itself is completely dry and safe to approach. Immediate emergency dispatch required.',
      prevent_routine_scheduling: true,
      requires_immediate_human_dispatch: true,
      detected_hazard_type: 'electrical_hazard',
    };
  }

  // 4. Major Burst Pipe / Active Ceiling Collapse / Heavy Flooding
  const majorFlooding = ['burst pipe', 'gushing water', 'water gushing', 'ceiling collapsing', 'ceiling caved in', 'sewage backup'];
  const hasMajorFlood = majorFlooding.some(kw => text.includes(kw));

  if (hasMajorFlood) {
    return {
      is_emergency: true,
      forced_urgency: 'high',
      safety_flags: [
        'URGENT: Active uncontrolled water flow or structural saturation',
        'Imminent major property damage and mold hazard',
      ],
      emergency_guidance:
        'HIGH PRIORITY WATER ACTION: 1. Instruct occupant to locate and close the main water shut-off valve immediately if safe to reach. 2. Clear valuables from beneath the affected area. 3. Fast-track emergency plumber dispatch.',
      prevent_routine_scheduling: false,
      requires_immediate_human_dispatch: true,
      detected_hazard_type: 'major_flooding',
    };
  }

  // Safe baseline
  return {
    is_emergency: false,
    safety_flags: [],
    prevent_routine_scheduling: false,
    requires_immediate_human_dispatch: false,
  };
}

/**
 * Enforces that AI cannot downgrade an emergency identified by deterministic safety rules
 */
export function reconcileUrgency(aiUrgency: UrgencyLevel, safetyEval: DeterministicSafetyEvaluation): UrgencyLevel {
  if (safetyEval.is_emergency) {
    if (safetyEval.forced_urgency === 'emergency') {
      return 'emergency';
    }
    if (safetyEval.forced_urgency === 'high' && (aiUrgency === 'low' || aiUrgency === 'normal')) {
      return 'high';
    }
  }
  return aiUrgency;
}

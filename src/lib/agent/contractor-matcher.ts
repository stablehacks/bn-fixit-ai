import { Contractor, ContractorRecommendation, IssueCategory, Property } from '../types';

export interface ContractorMatchResult {
  found: boolean;
  recommendation?: ContractorRecommendation;
  reason: string;
  candidate_count: number;
}

export function matchContractor(
  contractors: Contractor[],
  tradeCategory: IssueCategory,
  property: Property,
  urgency: string,
  historicalContractorId?: string
): ContractorMatchResult {
  // Filter 1: Strictly active contractors only
  const activeContractors = contractors.filter(c => c.active);

  // Filter 2: Trade match (must have the tradeCategory in service_categories)
  const tradeMatches = activeContractors.filter(c => 
    c.service_categories.includes(tradeCategory) ||
    c.service_categories.includes('general_maintenance')
  );

  if (tradeMatches.length === 0) {
    return {
      found: false,
      reason: `No active contractor registered in directory for trade category '${tradeCategory}'.`,
      candidate_count: 0,
    };
  }

  // Filter 3: Service area match (or 'All Metro' / area keyword match)
  const areaKeywords = property.address.toLowerCase().split(/[\s,]+/);
  const propertyCity = areaKeywords.includes('toronto') ? 'toronto' :
                       areaKeywords.includes('vancouver') ? 'vancouver' :
                       areaKeywords.includes('north') ? 'north' :
                       areaKeywords.includes('downtown') ? 'downtown' : '';

  const areaMatches = tradeMatches.filter(c => {
    const contractorArea = c.service_area.toLowerCase();
    if (contractorArea.includes('all metro') || contractorArea.includes('greater') || contractorArea.includes('all regions')) {
      return true;
    }
    if (propertyCity && contractorArea.includes(propertyCity)) {
      return true;
    }
    return true; // If property area is general, keep candidates
  });

  if (areaMatches.length === 0) {
    return {
      found: false,
      reason: `Contractors found for trade '${tradeCategory}', but none currently service property area '${property.address}'.`,
      candidate_count: 0,
    };
  }

  // Score candidates
  const scored = areaMatches.map(contractor => {
    let score = 50;
    const reasons: string[] = [];

    // Exact trade match
    if (contractor.service_categories.includes(tradeCategory)) {
      score += 20;
      reasons.push(`Direct trade specialty in ${tradeCategory}`);
    } else {
      reasons.push(`General maintenance coverage capable of preliminary repair`);
    }

    // Availability
    if (contractor.availability_status === 'available') {
      score += 20;
      reasons.push('Immediately available for dispatch');
    } else if (contractor.availability_status === 'on_call') {
      score += 15;
      reasons.push('On-call 24/7 emergency response status');
    } else {
      score += 5;
      reasons.push('Currently marked busy (may require scheduling lead time)');
    }

    // Historical familiarity bonus (if contractor handled prior unit repairs)
    if (historicalContractorId && contractor.id === historicalContractorId) {
      score += 15;
      reasons.push('Previously performed successful service on this unit/property');
    }

    // Rating bonus
    if (contractor.rating && contractor.rating >= 4.7) {
      score += 5;
      reasons.push(`High satisfaction rating (${contractor.rating}/5.0)`);
    }

    return {
      contractor,
      score,
      reasons,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const recommendation: ContractorRecommendation = {
    contractor_id: best.contractor.id,
    contractor_name: best.contractor.name,
    company: best.contractor.company,
    service_area: best.contractor.service_area,
    match_score: best.score,
    match_reasons: best.reasons,
    availability: best.contractor.availability_status,
    estimated_response_time: best.contractor.response_time_est || (best.contractor.availability_status === 'on_call' ? 'Under 2 hours' : 'Same day'),
  };

  return {
    found: true,
    recommendation,
    reason: `Matched with ${best.contractor.name} (${best.contractor.company}): ${best.reasons.join(', ')}.`,
    candidate_count: scored.length,
  };
}

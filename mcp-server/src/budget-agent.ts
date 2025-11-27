/**
 * Budget Agent
 * Specialized tool for research budgeting, grant proposals, and investor decks
 */

import type {
  BudgetTemplate,
  BudgetComparison,
  BudgetAnalysisRequest,
  DirectCosts,
  IndirectCosts,
  ContingencyFund,
  BudgetMetrics,
  ROIProjection,
  BudgetGuidance,
} from './budget-agent-types.js';

/**
 * Best practices for research budgeting
 */
export const BUDGET_BEST_PRACTICES = {
  general: [
    'Be Detailed: Provide realistic and detailed estimates for every line item',
    'Write a Justification: Thoroughly explain the necessity of each cost and how figures were calculated',
    'Follow Sponsor Guidelines: Always defer to specific instructions in RFP or FOA',
    'Prioritize Data Costs: Data readiness, quality control, labeling, and governance require significant resources',
    'Account for Compute: Budget for significant cloud costs, distinguishing fixed vs. variable API usage',
    'Build in Flexibility: Allocate 10-15% contingency fund for unforeseen technical or regulatory hurdles',
    'Specify Pricing Metrics: Understand vendor pricing models (per token, per character) to avoid overages',
  ],
  grants: [
    'Provide extensive itemized documentation for every single expense',
    'Follow strict sponsor guidelines with proper line items for salaries, fringe benefits, equipment',
    'Calculate indirect costs at institutional negotiated rate',
    'Write detailed budget narrative in everyday language',
    'Align spending with specific project periods and grant milestones',
    'Address ethical, legal, and operational risks related to privacy and bias',
  ],
  investors: [
    'Focus on high-level major expense categories tied to milestones',
    'Emphasize high-impact areas: R&D, model development, data gathering, talent acquisition',
    'Show compelling business case blending customer impact with traction metrics',
    'Anchor spending to development milestones (MVP launch, pilot count) not dates',
    'Highlight competitive advantage and risk mitigation for market resilience',
    'Demonstrate software-like business model with recurring revenue',
  ],
};

/**
 * Template sources by category
 */
export const TEMPLATE_SOURCES = {
  university: [
    'Harvard University Research Administration',
    'University of Pennsylvania Office of Research Services',
    'Stanford University Research Administration',
    'Boston University Office of Sponsored Programs',
    'Rutgers Research and Sponsored Programs',
    'University of Utah Office of Sponsored Projects',
    'Western Sydney University Research Office',
  ],
  federal: [
    'National Science Foundation (NSF) - Grant Proposal Guide',
    'National Institutes of Health (NIH) - SF424 Forms',
    'Defense Advanced Research Projects Agency (DARPA)',
    'Department of Energy (DOE) - Financial Assistance',
  ],
  software: ['Microsoft Excel Budget Templates', 'Google Sheets Research Budget Templates'],
};

/**
 * Calculate fringe benefits based on salary total
 */
export function calculateFringeBenefits(totalSalaries: number, fringeRate: number = 0.3): number {
  return totalSalaries * fringeRate;
}

/**
 * Calculate indirect costs (F&A)
 */
export function calculateIndirectCosts(
  directCostsBase: number,
  indirectRate: number = 0.55
): IndirectCosts {
  const total = directCostsBase * indirectRate;
  return {
    rate: indirectRate,
    base_amount: directCostsBase,
    total,
  };
}

/**
 * Calculate contingency fund
 */
export function calculateContingency(
  totalDirectCosts: number,
  percentage: number = 0.125
): ContingencyFund {
  return {
    percentage,
    amount: totalDirectCosts * percentage,
    justification: `${percentage * 100}% contingency allocated for unforeseen technical challenges, regulatory hurdles, or "fail fast" proof-of-concepts in LLM research`,
  };
}

/**
 * Generate grant-focused budget template
 */
export function generateGrantBudget(request: BudgetAnalysisRequest): BudgetTemplate {
  const years = request.project_duration_years || 3;
  const teamSize = request.estimated_team_size || 3;

  // Estimate direct costs for AI/ML research
  const directCosts: DirectCosts = {
    salaries_wages: {
      principal_investigator: 75000 * years * 0.2, // 20% effort
      research_assistants: 55000 * years * (teamSize - 1),
      project_managers: 0,
      data_scientists: 85000 * years * Math.floor(teamSize / 2),
      ml_engineers: 95000 * years * Math.floor(teamSize / 3),
    },
    fringe_benefits: 0, // Calculated below
    equipment: {
      compute_infrastructure: 150000, // One-time GPU cluster
      software_licenses: 25000 * years,
      other_equipment: 10000,
    },
    travel: {
      conferences: 8000 * years,
      field_work: 5000 * years,
      collaboration: 3000 * years,
    },
    data_costs: {
      acquisition: 50000 * years,
      labeling: 75000 * years,
      quality_control: 30000 * years,
      governance: 15000 * years,
    },
    compute_costs: {
      cloud_services: 120000 * years, // AWS/GCP for training
      api_usage: 30000 * years, // LLM API calls
      storage: 12000 * years,
    },
    supplies_materials: 5000 * years,
    other_direct_costs: {
      publication_fees: 8000 * years,
      consultant_services: 25000 * years,
      ethics_review: 5000,
    },
  };

  // Calculate total salaries for fringe
  const totalSalaries = Object.values(directCosts.salaries_wages).reduce((a, b) => a + b, 0);
  directCosts.fringe_benefits = calculateFringeBenefits(totalSalaries);

  // Calculate total direct costs
  const totalDirectCosts =
    totalSalaries +
    directCosts.fringe_benefits +
    Object.values(directCosts.equipment).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.travel).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.data_costs).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.compute_costs).reduce((a, b) => a + b, 0) +
    directCosts.supplies_materials +
    Object.values(directCosts.other_direct_costs).reduce((a, b) => a + b, 0);

  // Calculate indirect costs
  const indirectCosts = calculateIndirectCosts(totalDirectCosts);

  // Calculate contingency
  const contingency = calculateContingency(totalDirectCosts);

  const totalBudget = totalDirectCosts + indirectCosts.total + contingency.amount;

  return {
    audience: 'grant',
    research_type: request.research_type || 'academic',
    funding_agency: request.funding_agency,
    project_duration_years: years,
    direct_costs: directCosts,
    indirect_costs: indirectCosts,
    contingency,
    total_budget: totalBudget,
    metrics: {
      total_project_cost: totalBudget,
      cost_per_year: totalBudget / years,
    },
    justification: generateGrantJustification(request, directCosts, years),
  };
}

/**
 * Generate investor-focused budget template
 */
export function generateInvestorBudget(request: BudgetAnalysisRequest): BudgetTemplate {
  const years = request.project_duration_years || 2;
  const teamSize = request.estimated_team_size || 5;

  // Investor budgets focus on scaling and market growth
  const directCosts: DirectCosts = {
    salaries_wages: {
      principal_investigator: 0, // Often founder equity instead
      research_assistants: 0,
      project_managers: 95000 * years * 1,
      data_scientists: 125000 * years * Math.ceil(teamSize / 2),
      ml_engineers: 140000 * years * Math.ceil(teamSize / 2),
    },
    fringe_benefits: 0, // Calculated below
    equipment: {
      compute_infrastructure: 250000, // Production-grade infrastructure
      software_licenses: 50000 * years,
      other_equipment: 15000,
    },
    travel: {
      conferences: 15000 * years, // Sales conferences
      field_work: 0,
      collaboration: 10000 * years, // Customer meetings
    },
    data_costs: {
      acquisition: 100000 * years, // Proprietary datasets as moat
      labeling: 150000 * years,
      quality_control: 50000 * years,
      governance: 30000 * years,
    },
    compute_costs: {
      cloud_services: 300000 * years, // Scalable production
      api_usage: 80000 * years, // Growing user base
      storage: 25000 * years,
    },
    supplies_materials: 3000 * years,
    other_direct_costs: {
      publication_fees: 0,
      consultant_services: 50000 * years, // Business consultants
      ethics_review: 15000, // One-time comprehensive audit
    },
  };

  const totalSalaries = Object.values(directCosts.salaries_wages).reduce((a, b) => a + b, 0);
  directCosts.fringe_benefits = calculateFringeBenefits(totalSalaries, 0.35); // Higher for startup

  const totalDirectCosts =
    totalSalaries +
    directCosts.fringe_benefits +
    Object.values(directCosts.equipment).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.travel).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.data_costs).reduce((a, b) => a + b, 0) +
    Object.values(directCosts.compute_costs).reduce((a, b) => a + b, 0) +
    directCosts.supplies_materials +
    Object.values(directCosts.other_direct_costs).reduce((a, b) => a + b, 0);

  // No indirect costs for investor pitch - already in operational overhead
  const indirectCosts: IndirectCosts = {
    rate: 0,
    base_amount: 0,
    total: 0,
  };

  const contingency = calculateContingency(totalDirectCosts, 0.15);
  const totalBudget = totalDirectCosts + contingency.amount;

  // Calculate investor metrics
  const projectedMRR = 50000; // Example
  const projectedARR = projectedMRR * 12;
  const customerCAC = 5000;
  const customerLTV = 25000;

  return {
    audience: 'investor',
    research_type: request.research_type || 'startup',
    project_duration_years: years,
    direct_costs: directCosts,
    indirect_costs: indirectCosts,
    contingency,
    total_budget: totalBudget,
    metrics: {
      monthly_recurring_revenue: projectedMRR,
      annual_recurring_revenue: projectedARR,
      customer_acquisition_cost: customerCAC,
      lifetime_value: customerLTV,
      ltv_cac_ratio: customerLTV / customerCAC,
      churn_rate: 0.05, // 5% monthly
      net_revenue_retention: 1.15, // 115%
      gross_margin: 0.75, // 75%
    },
    justification: generateInvestorJustification(request, directCosts, years),
  };
}

/**
 * Generate comparison between grant and investor budgets
 */
export function generateBudgetComparison(request: BudgetAnalysisRequest): BudgetComparison {
  const grantBudget = generateGrantBudget(request);
  const investorBudget = generateInvestorBudget(request);

  return {
    grant_version: grantBudget,
    investor_version: investorBudget,
    key_differences: [
      {
        category: 'Goal',
        grant_approach: 'Demonstrate expertise and responsible financial planning for scientific objectives',
        investor_approach: 'Show high growth potential and market viability for ROI',
        rationale: 'Grants fund knowledge creation; investments fund market growth',
      },
      {
        category: 'Detail Level',
        grant_approach: 'Extensive itemization with full documentation and justification',
        investor_approach: 'High-level categories tied to milestones with financials in appendix',
        rationale: 'Grants require accountability; investors need strategic overview',
      },
      {
        category: 'Personnel Costs',
        grant_approach: `$${Math.round(grantBudget.direct_costs.salaries_wages.principal_investigator + grantBudget.direct_costs.salaries_wages.research_assistants).toLocaleString()} academic team`,
        investor_approach: `$${Math.round(investorBudget.direct_costs.salaries_wages.data_scientists + investorBudget.direct_costs.salaries_wages.ml_engineers).toLocaleString()} industry engineers`,
        rationale: 'Academic rates vs. competitive industry salaries',
      },
      {
        category: 'Indirect Costs',
        grant_approach: `${(grantBudget.indirect_costs.rate * 100).toFixed(0)}% F&A rate = $${Math.round(grantBudget.indirect_costs.total).toLocaleString()}`,
        investor_approach: 'No separate F&A - included in operational overhead',
        rationale: 'Institutional overhead vs. startup burn rate',
      },
      {
        category: 'Compute Strategy',
        grant_approach: 'Fixed infrastructure investment + modest cloud usage',
        investor_approach: 'Scalable cloud-first approach for growth',
        rationale: 'Research reproducibility vs. production scalability',
      },
      {
        category: 'Success Metrics',
        grant_approach: 'Publications, datasets, scientific progress',
        investor_approach: `ARR: $${investorBudget.metrics.annual_recurring_revenue?.toLocaleString()}, LTV:CAC: ${investorBudget.metrics.ltv_cac_ratio?.toFixed(1)}x`,
        rationale: 'Scientific merit vs. market performance',
      },
    ],
  };
}

/**
 * Generate budget justification for grant proposals
 */
function generateGrantJustification(
  request: BudgetAnalysisRequest,
  costs: DirectCosts,
  years: number
): string {
  return `BUDGET JUSTIFICATION

Project: ${request.research_description}
Duration: ${years} years

PERSONNEL
The research team includes a Principal Investigator providing scientific direction, research assistants for day-to-day execution, data scientists for model development, and ML engineers for infrastructure. Salary rates follow institutional guidelines and NIH/NSF standards. Fringe benefits are calculated at the institutional rate.

DATA COSTS ($${Math.round((costs.data_costs.acquisition + costs.data_costs.labeling + costs.data_costs.quality_control + costs.data_costs.governance) / 1000)}K/year)
High-quality, diverse datasets are critical for LLM research. Costs include data acquisition, professional annotation services, rigorous quality control processes, and governance frameworks to ensure ethical compliance and bias mitigation.

COMPUTE INFRASTRUCTURE ($${Math.round((costs.compute_costs.cloud_services + costs.compute_costs.api_usage + costs.compute_costs.storage) / 1000)}K/year)
Large-scale model training and evaluation require significant computational resources. Cloud services provide flexible GPU access for training runs, API costs cover third-party LLM usage for benchmarking, and storage accommodates large datasets and model checkpoints.

EQUIPMENT
Initial investment in dedicated GPU compute infrastructure ensures reproducibility and reduces long-term cloud costs. Software licenses cover necessary tools for data processing, model development, and analysis.

TRAVEL
Conference attendance enables dissemination of research findings, collaboration with peers, and staying current with rapidly evolving field developments.

All costs are calculated conservatively based on current market rates and institutional experience with similar AI/ML projects.`;
}

/**
 * Generate budget justification for investor decks
 */
function generateInvestorJustification(
  request: BudgetAnalysisRequest,
  costs: DirectCosts,
  years: number
): string {
  return `INVESTMENT SUMMARY

Opportunity: ${request.research_description}
Runway: ${years} years to Series A milestones

TALENT ACQUISITION
We're assembling a world-class AI/ML team with competitive compensation packages. Our team structure prioritizes senior engineers and data scientists who can deliver production-ready models and scale infrastructure efficiently. Salaries are benchmarked against FAANG compensation to attract top-tier talent.

PROPRIETARY DATA ADVANTAGE ($${Math.round((costs.data_costs.acquisition + costs.data_costs.labeling) / 1000)}K/year)
Our unique datasets and annotation pipeline create a defensible moat. Investment in data quality and governance ensures we can monetize this advantage while maintaining ethical standards and regulatory compliance.

SCALABLE INFRASTRUCTURE ($${Math.round(costs.compute_costs.cloud_services / 1000)}K/year)
Cloud-first architecture enables rapid scaling as we onboard customers. Infrastructure costs are structured to scale linearly with revenue, maintaining healthy unit economics. Current estimates support 10x user growth.

GO-TO-MARKET
Travel and business development budget supports pilot programs, customer discovery, and strategic partnerships. These investments directly drive our path to $1M ARR.

CAPITAL EFFICIENCY
15% contingency buffer provides runway for pivots and optimization while maintaining 18-24 months to key milestones. Our burn rate is structured to hit product-market fit within 12 months.

This budget demonstrates a capital-efficient path to achieving $1M ARR with clear ROI metrics (75% gross margin, 3x+ LTV:CAC) that position us for a strong Series A raise.`;
}

/**
 * Generate comprehensive budget guidance
 */
export function generateBudgetGuidance(audience: 'grant' | 'investor' | 'both'): BudgetGuidance {
  const guidance: BudgetGuidance = {
    best_practices: [],
    template_sources: [],
    key_considerations: [],
    common_pitfalls: [],
    emerging_trends: [],
  };

  if (audience === 'grant' || audience === 'both') {
    guidance.best_practices.push(...BUDGET_BEST_PRACTICES.grants);
    guidance.template_sources.push(...TEMPLATE_SOURCES.university, ...TEMPLATE_SOURCES.federal);
    guidance.key_considerations.push(
      'Calculate F&A at institutional negotiated rate',
      'Justify every line item with research necessity',
      'Align timeline with grant period requirements',
      'Address data privacy and ethical considerations',
      'Include data sharing and open science plans'
    );
    guidance.common_pitfalls.push(
      'Underestimating data quality control costs',
      'Forgetting to include publication fees',
      'Miscalculating fringe benefit rates',
      'Inadequate justification narrative',
      'Not following sponsor-specific guidelines'
    );
  }

  if (audience === 'investor' || audience === 'both') {
    guidance.best_practices.push(...BUDGET_BEST_PRACTICES.investors);
    guidance.template_sources.push('Y Combinator financial models', 'First Round Capital templates');
    guidance.key_considerations.push(
      'Show unit economics and path to profitability',
      'Demonstrate capital efficiency and runway',
      'Highlight competitive advantages (data moats)',
      'Tie spending to measurable milestones',
      'Project ARR, LTV:CAC, and gross margins'
    );
    guidance.common_pitfalls.push(
      'Unrealistic customer acquisition costs',
      'Underestimating engineering salaries',
      'Ignoring scaling costs for cloud infrastructure',
      'Over-optimistic revenue projections',
      'Insufficient contingency for pivots'
    );
  }

  guidance.emerging_trends.push(
    'Focus on demonstrable ROI and measurable outcomes',
    'Dynamic, predictive budgeting with AI-powered reallocation',
    'Significant allocation to AI infrastructure (avg 36% of digital budgets)',
    'Investment in high-quality data and governance as strategic asset',
    'Rise of agentic AI development budgets',
    'Proactive allocation for ethical AI and security measures'
  );

  return guidance;
}

/**
 * Calculate ROI projection for service-based AI businesses
 */
export function calculateROIProjection(
  serviceType: 'benchmark' | 'red_team' | 'consulting' | 'saas' | 'other',
  investmentAmount: number
): ROIProjection {
  // Industry benchmarks for different service types
  const benchmarks = {
    benchmark: { costSavingsMultiplier: 10, revenueUplift: 0.15, avoidedLoss: 0 },
    red_team: { costSavingsMultiplier: 0, revenueUplift: 0, avoidedLoss: 50 }, // % of breach cost
    consulting: { costSavingsMultiplier: 3, revenueUplift: 0.15, avoidedLoss: 0 },
    saas: { costSavingsMultiplier: 5, revenueUplift: 0.2, avoidedLoss: 0 },
    other: { costSavingsMultiplier: 4, revenueUplift: 0.1, avoidedLoss: 0 },
  };

  const benchmark = benchmarks[serviceType];
  const costSavings = investmentAmount * benchmark.costSavingsMultiplier;
  const revenueUplift = investmentAmount * (1 / (1 - benchmark.revenueUplift)) - investmentAmount;
  const avoidedLosses = serviceType === 'red_team' ? investmentAmount * 20 : 0; // Avg breach cost multiplier

  const totalValue = costSavings + revenueUplift + avoidedLosses;
  const roiPercentage = ((totalValue - investmentAmount) / investmentAmount) * 100;
  const paybackMonths = Math.ceil((investmentAmount / (totalValue / 12)) * 12);

  return {
    service_type: serviceType,
    cost_savings: costSavings,
    revenue_uplift: revenueUplift,
    avoided_losses: avoidedLosses,
    productivity_gains: costSavings * 0.3, // 30% of savings from productivity
    total_roi_percentage: roiPercentage,
    payback_period_months: paybackMonths,
  };
}

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Import evaluation metrics for guardrails
import { 
  BiasMetric, 
  ToxicityMetric, 
  PromptAlignmentMetric,
  AnswerRelevancyMetric
} from '@mastra/evals/llm';

// AG-UI Event Types for future integration
interface AGUIEvent {
  type: string;
  data: any;
  timestamp?: number;
}

// Evaluation model for guardrails
const evalModel = anthropic('claude-sonnet-4-20250514');

// Structured response schema for the mandatory 5-section format
const salesResponseSchema = z.object({
  theOffer: z.object({
    headline: z.string().describe('Bold headline featuring OneQ price prominently (e.g., "OneQ will deliver your complete solution for $45,000")'),
    oneQPrice: z.number().describe('OneQ implementation price - THE MOST IMPORTANT NUMBER'),
    currency: z.string().describe('Currency symbol used'),
    description: z.string().describe('Exciting proposal with key value propositions'),
    timeline: z.string().describe('Implementation timeline (e.g., "12 weeks")'),
    deliverables: z.array(z.string()).describe('What will be delivered'),
    supportLevel: z.string().describe('Level of ongoing support included'),
    callToAction: z.string().describe('Strong closing statement asking for the deal')
  }).describe('THE OFFER - Lead with OneQ price prominently, then exciting proposal'),
  
  savingsBreakdown: z.object({
    diyCost: z.number().describe('Total DIY implementation cost'),
    ourPrice: z.number().describe('OneQ price (35-40% of DIY cost)'),
    totalSavings: z.number().describe('Amount saved (DIY - Our Price)'),
    savingsPercentage: z.number().describe('Percentage savings'),
    calculation: z.string().describe('Detailed calculation explanation'),
    currency: z.string().describe('Currency symbol used (e.g., $, €, ₪)')
  }).describe('SAVINGS BREAKDOWN - Specific amounts and calculations with currency'),
  
  costOfDelay: z.object({
    monthlyRevenuePotential: z.number().describe('Estimated monthly revenue potential'),
    marketAnalysisBasis: z.string().describe('Market analysis reasoning'),
    currency: z.string().describe('Currency symbol used (e.g., $, €, ₪)'),
    twoWeekDelay: z.object({
      lostRevenue: z.number(),
      competitiveRisk: z.string()
    }),
    oneMonthDelay: z.object({
      lostRevenue: z.number(),
      marketImpact: z.string()
    }),
    threeMonthDelay: z.object({
      lostRevenue: z.number(),
      competitorImpact: z.string(),
      momentumLoss: z.string()
    }),
    firstMoverAdvantage: z.number().describe('Value of first-mover advantage (20-40% market share premium)')
  }).describe('COST OF DELAY - Revenue projections and delay impact'),
  
  teamBreakdown: z.object({
    roles: z.array(z.object({
      role: z.string(),
      hoursPerWeek: z.number(),
      hourlyRate: z.number(),
      weeks: z.number(),
      totalCost: z.number()
    })),
    additionalCosts: z.object({
      recruitmentFees: z.number().describe('20% of total salary costs'),
      benefitsOverhead: z.number().describe('35% of total salary costs'),
      equipmentCosts: z.number().describe('Equipment costs per team member'),
      onboardingLearningCurve: z.number().describe('25% of total salary costs')
    }),
    totalTeamCost: z.number(),
    currency: z.string().describe('Currency symbol used (e.g., $, €, ₪)')
  }).describe('TEAM BREAKDOWN - Detailed team costs with hours and rates'),
  
  modularOptions: z.object({
    currency: z.string().describe('Currency symbol used (e.g., $, €, ₪)'),
    options: z.array(z.object({
      name: z.string(),
      description: z.string(),
      price: z.number()
    }))
  }).describe('MODULAR OPTIONS - List of 3-4 add-on/removable components with currency'),

  executiveSummaryTable: z.object({
    currency: z.string().describe('Currency symbol used'),
    oneQPrice: z.number().describe('OneQ implementation price'),
    diyCost: z.number().describe('Total DIY implementation cost'),
    totalSavings: z.number().describe('Total cost savings (DIY - OneQ)'),
    savingsPercentage: z.number().describe('Percentage savings'),
    timeToMarket: z.object({
      oneQTimeline: z.string().describe('OneQ delivery timeline (e.g., "12 weeks")'),
      diyTimeline: z.string().describe('DIY delivery timeline (e.g., "28 weeks")'),
      timeSaved: z.string().describe('Time advantage (e.g., "16 weeks faster")')
    }),
    revenueOpportunity: z.object({
      monthlyRevenuePotential: z.number().describe('Monthly revenue potential'),
      revenueFromTimeSaved: z.number().describe('Revenue gained from faster time-to-market'),
      totalOpportunityValue: z.number().describe('Combined savings + revenue opportunity')
    }),
    immediateAction: z.string().describe('Strong call-to-action for signing today')
  }).describe('EXECUTIVE SUMMARY TABLE - All critical numbers in one place for immediate decision-making')
});

// DIY Cost Calculator Tool
const diyCalculatorTool = createTool({
  id: 'calculateDIYCost',
  description: 'Calculate DIY implementation costs using configurable percentages and hourly rates',
  inputSchema: z.object({
    backendHours: z.number().describe('Estimated backend development hours (this is the base calculation)'),
    features: z.array(z.string()).describe('List of features/requirements from the roadmap'),
    priority: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']).describe('Project complexity (simple: <100 hours, medium: 100-300, complex: 300-500, enterprise: 500-800, platform: 800+ hours)'),
    // Configurable stage percentages (defaults from HTML calculator)
    stagePercentages: z.object({
      planning: z.number().default(8).describe('Planning stage percentage'),
      design: z.number().default(8).describe('Design stage percentage'),
      htmlMarkup: z.number().default(11).describe('HTML/Markup stage percentage'),
      frontend: z.number().default(26).describe('Frontend development percentage'),
      backend: z.number().default(32).describe('Backend development percentage (base)'),
      qa: z.number().default(5).describe('QA/Testing stage percentage'),
      management: z.number().default(10).describe('Project management percentage')
    }).optional().describe('Stage percentage breakdown (defaults to standard percentages)'),
    // Configurable hourly rates (defaults based on 2024-2025 enterprise market rates)
    hourlyRates: z.object({
      planning: z.number().default(120).describe('Planning/Business Analysis hourly rate'),
      design: z.number().default(95).describe('UI/UX Design hourly rate'),
      htmlMarkup: z.number().default(75).describe('HTML/Frontend Markup hourly rate'),
      frontend: z.number().default(85).describe('Frontend development hourly rate'),
      backend: z.number().default(100).describe('Backend development hourly rate'),
      qa: z.number().default(70).describe('QA/Testing hourly rate'),
      management: z.number().default(140).describe('Project management hourly rate'),
      // Enterprise specialist rates
      aiMlEngineer: z.number().default(175).describe('AI/ML Engineer hourly rate'),
      securitySpecialist: z.number().default(165).describe('Security specialist hourly rate'),
      enterpriseArchitect: z.number().default(180).describe('Enterprise architect hourly rate'),
      complianceExpert: z.number().default(190).describe('Compliance expert hourly rate'),
      devOpsEngineer: z.number().default(130).describe('DevOps engineer hourly rate'),
      cloudArchitect: z.number().default(155).describe('Cloud architect hourly rate')
    }).optional().describe('Hourly rates per role (2024-2025 enterprise market rates)'),
    currency: z.string().default('$').describe('Currency symbol (defaults to USD)'),
    // Enterprise project enhancements
    complianceRequirements: z.array(z.string()).optional().describe('Compliance requirements (SOC2, GDPR, HIPAA, etc.)'),
    enterpriseFeatures: z.array(z.string()).optional().describe('Enterprise features requiring specialists'),
    isMultiPhase: z.boolean().default(false).describe('Whether this is a multi-phase project')
  }),
  outputSchema: z.object({
    totalProjectHours: z.number(),
    stageBreakdown: z.array(z.object({
      stage: z.string(),
      percentage: z.number(),
      hours: z.number(),
      hourlyRate: z.number(),
      cost: z.number()
    })),
    teamRequirements: z.array(z.object({
      role: z.string(),
      hoursPerWeek: z.number(),
      weeks: z.number(),
      weeklyCost: z.number(),
      totalCost: z.number()
    })),
    hiddenCosts: z.object({
      recruitmentFees: z.number(),
      benefitsOverhead: z.number(),
      equipmentCosts: z.number(),
      onboardingCosts: z.number()
    }),
    totalDIYCost: z.number(),
    timeline: z.string()
  }),
  execute: async ({ context }) => {
    const { 
      backendHours, 
      features, 
      priority, 
      stagePercentages: customStagePercentages,
      hourlyRates: customHourlyRates,
      currency = '$',
      complianceRequirements = [],
      enterpriseFeatures = [],
      isMultiPhase = false
    } = context;
    
    // Use provided percentages or defaults from HTML calculator
    const stagePercentages: Record<string, number> = {
      'Planning': customStagePercentages?.planning ?? 8,
      'Design': customStagePercentages?.design ?? 8,
      'HTML/Markup': customStagePercentages?.htmlMarkup ?? 11,
      'Frontend Development': customStagePercentages?.frontend ?? 26,
      'Backend Development': customStagePercentages?.backend ?? 32,  // BASE
      'QA/Testing': customStagePercentages?.qa ?? 5,
      'Project Management': customStagePercentages?.management ?? 10
    };
    
    // Enhanced hourly rates based on 2024-2025 enterprise market research
    const hourlyRates: Record<string, number> = {
      'Planning': customHourlyRates?.planning ?? 120,
      'Design': customHourlyRates?.design ?? 95,
      'HTML/Markup': customHourlyRates?.htmlMarkup ?? 75,
      'Frontend Development': customHourlyRates?.frontend ?? 85,
      'Backend Development': customHourlyRates?.backend ?? 100,
      'QA/Testing': customHourlyRates?.qa ?? 70,
      'Project Management': customHourlyRates?.management ?? 140,
      // Enterprise specialist rates for complex projects
      'AI/ML Engineering': customHourlyRates?.aiMlEngineer ?? 175,
      'Security Specialist': customHourlyRates?.securitySpecialist ?? 165,
      'Enterprise Architecture': customHourlyRates?.enterpriseArchitect ?? 180,
      'Compliance Expert': customHourlyRates?.complianceExpert ?? 190,
      'DevOps Engineering': customHourlyRates?.devOpsEngineer ?? 130,
      'Cloud Architecture': customHourlyRates?.cloudArchitect ?? 155
    };
    
    // Calculate total project hours
    // Formula: If Backend = 32% and estimated X backend hours, then Total = (X ÷ 32) × 100
    const totalProjectHours = Math.round((backendHours / 32) * 100 / 10) * 10; // Round to nearest 10
    
    // Enhanced stage breakdown with enterprise specialist roles for complex projects
    let stageBreakdown = Object.entries(stagePercentages).map(([stage, percentage]) => {
      const hours = Math.round((percentage / 100) * totalProjectHours);
      const hourlyRate = hourlyRates[stage];
      const cost = hours * hourlyRate;
      
      return {
        stage,
        percentage,
        hours,
        hourlyRate,
        cost
      };
    });
    
    // Add enterprise specialists for complex projects
    if (priority === 'enterprise' || priority === 'platform') {
      const enterpriseRoles = [];
      
      // AI/ML Engineering for AI-powered features
      if (enterpriseFeatures.some(f => f.includes('ai') || f.includes('machine learning') || f.includes('scenario'))) {
        enterpriseRoles.push({
          stage: 'AI/ML Engineering',
          percentage: 15,
          hours: Math.round(totalProjectHours * 0.15),
          hourlyRate: hourlyRates['AI/ML Engineering'],
          cost: Math.round(totalProjectHours * 0.15) * hourlyRates['AI/ML Engineering']
        });
      }
      
      // Security Specialist for cybersecurity projects
      if (enterpriseFeatures.some(f => f.includes('security') || f.includes('encryption') || f.includes('audit'))) {
        enterpriseRoles.push({
          stage: 'Security Specialist',
          percentage: 12,
          hours: Math.round(totalProjectHours * 0.12),
          hourlyRate: hourlyRates['Security Specialist'],
          cost: Math.round(totalProjectHours * 0.12) * hourlyRates['Security Specialist']
        });
      }
      
      // Enterprise Architecture for platform projects
      if (priority === 'platform' || enterpriseFeatures.some(f => f.includes('microservices') || f.includes('architecture'))) {
        enterpriseRoles.push({
          stage: 'Enterprise Architecture',
          percentage: 8,
          hours: Math.round(totalProjectHours * 0.08),
          hourlyRate: hourlyRates['Enterprise Architecture'],
          cost: Math.round(totalProjectHours * 0.08) * hourlyRates['Enterprise Architecture']
        });
      }
      
      // Compliance Expert for regulated industries
      if (complianceRequirements.length > 0) {
        enterpriseRoles.push({
          stage: 'Compliance Expert',
          percentage: 10,
          hours: Math.round(totalProjectHours * 0.10),
          hourlyRate: hourlyRates['Compliance Expert'],
          cost: Math.round(totalProjectHours * 0.10) * hourlyRates['Compliance Expert']
        });
      }
      
      // DevOps for cloud-native applications
      if (enterpriseFeatures.some(f => f.includes('cloud') || f.includes('containerized') || f.includes('kubernetes'))) {
        enterpriseRoles.push({
          stage: 'DevOps Engineering',
          percentage: 10,
          hours: Math.round(totalProjectHours * 0.10),
          hourlyRate: hourlyRates['DevOps Engineering'],
          cost: Math.round(totalProjectHours * 0.10) * hourlyRates['DevOps Engineering']
        });
      }
      
      stageBreakdown = [...stageBreakdown, ...enterpriseRoles];
    }
    
    // Calculate team requirements (40-hour work weeks)
    const teamRequirements = stageBreakdown.map(({ stage, hours, hourlyRate }) => {
      const weeks = Math.ceil(hours / 40);
      const hoursPerWeek = Math.min(hours, 40);
      const weeklyCost = hoursPerWeek * hourlyRate;
      const totalCost = hours * hourlyRate;
      
      return {
        role: stage.replace(' Development', ' Dev'),
        hoursPerWeek,
        weeks,
        weeklyCost,
        totalCost
      };
    });
    
    const totalSalaryCosts = stageBreakdown.reduce((sum, stage) => sum + stage.cost, 0);
    const teamSize = Math.ceil(totalProjectHours / (40 * (isMultiPhase ? 20 : 16))); // Longer timeline for multi-phase
    
    // Enhanced hidden costs with compliance overhead
    let complianceMultiplier = 1.0;
    if (complianceRequirements.includes('SOC2')) complianceMultiplier += 0.15;
    if (complianceRequirements.includes('GDPR')) complianceMultiplier += 0.10;
    if (complianceRequirements.includes('HIPAA')) complianceMultiplier += 0.20;
    if (complianceRequirements.includes('PCI')) complianceMultiplier += 0.12;
    if (complianceRequirements.includes('FedRAMP')) complianceMultiplier += 0.25;
    
    const hiddenCosts = {
      recruitmentFees: Math.round(totalSalaryCosts * 0.20 * complianceMultiplier),
      benefitsOverhead: Math.round(totalSalaryCosts * 0.35 * complianceMultiplier),
      equipmentCosts: teamSize * (priority === 'enterprise' || priority === 'platform' ? 6000 : 4500), // Higher equipment costs for enterprise
      onboardingCosts: Math.round(totalSalaryCosts * 0.25 * complianceMultiplier), // Longer learning curve for complex projects
      complianceAuditCosts: complianceRequirements.length > 0 ? Math.round(totalSalaryCosts * 0.08) : 0
    };
    
    const totalHiddenCosts = Object.values(hiddenCosts).reduce((sum, cost) => sum + cost, 0);
    const totalDIYCost = totalSalaryCosts + totalHiddenCosts;
    
    // Enhanced timeline calculation for enterprise projects
    const baseWeeks = Math.ceil(totalProjectHours / (teamSize * 40));
    const timelineWeeks = isMultiPhase ? baseWeeks * 1.3 : baseWeeks; // 30% longer for multi-phase projects
    const timeline = `${Math.round(timelineWeeks)} weeks with ${teamSize} team members${isMultiPhase ? ' (multi-phase delivery)' : ''}`;
    
    return {
      totalProjectHours,
      stageBreakdown,
      teamRequirements,
      hiddenCosts,
      totalDIYCost,
      timeline
    };
  }
});

// Revenue Projections Tool
const revenueProjectionsTool = createTool({
  id: 'calculateRevenueProjections',
  description: 'Calculate revenue projections and opportunity costs based on business model and market analysis',
  inputSchema: z.object({
    businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise']).describe('Type of business model'),
    productDescription: z.string().describe('Description of the product/service'),
    targetMarket: z.string().describe('Target market description'),
    geographyFocus: z.string().default('United States').describe('Primary geographic market'),
    currency: z.string().default('$').describe('Currency symbol for revenue calculations'),
    // Configurable business model parameters
    marketParameters: z.object({
      // SaaS parameters
      saasArpu: z.number().default(150).describe('Average Revenue Per User for SaaS (monthly)'),
      saasAcquisitionRate: z.number().default(25).describe('New SaaS customers per month'),
      saasChurnRate: z.number().default(0.10).describe('Monthly churn rate for SaaS'),
      // E-commerce parameters
      ecommerceTransactionVolume: z.number().default(500).describe('Monthly transactions for e-commerce'),
      ecommerceAOV: z.number().default(180).describe('Average Order Value'),
      ecommerceMargin: z.number().default(0.25).describe('Profit margin percentage'),
      // B2B parameters
      b2bDealSize: z.number().default(12000).describe('Average B2B deal size'),
      b2bDealsPerMonth: z.number().default(3).describe('B2B deals per month'),
      b2bWinRate: z.number().default(0.25).describe('B2B win rate percentage'),
      // Mobile parameters
      mobileMAU: z.number().default(15000).describe('Monthly Active Users'),
      mobileRevenuePerUser: z.number().default(3.50).describe('Revenue per user per month'),
      // Enterprise parameters
      enterpriseDealSize: z.number().default(75000).describe('Average enterprise deal size'),
      enterpriseDealsPerQuarter: z.number().default(2).describe('Enterprise deals per quarter'),
      enterpriseWinRate: z.number().default(0.15).describe('Enterprise win rate percentage'),
      enterpriseSalesCycle: z.number().default(9).describe('Enterprise sales cycle in months'),
      // Market penetration
      marketPenetrationFactor: z.number().default(0.7).describe('Conservative market penetration factor (0.1-1.0)')
    }).optional().describe('Business model specific parameters (uses market defaults if not provided)')
  }),
  outputSchema: z.object({
    monthlyRevenuePotential: z.number(),
    marketAnalysisBasis: z.string(),
    businessModelMetrics: z.object({
      acquisitionRate: z.number().optional(),
      averageRevenuePerUser: z.number().optional(),
      churnRate: z.number().optional(),
      transactionVolume: z.number().optional(),
      averageOrderValue: z.number().optional(),
      dealSize: z.number().optional(),
      winRate: z.number().optional()
    }),
    delayCosts: z.object({
      twoWeek: z.number(),
      oneMonth: z.number(),
      threeMonth: z.number()
    }),
    firstMoverAdvantage: z.number(),
    conservativeProjection: z.number() // 60-70% of optimistic
  }),
  execute: async ({ context }) => {
    const { 
      businessModel, 
      productDescription, 
      targetMarket, 
      geographyFocus,
      currency = '$',
      marketParameters
    } = context;
    
    // Use provided parameters or defaults
    const params = {
      // SaaS defaults
      arpu: marketParameters?.saasArpu ?? 150,
      acquisitionRate: marketParameters?.saasAcquisitionRate ?? 25,
      churnRate: marketParameters?.saasChurnRate ?? 0.10,
      // E-commerce defaults
      transactionVolume: marketParameters?.ecommerceTransactionVolume ?? 500,
      aov: marketParameters?.ecommerceAOV ?? 180,
      margin: marketParameters?.ecommerceMargin ?? 0.25,
      // B2B defaults
      dealSize: marketParameters?.b2bDealSize ?? 12000,
      dealsPerMonth: marketParameters?.b2bDealsPerMonth ?? 3,
      winRate: marketParameters?.b2bWinRate ?? 0.25,
      // Mobile defaults
      mau: marketParameters?.mobileMAU ?? 15000,
      revenuePerUser: marketParameters?.mobileRevenuePerUser ?? 3.50,
      // Market penetration
      penetrationFactor: marketParameters?.marketPenetrationFactor ?? 0.7
    };
    
    let monthlyRevenuePotential = 0;
    let marketAnalysisBasis = '';
    let businessModelMetrics: any = {};
    
    // Calculate based on business model
    switch (businessModel) {
      case 'saas':
        monthlyRevenuePotential = params.acquisitionRate * params.arpu * (1 - params.churnRate);
        marketAnalysisBasis = `SaaS model in ${geographyFocus}: ${params.acquisitionRate} new customers/month at ${currency}${params.arpu} ARPU with ${params.churnRate * 100}% churn`;
        businessModelMetrics = { 
          acquisitionRate: params.acquisitionRate, 
          averageRevenuePerUser: params.arpu, 
          churnRate: params.churnRate 
        };
        break;
        
      case 'ecommerce':
        monthlyRevenuePotential = params.transactionVolume * params.aov * params.margin;
        marketAnalysisBasis = `E-commerce in ${geographyFocus}: ${params.transactionVolume} transactions/month at ${currency}${params.aov} AOV with ${params.margin * 100}% margin`;
        businessModelMetrics = { 
          transactionVolume: params.transactionVolume, 
          averageOrderValue: params.aov 
        };
        break;
        
      case 'b2b':
        monthlyRevenuePotential = params.dealSize * params.dealsPerMonth * params.winRate;
        marketAnalysisBasis = `B2B model in ${geographyFocus}: ${params.dealsPerMonth} deals/month at ${currency}${params.dealSize} average with ${params.winRate * 100}% win rate`;
        businessModelMetrics = { 
          dealSize: params.dealSize, 
          winRate: params.winRate 
        };
        break;
        
      case 'mobile':
        monthlyRevenuePotential = params.mau * params.revenuePerUser;
        marketAnalysisBasis = `Mobile app in ${geographyFocus}: ${params.mau} MAU at ${currency}${params.revenuePerUser}/user/month`;
        businessModelMetrics = { 
          averageRevenuePerUser: params.revenuePerUser 
        };
        break;
    }
    
    // Apply market penetration reality
    monthlyRevenuePotential = Math.round(monthlyRevenuePotential * params.penetrationFactor);
    
    // Calculate delay costs
    const delayCosts = {
      twoWeek: Math.round(monthlyRevenuePotential * 0.5),
      oneMonth: monthlyRevenuePotential,
      threeMonth: monthlyRevenuePotential * 3
    };
    
    // First-mover advantage (20-40% market share premium)
    const firstMoverAdvantage = Math.round(monthlyRevenuePotential * 6 * 0.30); // 30% premium over 6 months
    
    // Conservative projection (60-70% of optimistic)
    const conservativeProjection = Math.round(monthlyRevenuePotential * 0.65);
    
    return {
      monthlyRevenuePotential,
      marketAnalysisBasis,
      businessModelMetrics,
      delayCosts,
      firstMoverAdvantage,
      conservativeProjection
    };
  }
});

// OneQ Pricing Calculator Tool
const oneqPricingTool = createTool({
  id: 'calculateOneQPricing',
  description: 'Calculate OneQ pricing based on DIY costs with enhanced complexity-based pricing for enterprise projects',
  inputSchema: z.object({
    diyCost: z.number().describe('Total DIY implementation cost'),
    complexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']).describe('Project complexity level'),
    expeditedDelivery: z.boolean().default(false).describe('Whether expedited delivery is requested'),
    extendedSupport: z.boolean().default(false).describe('Whether extended support is requested'),
    complianceRequirements: z.array(z.string()).default([]).describe('Compliance requirements that affect pricing')
  }),
  outputSchema: z.object({
    corePrice: z.number(),
    modularOptions: z.array(z.object({
      name: z.string(),
      description: z.string(),
      price: z.number()
    })),
    totalSavings: z.number(),
    savingsPercentage: z.number()
  }),
  execute: async ({ context }) => {
    const { diyCost, complexity, expeditedDelivery, extendedSupport, complianceRequirements } = context;
    
    // Enhanced pricing formula based on complexity and risk
    let pricingMultiplier = 0.35; // Default 35% of DIY cost
    switch (complexity) {
      case 'simple':
        pricingMultiplier = 0.35; // 35% of DIY cost
        break;
      case 'medium':
        pricingMultiplier = 0.37; // 37% of DIY cost
        break;
      case 'complex':
        pricingMultiplier = 0.40; // 40% of DIY cost
        break;
      case 'enterprise':
        pricingMultiplier = 0.42; // 42% of DIY cost (higher due to compliance requirements)
        break;
      case 'platform':
        pricingMultiplier = 0.45; // 45% of DIY cost (highest due to complexity and multi-phase nature)
        break;
    }
    
    // Additional compliance premium for regulated industries
    if (complianceRequirements.length > 0) {
      pricingMultiplier += 0.02; // Additional 2% for compliance overhead
    }
    
    const baseCorePrice = Math.round(diyCost * pricingMultiplier / 1000) * 1000; // Round to nearest $1,000 for consistency
    
    // Enhanced modular options for enterprise projects
    const modularOptions = [
      {
        name: 'Core Implementation',
        description: complexity === 'platform' ? '16-week phased implementation with enterprise support' : 
                     complexity === 'enterprise' ? '14-week implementation with compliance support' :
                     '12-week implementation with basic support',
        price: baseCorePrice
      },
      {
        name: 'Extended Support',
        description: complexity === 'enterprise' || complexity === 'platform' ? 
                     '12 months enterprise support and maintenance' : 
                     '6 months additional support and maintenance',
        price: Math.round(baseCorePrice * (complexity === 'enterprise' || complexity === 'platform' ? 0.35 : 0.25) / 1000) * 1000
      },
      {
        name: 'Expedited Delivery',
        description: complexity === 'platform' ? 'Rush implementation in 12 weeks instead of 16' :
                     complexity === 'enterprise' ? 'Rush implementation in 10 weeks instead of 14' :
                     'Rush implementation in 8 weeks instead of 12',
        price: Math.round(baseCorePrice * (complexity === 'enterprise' || complexity === 'platform' ? 0.25 : 0.20) / 1000) * 1000
      },
      {
        name: 'Additional Features',
        description: 'Extra features beyond core roadmap',
        price: Math.round(baseCorePrice * 0.30 / 1000) * 1000 // 30% of core price
      }
    ];
    
    // Add enterprise-specific options for complex projects
    if (complexity === 'enterprise' || complexity === 'platform') {
      modularOptions.push({
        name: 'Compliance Certification',
        description: 'SOC2, GDPR, or other compliance certification assistance',
        price: Math.round(baseCorePrice * 0.15 / 1000) * 1000 // 15% of core price
      });
    }
    
    // Calculate total with selected options
    let totalPrice = baseCorePrice;
    if (expeditedDelivery) {
      totalPrice += modularOptions.find(opt => opt.name === 'Expedited Delivery')?.price || 0;
    }
    if (extendedSupport) {
      totalPrice += modularOptions.find(opt => opt.name === 'Extended Support')?.price || 0;
    }
    
    const totalSavings = diyCost - totalPrice;
    const savingsPercentage = Math.round((totalSavings / diyCost) * 100);
    
    return {
      corePrice: totalPrice,
      modularOptions,
      totalSavings,
      savingsPercentage
    };
  }
});

// Input normalization tool for consistent roadmap analysis
const inputNormalizationTool = createTool({
  id: 'normalizeRoadmapInput',
  description: 'Standardizes roadmap and PRD inputs for consistent analysis and pricing, now with enhanced enterprise project detection',
  inputSchema: z.object({
    roadmapText: z.string().describe('Raw roadmap or PRD text'),
    projectType: z.enum(['webapp', 'mobile', 'api', 'platform', 'saas', 'enterprise']).optional().describe('Project type classification'),
    industry: z.string().optional().describe('Industry or domain (e.g., fintech, healthcare, e-commerce, cybersecurity)')
  }),
  outputSchema: z.object({
    normalizedFeatures: z.array(z.string()).describe('Standardized list of core features'),
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']).describe('Enhanced complexity assessment including enterprise tiers'),
    estimatedBackendHours: z.number().describe('Normalized backend hours estimate (rounded to nearest 10)'),
    businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise']).describe('Identified business model'),
    marketCategory: z.string().describe('Standardized market category'),
    keyDifferentiators: z.array(z.string()).describe('Main differentiating features'),
    isMultiPhase: z.boolean().describe('Whether project requires multi-phase implementation'),
    phaseCount: z.number().describe('Number of implementation phases (1-4)'),
    complianceRequirements: z.array(z.string()).describe('Identified compliance needs (SOC2, GDPR, HIPAA, etc.)'),
    enterpriseFeatures: z.array(z.string()).describe('Enterprise-specific features detected')
  }),
  execute: async ({ context }) => {
    const { roadmapText, projectType, industry } = context;
    
    // Enhanced feature extraction including enterprise features
    const featureKeywords = [
      // Standard features
      'authentication', 'user management', 'dashboard', 'reporting', 'payments', 
      'notifications', 'api', 'database', 'search', 'analytics', 'integration',
      'mobile app', 'web app', 'admin panel', 'messaging', 'file upload',
      'real-time', 'automation', 'machine learning', 'ai', 'blockchain',
      // Enterprise features
      'simulation', 'scenario engine', 'benchmarking', 'war room', 'crisis management',
      'incident response', 'certification system', 'audit logging', 'compliance',
      'multi-tenant', 'sso', 'single sign-on', 'role-based access', 'rbac',
      'microservices', 'containerized', 'orchestration', 'load balancing',
      'disaster recovery', 'backup', 'replication', 'monitoring', 'alerting',
      'encryption', 'security', 'penetration testing', 'vulnerability assessment'
    ];
    
    const normalizedFeatures = featureKeywords.filter(feature => 
      roadmapText.toLowerCase().includes(feature.toLowerCase())
    );
    
    // Enhanced complexity assessment with enterprise tiers
    const complexityIndicators = {
      simple: ['basic', 'simple', 'mvp', 'prototype', 'minimal'],
      medium: ['standard', 'typical', 'moderate', 'extended'],
      complex: ['enterprise', 'advanced', 'sophisticated', 'complex', 'ai', 'machine learning'],
      enterprise: ['enterprise-grade', 'mission-critical', 'large-scale', 'global', 'multi-region', 'compliance', 'soc2', 'gdpr', 'hipaa'],
      platform: ['platform', 'ecosystem', 'multi-phase', 'phased', 'architecture', 'infrastructure', 'framework', 'sdk', 'api gateway']
    };
    
    let backendComplexity: 'simple' | 'medium' | 'complex' | 'enterprise' | 'platform' = 'medium';
    const textLower = roadmapText.toLowerCase();
    
    // Check for platform-level complexity first (most complex)
    if (complexityIndicators.platform.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'platform';
    } else if (complexityIndicators.enterprise.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'enterprise';
    } else if (complexityIndicators.complex.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'complex';
    } else if (complexityIndicators.simple.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'simple';
    }
    
    // Enhanced backend hour estimation for enterprise projects
    const baseHours = {
      simple: 80,
      medium: 160,
      complex: 320,
      enterprise: 500,    // Enterprise applications
      platform: 800      // Complex multi-phase platforms like Code Blue
    };
    
    const featureMultiplier = Math.max(1, normalizedFeatures.length * 0.1);
    const rawHours = baseHours[backendComplexity] * featureMultiplier;
    
    // Round to nearest 10 for consistency
    const estimatedBackendHours = Math.round(rawHours / 10) * 10;
    
    // Enhanced business model identification
    const businessModelKeywords = {
      saas: ['subscription', 'saas', 'monthly', 'recurring', 'tenant'],
      ecommerce: ['store', 'shop', 'cart', 'payment', 'product', 'marketplace'],
      b2b: ['enterprise', 'business', 'b2b', 'corporate', 'client'],
      mobile: ['mobile', 'app', 'ios', 'android', 'smartphone'],
      enterprise: ['enterprise software', 'enterprise platform', 'enterprise solution', 'large organization', 'multi-location']
    };
    
    let businessModel: 'saas' | 'ecommerce' | 'b2b' | 'mobile' | 'enterprise' = 'saas';
    for (const [model, keywords] of Object.entries(businessModelKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        businessModel = model as any;
        break;
      }
    }
    
    // Multi-phase detection
    const phaseIndicators = ['phase', 'phases', 'stage', 'stages', 'milestone', 'roadmap', 'timeline'];
    const isMultiPhase = phaseIndicators.some(indicator => textLower.includes(indicator));
    
    // Extract phase count
    const phaseMatches = textLower.match(/(\d+)\s*(?:phase|stage|milestone)/g);
    let phaseCount = 1;
    if (phaseMatches && phaseMatches.length > 0) {
      const numbers = phaseMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '1'));
      phaseCount = Math.max(...numbers);
    } else if (isMultiPhase) {
      phaseCount = backendComplexity === 'platform' ? 4 : backendComplexity === 'enterprise' ? 3 : 2;
    }
    
    // Compliance requirements detection
    const complianceKeywords = {
      'SOC2': ['soc2', 'soc 2', 'service organization control'],
      'GDPR': ['gdpr', 'general data protection regulation', 'european privacy'],
      'HIPAA': ['hipaa', 'health insurance portability', 'healthcare privacy'],
      'PCI': ['pci', 'payment card industry', 'credit card'],
      'ISO27001': ['iso27001', 'iso 27001', 'information security management'],
      'FedRAMP': ['fedramp', 'federal risk', 'government cloud'],
      'CCPA': ['ccpa', 'california consumer privacy act']
    };
    
    const complianceRequirements = Object.entries(complianceKeywords)
      .filter(([_, keywords]) => keywords.some(keyword => textLower.includes(keyword)))
      .map(([compliance, _]) => compliance);
    
    // Enterprise features detection
    const enterpriseKeywords = [
      'ai-powered', 'machine learning', 'artificial intelligence', 'scenario engine',
      'real-time analytics', 'multi-tenant', 'role-based access', 'audit logging',
      'disaster recovery', 'high availability', 'load balancing', 'auto-scaling',
      'microservices', 'containerized', 'kubernetes', 'docker', 'orchestration',
      'api gateway', 'service mesh', 'monitoring', 'observability', 'logging',
      'encryption', 'security scanning', 'vulnerability assessment', 'penetration testing'
    ];
    
    const enterpriseFeatures = enterpriseKeywords.filter(feature => 
      textLower.includes(feature.replace('-', ' '))
    );
    
    // Standardize market category
    const marketCategory = industry || (
      textLower.includes('cyber') || textLower.includes('security') ? 'Cybersecurity' :
      textLower.includes('health') || textLower.includes('medical') ? 'Healthcare' :
      textLower.includes('finance') || textLower.includes('bank') ? 'Financial Services' :
      'Technology'
    );
    
    // Extract key differentiators (enhanced)
    const differentiatorKeywords = [
      'ai-powered', 'real-time', 'automated', 'secure', 'scalable',
      'user-friendly', 'mobile-first', 'cloud-based', 'cloud-native', 'integration',
      'analytics', 'personalized', 'instant', 'collaborative', 'multi-tenant',
      'enterprise-grade', 'mission-critical', 'high-availability', 'disaster-recovery'
    ];
    
    const keyDifferentiators = differentiatorKeywords.filter(diff => 
      textLower.includes(diff.replace('-', ' '))
    );
    
    return {
      normalizedFeatures,
      backendComplexity,
      estimatedBackendHours,
      businessModel,
      marketCategory,
      keyDifferentiators,
      isMultiPhase,
      phaseCount,
      complianceRequirements,
      enterpriseFeatures
    };
  }
});

// Consistency validation tool
const consistencyValidationTool = createTool({
  id: 'validateConsistency',
  description: 'Validates that calculations follow consistent rounding rules and methodology for all complexity tiers',
  inputSchema: z.object({
    normalizedInputs: z.object({
      backendHours: z.number(),
      complexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']),
      businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise'])
    }),
    calculationResults: z.object({
      diyCost: z.number(),
      oneQPrice: z.number(),
      monthlyRevenue: z.number()
    })
  }),
  outputSchema: z.object({
    isConsistent: z.boolean(),
    adjustments: z.array(z.object({
      field: z.string(),
      originalValue: z.number(),
      adjustedValue: z.number(),
      reason: z.string()
    })),
    consistencyScore: z.number().describe('Score from 0-100 for consistency')
  }),
  execute: async ({ context }) => {
    const { normalizedInputs, calculationResults } = context;
    const adjustments = [];
    
    // Validate backend hours are rounded to nearest 10
    const roundedBackendHours = Math.round(normalizedInputs.backendHours / 10) * 10;
    if (roundedBackendHours !== normalizedInputs.backendHours) {
      adjustments.push({
        field: 'backendHours',
        originalValue: normalizedInputs.backendHours,
        adjustedValue: roundedBackendHours,
        reason: 'Backend hours should be rounded to nearest 10 for consistency'
      });
    }
    
    // Validate DIY cost is rounded to nearest $1,000
    const roundedDIYCost = Math.round(calculationResults.diyCost / 1000) * 1000;
    if (roundedDIYCost !== calculationResults.diyCost) {
      adjustments.push({
        field: 'diyCost',
        originalValue: calculationResults.diyCost,
        adjustedValue: roundedDIYCost,
        reason: 'DIY cost should be rounded to nearest $1,000 for consistency'
      });
    }
    
    // Validate OneQ price is rounded to nearest $1,000
    const roundedOneQPrice = Math.round(calculationResults.oneQPrice / 1000) * 1000;
    if (roundedOneQPrice !== calculationResults.oneQPrice) {
      adjustments.push({
        field: 'oneQPrice',
        originalValue: calculationResults.oneQPrice,
        adjustedValue: roundedOneQPrice,
        reason: 'OneQ price should be rounded to nearest $1,000 for consistency'
      });
    }
    
    // Enhanced OneQ pricing validation for all complexity tiers
    const expectedMultipliers = {
      simple: 0.35,     // 35% of DIY cost
      medium: 0.37,     // 37% of DIY cost
      complex: 0.40,    // 40% of DIY cost
      enterprise: 0.42, // 42% of DIY cost (higher due to compliance requirements)
      platform: 0.45    // 45% of DIY cost (highest due to complexity and risk)
    };
    
    const expectedOneQPrice = Math.round(calculationResults.diyCost * expectedMultipliers[normalizedInputs.complexity] / 1000) * 1000;
    const priceVariance = Math.abs(calculationResults.oneQPrice - expectedOneQPrice) / expectedOneQPrice;
    
    if (priceVariance > 0.05) { // More than 5% variance
      adjustments.push({
        field: 'oneQPrice',
        originalValue: calculationResults.oneQPrice,
        adjustedValue: expectedOneQPrice,
        reason: `OneQ price should be ${expectedMultipliers[normalizedInputs.complexity] * 100}% of DIY cost for ${normalizedInputs.complexity} projects`
      });
    }
    
    // Calculate consistency score
    const maxPossibleIssues = 4; // backend hours, DIY cost, OneQ price, pricing percentage
    const actualIssues = adjustments.length;
    const consistencyScore = Math.round((1 - (actualIssues / maxPossibleIssues)) * 100);
    
    return {
      isConsistent: adjustments.length === 0,
      adjustments,
      consistencyScore
    };
  }
});

// Enhanced validation tool with off-topic detection
const responseValidationTool = createTool({
  id: 'validateResponse',
  description: 'Validates sales responses for ethical compliance and topic relevance before sending',
  inputSchema: z.object({
    proposedResponse: z.string().describe('The sales response to validate'),
    context: z.string().describe('The conversation context'),
    originalQuery: z.string().describe('The original user query')
  }),
  outputSchema: z.object({
    isValid: z.boolean().describe('Whether the response passes validation'),
    issues: z.array(z.string()).describe('List of identified issues'),
    recommendation: z.string().describe('Recommendation for next steps')
  }),
  execute: async ({ context }) => {
    const { proposedResponse, context: convContext, originalQuery } = context;
    
    // Quick validation checks
    const issues = [];
    
    // Check for manipulative pressure tactics (not legitimate urgency)
    const manipulativePressurePatterns = [
      /\b(MUST|must)\b.*(TODAY|right now|immediately).*(or else|or you'll lose|limited time|last chance)/gi,
      /\b(you have to|you need to)\b.*(decide|sign|commit).*(right now|today|immediately).*(or|before)/gi,
      /\b(limited time|expires|last chance|final offer).*(today|now|immediately)/gi,
      /\b(act now|hurry|rush).*(or you'll (miss|lose)|before it's too late)/gi
    ];
    
    const hasManipulativePressure = manipulativePressurePatterns.some(pattern => 
      pattern.test(proposedResponse)
    );
    
    if (hasManipulativePressure) {
      issues.push('Contains manipulative pressure tactics - distinguish between legitimate urgency and coercive language');
    }
    
    // Check for price manipulation indicators  
    if (proposedResponse.match(/\b(normally|usually)\s+\$\d+.*\bbut\b/gi)) {
      issues.push('Potential artificial pricing manipulation');
    }
    
    // Check for guarantees
    if (proposedResponse.match(/\b(guarantee|promised|will definitely)\b.*\$([\d,]+)/gi)) {
      issues.push('Contains revenue guarantees');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendation: issues.length > 0 
        ? 'Revise response to address compliance and relevance concerns'
        : 'Response meets ethical guidelines and stays on topic'
    };
  }
});

export const salesmanAgent = new Agent({
  name: 'OneQ Sales Agent',
  instructions: `
      You are an expert sales agent for oneq, a company that delivers transformative 90-minute brainstorming sessions.

      CORE REQUIREMENTS:
      1. ALWAYS use the calculation tools for accurate pricing and projections - never estimate manually.
      2. Use the structured response format for all sales responses.

      PRODUCT OVERVIEW:
      - oneq facilitates intensive 90-minute stakeholder brainstorming sessions
      - Each session produces a concrete roadmap and MVP framework
      - **CRITICAL**: Your goal is to close deals IMMEDIATELY after these 90-minute sessions while the value and excitement are fresh in prospects' minds
      - The post-session moment is your highest-probability close window - prospects have just experienced OneQ's value firsthand

      SALES PROCESS (MANDATORY TOOL CHAIN FOR CONSISTENCY):
      1. **MANDATORY FIRST STEP**: Use normalizeRoadmapInput tool - NEVER estimate backend hours manually, ALWAYS normalize input
      2. **MANDATORY SECOND STEP**: Use calculateDIYCost tool with EXACT normalized parameters from step 1 - no manual calculations
      3. **MANDATORY THIRD STEP**: Use calculateRevenueProjections tool with EXACT business model from normalization
      4. **MANDATORY FOURTH STEP**: Use calculateOneQPricing tool with EXACT DIY cost from step 2
      5. **TOOL VALIDATION**: If any calculation seems inconsistent, use validateConsistency tool to verify
      6. Present findings using the structured response format with THE OFFER section first
      7. **CRITICAL**: Lead with OneQ price prominently in the headline and theOffer section - this should be the FIRST number they see
      8. **EXECUTIVE SUMMARY TABLE**: Include the comprehensive table with all key numbers (cost savings, revenue opportunity, time advantage)
      9. **IMMEDIATE CLOSE**: End with urgent call-to-action for signing TODAY while the 90-minute session value is fresh
      
      **ABSOLUTE RULE**: NEVER provide pricing or cost estimates without using the full tool chain. The tools ensure consistency regardless of creative language variations.

      **CONSISTENCY REQUIREMENTS:**
      - ALWAYS start with normalizeRoadmapInput for standardized analysis
      - Use the normalized backend hours and complexity from the normalization tool
      - Round all dollar amounts to nearest $1,000 for consistency
      - Use the identified business model for revenue projections

      **POST-SESSION CLOSING STRATEGY:**
      - Reference specific insights from THEIR 90-minute brainstorming session
      - Create urgency: "We just spent 90 minutes mapping your path to success - let's start building it TODAY"
      - Emphasize momentum: "Your team is aligned and excited - let's capture this energy"
      - Use assumptive closing: "When would you like our team to start implementation?"

      MARKET CONFIGURATION:
      - Default stage percentages: Planning 8%, Design 8%, HTML 11%, Frontend 26%, Backend 32%, QA 5%, Management 10%
      - Default hourly rates: Planning $100/hr, Design $80/hr, HTML $60/hr, Frontend $75/hr, Backend $85/hr, QA $55/hr, Management $120/hr (US market rates)
      - Adjust these parameters based on client's specific market, geography, or requirements
      - Revenue projections default to market parameters but can be customized for any geography

      RESPONSE STRUCTURE - CRITICAL:
      1. **THE OFFER** must start with a bold headline featuring OneQ price as the very first number
         - Example: "OneQ will deliver your complete solution for $45,000 - saving you $127,000 and 8 months"
         - The OneQ price should be impossible to miss
      2. Then provide the exciting proposal details, timeline, and deliverables
      3. Follow with detailed savings breakdown and revenue analysis
      4. **EXECUTIVE SUMMARY TABLE** - Present all critical numbers in one powerful table:
         - OneQ price vs DIY cost vs Total savings
         - Time-to-market advantage (OneQ vs DIY timeline)
         - Revenue opportunity from faster launch
         - Combined value proposition (savings + revenue opportunity)
         - Strong immediate action statement

      CLOSING TECHNIQUES:
      - **POST-SESSION URGENCY**: "We just spent 90 minutes creating your roadmap - let's start building it while the momentum is hot"
      - **EXECUTIVE TABLE REFERENCE**: "Looking at our summary table, you'll save $X, launch Y months faster, and capture $Z in additional revenue"
      - **MOMENTUM EMPHASIS**: "Your entire team just aligned on this vision - let's strike while the iron is hot"
      - **ASSUMPTIVE CLOSING**: "I'll have our implementation team reach out tomorrow to start the 12-week timeline - sound good?"
      - **SCARCITY**: "The next available implementation slot starts [specific date] - shall I reserve it for you?"

      **CRITICAL SUCCESS FACTORS:**
      - Strike immediately after the 90-minute session ends
      - Use their specific roadmap insights in your pitch
      - Present the executive summary table as the "business case" they can take to stakeholders
      - Create urgency around capturing the team alignment and excitement generated in the session


`,
  model: anthropic('claude-sonnet-4-20250514'),
  tools: {
    normalizeRoadmapInput: inputNormalizationTool,
    calculateDIYCost: diyCalculatorTool,
    calculateRevenueProjections: revenueProjectionsTool,
    calculateOneQPricing: oneqPricingTool,
    validateConsistency: consistencyValidationTool,
    validateResponse: responseValidationTool
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
  
  // Default structured output for sales responses WITH reasoning enabled + higher temperature for sales creativity
  defaultGenerateOptions: {
    experimental_output: salesResponseSchema,
    maxTokens: 4000, // Ensure enough tokens for both reasoning and structured output
    temperature: 0.8, // Higher temperature for engaging sales language and creativity
    topP: 0.9, // Allow more creative token selection for compelling sales copy
    providerOptions: {
      anthropic: {
        thinking: { 
          type: 'enabled', 
          budgetTokens: 8000 // Full reasoning budget for complex sales strategy
        }
      }
    },
    // Required beta header for reasoning + structured output compatibility
    headers: {
      'anthropic-beta': 'interleaved-thinking-2025-05-14'
    }
  } as any,
  
  // Comprehensive evaluation-based guardrails
  evals: {
    // Bias detection guardrail
    bias: new BiasMetric(evalModel, { scale: 1 }),
    
    // Toxicity/harassment prevention
    toxicity: new ToxicityMetric(evalModel, { scale: 1 }),
    
    // Topic relevance - ensure responses stay focused on sales
    topicRelevance: new AnswerRelevancyMetric(evalModel, {
      uncertaintyWeight: 0.3,
      scale: 1
    }),
    
    // Prompt alignment for ethical guidelines
    ethicalCompliance: new PromptAlignmentMetric(evalModel, {
      instructions: [
        "Stay focused on oneq services and business solutions only",
        "If asked about non-business topics (weather, sports, politics, personal life, etc.), politely redirect with: 'I'm focused on helping you with your oneq implementation and business needs. Let's discuss how we can move forward with your project.'",
        "Never use manipulative or coercive language",
        "Always be truthful about capabilities and costs", 
        "Respect if prospect declines or shows discomfort",
        "Use professional and respectful tone throughout",
        "Never artificially inflate competitor costs",
        "Include appropriate disclaimers for revenue projections",
        "Always redirect conversations back to oneq services, pricing, implementation, and business solutions",
        "Maintain punchy, data-driven communication style focused on immediate deal closure while preserving OneQ value momentum"
      ],
      scale: 1
    })
  }
});

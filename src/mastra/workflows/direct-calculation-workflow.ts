import { createStep, createWorkflow } from '@mastra/core/workflows';
import { RuntimeContext } from '@mastra/core/di';
import { z } from 'zod';
import { inputNormalizationTool } from '../tools/input-normalization-tool';
import { diyCalculatorTool } from '../tools/diy-cost-calculator-tool';
import { revenueProjectionsTool } from '../tools/revenue-projections-tool';
import { oneqPricingTool } from '../tools/oneq-pricing-tool';
import { consistencyValidationTool } from '../tools/validation-tools';

// Step 1: Normalize roadmap input
const normalizeInputStep = createStep({
  id: 'normalizeInput',
  inputSchema: z.object({
    roadmapText: z.string(),
    projectType: z.enum(['webapp', 'mobile', 'api', 'platform', 'saas', 'enterprise']).optional(),
    industry: z.string().optional()
  }),
  outputSchema: z.object({
    normalizedFeatures: z.array(z.string()),
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']),
    estimatedBackendHours: z.number(),
    businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise']),
    marketCategory: z.string(),
    keyDifferentiators: z.array(z.string()),
    isMultiPhase: z.boolean(),
    phaseCount: z.number(),
    complianceRequirements: z.array(z.string()),
    enterpriseFeatures: z.array(z.string())
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { roadmapText, projectType, industry } = inputData;
    
    if (!roadmapText) {
      throw new Error('Roadmap text is required');
    }
    
    const context = runtimeContext || new RuntimeContext();
    
    const result = await inputNormalizationTool.execute({
      context: {
        roadmapText,
        projectType,
        industry
      },
      runtimeContext: context
    });
    
    return result;
  },
});

// Step 2: Calculate DIY costs
const calculateDIYStep = createStep({
  id: 'calculateDIY',
  inputSchema: z.object({
    normalizedFeatures: z.array(z.string()),
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']),
    estimatedBackendHours: z.number(),
    complianceRequirements: z.array(z.string()),
    enterpriseFeatures: z.array(z.string()),
    isMultiPhase: z.boolean()
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
      onboardingCosts: z.number(),
      complianceAuditCosts: z.number()
    }),
    totalDIYCost: z.number(),
    timeline: z.string()
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { estimatedBackendHours, normalizedFeatures, backendComplexity, complianceRequirements, enterpriseFeatures, isMultiPhase } = inputData;
    
    const context = runtimeContext || new RuntimeContext();
    
    const result = await diyCalculatorTool.execute({
      context: {
        backendHours: estimatedBackendHours,
        features: normalizedFeatures,
        priority: backendComplexity,
        complianceRequirements: complianceRequirements || [],
        enterpriseFeatures: enterpriseFeatures || [],
        isMultiPhase: isMultiPhase || false,
        currency: '$'
      },
      runtimeContext: context
    });
    
    return result;
  },
});

// Step 3: Calculate revenue projections
const calculateRevenueStep = createStep({
  id: 'calculateRevenue',
  inputSchema: z.object({
    businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise']),
    marketCategory: z.string(),
    roadmapText: z.string()
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
    conservativeProjection: z.number()
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { businessModel, marketCategory, roadmapText } = inputData;
    
    const context = runtimeContext || new RuntimeContext();
    
    const result = await revenueProjectionsTool.execute({
      context: {
        businessModel,
        productDescription: roadmapText || '',
        targetMarket: marketCategory,
        geographyFocus: 'United States',
        currency: '$'
      },
      runtimeContext: context
    });
    
    return result;
  },
});

// Step 4: Calculate OneQ pricing
const calculatePricingStep = createStep({
  id: 'calculatePricing',
  inputSchema: z.object({
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']),
    totalDIYCost: z.number(),
    complianceRequirements: z.array(z.string())
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
  execute: async ({ inputData, runtimeContext }) => {
    const { totalDIYCost, backendComplexity, complianceRequirements } = inputData;
    
    const context = runtimeContext || new RuntimeContext();
    
    const result = await oneqPricingTool.execute({
      context: {
        diyCost: totalDIYCost,
        complexity: backendComplexity,
        expeditedDelivery: false,
        extendedSupport: false,
        complianceRequirements: complianceRequirements || []
      },
      runtimeContext: context
    });
    
    return result;
  },
});

// Step 5: Validate consistency - Fixed to match actual tool schema
const validateConsistencyStep = createStep({
  id: 'validateConsistency',
  inputSchema: z.object({
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']),
    totalDIYCost: z.number(),
    corePrice: z.number()
  }),
  outputSchema: z.object({
    isConsistent: z.boolean(),
    consistencyScore: z.number(),
    finalPricing: z.object({
      diyCost: z.number(),
      oneQPrice: z.number(),
      savingsPercent: z.number()
    })
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { backendComplexity, totalDIYCost, corePrice } = inputData;
    
    const context = runtimeContext || new RuntimeContext();
    
    // Use the correct schema that matches the imported validation tool
    const result = await consistencyValidationTool.execute({
      context: {
        normalizedInputs: {
          complexity: backendComplexity  // Only complexity is needed
        },
        calculationResults: {
          diyCost: totalDIYCost,
          oneQPrice: corePrice
          // Remove monthlyRevenue - not expected by the tool
        }
      },
      runtimeContext: context
    });
    
    return result;
  },
});

// Create the workflow with proper step definitions
export const directCalculationWorkflow = createWorkflow({
  id: 'direct-calculation',
  description: 'Direct calculation workflow for OneQ sales proposals',
  inputSchema: z.object({
    roadmapText: z.string().describe('Roadmap or PRD text to analyze'),
    projectType: z.enum(['webapp', 'mobile', 'api', 'platform', 'saas', 'enterprise']).optional(),
    industry: z.string().optional()
  }),
  outputSchema: z.object({
    isConsistent: z.boolean(),
    consistencyScore: z.number(),
    finalPricing: z.object({
      diyCost: z.number(),
      oneQPrice: z.number(),
      savingsPercent: z.number()
    })
  }),
  steps: [normalizeInputStep, calculateDIYStep, calculateRevenueStep, calculatePricingStep, validateConsistencyStep]
})
  .then(normalizeInputStep)
  .map({
    normalizedFeatures: { step: normalizeInputStep, path: 'normalizedFeatures' },
    backendComplexity: { step: normalizeInputStep, path: 'backendComplexity' },
    estimatedBackendHours: { step: normalizeInputStep, path: 'estimatedBackendHours' },
    complianceRequirements: { step: normalizeInputStep, path: 'complianceRequirements' },
    enterpriseFeatures: { step: normalizeInputStep, path: 'enterpriseFeatures' },
    isMultiPhase: { step: normalizeInputStep, path: 'isMultiPhase' }
  })
  .then(calculateDIYStep)
  .map({
    businessModel: { step: normalizeInputStep, path: 'businessModel' },
    marketCategory: { step: normalizeInputStep, path: 'marketCategory' },
    roadmapText: { value: '', schema: z.string() }
  })
  .then(calculateRevenueStep)
  .map({
    backendComplexity: { step: normalizeInputStep, path: 'backendComplexity' },
    totalDIYCost: { step: calculateDIYStep, path: 'totalDIYCost' },
    complianceRequirements: { step: normalizeInputStep, path: 'complianceRequirements' }
  })
  .then(calculatePricingStep)
  .map({
    backendComplexity: { step: normalizeInputStep, path: 'backendComplexity' },
    totalDIYCost: { step: calculateDIYStep, path: 'totalDIYCost' },
    corePrice: { step: calculatePricingStep, path: 'corePrice' }
  })
  .then(validateConsistencyStep)
  .commit(); 
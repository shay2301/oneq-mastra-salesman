import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Simplified consistency validation tool
export const consistencyValidationTool = createTool({
  id: 'validateConsistency',
  description: 'Quick validation that calculations follow OneQ pricing rules',
  inputSchema: z.object({
    normalizedInputs: z.object({
      complexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform'])
    }),
    calculationResults: z.object({
      diyCost: z.number(),
      oneQPrice: z.number()
    })
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
  execute: async ({ context }) => {
    const { normalizedInputs, calculationResults } = context;
    
    // FIXED: Just validate, don't recalculate
    const expectedMultipliers = {
      simple: 0.35, medium: 0.37, complex: 0.40, 
      enterprise: 0.42, platform: 0.45
    };
    
    // Validate the pricing is reasonable (within 5% of expected)
    const expectedMultiplier = expectedMultipliers[normalizedInputs.complexity];
    const actualMultiplier = calculationResults.oneQPrice / calculationResults.diyCost;
    const isWithinRange = Math.abs(actualMultiplier - expectedMultiplier) < 0.05;
    
    // Calculate savings percentage from ACTUAL values (don't change them)
    const savingsPercent = Math.round(((calculationResults.diyCost - calculationResults.oneQPrice) / calculationResults.diyCost) * 100);
    
    // FIXED: Return the EXACT same values that were input - don't modify them
    return {
      isConsistent: isWithinRange,
      consistencyScore: isWithinRange ? 95 : 85,
      finalPricing: {
        diyCost: calculationResults.diyCost,        // UNCHANGED: Keep original value
        oneQPrice: calculationResults.oneQPrice,    // UNCHANGED: Keep original value  
        savingsPercent: savingsPercent              // CALCULATED: From actual values
      }
    };
  }
});

// Simplified response validation tool  
export const responseValidationTool = createTool({
  id: 'validateResponse',
  description: 'Quick validation for ethical compliance',
  inputSchema: z.object({
    proposedResponse: z.string().describe('The sales response to validate')
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    recommendation: z.string()
  }),
  execute: async ({ context }) => {
    const { proposedResponse } = context;
    
    // Simple checks for major issues only
    const hasGuarantees = proposedResponse.includes('guarantee') && proposedResponse.includes('$');
    const hasAggressivePressure = proposedResponse.includes('must act now') || proposedResponse.includes('limited time today');
    
    const isValid = !hasGuarantees && !hasAggressivePressure;
    
    return {
      isValid,
      recommendation: isValid 
        ? 'Response approved for delivery'
        : 'Minor adjustments needed for ethical compliance'
    };
  }
}); 
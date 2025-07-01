import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const oneqPricingTool = createTool({
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
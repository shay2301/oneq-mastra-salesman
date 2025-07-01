import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const revenueProjectionsTool = createTool({
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
        
      case 'enterprise':
        // Enterprise software with larger deal sizes and quarterly cycles
        const enterpriseDealSize = marketParameters?.enterpriseDealSize ?? 75000;
        const enterpriseDealsPerQuarter = marketParameters?.enterpriseDealsPerQuarter ?? 2;
        const enterpriseWinRate = marketParameters?.enterpriseWinRate ?? 0.15;
        monthlyRevenuePotential = Math.round((enterpriseDealSize * enterpriseDealsPerQuarter * enterpriseWinRate) / 3); // Convert quarterly to monthly
        marketAnalysisBasis = `Enterprise software in ${geographyFocus}: ${enterpriseDealsPerQuarter} deals/quarter at ${currency}${enterpriseDealSize} average with ${enterpriseWinRate * 100}% win rate`;
        businessModelMetrics = { 
          dealSize: enterpriseDealSize, 
          winRate: enterpriseWinRate 
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
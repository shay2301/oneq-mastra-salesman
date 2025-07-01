import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const diyCalculatorTool = createTool({
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
      onboardingCosts: z.number(),
      complianceAuditCosts: z.number().describe('Compliance audit and certification costs')
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
    
    // Updated Israeli enterprise hourly rates (converted from NIS to USD, based on 3.7 exchange rate)
    // Data source: Israeli salary surveys and enterprise hiring data (2024-2025)
    const baseHourlyRates = {
      // Core development roles - based on Israeli enterprise averages
      seniorDeveloper: 65,      // $49-$69 range average for senior developers
      midDeveloper: 45,         // $37-$51 range average for mid-level developers  
      juniorDeveloper: 32,      // $31-$34 range average for junior developers
      
      // Specialized technical roles - premium rates for expertise
      architect: 85,            // Senior technical leadership
      devopsEngineer: 58,       // $54-$61 range average for senior DevOps
      securitySpecialist: 50,   // $46-$54 range average for senior security
      
      // AI/ML roles - highest demand in Israeli market
      mlEngineer: 80,           // $61-$99 range average for senior ML engineers
      dataScientist: 65,        // $61-$69 range average for senior data scientists
      aiResearcher: 90,         // Premium for AI research expertise
      
      // Design and UX - based on Israeli market rates  
      uiUxDesigner: 36,         // $35-$38 range average for senior designers
      productDesigner: 42,      // Slightly higher for product focus
      
      // QA and testing - reflecting automation premium
      qaEngineer: 42,           // $37-$46 range average for senior QA
      automationEngineer: 46,   // $43-$49 range average for automation
      
      // Management and coordination
      projectManager: 38,       // $34-$41 range average for senior PMs
      productManager: 42,       // $37-$46 range average for senior product managers
      teamLead: 75,            // Leadership premium
      
      // System administration and infrastructure
      systemAdmin: 50,          // $46-$54 range average for senior systems
      cloudEngineer: 62,        // Premium for cloud expertise
      
      // Data roles
      dataEngineer: 55,         // $49-$61 range average for senior data engineers
      dataAnalyst: 40,          // Mid-level analysis work
      
      // Mobile development - specialized platforms
      mobileDeveloper: 52,      // Cross-platform mobile expertise
      iosDeveloper: 55,         // iOS specialization premium  
      androidDeveloper: 55,     // Android specialization premium
    };
    
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
    
    // Enhanced hourly rates based on Israeli enterprise market research (2024-2025)
    // Converted from NIS to USD using 3.7 exchange rate, based on actual salary surveys
    const hourlyRates: Record<string, number> = {
      'Planning': customHourlyRates?.planning ?? baseHourlyRates.architect,        // 85
      'Design': customHourlyRates?.design ?? baseHourlyRates.uiUxDesigner,        // 36  
      'HTML/Markup': customHourlyRates?.htmlMarkup ?? baseHourlyRates.juniorDeveloper, // 32
      'Frontend Development': customHourlyRates?.frontend ?? baseHourlyRates.midDeveloper, // 45
      'Backend Development': customHourlyRates?.backend ?? baseHourlyRates.seniorDeveloper, // 65
      'QA/Testing': customHourlyRates?.qa ?? baseHourlyRates.qaEngineer,          // 42
      'Project Management': customHourlyRates?.management ?? baseHourlyRates.projectManager, // 38
      
      // Enterprise specialist rates for complex projects (Israeli market + premium)
      'AI/ML Engineering': customHourlyRates?.aiMlEngineer ?? baseHourlyRates.mlEngineer,      // 80
      'Security Specialist': customHourlyRates?.securitySpecialist ?? baseHourlyRates.securitySpecialist, // 50
      'Enterprise Architecture': customHourlyRates?.enterpriseArchitect ?? baseHourlyRates.architect, // 85
      'Compliance Expert': customHourlyRates?.complianceExpert ?? 95,              // Premium for compliance expertise
      'DevOps Engineering': customHourlyRates?.devOpsEngineer ?? baseHourlyRates.devopsEngineer, // 58
      'Cloud Architecture': customHourlyRates?.cloudArchitect ?? baseHourlyRates.cloudEngineer  // 62
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
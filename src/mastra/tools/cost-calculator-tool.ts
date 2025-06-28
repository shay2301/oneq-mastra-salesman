import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const costCalculatorTool = createTool({
  id: 'calculate-project-cost',
  description: 'Calculate DIY project development costs based on roadmap requirements',
  inputSchema: z.object({
    developmentRequests: z.array(z.object({
      title: z.string().describe('Feature or requirement title'),
      description: z.string().describe('Technical description of the requirement'),
      backendHours: z.number().describe('Estimated backend development hours'),
      priority: z.number().min(1).max(5).describe('Priority level (1=lowest, 5=highest)')
    })).describe('List of development requirements from roadmap/PRD'),
    
    location: z.string().default('Israel').describe('Geographic location for salary calculations'),
    
    // Stage percentages - defaults from the calculator
    stagePercentages: z.object({
      planning: z.number().default(8).describe('Planning phase percentage'),
      design: z.number().default(8).describe('Design phase percentage'), 
      html: z.number().default(11).describe('HTML/markup phase percentage'),
      frontend: z.number().default(26).describe('Frontend development percentage'),
      backend: z.number().default(32).describe('Backend development percentage'),
      qa: z.number().default(5).describe('QA/testing percentage'),
      management: z.number().default(10).describe('Project management percentage')
    }).optional().describe('Custom stage percentage allocation'),
    
    // Hourly rates - defaults for Israel market
    hourlyRates: z.object({
      planning: z.number().default(200).describe('Planning hourly rate (₪)'),
      design: z.number().default(250).describe('Design hourly rate (₪)'),
      html: z.number().default(180).describe('HTML/markup hourly rate (₪)'),
      frontend: z.number().default(280).describe('Frontend developer hourly rate (₪)'),
      backend: z.number().default(300).describe('Backend developer hourly rate (₪)'),
      qa: z.number().default(220).describe('QA engineer hourly rate (₪)'),
      management: z.number().default(350).describe('Project manager hourly rate (₪)')
    }).optional().describe('Custom hourly rates by role')
  }),
  
  outputSchema: z.object({
    totalBackendHours: z.number().describe('Total backend hours across all requests'),
    totalProjectHours: z.number().describe('Total project hours across all stages'),
    totalProjectCost: z.number().describe('Total project cost in ₪'),
    
    stageBreakdown: z.array(z.object({
      stage: z.string().describe('Stage name'),
      percentage: z.number().describe('Percentage of total project'),
      hours: z.number().describe('Hours for this stage'),
      hourlyRate: z.number().describe('Hourly rate for this stage'),
      cost: z.number().describe('Total cost for this stage')
    })).describe('Detailed breakdown by development stage'),
    
    teamRequirements: z.array(z.object({
      role: z.string().describe('Required team role'),
      hoursPerWeek: z.number().describe('Hours per week commitment'),
      weeklyRate: z.number().describe('Weekly cost for this role'),
      totalWeeks: z.number().describe('Estimated duration in weeks'),
      totalCost: z.number().describe('Total cost for this role')
    })).describe('Team member requirements and costs'),
    
    additionalCosts: z.object({
      recruitmentFees: z.number().describe('Recruitment costs (20% of annual salaries)'),
      benefitsOverhead: z.number().describe('Benefits and overhead (35% of salaries)'),
      equipmentCosts: z.number().describe('Equipment and workspace costs'),
      onboardingCosts: z.number().describe('Learning curve and onboarding costs'),
      totalAdditionalCosts: z.number().describe('Sum of all additional costs')
    }).describe('Hidden costs not included in hourly rates'),
    
    projectSummary: z.object({
      complexity: z.enum(['Simple', 'Medium', 'Complex']).describe('Overall project complexity'),
      estimatedDuration: z.string().describe('Estimated project duration'),
      riskFactors: z.array(z.string()).describe('Key risk factors'),
      recommendedTeamSize: z.number().describe('Recommended team size')
    }).describe('High-level project analysis')
  }),
  
  execute: async ({ context }) => {
    const { 
      developmentRequests, 
      location = 'Israel',
      stagePercentages = {
        planning: 8, design: 8, html: 11, frontend: 26, 
        backend: 32, qa: 5, management: 10
      },
      hourlyRates = {
        planning: 200, design: 250, html: 180, frontend: 280,
        backend: 300, qa: 220, management: 350
      }
    } = context;

    // Calculate total backend hours
    const totalBackendHours = developmentRequests.reduce((sum, req) => sum + req.backendHours, 0);
    
    // Calculate total project hours based on backend percentage
    const backendPercent = stagePercentages.backend;
    const totalProjectHours = backendPercent > 0 ? (totalBackendHours / backendPercent) * 100 : 0;
    
    // Calculate stage breakdown
    const stages = [
      { name: 'Planning', key: 'planning' },
      { name: 'Design', key: 'design' },
      { name: 'HTML/Markup', key: 'html' },
      { name: 'Frontend Development', key: 'frontend' },
      { name: 'Backend Development', key: 'backend' },
      { name: 'QA/Testing', key: 'qa' },
      { name: 'Project Management', key: 'management' }
    ];
    
    const stageBreakdown = stages.map(stage => {
      const percentage = stagePercentages[stage.key as keyof typeof stagePercentages];
      const hours = (percentage / 100) * totalProjectHours;
      const hourlyRate = hourlyRates[stage.key as keyof typeof hourlyRates];
      const cost = hours * hourlyRate;
      
      return {
        stage: stage.name,
        percentage,
        hours,
        hourlyRate,
        cost
      };
    });
    
    const totalProjectCost = stageBreakdown.reduce((sum, stage) => sum + stage.cost, 0);
    
    // Calculate team requirements (assuming 40-hour work weeks)
    const teamRequirements = stageBreakdown.map(stage => {
      const weeksNeeded = Math.ceil(stage.hours / 40); // 40 hours per week
      const hoursPerWeek = stage.hours / (weeksNeeded || 1);
      const weeklyRate = hoursPerWeek * stage.hourlyRate;
      
      return {
        role: stage.stage,
        hoursPerWeek,
        weeklyRate,
        totalWeeks: weeksNeeded,
        totalCost: stage.cost
      };
    });
    
    // Calculate additional costs
    const annualSalaryCost = totalProjectCost * 2; // Rough annual equivalent
    const recruitmentFees = annualSalaryCost * 0.20; // 20% recruitment fees
    const benefitsOverhead = totalProjectCost * 0.35; // 35% benefits overhead
    const teamSize = Math.ceil(developmentRequests.length / 2); // Rough team size estimate
    const equipmentCosts = teamSize * 15000; // ₪15K per developer
    const onboardingCosts = totalProjectCost * 0.25; // 25% for learning curve
    
    const additionalCosts = {
      recruitmentFees,
      benefitsOverhead,
      equipmentCosts,
      onboardingCosts,
      totalAdditionalCosts: recruitmentFees + benefitsOverhead + equipmentCosts + onboardingCosts
    };
    
    // Project complexity analysis
    const avgPriority = developmentRequests.reduce((sum, req) => sum + req.priority, 0) / developmentRequests.length;
    const complexity = totalBackendHours < 100 ? 'Simple' : 
                      totalBackendHours < 300 ? 'Medium' : 'Complex';
    
    const estimatedDurationWeeks = Math.ceil(totalProjectHours / (teamSize * 40));
    const estimatedDuration = `${estimatedDurationWeeks} weeks (${Math.ceil(estimatedDurationWeeks / 4)} months)`;
    
    const riskFactors = [];
    if (complexity === 'Complex') riskFactors.push('High technical complexity');
    if (avgPriority > 4) riskFactors.push('Very tight deadlines');
    if (developmentRequests.length > 10) riskFactors.push('Large scope with many features');
    if (totalBackendHours > 500) riskFactors.push('Extended development timeline');
    
    return {
      totalBackendHours,
      totalProjectHours,
      totalProjectCost,
      stageBreakdown,
      teamRequirements,
      additionalCosts,
      projectSummary: {
        complexity: complexity as 'Simple' | 'Medium' | 'Complex',
        estimatedDuration,
        riskFactors,
        recommendedTeamSize: teamSize
      }
    };
  }
}); 
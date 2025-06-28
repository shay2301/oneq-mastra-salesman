import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface IStage {
  name: string;
  percent: number;
  rate: number;
}

interface IRequest {
  id: number;
  title: string;
  description: string;
  backendHours: number;
  priority: number;
}

class ProjectCostCalculator {
  private stages: IStage[];
  private requests: IRequest[];

  constructor(stages: IStage[], requests: IRequest[]) {
      this.stages = stages;
      this.requests = requests;
  }

  public getStageResults(backendHours: number): any[] {
      const backendStage = this.stages.find(s => s.name === 'Backend Development');
      const backendPercent = backendStage ? backendStage.percent : 0;
      const totalHours = backendPercent > 0 ? (backendHours / backendPercent) * 100 : 0;

      return this.stages.map((stage, i) => {
          const hours = (stage.percent / 100) * totalHours;
          const cost = hours * stage.rate;
          return { name: stage.name, percent: stage.percent, hours, rate: stage.rate, cost };
      });
  }

  public get cumulativeResults() {
      const totalBackendHours = this.requests.reduce((sum, req) => sum + req.backendHours, 0);
      return this.getStageResults(totalBackendHours);
  }

  public get totalCumulativeCost() {
      return this.cumulativeResults.reduce((sum, r) => sum + r.cost, 0);
  }

  public get totalCumulativeHours() {
      return this.cumulativeResults.reduce((sum, r) => sum + r.hours, 0);
  }
}

const inputSchema = z.object({
    requests: z.array(z.object({
        id: z.number().describe('Requirement ID'),
        title: z.string().describe('Title of the requirement'),
        description: z.string().describe('Description of the requirement'),
        backendHours: z.number().describe('Estimated backend development hours'),
        priority: z.number().describe('Priority of the requirement (1-5)'),
    })).describe('An array of development requirements.'),
});

export const projectCostCalculatorTool = createTool({
    id: 'project-cost-calculator',
    description: 'Calculates project costs based on development requirements. Use this to determine the DIY cost for a project.',
    inputSchema,
    outputSchema: z.object({
        breakdown: z.array(z.object({
            name: z.string(),
            percent: z.number(),
            hours: z.number(),
            rate: z.number(),
            cost: z.number(),
        })),
        totalCost: z.number(),
        totalHours: z.number(),
    }),
    execute: async ({ context }) => {
        const stages: IStage[] = [
            { name: 'Planning', percent: 8, rate: 60 },
            { name: 'Design', percent: 8, rate: 75 },
            { name: 'HTML/Markup', percent: 11, rate: 55 },
            { name: 'Frontend Development', percent: 26, rate: 85 },
            { name: 'Backend Development', percent: 32, rate: 90 },
            { name: 'QA/Testing', percent: 5, rate: 65 },
            { name: 'Project Management', percent: 10, rate: 105 },
        ];

        const calculator = new ProjectCostCalculator(stages, context.requests);

        return {
            breakdown: calculator.cumulativeResults,
            totalCost: calculator.totalCumulativeCost,
            totalHours: calculator.totalCumulativeHours,
        };
    },
});
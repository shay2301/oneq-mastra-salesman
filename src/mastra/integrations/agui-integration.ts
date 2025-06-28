// AG-UI Integration Layer for OneQ Salesman Agent
// This file prepares the agent for easy AG-UI integration

export interface AGUIEvent {
  type: string;
  data?: any;
  timestamp?: number;
  component?: string;
  props?: Record<string, any>;
}

export interface SalesData {
  diyCost: number;
  oneqPrice: number;
  savings: number;
  savingsPercentage: number;
  monthlyRevenue: number;
  teamBreakdown: TeamMember[];
  delayImpact: DelayScenario[];
  modularOptions: ModularOption[];
}

export interface TeamMember {
  role: string;
  hoursPerWeek: number;
  hourlyRate: number;
  weeks: number;
  totalCost: number;
}

export interface DelayScenario {
  period: string;
  lostRevenue: number;
  competitiveRisk: string;
  impact: string;
}

export interface ModularOption {
  name: string;
  description: string;
  price: number;
  included: boolean;
}

export class AGUIEventEmitter {
  private events: AGUIEvent[] = [];
  
  // Emit pricing calculator component
  emitPricingCalculator(salesData: SalesData): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "PricingCalculator",
      props: {
        diyCost: salesData.diyCost,
        oneqPrice: salesData.oneqPrice,
        savings: salesData.savings,
        savingsPercentage: salesData.savingsPercentage,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit cost of delay visualization
  emitDelayImpactChart(delayScenarios: DelayScenario[]): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui", 
      component: "DelayImpactChart",
      props: {
        scenarios: delayScenarios,
        chartType: "bar",
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit team breakdown visualization
  emitTeamBreakdown(teamMembers: TeamMember[]): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "TeamBreakdownChart", 
      props: {
        teamMembers,
        showCosts: true,
        showTimeline: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit modular options selector
  emitModularOptions(options: ModularOption[]): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "ModularOptionsSelector",
      props: {
        options,
        allowToggle: true,
        showPriceImpact: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit real-time calculation updates
  emitCalculationStep(step: string, data: any): AGUIEvent {
    const event: AGUIEvent = {
      type: "calculation_update",
      data: {
        step,
        ...data
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit proposal generation progress
  emitProposalProgress(progress: number, currentStep: string): AGUIEvent {
    const event: AGUIEvent = {
      type: "proposal_progress",
      data: {
        progress,
        currentStep,
        total: 100
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Get all events for AG-UI consumption
  getEvents(): AGUIEvent[] {
    return this.events;
  }
  
  // Clear events (for new conversations)
  clearEvents(): void {
    this.events = [];
  }
}

// Utility functions to parse agent responses into AG-UI compatible data
export class SalesDataParser {
  static parsePricingFromResponse(response: string): SalesData | null {
    try {
      // Extract pricing data from agent response
      const diyCostMatch = response.match(/DIY Cost:\s*\$?([\d,]+)/i);
      const oneqPriceMatch = response.match(/Our Price:\s*\$?([\d,]+)/i);
      const savingsMatch = response.match(/You Save:\s*\$?([\d,]+)/i);
      const revenueMatch = response.match(/monthly revenue potential:\s*\$?([\d,]+)/i);
      
      if (!diyCostMatch || !oneqPriceMatch || !savingsMatch) {
        return null;
      }
      
      const diyCost = parseInt(diyCostMatch[1].replace(/,/g, ''));
      const oneqPrice = parseInt(oneqPriceMatch[1].replace(/,/g, ''));
      const savings = parseInt(savingsMatch[1].replace(/,/g, ''));
      const monthlyRevenue = revenueMatch ? parseInt(revenueMatch[1].replace(/,/g, '')) : 0;
      
      return {
        diyCost,
        oneqPrice,
        savings,
        savingsPercentage: Math.round((savings / diyCost) * 100),
        monthlyRevenue,
        teamBreakdown: this.parseTeamBreakdown(response),
        delayImpact: this.parseDelayImpact(response),
        modularOptions: this.parseModularOptions(response)
      };
    } catch (error) {
      console.error('Error parsing sales data:', error);
      return null;
    }
  }
  
  static parseTeamBreakdown(response: string): TeamMember[] {
    const teamMembers: TeamMember[] = [];
    
    // Parse team breakdown patterns like "Frontend Dev: 40h/week × $85/hour × 16 weeks = $54,400"
    const teamPattern = /([\w\s]+):\s*(\d+)h\/week\s*×\s*\$(\d+)\/hour\s*×\s*(\d+)\s*weeks\s*=\s*\$?([\d,]+)/gi;
    let match;
    
    while ((match = teamPattern.exec(response)) !== null) {
      teamMembers.push({
        role: match[1].trim(),
        hoursPerWeek: parseInt(match[2]),
        hourlyRate: parseInt(match[3]),
        weeks: parseInt(match[4]),
        totalCost: parseInt(match[5].replace(/,/g, ''))
      });
    }
    
    return teamMembers;
  }
  
  static parseDelayImpact(response: string): DelayScenario[] {
    const scenarios: DelayScenario[] = [];
    
    // Parse delay scenarios
    const delayPatterns = [
      { period: "2-Week Delay", pattern: /2-Week Delay:\s*\$?([\d,]+)\s*lost revenue\s*\+\s*(.+?)(?=\*|$)/i },
      { period: "1-Month Delay", pattern: /1-Month Delay:\s*\$?([\d,]+)\s*lost revenue\s*\+\s*(.+?)(?=\*|$)/i },
      { period: "3-Month Delay", pattern: /3-Month Delay:\s*\$?([\d,]+)\s*lost revenue\s*\+\s*(.+?)(?=\*|$)/i }
    ];
    
    delayPatterns.forEach(({ period, pattern }) => {
      const match = response.match(pattern);
      if (match) {
        scenarios.push({
          period,
          lostRevenue: parseInt(match[1].replace(/,/g, '')),
          competitiveRisk: match[2].trim(),
          impact: `${period} costs $${match[1]} in lost revenue`
        });
      }
    });
    
    return scenarios;
  }
  
  static parseModularOptions(response: string): ModularOption[] {
    const options: ModularOption[] = [];
    
    // Parse modular options patterns
    const optionPattern = /-\s*([\w\s]+):\s*\$?([\d,]+)/gi;
    let match;
    
    while ((match = optionPattern.exec(response)) !== null) {
      options.push({
        name: match[1].trim(),
        description: `${match[1].trim()} component`,
        price: parseInt(match[2].replace(/,/g, '')),
        included: true
      });
    }
    
    return options;
  }
}

// Integration helper for oneq developers
export class OneQAGUIIntegration {
  private eventEmitter: AGUIEventEmitter;
  
  constructor() {
    this.eventEmitter = new AGUIEventEmitter();
  }
  
  // Main method to process agent response and emit AG-UI events
  processAgentResponse(agentResponse: string): AGUIEvent[] {
    this.eventEmitter.clearEvents();
    
    // Parse sales data from agent response
    const salesData = SalesDataParser.parsePricingFromResponse(agentResponse);
    
    if (salesData) {
      // Emit interactive components based on parsed data
      this.eventEmitter.emitPricingCalculator(salesData);
      this.eventEmitter.emitDelayImpactChart(salesData.delayImpact);
      this.eventEmitter.emitTeamBreakdown(salesData.teamBreakdown);
      this.eventEmitter.emitModularOptions(salesData.modularOptions);
    }
    
    return this.eventEmitter.getEvents();
  }
  
  // Method for real-time calculation updates during agent thinking
  emitCalculationProgress(step: string, data: any): void {
    this.eventEmitter.emitCalculationStep(step, data);
  }
  
  // Get all events for AG-UI frontend consumption
  getAGUIEvents(): AGUIEvent[] {
    return this.eventEmitter.getEvents();
  }
}

// Export for easy integration
export default OneQAGUIIntegration; 
// AG-UI Integration Layer for OneQ Salesman Agent v3.0
// Enhanced with tool chain transparency, consistency validation, and reasoning trace

export interface AGUIEvent {
  type: string;
  data?: any;
  timestamp?: number;
  component?: string;
  props?: Record<string, any>;
}

// NEW: Tool chain execution results for transparency
export interface ToolChainResults {
  normalization: {
    backendHours: number;
    complexity: 'simple' | 'medium' | 'complex';
    businessModel: 'saas' | 'ecommerce' | 'b2b' | 'mobile';
    features: string[];
    confidence: 'high' | 'medium' | 'low';
  };
  diyCalculation: {
    totalCost: number;
    totalHours: number;
    timeline: string;
    confidence: 'high' | 'medium' | 'low';
  };
  revenueProjection: {
    monthlyPotential: number;
    marketBasis: string;
    businessModel: string;
    confidence: 'high' | 'medium' | 'low';
  };
  pricing: {
    oneQPrice: number;
    savingsPercentage: number;
    complexityMultiplier: number;
    confidence: 'high' | 'medium' | 'low';
  };
  validation: {
    consistencyScore: number;
    adjustments: Array<{
      field: string;
      originalValue: number;
      adjustedValue: number;
      reason: string;
    }>;
    overallConfidence: 'high' | 'medium' | 'low';
  };
}

// NEW: Reasoning trace for decision transparency
export interface ReasoningTrace {
  steps: Array<{
    step: string;
    reasoning: string;
    decision: string;
    confidence: number;
  }>;
  finalDecision: string;
  overallConfidence: number;
  transparencyLevel: 'full' | 'summary' | 'minimal';
}

// Updated interfaces to match the new agent schema
export interface TheOffer {
  headline: string;
  oneQPrice: number;
  currency: string;
  description: string;
  timeline: string;
  deliverables: string[];
  supportLevel: string;
  callToAction: string;
}

export interface SavingsBreakdown {
  diyCost: number;
  ourPrice: number;
  totalSavings: number;
  savingsPercentage: number;
  calculation: string;
  currency: string;
}

export interface CostOfDelay {
  monthlyRevenuePotential: number;
  marketAnalysisBasis: string;
  currency: string;
  twoWeekDelay: {
    lostRevenue: number;
    competitiveRisk: string;
  };
  oneMonthDelay: {
    lostRevenue: number;
    marketImpact: string;
  };
  threeMonthDelay: {
    lostRevenue: number;
    competitorImpact: string;
    momentumLoss: string;
  };
  firstMoverAdvantage: number;
}

export interface TeamBreakdown {
  roles: Array<{
    role: string;
    hoursPerWeek: number;
    hourlyRate: number;
    weeks: number;
    totalCost: number;
  }>;
  additionalCosts: {
    recruitmentFees: number;
    benefitsOverhead: number;
    equipmentCosts: number;
    onboardingLearningCurve: number;
  };
  totalTeamCost: number;
  currency: string;
}

export interface ModularOptions {
  currency: string;
  options: Array<{
    name: string;
    description: string;
    price: number;
  }>;
}

export interface ExecutiveSummaryTable {
  currency: string;
  oneQPrice: number;
  diyCost: number;
  totalSavings: number;
  savingsPercentage: number;
  timeToMarket: {
    oneQTimeline: string;
    diyTimeline: string;
    timeSaved: string;
  };
  revenueOpportunity: {
    monthlyRevenuePotential: number;
    revenueFromTimeSaved: number;
    totalOpportunityValue: number;
  };
  immediateAction: string;
}

// ENHANCED: Sales agent response with transparency data
export interface EnhancedSalesAgentResponse {
  theOffer: TheOffer;
  savingsBreakdown: SavingsBreakdown;
  costOfDelay: CostOfDelay;
  teamBreakdown: TeamBreakdown;
  modularOptions: ModularOptions;
  executiveSummaryTable: ExecutiveSummaryTable;
  // NEW: Transparency and validation data
  toolChainResults?: ToolChainResults;
  reasoningTrace?: ReasoningTrace;
  overallConfidence?: number;
  calculationTimestamp?: number;
}

// Legacy interface for backward compatibility
export interface SalesAgentResponse {
  theOffer: TheOffer;
  savingsBreakdown: SavingsBreakdown;
  costOfDelay: CostOfDelay;
  teamBreakdown: TeamBreakdown;
  modularOptions: ModularOptions;
  executiveSummaryTable: ExecutiveSummaryTable;
}

export class AGUIEventEmitter {
  private events: AGUIEvent[] = [];
  
  // NEW: Emit tool chain transparency component
  emitToolChainTransparency(toolChainResults: ToolChainResults): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "CalculationTransparency",
      props: {
        toolChainResults,
        showDetailedBreakdown: true,
        showConfidenceLevels: true,
        allowDrillDown: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // NEW: Emit consistency confidence indicator
  emitConsistencyConfidence(validationResults: ToolChainResults['validation']): AGUIEvent {
    const event: AGUIEvent = {
      type: "confidence_indicator",
      component: "ConsistencyConfidence",
      props: {
        consistencyScore: validationResults.consistencyScore,
        adjustments: validationResults.adjustments,
        overallConfidence: validationResults.overallConfidence,
        calculationMethodology: "Standardized tool chain with validation",
        showDetails: true,
        trustIndicator: validationResults.consistencyScore >= 90 ? "high" : 
                       validationResults.consistencyScore >= 70 ? "medium" : "low"
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // NEW: Emit reasoning trace for decision transparency
  emitReasoningTrace(reasoningTrace: ReasoningTrace): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui", 
      component: "ReasoningTrace",
      props: {
        steps: reasoningTrace.steps,
        finalDecision: reasoningTrace.finalDecision,
        overallConfidence: reasoningTrace.overallConfidence,
        transparencyLevel: reasoningTrace.transparencyLevel,
        showThinkingProcess: true,
        collapsible: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // NEW: Real-time tool execution progress
  emitToolExecutionProgress(
    toolName: string, 
    status: 'starting' | 'processing' | 'completed' | 'error',
    progress?: number,
    result?: any
  ): AGUIEvent {
    const event: AGUIEvent = {
      type: "tool_progress",
      component: "ToolExecutionProgress",
      props: {
        toolName,
        status,
        progress: progress || 0,
        result,
        timestamp: Date.now(),
        showProgressBar: true,
        showIntermediate: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit the new executive summary table - the star of the show!
  emitExecutiveSummaryTable(summaryData: ExecutiveSummaryTable): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "ExecutiveSummaryTable",
      props: {
        ...summaryData,
        interactive: true,
        highlight: "primary", // Make this the primary component
        showImmediateAction: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit the offer headline prominently
  emitOfferHeadline(offerData: TheOffer): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "OfferHeadline",
      props: {
        headline: offerData.headline,
        oneQPrice: offerData.oneQPrice,
        currency: offerData.currency,
        callToAction: offerData.callToAction,
        prominence: "hero" // Make this hero-sized
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit enhanced pricing calculator with savings and revenue opportunity
  emitEnhancedPricingCalculator(
    savingsData: SavingsBreakdown, 
    summaryData: ExecutiveSummaryTable
  ): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "EnhancedPricingCalculator",
      props: {
        oneQPrice: savingsData.ourPrice,
        diyCost: savingsData.diyCost,
        totalSavings: savingsData.totalSavings,
        savingsPercentage: savingsData.savingsPercentage,
        currency: savingsData.currency,
        // New: Revenue opportunity integration
        revenueOpportunity: summaryData.revenueOpportunity,
        timeAdvantage: summaryData.timeToMarket,
        interactive: true,
        showRevenueImpact: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit time-to-market comparison chart
  emitTimeToMarketChart(timeData: ExecutiveSummaryTable['timeToMarket']): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "TimeToMarketChart",
      props: {
        oneQTimeline: timeData.oneQTimeline,
        diyTimeline: timeData.diyTimeline,
        timeSaved: timeData.timeSaved,
        chartType: "timeline",
        showCompetitiveAdvantage: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit revenue opportunity visualization
  emitRevenueOpportunityChart(revenueData: ExecutiveSummaryTable['revenueOpportunity']): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "RevenueOpportunityChart",
      props: {
        monthlyRevenuePotential: revenueData.monthlyRevenuePotential,
        revenueFromTimeSaved: revenueData.revenueFromTimeSaved,
        totalOpportunityValue: revenueData.totalOpportunityValue,
        chartType: "stacked_bar",
        showProjections: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit enhanced delay impact chart with specific scenarios
  emitDelayImpactChart(delayData: CostOfDelay): AGUIEvent {
    const scenarios = [
      {
        period: "2 Weeks",
        lostRevenue: delayData.twoWeekDelay.lostRevenue,
        impact: delayData.twoWeekDelay.competitiveRisk,
        severity: "medium"
      },
      {
        period: "1 Month", 
        lostRevenue: delayData.oneMonthDelay.lostRevenue,
        impact: delayData.oneMonthDelay.marketImpact,
        severity: "high"
      },
      {
        period: "3 Months",
        lostRevenue: delayData.threeMonthDelay.lostRevenue,
        impact: `${delayData.threeMonthDelay.competitorImpact} + ${delayData.threeMonthDelay.momentumLoss}`,
        severity: "critical"
      }
    ];

    const event: AGUIEvent = {
      type: "generative_ui",
      component: "DelayImpactChart",
      props: {
        scenarios,
        monthlyRevenuePotential: delayData.monthlyRevenuePotential,
        firstMoverAdvantage: delayData.firstMoverAdvantage,
        currency: delayData.currency,
        chartType: "escalating_bar",
        showUrgency: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit team breakdown with enhanced cost visualization
  emitTeamBreakdown(teamData: TeamBreakdown): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "TeamBreakdownChart",
      props: {
        roles: teamData.roles,
        additionalCosts: teamData.additionalCosts,
        totalTeamCost: teamData.totalTeamCost,
        currency: teamData.currency,
        showHiddenCosts: true,
        showTimeline: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit modular options with pricing impact
  emitModularOptions(optionsData: ModularOptions): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "ModularOptionsSelector",
      props: {
        options: optionsData.options,
        currency: optionsData.currency,
        allowToggle: true,
        showPriceImpact: true,
        interactive: true
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit post-session urgency component
  emitPostSessionUrgency(offerData: TheOffer, summaryData: ExecutiveSummaryTable): AGUIEvent {
    const event: AGUIEvent = {
      type: "generative_ui",
      component: "PostSessionUrgency",
      props: {
        callToAction: offerData.callToAction,
        immediateAction: summaryData.immediateAction,
        totalValue: summaryData.totalSavings + summaryData.revenueOpportunity.totalOpportunityValue,
        currency: summaryData.currency,
        showCountdown: true, // 90-minute session momentum timer
        urgencyLevel: "high"
      },
      timestamp: Date.now()
    };
    
    this.events.push(event);
    return event;
  }
  
  // Emit calculation progress for real-time updates
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
  
  // Get all events for AG-UI consumption
  getEvents(): AGUIEvent[] {
    return this.events;
  }
  
  // Clear events (for new conversations)
  clearEvents(): void {
    this.events = [];
  }
}

// NEW: Direct JSON parser for structured agent responses
export class StructuredSalesDataParser {
  static parseStructuredResponse(agentResponse: SalesAgentResponse): SalesAgentResponse {
    // Agent now returns structured JSON, so we can use it directly
    // But we'll add validation and ensure all required fields are present
    
    const validated: SalesAgentResponse = {
      theOffer: {
        headline: agentResponse.theOffer?.headline || "OneQ Implementation Proposal",
        oneQPrice: agentResponse.theOffer?.oneQPrice || 0,
        currency: agentResponse.theOffer?.currency || "$",
        description: agentResponse.theOffer?.description || "",
        timeline: agentResponse.theOffer?.timeline || "12 weeks",
        deliverables: agentResponse.theOffer?.deliverables || [],
        supportLevel: agentResponse.theOffer?.supportLevel || "",
        callToAction: agentResponse.theOffer?.callToAction || ""
      },
      savingsBreakdown: {
        diyCost: agentResponse.savingsBreakdown?.diyCost || 0,
        ourPrice: agentResponse.savingsBreakdown?.ourPrice || 0,
        totalSavings: agentResponse.savingsBreakdown?.totalSavings || 0,
        savingsPercentage: agentResponse.savingsBreakdown?.savingsPercentage || 0,
        calculation: agentResponse.savingsBreakdown?.calculation || "",
        currency: agentResponse.savingsBreakdown?.currency || "$"
      },
      costOfDelay: agentResponse.costOfDelay,
      teamBreakdown: agentResponse.teamBreakdown,
      modularOptions: agentResponse.modularOptions,
      executiveSummaryTable: agentResponse.executiveSummaryTable
    };

    return validated;
  }
}

// Updated integration class for structured responses
export class OneQAGUIIntegration {
  private eventEmitter: AGUIEventEmitter;
  
  constructor() {
    this.eventEmitter = new AGUIEventEmitter();
  }
  
  // ENHANCED: Main method to process structured agent response with transparency features
  processEnhancedAgentResponse(agentResponse: EnhancedSalesAgentResponse): AGUIEvent[] {
    this.eventEmitter.clearEvents();
    
    try {
      // NEW: Emit transparency components first for trust building
      if (agentResponse.toolChainResults) {
        this.eventEmitter.emitToolChainTransparency(agentResponse.toolChainResults);
        this.eventEmitter.emitConsistencyConfidence(agentResponse.toolChainResults.validation);
      }
      
      if (agentResponse.reasoningTrace) {
        this.eventEmitter.emitReasoningTrace(agentResponse.reasoningTrace);
      }
      
      // Validate and parse the structured response
      const salesData = StructuredSalesDataParser.parseStructuredResponse(agentResponse);
      
      // Emit components in priority order for optimal sales impact
      
      // 1. HERO: Offer headline with OneQ price (first thing they see)
      this.eventEmitter.emitOfferHeadline(salesData.theOffer);
      
      // 2. STAR: Executive summary table (all key numbers in one place)
      this.eventEmitter.emitExecutiveSummaryTable(salesData.executiveSummaryTable);
      
      // 3. ENHANCED: Pricing calculator with revenue opportunity
      this.eventEmitter.emitEnhancedPricingCalculator(
        salesData.savingsBreakdown, 
        salesData.executiveSummaryTable
      );
      
      // 4. NEW: Time-to-market advantage visualization
      this.eventEmitter.emitTimeToMarketChart(salesData.executiveSummaryTable.timeToMarket);
      
      // 5. NEW: Revenue opportunity chart
      this.eventEmitter.emitRevenueOpportunityChart(salesData.executiveSummaryTable.revenueOpportunity);
      
      // 6. ENHANCED: Delay impact with specific scenarios
      this.eventEmitter.emitDelayImpactChart(salesData.costOfDelay);
      
      // 7. UPDATED: Team breakdown with hidden costs
      this.eventEmitter.emitTeamBreakdown(salesData.teamBreakdown);
      
      // 8. STANDARD: Modular options
      this.eventEmitter.emitModularOptions(salesData.modularOptions);
      
      // 9. CRITICAL: Post-session urgency (capture 90-minute momentum)
      this.eventEmitter.emitPostSessionUrgency(
        salesData.theOffer, 
        salesData.executiveSummaryTable
      );
      
    } catch (error) {
      console.error('Error processing enhanced agent response:', error);
    }
    
    return this.eventEmitter.getEvents();
  }

  // LEGACY: Main method to process structured agent response (backward compatibility)
  processStructuredAgentResponse(agentResponse: SalesAgentResponse): AGUIEvent[] {
    // Convert to enhanced response format for processing
    const enhancedResponse: EnhancedSalesAgentResponse = {
      ...agentResponse,
      overallConfidence: 85, // Default confidence for legacy responses
      calculationTimestamp: Date.now()
    };
    
    return this.processEnhancedAgentResponse(enhancedResponse);
  }
  
  // Method for real-time calculation updates during agent thinking
  emitCalculationProgress(step: string, data: any): void {
    this.eventEmitter.emitCalculationStep(step, data);
  }
  
  // Get all events for AG-UI frontend consumption
  getAGUIEvents(): AGUIEvent[] {
    return this.eventEmitter.getEvents();
  }
  
  /**
   * @deprecated Use processStructuredAgentResponse instead
   * Legacy text parsing method (kept for backward compatibility)
   */
  processAgentResponse(agentResponse: string): AGUIEvent[] {
    console.warn("processAgentResponse is deprecated. Use processStructuredAgentResponse with JSON output.");
    return [];
  }
}

// Export for easy integration
export default OneQAGUIIntegration; 
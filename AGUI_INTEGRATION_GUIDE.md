# OneQ Salesman Agent + AG-UI Integration Guide v2.0

🚀 **Updated for Structured JSON Output & Executive Summary Table**

This guide explains how to integrate the enhanced OneQ Salesman Agent with AG-UI for interactive sales presentations featuring the new executive summary table and post-session urgency components.

## 🎯 **Overview**

The OneQ Salesman Agent v2.0 now features:
- ✅ **Structured JSON Output** (no more text parsing!)
- ✅ **Executive Summary Table** (all critical numbers in one place)
- ✅ **Post-90-Minute Session Urgency** (capture momentum immediately)
- ✅ **Revenue Opportunity Calculations** (time-to-market advantage)
- ✅ **Enhanced Time-to-Market Visualizations**
- ✅ **Claude Sonnet 4 Reasoning** (transparent decision-making)

## 📋 **Current Status**

✅ **Ready for Integration:**
- Enhanced salesman agent with structured output schema
- Executive summary table for deal closure
- Post-session urgency components  
- Revenue opportunity calculations
- Updated AG-UI event emitter layer
- TypeScript interfaces matching new schema

🔧 **Next Steps for OneQ Team:**
- Install AG-UI in your application
- Connect the new structured integration layer
- Build enhanced frontend components
- Test post-session closing workflow

## 🚀 **Quick Start Integration**

### **1. Install AG-UI (when ready)**
```bash
npm install @ag-ui/core @ag-ui/react
# or
pnpm add @ag-ui/core @ag-ui/react
```

### **2. Use the Enhanced Integration Layer**
```typescript
import { OneQAGUIIntegration, SalesAgentResponse } from './src/mastra/integrations/agui-integration';
import { salesmanAgent } from './src/mastra/agents/salesman-agent';

// Initialize AG-UI integration
const aguiIntegration = new OneQAGUIIntegration();

// Process structured agent response and get interactive components
async function handlePostSessionSalesPresentation(roadmapAnalysis: string) {
  // Get structured JSON response from agent
  const agentResponse: SalesAgentResponse = await salesmanAgent.generate(roadmapAnalysis);
  
  // Convert to AG-UI events (now using structured data!)
  const aguiEvents = aguiIntegration.processStructuredAgentResponse(agentResponse);
  
  // Send events to your AG-UI frontend
  return aguiEvents;
}
```

### **3. Frontend Components You'll Get**

The integration automatically generates these interactive components:

#### **🎯 NEW: Executive Summary Table (THE STAR)**
```typescript
{
  type: "generative_ui",
  component: "ExecutiveSummaryTable",
  props: {
    currency: "$",
    oneQPrice: 85000,
    diyCost: 252000,
    totalSavings: 167000,
    savingsPercentage: 66,
    timeToMarket: {
      oneQTimeline: "12 weeks",
      diyTimeline: "28 weeks", 
      timeSaved: "16 weeks faster"
    },
    revenueOpportunity: {
      monthlyRevenuePotential: 54000,
      revenueFromTimeSaved: 216000,
      totalOpportunityValue: 383000
    },
    immediateAction: "Let's start implementation while your team momentum is hot!",
    interactive: true,
    highlight: "primary"
  }
}
```

#### **🏆 NEW: Offer Headline (HERO COMPONENT)**
```typescript
{
  type: "generative_ui",
  component: "OfferHeadline",
  props: {
    headline: "OneQ will deliver your complete cybersecurity platform for $85,000 - saving you $167,000 and 16 weeks",
    oneQPrice: 85000,
    currency: "$",
    callToAction: "Ready to start building your vision today?",
    prominence: "hero"
  }
}
```

#### **⏰ NEW: Time-to-Market Chart**
```typescript
{
  type: "generative_ui",
  component: "TimeToMarketChart",
  props: {
    oneQTimeline: "12 weeks",
    diyTimeline: "28 weeks",
    timeSaved: "16 weeks faster",
    chartType: "timeline",
    showCompetitiveAdvantage: true,
    interactive: true
  }
}
```

#### **💰 NEW: Revenue Opportunity Chart**
```typescript
{
  type: "generative_ui",
  component: "RevenueOpportunityChart",
  props: {
    monthlyRevenuePotential: 54000,
    revenueFromTimeSaved: 216000,
    totalOpportunityValue: 383000,
    chartType: "stacked_bar",
    showProjections: true,
    interactive: true
  }
}
```

#### **📊 ENHANCED: Pricing Calculator with Revenue Integration**
```typescript
{
  type: "generative_ui",
  component: "EnhancedPricingCalculator",
  props: {
    oneQPrice: 85000,
    diyCost: 252000,
    totalSavings: 167000,
    savingsPercentage: 66,
    currency: "$",
    revenueOpportunity: {
      monthlyRevenuePotential: 54000,
      revenueFromTimeSaved: 216000,
      totalOpportunityValue: 383000
    },
    timeAdvantage: {
      oneQTimeline: "12 weeks",
      diyTimeline: "28 weeks",
      timeSaved: "16 weeks faster"
    },
    interactive: true,
    showRevenueImpact: true
  }
}
```

#### **⚠️ ENHANCED: Cost of Delay Chart with Severity Levels**
```typescript
{
  type: "generative_ui",
  component: "DelayImpactChart", 
  props: {
    scenarios: [
      { period: "2 Weeks", lostRevenue: 27000, impact: "Competitive risk", severity: "medium" },
      { period: "1 Month", lostRevenue: 54000, impact: "Market position impact", severity: "high" },
      { period: "3 Months", lostRevenue: 162000, impact: "Competitors established + momentum lost", severity: "critical" }
    ],
    monthlyRevenuePotential: 54000,
    firstMoverAdvantage: 97200,
    currency: "$",
    chartType: "escalating_bar",
    showUrgency: true,
    interactive: true
  }
}
```

#### **🚨 NEW: Post-Session Urgency Component**
```typescript
{
  type: "generative_ui",
  component: "PostSessionUrgency",
  props: {
    callToAction: "Ready to start building your vision today?",
    immediateAction: "Let's start implementation while your team momentum is hot!",
    totalValue: 550000, // Combined savings + revenue opportunity
    currency: "$",
    showCountdown: true, // 90-minute session momentum timer
    urgencyLevel: "high"
  }
}
```

## 🔧 **Integration Architecture**

```
OneQ 90-Minute Session → Roadmap → Salesman Agent (Claude Sonnet 4 + Reasoning)
                                           ↓
                                  Structured JSON Output
                                           ↓
                                AG-UI Integration Layer v2.0
                                           ↓
                        Enhanced Interactive Frontend Components
                                           ↓
                                IMMEDIATE DEAL CLOSURE
```

## 📊 **Data Flow (Updated)**

1. **Agent Response** → Structured JSON with executive summary table
2. **Structured Parser** → Direct JSON handling (no regex needed!)
3. **Event Emitter** → Converts JSON to AG-UI events with priority ordering
4. **Frontend** → Renders interactive components optimized for deal closure

## 🎨 **Frontend Components to Build**

### **ExecutiveSummaryTable.tsx (PRIORITY #1)**
- All critical numbers in one place
- Cost savings vs revenue opportunity
- Time-to-market advantage
- Immediate action buttons
- Post-session momentum messaging

### **OfferHeadline.tsx (HERO COMPONENT)**  
- Bold OneQ price display
- Savings highlight
- Time advantage
- Strong call-to-action

### **EnhancedPricingCalculator.tsx**
- Interactive cost/savings sliders
- Revenue opportunity integration
- Time-to-market impact
- Real-time total value calculation

### **TimeToMarketChart.tsx (NEW)**
- Timeline comparison visualization
- Competitive advantage indicators
- First-mover benefits
- Market window analysis

### **RevenueOpportunityChart.tsx (NEW)**
- Revenue projections from faster launch
- Stacked value visualization
- Market penetration scenarios
- ROI calculations

### **PostSessionUrgency.tsx (CRITICAL)**
- 90-minute session momentum timer
- Team alignment messaging
- Immediate action prompts
- Total value emphasis

## 🔌 **Integration Points**

### **With OneQ 90-Minute Sessions**
```typescript
// Enhanced session context for immediate post-session sales
interface PostSessionContext {
  sessionId: string;
  sessionEndTime: number; // For urgency calculations
  roadmap: RoadmapData;
  prd: PRDData;
  participants: Participant[];
  teamAlignment: AlignmentScore;
  keyInsights: SessionInsight[];
  momentum: 'high' | 'medium' | 'low';
}

// Agent with post-session context
const postSessionSalesmanAgent = new Agent({
  // ... existing config
  context: postSessionContext,
  instructions: `
    CRITICAL: This is immediately after a 90-minute OneQ session.
    The prospect has just experienced OneQ's value firsthand.
    Strike while the iron is hot - maximum urgency and momentum!
    Reference specific insights from THEIR session.
    Close the deal TODAY.
  `
});
```

### **Component Priority Order (Sales Optimized)**
```typescript
// Emit components in order of sales impact
const salesPriorityOrder = [
  'OfferHeadline',           // 1. Hero - OneQ price first
  'ExecutiveSummaryTable',   // 2. Star - All numbers in one place  
  'EnhancedPricingCalculator', // 3. Interactive savings
  'TimeToMarketChart',       // 4. Competitive advantage
  'RevenueOpportunityChart', // 5. Revenue upside
  'DelayImpactChart',        // 6. Cost of waiting
  'TeamBreakdownChart',      // 7. Implementation details
  'ModularOptionsSelector',  // 8. Customization options
  'PostSessionUrgency'       // 9. Final close with urgency
];
```

## 🎯 **Benefits for OneQ**

### **Immediate Impact**
- **90-minute session momentum capture** with post-session urgency
- **Executive summary table** provides instant business case
- **Professional presentation** that matches OneQ innovation level
- **Real-time interactivity** keeps prospects engaged during critical closing window

### **Enhanced Closing Power**
- **All critical numbers** consolidated in executive summary
- **Revenue opportunity** calculations show upside potential  
- **Time-to-market advantage** creates competitive urgency
- **Post-session context** leverages fresh alignment and excitement

### **Data-Driven Decisions**
- **Structured JSON** eliminates parsing errors
- **Component tracking** shows engagement patterns
- **A/B testing ready** for optimization
- **CRM integration** ready for pipeline management

## 🚀 **Implementation Checklist**

### **Phase 1: Core Components**
- [ ] Executive Summary Table component
- [ ] Offer Headline component  
- [ ] Enhanced Pricing Calculator
- [ ] Post-Session Urgency component

### **Phase 2: Advanced Visualizations**
- [ ] Time-to-Market Chart
- [ ] Revenue Opportunity Chart
- [ ] Enhanced Delay Impact Chart
- [ ] Team Breakdown with hidden costs

### **Phase 3: Integration & Testing**
- [ ] Post-session workflow integration
- [ ] Real-time calculation updates
- [ ] Mobile-responsive design
- [ ] A/B testing framework

## 📞 **Ready to Get Started?**

The enhanced OneQ Salesman Agent is now optimized for immediate post-session deal closure with powerful interactive components. Your prospects will see:

1. **OneQ price prominently** (first number they see)
2. **Executive summary table** (all critical numbers in one place)
3. **Revenue opportunity** (upside from faster time-to-market) 
4. **Post-session urgency** (capture 90-minute momentum)

**Next steps:** Install AG-UI, build the components, and start closing deals immediately after your 90-minute sessions! 🎯 
# OneQ Salesman Agent + AG-UI Integration Guide

This guide explains how to integrate the OneQ Salesman Agent with AG-UI for interactive sales presentations.

## 🎯 **Overview**

The OneQ Salesman Agent is designed to be AG-UI ready, allowing for seamless integration of interactive sales components into your frontend application.

## 📋 **Current Status**

✅ **Ready for Integration:**
- Salesman agent with structured output
- AG-UI event emitter layer
- Data parsing utilities
- TypeScript interfaces

🔧 **Next Steps for OneQ Team:**
- Install AG-UI in your application
- Connect the integration layer
- Build frontend components
- Test end-to-end workflow

## 🚀 **Quick Start Integration**

### **1. Install AG-UI (when ready)**
```bash
npm install @ag-ui/core @ag-ui/react
# or
pnpm add @ag-ui/core @ag-ui/react
```

### **2. Use the Integration Layer**
```typescript
import { OneQAGUIIntegration } from './src/mastra/integrations/agui-integration';
import { salesmanAgent } from './src/mastra/agents/salesman-agent';

// Initialize AG-UI integration
const aguiIntegration = new OneQAGUIIntegration();

// Process agent response and get interactive components
async function handleSalesConversation(userInput: string) {
  // Get agent response
  const agentResponse = await salesmanAgent.generate(userInput);
  
  // Convert to AG-UI events
  const aguiEvents = aguiIntegration.processAgentResponse(agentResponse);
  
  // Send events to your AG-UI frontend
  return aguiEvents;
}
```

### **3. Frontend Components You'll Get**

The integration automatically generates these interactive components:

#### **📊 Pricing Calculator**
```typescript
{
  type: "generative_ui",
  component: "PricingCalculator",
  props: {
    diyCost: 252000,
    oneqPrice: 85000,
    savings: 167000,
    savingsPercentage: 66,
    interactive: true
  }
}
```

#### **⏰ Cost of Delay Chart**
```typescript
{
  type: "generative_ui",
  component: "DelayImpactChart", 
  props: {
    scenarios: [
      { period: "2-Week Delay", lostRevenue: 27000, impact: "Competitive risk" },
      { period: "1-Month Delay", lostRevenue: 54000, impact: "Market position impact" },
      { period: "3-Month Delay", lostRevenue: 162000, impact: "Competitors established" }
    ],
    chartType: "bar",
    interactive: true
  }
}
```

#### **👥 Team Breakdown Visualization**
```typescript
{
  type: "generative_ui",
  component: "TeamBreakdownChart",
  props: {
    teamMembers: [
      { role: "Frontend Dev", hoursPerWeek: 40, hourlyRate: 85, weeks: 16, totalCost: 54400 },
      { role: "Backend Dev", hoursPerWeek: 40, hourlyRate: 90, weeks: 16, totalCost: 57600 },
      // ... more team members
    ],
    showCosts: true,
    showTimeline: true
  }
}
```

#### **🧩 Modular Options Selector**
```typescript
{
  type: "generative_ui", 
  component: "ModularOptionsSelector",
  props: {
    options: [
      { name: "Core implementation", price: 85000, included: true },
      { name: "Extended support", price: 15000, included: false },
      { name: "Additional features", price: 25000, included: false }
    ],
    allowToggle: true,
    showPriceImpact: true
  }
}
```

## 🔧 **Integration Architecture**

```
OneQ Session → Roadmap Agent → PRD Agent → Salesman Agent
                                              ↓
                                    AG-UI Integration Layer
                                              ↓
                              Interactive Frontend Components
```

## 📊 **Data Flow**

1. **Agent Response** → Structured text with pricing, team breakdown, delay costs
2. **Parser** → Extracts data using regex patterns
3. **Event Emitter** → Converts data to AG-UI events
4. **Frontend** → Renders interactive components

## 🎨 **Frontend Components to Build**

### **PricingCalculator.tsx**
- Interactive sliders for project scope
- Real-time price updates
- Savings visualization
- Comparison charts

### **DelayImpactChart.tsx**
- Bar chart showing delay costs
- Timeline visualization
- Competitive risk indicators
- Revenue loss projections

### **TeamBreakdownChart.tsx**
- Team member cards with costs
- Timeline Gantt chart
- Resource allocation view
- Cost breakdown by role

### **ModularOptionsSelector.tsx**
- Checkbox options for add-ons
- Real-time price calculation
- Package configurator
- Recommendation engine

## 🔌 **Integration Points**

### **With Existing OneQ Systems**
```typescript
// Connect to session data
interface SessionContext {
  roadmap: RoadmapData;
  prd: PRDData;
  participants: Participant[];
  insights: SessionInsight[];
}

// Enhanced agent with session context
const enhancedSalesmanAgent = new Agent({
  // ... existing config
  context: sessionContext
});
```

### **With OneQ CRM/Pipeline**
```typescript
// Track sales interactions
interface SalesInteraction {
  sessionId: string;
  proposalGenerated: boolean;
  componentsInteracted: string[];
  finalPrice: number;
  dealStatus: 'open' | 'closed' | 'lost';
}
```

## 🎯 **Benefits for OneQ**

### **Immediate Impact**
- **Professional presentation** that matches your innovation
- **Interactive exploration** vs static proposals
- **Real-time customization** during sales calls
- **Visual impact** that makes numbers tangible

### **Sales Effectiveness**
- **Higher engagement** through interaction
- **Faster decision making** with immediate what-if scenarios
- **Better objection handling** with visual data
- **Increased close rates** through professional presentation

### **Competitive Advantage**
- **First consulting firm** with interactive AI proposals
- **Modern, tech-forward** brand positioning
- **Scalable sales process** that doesn't require senior staff
- **Data-driven presentations** that build trust

## 🛠 **Implementation Phases**

### **Phase 1: Basic Integration (Week 1-2)**
- Install AG-UI
- Connect salesman agent
- Build basic pricing calculator
- Test with sample data

### **Phase 2: Enhanced Components (Week 3-4)**
- Add delay impact visualization
- Build team breakdown charts
- Create modular options selector
- Polish UI/UX

### **Phase 3: Advanced Features (Week 5-6)**
- Real-time collaboration features
- Integration with OneQ CRM
- Advanced analytics and tracking
- Mobile optimization

### **Phase 4: Production Ready (Week 7-8)**
- Performance optimization
- Error handling and fallbacks
- User testing and feedback
- Deployment and monitoring

## 📞 **Next Steps**

1. **Review this integration approach** with your team
2. **Install AG-UI** in your development environment
3. **Test the salesman agent** with the integration layer
4. **Build one component** (start with PricingCalculator)
5. **Schedule integration meeting** to discuss specific requirements

## 🤝 **Support**

The salesman agent and integration layer are designed to be:
- **Plug-and-play** with minimal setup
- **Customizable** for your specific needs
- **Scalable** as your requirements grow
- **Maintainable** with clear separation of concerns

---

**Ready to transform your sales process?** Let's make OneQ's sales presentations as innovative as your brainstorming sessions! 🚀 
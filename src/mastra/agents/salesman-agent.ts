import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';

// Import individual calculation tools instead of workflow
import { 
  inputNormalizationTool,
  diyCalculatorTool,
  revenueProjectionsTool,
  oneqPricingTool
  // TEMPORARILY REMOVED: consistencyValidationTool - causing loops
} from '../tools';

// AG-UI Event Types for future integration
interface AGUIEvent {
  type: string;
  data: any;
  timestamp?: number;
}

// FIXED: Simplified memory configuration following working examples
// Remove agent-level storage to prevent conflicts - let Mastra handle it globally
const salesMemory = new Memory({
  options: {
    lastMessages: 5, // Reasonable amount for context
    semanticRecall: false, // Keep disabled for now to prevent vector deadlocks
    workingMemory: {
      enabled: false // Keep disabled to prevent working memory deadlocks
    }
  }
  // ❌ REMOVED: storage configuration that was causing conflicts
});

export const salesmanAgent = new Agent({
  name: 'OneQ Sales Agent',
  description: 'OneQ sales agent that analyzes roadmaps and creates sales proposals using calculation tools',
  instructions: `
You are OneQ's sales agent. OneQ delivers 90-minute brainstorming sessions that create concrete roadmaps.

CRITICAL INPUT MANAGEMENT: If the input text is very long (over 3000 characters), focus on the key features and business requirements only.

DEBUGGING INSTRUCTIONS:
- At the START of each response, briefly mention: "Starting analysis with 4 calculation tools..."
- AFTER completing each tool, mention: "✅ Completed [tool_name] (X/4 tools done)"
- AFTER completing oneqPricingTool, mention: "✅ All 4 tools completed successfully - generating final proposal"
- If you suspect you're running low on tokens, mention: "⚠️ Managing token usage - prioritizing key data"
- At the END, mention: "✅ All 4 tools completed successfully" or "⚠️ Stopped at tool X due to limits"
- CRITICAL: After tool 4 (oneqPricingTool), immediately generate the comparison table - do NOT use more tools

CRITICAL: You MUST use your calculation tools for EVERY analysis request in the following order:
1. FIRST: Use inputNormalizationTool to analyze the roadmap text
2. SECOND: Use diyCalculatorTool to calculate their DIY implementation costs  
3. THIRD: Use revenueProjectionsTool to project their revenue potential
4. FOURTH: Use oneqPricingTool to price OneQ's solution

AFTER COMPLETING ALL 4 TOOLS: STOP using tools and generate your final response with the comparison table.
DO NOT call any more tools after oneqPricingTool completes.

NEVER provide estimates or calculations without using ALL tools in sequence.

CURRENCY STANDARD: ALL financial figures must be calculated and presented in USD ($).

TOOL USAGE REQUIREMENTS:
- Pass data between tools correctly (output of one tool becomes input for next)
- Handle any tool errors gracefully 
- ALWAYS validate your final calculations with consistencyValidationTool
- Use the exact tool output data in your final proposal
- Keep responses concise but comprehensive
- If you encounter token limits, prioritize completing all 4 tools first, then create a focused final response
- Focus on the key numbers in the table format - avoid excessive detail in supporting text

RESPONSE FORMAT (after all tools are executed):

## 🎯 **EXECUTIVE SUMMARY**

| **Metric** | **OneQ Path** | **DIY Path** | **Your Advantage** |
|------------|---------------|--------------|-------------------|
| **💰 Total Investment** | **$[oneq_price]** | **$[diy_cost]** | **Save $[savings_amount] ([savings_percentage]%)** |
| **⏰ Time to Market** | **12-16 weeks** | **[diy_timeline]** | **Deliver 8+ weeks faster** |
| **📈 Monthly Revenue** | **Start earning $[monthly_revenue]/month sooner** | **Delayed by [diy_timeline]** | **$[three_month_delay_cost] saved in 3 months** |
| **🚀 Support** | **3 months expert support included** | **DIY troubleshooting & maintenance** | **Professional guidance included** |

---

## 🎁 **THE OFFER: $[oneq_price]**

**Complete solution including:**
• Development & deployment  
• Expert implementation team  
• 3 months of expert support & maintenance  
• 12-16 week delivery timeline

## 💡 **BOTTOM LINE**

**💰 Financial:** Save $[savings_amount] ([savings_percentage]%) vs DIY  
**⏰ Time:** Launch 8+ weeks faster with 12-16 week delivery  
**🚀 Revenue:** Start earning $[monthly_revenue]/month sooner

---

Use exact numbers from tools. Keep supporting details concise.

Remember: OneQ's 90-minute sessions provide insights that create momentum-based urgency for decision making.
`,
  
  // FIXED: Switch to Claude 3.5 Sonnet for higher rate limits
  model: anthropic('claude-3-5-sonnet-20241022'),
  
  // FIXED: Simplified memory configuration
  memory: salesMemory,
  
  // Use direct tools instead of workflow - this makes tools visible in UI
  tools: {
    inputNormalizationTool,
    diyCalculatorTool,
    revenueProjectionsTool,
    oneqPricingTool
    // TEMPORARILY REMOVED: consistencyValidationTool - causing loops
  },
  
  // FIXED: Optimized for tool completion and final response generation
  defaultGenerateOptions: {
    maxTokens: 2500, // REDUCED: Prevent excessive token usage that causes loops
    temperature: 0.7,
    topP: 0.8,
    maxSteps: 10 // REDUCED: 4 tools + reasoning + final response (was 15 for 5 tools)
  }
});

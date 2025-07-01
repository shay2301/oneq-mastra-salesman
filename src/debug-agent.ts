import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

// Import all calculation tools
import { inputNormalizationTool } from './mastra/tools/input-normalization-tool';
import { diyCalculatorTool } from './mastra/tools/diy-cost-calculator-tool';
import { revenueProjectionsTool } from './mastra/tools/revenue-projections-tool';
import { oneqPricingTool } from './mastra/tools/oneq-pricing-tool';
import { consistencyValidationTool, responseValidationTool } from './mastra/tools/validation-tools';

// Performance logging wrapper
function wrapToolWithLogging(tool: any, toolName: string) {
  const originalExecute = tool.execute;
  
  tool.execute = async (params: any) => {
    console.log(`🔧 [${new Date().toISOString()}] Starting ${toolName}...`);
    const startTime = Date.now();
    
    try {
      const result = await originalExecute(params);
      const duration = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] ${toolName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [${new Date().toISOString()}] ${toolName} failed after ${duration}ms:`, error);
      throw error;
    }
  };
  
  return tool;
}

// Wrap tools with logging
const loggedTools = {
  inputNormalizationTool: wrapToolWithLogging(inputNormalizationTool, 'Input Normalization'),
  diyCalculatorTool: wrapToolWithLogging(diyCalculatorTool, 'DIY Calculator'),
  revenueProjectionsTool: wrapToolWithLogging(revenueProjectionsTool, 'Revenue Projections'),
  oneqPricingTool: wrapToolWithLogging(oneqPricingTool, 'OneQ Pricing'),
  consistencyValidationTool: wrapToolWithLogging(consistencyValidationTool, 'Consistency Validation'),
  responseValidationTool: wrapToolWithLogging(responseValidationTool, 'Response Validation')
};

// Simplified memory for debugging
const debugMemory = new Memory({
  storage: new LibSQLStore({
    url: "file:./debug.db",
  }),
  vector: new LibSQLVector({
    connectionUrl: "file:./debug.db",
  }),
  embedder: openai.embedding("text-embedding-3-small"),
  options: {
    lastMessages: 5, // Minimal for debugging
    semanticRecall: {
      topK: 1,
      messageRange: 2,
      scope: 'resource',
    },
    workingMemory: {
      enabled: false // Disable for debugging
    },
  },
});

export const debugSalesAgent = new Agent({
  name: 'Debug OneQ Sales Agent',
  description: 'Debug version with performance logging',
  instructions: `
# DEBUG MODE - OneQ Sales Agent

## CRITICAL: MANDATORY TOOL USAGE
You MUST use your calculation tools in this EXACT sequence:

1. **FIRST**: Use inputNormalizationTool 
2. **SECOND**: Use diyCalculatorTool
3. **THIRD**: Use revenueProjectionsTool  
4. **FOURTH**: Use oneqPricingTool
5. **FIFTH**: Use consistencyValidationTool
6. **FINALLY**: Use responseValidationTool

## DEBUGGING NOTES:
- Each tool will log its execution time
- Look for tools taking >3 seconds
- All calculations must be in USD ($)
- Keep responses concise for debugging

Create a basic sales proposal with the tool results.
`,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: loggedTools,
  memory: debugMemory,
  defaultGenerateOptions: {
    maxTokens: 1500, // Reduced for debugging
    temperature: 0.7,
    topP: 0.9
  }
}); 
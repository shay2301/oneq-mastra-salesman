import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { salesmanAgent } from './agents/salesman-agent';
import { directCalculationWorkflow } from './workflows/direct-calculation-workflow';

// Export the main agent with a clear name
export const oneqSalesAgent = salesmanAgent;

export const mastra = new Mastra({
  workflows: {
    directCalculationWorkflow
  },
  agents: { 
    oneqSalesAgent
  },
  
  // FIXED: Add central storage configuration to handle all memory storage
  // This prevents agent-level storage conflicts that were causing deadlocks
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
  
  // DEBUGGING: Enable debug logging to see token/step limit details
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'debug',
  }),
  
  // DEBUGGING: Enable telemetry for detailed tracing
  telemetry: {
    serviceName: "oneq-sales-agent",
    enabled: true,
    sampling: {
      type: "always_on"
    },
    export: {
      type: "console"
    }
  }
});

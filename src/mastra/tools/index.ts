// Import all calculation tools
import { inputNormalizationTool } from './input-normalization-tool';
import { diyCalculatorTool } from './diy-cost-calculator-tool';
import { revenueProjectionsTool } from './revenue-projections-tool';
import { oneqPricingTool } from './oneq-pricing-tool';
import { consistencyValidationTool, responseValidationTool } from './validation-tools';

// Export all calculation tools for easy importing
export { inputNormalizationTool } from './input-normalization-tool';
export { diyCalculatorTool } from './diy-cost-calculator-tool';
export { revenueProjectionsTool } from './revenue-projections-tool';
export { oneqPricingTool } from './oneq-pricing-tool';
export { consistencyValidationTool, responseValidationTool } from './validation-tools';

// Export tool collections for different use cases
export const allCalculationTools = [
  inputNormalizationTool,
  diyCalculatorTool,
  revenueProjectionsTool,
  oneqPricingTool,
  consistencyValidationTool,
  responseValidationTool
];

export const coreCalculationTools = [
  inputNormalizationTool,
  diyCalculatorTool,
  revenueProjectionsTool,
  oneqPricingTool
];

export const validationTools = [
  consistencyValidationTool,
  responseValidationTool
]; 
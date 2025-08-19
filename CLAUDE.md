# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands and Development

### Essential Commands
```bash
npm run dev      # Start Mastra development server (http://localhost:4111/agents)
npm run debug    # Start with verbose debugging and telemetry
npm run build    # Build the TypeScript application
npm run start    # Start production server
```

### Development Workflow
1. Run `npm run dev` to start the Mastra development interface
2. Navigate to http://localhost:4111/agents and select "OneQ Sales Agent"
3. Test with sample roadmap/PRD text to verify the 4-tool calculation sequence
4. Monitor debug logs for token usage and tool execution flow
5. Use `npm run debug` when investigating tool chain issues or memory problems

## Architecture Overview

This is an **AI-powered sales automation system** built on the Mastra framework that generates professional sales proposals by analyzing customer roadmaps through a structured tool chain.

### Core System Flow
```
Input Roadmap → Tool 1 (Normalize) → Tool 2 (DIY Cost) → 
Tool 3 (Revenue) → Tool 4 (Pricing) → Executive Summary → AG-UI Components
```

### Key Components

**Main Agent** (`src/mastra/agents/salesman-agent.ts`)
- Uses Claude 3.5 Sonnet with 2,500 token limit and 10-step maximum
- MUST execute all 4 tools in sequence for every analysis request
- Configured with simplified memory to prevent LibSQL deadlocks
- Outputs structured executive summary tables with exact financial calculations

**Tool Chain** (`src/mastra/tools/`)
The system uses a mandatory 4-tool sequence:
1. `input-normalization-tool.ts` - Analyzes roadmap complexity and features
2. `diy-cost-calculator-tool.ts` - Calculates comprehensive DIY implementation costs
3. `revenue-projections-tool.ts` - Projects revenue potential and opportunity costs  
4. `oneq-pricing-tool.ts` - Prices OneQ solution at 35-45% of DIY cost

**Storage & Memory** (`src/mastra/index.ts`)
- Uses LibSQL (`file:./mastra.db`) for persistent agent memory
- Memory configuration is simplified to prevent vector database deadlocks
- Semantic recall and working memory are disabled to avoid performance issues

**AG-UI Integration** (`src/mastra/integrations/agui-integration.ts`)
- Frontend integration layer with interactive components
- Executive summary tables, pricing calculators, and progress indicators
- Designed for post-session momentum capture after 90-minute OneQ brainstorming sessions

### Technology Stack
- **Framework**: Mastra with AI SDK for Claude integration
- **Language**: TypeScript with ES2022 modules and strict typing
- **Database**: LibSQL for agent memory and state persistence
- **AI Models**: Claude 3.5 Sonnet (primary), with OpenRouter support for Claude 4
- **Validation**: Zod schemas throughout the tool chain

## Business Logic and Rules

### OneQ Value Proposition
OneQ provides 90-minute brainstorming sessions that create concrete roadmaps. This system generates compelling sales proposals immediately after sessions to capture decision-making momentum.

### Pricing Strategy
- OneQ pricing: 35-45% of calculated DIY cost (60%+ total savings)
- Time advantage: 12-16 weeks faster than DIY implementation
- Includes 3 months of expert support and maintenance
- Revenue acceleration through faster time-to-market

### Tool Chain Requirements
- **Input texts over 3000 characters**: Focus on key features and business requirements only
- **Currency standard**: ALL financial figures must be in USD
- **Tool sequence**: MUST complete all 4 tools before generating final response
- **No additional tools**: After oneqPricingTool completes, immediately generate comparison table
- **Error handling**: Tools must handle token limits gracefully and pass data between tools correctly

## Critical Development Considerations

### Token and Performance Optimization
- Agent has 2,500 token limit and 10-step maximum to prevent loops
- Debug responses include tool completion status: "✅ Completed [tool_name] (X/4 tools done)"
- If approaching token limits, prioritize completing all 4 tools first
- Memory configuration is intentionally simplified to prevent deadlocks

### Common Issues and Solutions
- **Tool loops**: Caused by excessive token usage or memory conflicts
- **LibSQL deadlocks**: Avoid complex memory configurations or multiple agents
- **Missing calculations**: Ensure all 4 tools complete before final response generation
- **Inconsistent pricing**: Use exact tool output data, don't generate estimates

### Environment Configuration
- Supports both Anthropic API keys and OpenRouter API keys
- LibSQL database file created automatically at `./mastra.db`
- Debug logging and telemetry enabled by default in development

## Key Files for Modification

**Agent Behavior**: `src/mastra/agents/salesman-agent.ts` - Modify instructions, model selection, or memory configuration

**Business Logic**: `src/mastra/tools/` - Update calculation formulas, pricing rules, or validation logic

**System Configuration**: `src/mastra/index.ts` - Adjust Mastra settings, storage, or telemetry

**Frontend Integration**: `src/mastra/integrations/agui-integration.ts` - Modify UI components or presentation logic

## Documentation References

- `README-OPTIMIZED-ARCHITECTURE.md` - Comprehensive architecture and optimization guide
- `AGUI_INTEGRATION_GUIDE.md` - Frontend integration specifications
- `DEBUG.md` - Debugging and performance monitoring guide
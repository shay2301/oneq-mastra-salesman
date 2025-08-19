# OneQ Sales Agent

An AI-powered sales automation system built on the Mastra framework that generates professional sales proposals by analyzing customer roadmaps through a structured tool chain.

## Overview

This system creates compelling sales proposals immediately after OneQ's 90-minute brainstorming sessions to capture decision-making momentum. It analyzes customer roadmaps and generates comprehensive cost comparisons between DIY implementation and OneQ's solution.

## Core System Flow

```
Input Roadmap → Tool 1 (Normalize) → Tool 2 (DIY Cost) → 
Tool 3 (Revenue) → Tool 4 (Pricing) → Executive Summary → AG-UI Components
```

## Quick Start

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

## Architecture

### Main Agent
- Uses Claude 3.5 Sonnet with 2,500 token limit and 10-step maximum
- MUST execute all 4 tools in sequence for every analysis request
- Configured with simplified memory to prevent LibSQL deadlocks
- Outputs structured executive summary tables with exact financial calculations

### Tool Chain
The system uses a mandatory 4-tool sequence:

1. **Input Normalization Tool** - Analyzes roadmap complexity and features
2. **DIY Cost Calculator Tool** - Calculates comprehensive DIY implementation costs
3. **Revenue Projections Tool** - Projects revenue potential and opportunity costs  
4. **OneQ Pricing Tool** - Prices OneQ solution at 35-45% of DIY cost

### Storage & Memory
- Uses LibSQL (`file:./mastra.db`) for persistent agent memory
- Memory configuration is simplified to prevent vector database deadlocks
- Semantic recall and working memory are disabled to avoid performance issues

## Technology Stack

- **Framework**: Mastra with AI SDK for Claude integration
- **Language**: TypeScript with ES2022 modules and strict typing
- **Database**: LibSQL for agent memory and state persistence
- **AI Models**: Claude 3.5 Sonnet (primary), with OpenRouter support for Claude 4
- **Validation**: Zod schemas throughout the tool chain

## Business Logic

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

## Key Files

- `src/mastra/agents/salesman-agent.ts` - Main agent configuration
- `src/mastra/tools/` - Tool chain implementation
- `src/mastra/index.ts` - System configuration
- `src/mastra/integrations/agui-integration.ts` - Frontend integration layer
- `CLAUDE.md` - Detailed development guidelines
- `DEBUG.md` - Debugging and performance monitoring guide

## Environment Setup

Supports both Anthropic API keys and OpenRouter API keys. LibSQL database file is created automatically at `./mastra.db`.

## Documentation

- `README-OPTIMIZED-ARCHITECTURE.md` - Comprehensive architecture guide
- `AGUI_INTEGRATION_GUIDE.md` - Frontend integration specifications
- `DEBUG.md` - Debugging and performance monitoring
# OneQ Sales Agent

An AI-powered sales automation system built on the Mastra framework that generates professional sales proposals by analyzing customer roadmaps through a structured tool chain.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.9.0
- npm or yarn
- Anthropic API key or OpenRouter API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd oneq-sales-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Navigate to [http://localhost:4111/agents](http://localhost:4111/agents) and select "OneQ Sales Agent"

## 📋 Available Commands

```bash
npm run dev      # Start Mastra development server
npm run debug    # Start with verbose debugging and telemetry
npm run build    # Build the TypeScript application
npm run start    # Start production server
npm test         # Run tests (when implemented)
```

## 🏗️ Architecture Overview

### Core System Flow

The system processes customer roadmaps through a mandatory 4-tool sequence:

```
Input Roadmap → Tool 1 (Normalize) → Tool 2 (DIY Cost) → 
Tool 3 (Revenue) → Tool 4 (Pricing) → Executive Summary → AG-UI Components
```

### Key Components

#### 1. Main Agent (`src/mastra/agents/salesman-agent.ts`)
- **AI Model**: Claude 3.5 Sonnet with 2,500 token limit and 10-step maximum
- **Purpose**: Executes all 4 tools in sequence for every analysis request
- **Memory**: Simplified configuration to prevent LibSQL deadlocks
- **Output**: Structured executive summary tables with exact financial calculations

#### 2. Tool Chain (`src/mastra/tools/`)

The system uses a mandatory 4-tool sequence that must complete in order:

1. **Input Normalization Tool** (`input-normalization-tool.ts`)
   - Analyzes roadmap complexity and features
   - Identifies key technical requirements
   - Normalizes input for consistent processing

2. **DIY Cost Calculator Tool** (`diy-cost-calculator-tool.ts`)
   - Calculates comprehensive DIY implementation costs
   - Includes development time, resources, and infrastructure
   - Provides detailed cost breakdowns

3. **Revenue Projections Tool** (`revenue-projections-tool.ts`)
   - Projects revenue potential and opportunity costs
   - Calculates time-to-market advantages
   - Estimates business impact of delays

4. **OneQ Pricing Tool** (`oneq-pricing-tool.ts`)
   - Prices OneQ solution at 35-45% of DIY cost
   - Includes 3 months of expert support
   - Highlights 60%+ total savings

#### 3. Storage & Memory (`src/mastra/index.ts`)
- **Database**: LibSQL (`file:./mastra.db`) for persistent agent memory
- **Configuration**: Simplified to prevent vector database deadlocks
- **Memory Features**: Semantic recall and working memory disabled for stability

#### 4. AG-UI Integration (`src/mastra/integrations/agui-integration.ts`)
- Frontend integration layer with interactive components
- Executive summary tables and pricing calculators
- Progress indicators for tool execution
- Designed for post-session momentum capture

## 💼 Business Logic

### OneQ Value Proposition

OneQ provides 90-minute brainstorming sessions that create concrete roadmaps. This system generates compelling sales proposals immediately after sessions to capture decision-making momentum.

### Pricing Strategy

- **OneQ Pricing**: 35-45% of calculated DIY cost (60%+ total savings)
- **Time Advantage**: 12-16 weeks faster than DIY implementation
- **Support Included**: 3 months of expert support and maintenance
- **Revenue Acceleration**: Faster time-to-market benefits

### Processing Rules

- **Large Inputs**: Texts over 3,000 characters focus on key features only
- **Currency Standard**: All financial figures in USD
- **Tool Sequence**: Must complete all 4 tools before generating final response
- **Error Handling**: Graceful token limit handling with data passing between tools

## 🛠️ Technology Stack

- **Framework**: [Mastra](https://mastra.ai) with AI SDK for Claude integration
- **Language**: TypeScript with ES2022 modules and strict typing
- **Database**: LibSQL for agent memory and state persistence
- **AI Models**: 
  - Primary: Claude 3.5 Sonnet (Anthropic)
  - Alternative: Claude 4 (OpenRouter)
- **Validation**: Zod schemas throughout the tool chain
- **Logging**: Pino logger with debug support
- **Telemetry**: Built-in telemetry for performance monitoring

## 🔧 Development

### Project Structure

```
src/
├── mastra/
│   ├── agents/
│   │   └── salesman-agent.ts      # Main AI agent
│   ├── tools/
│   │   ├── input-normalization-tool.ts
│   │   ├── diy-cost-calculator-tool.ts
│   │   ├── revenue-projections-tool.ts
│   │   ├── oneq-pricing-tool.ts
│   │   ├── validation-tools.ts
│   │   └── index.ts
│   ├── integrations/
│   │   └── agui-integration.ts    # Frontend integration
│   ├── workflows/
│   └── index.ts                   # Main Mastra configuration
├── debug-agent.ts                 # Debug utilities
└── test-deadlock-fix.ts          # Testing utilities
```

### Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Agent**: Navigate to http://localhost:4111/agents and select "OneQ Sales Agent"

3. **Test Input**: Use sample roadmap/PRD text to verify the 4-tool calculation sequence

4. **Monitor Logs**: Check debug logs for token usage and tool execution flow

5. **Debug Issues**: Use `npm run debug` for verbose logging when investigating problems

### Common Issues and Solutions

#### Tool Loops
- **Cause**: Excessive token usage or memory conflicts
- **Solution**: Monitor token limits, ensure all 4 tools complete before final response

#### LibSQL Deadlocks
- **Cause**: Complex memory configurations or multiple agents
- **Solution**: Use simplified memory configuration, avoid concurrent agent instances

#### Missing Calculations
- **Cause**: Tools not completing in sequence
- **Solution**: Ensure all 4 tools execute and pass data correctly

#### Inconsistent Pricing
- **Cause**: Generated estimates instead of tool outputs
- **Solution**: Use exact tool output data, never generate estimates

## 🏃‍♀️ Performance Optimization

### Token Management
- Agent has 2,500 token limit and 10-step maximum
- Debug responses include tool completion status: "✅ Completed [tool_name] (X/4 tools done)"
- If approaching limits, prioritize completing all 4 tools first

### Memory Configuration
- Intentionally simplified to prevent deadlocks
- Semantic recall disabled
- Working memory disabled
- Last 5 messages only for context

### Database Optimization
- Single LibSQL instance for all storage
- Centralized storage configuration
- No agent-level storage conflicts

## 🔐 Environment Configuration

### Required Environment Variables

```bash
# Choose one of the following:
ANTHROPIC_API_KEY=your_anthropic_key_here
# OR
OPENROUTER_API_KEY=your_openrouter_key_here

# Optional: Database configuration
DATABASE_URL=file:./mastra.db
```

### API Key Setup

1. **Anthropic API**: Get your key from [Anthropic Console](https://console.anthropic.com/)
2. **OpenRouter API**: Get your key from [OpenRouter](https://openrouter.ai/)

## 📊 Monitoring and Debugging

### Debug Mode

Enable verbose logging:
```bash
npm run debug
```

### Telemetry

The system includes built-in telemetry for:
- Tool execution timing
- Token usage tracking
- Error monitoring
- Performance metrics

### Log Analysis

Debug responses include:
- Tool completion status
- Token usage per step
- Memory state changes
- Error details with context

## 📚 Documentation

- **Architecture Guide**: `README-OPTIMIZED-ARCHITECTURE.md`
- **AG-UI Integration**: `AGUI_INTEGRATION_GUIDE.md`
- **Debugging Guide**: `DEBUG.md`
- **Development Instructions**: `CLAUDE.md`

## 🤝 Contributing

1. Follow the existing TypeScript and code style conventions
2. Ensure all 4 tools maintain their sequential execution
3. Test with the Mastra development interface
4. Monitor token usage and performance
5. Update documentation for any architectural changes

## 📄 License

This project is licensed under the ISC License.

## 🔗 Related Links

- [Mastra Framework](https://mastra.ai)
- [Anthropic Claude](https://www.anthropic.com/)
- [OpenRouter](https://openrouter.ai/)

---

Built with ❤️ for OneQ Sales Automation
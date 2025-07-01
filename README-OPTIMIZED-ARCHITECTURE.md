# OneQ Sales System - Optimized Architecture

## Overview

This is an optimized Mastra-based sales system that analyzes roadmaps/PRDs and creates professional OneQ sales proposals using modular calculation tools. The system is designed for token efficiency while maintaining comprehensive analysis capabilities.

## Architecture

### Token-Optimized Design
- **Single Agent**: One comprehensive agent with all necessary tools
- **Modular Tools**: Separate calculation tools that handle heavy computation
- **Token Efficiency**: Under 20k token limit with optimized instructions
- **Direct Tool Access**: Tools can be called directly without agent overhead

### Key Components

#### 1. OneQ Sales Agent (`src/mastra/agents/oneq-sales-agent.ts`)
- Main sales agent that coordinates all analysis
- Enforces mandatory tool usage sequence
- Optimized instructions for professional proposals
- Token-limited to 1500 tokens for efficiency

#### 2. Calculation Tools (`src/mastra/tools/`)
- **Input Normalization Tool**: Analyzes roadmaps and extracts features
- **DIY Cost Calculator**: Calculates full DIY implementation costs
- **Revenue Projections Tool**: Projects revenue potential and opportunity costs
- **OneQ Pricing Tool**: Calculates OneQ pricing with modular options
- **Validation Tools**: Ensures consistency and ethical compliance

#### 3. Main Configuration (`src/mastra/index.ts`)
- Registers agent and all tools with Mastra
- LibSQL storage for memory and state management
- Structured for easy scaling and testing

## Usage

### Standard Workflow (User Experience)
1. Start the system: `npm run dev`
2. Open http://localhost:4111/agents
3. Select "OneQ Sales Agent"
4. Input: Provide roadmap/PRD text and business context
5. Output: Receive complete professional sales proposal

### Tool Sequence (Automatic)
The agent automatically follows this sequence:
1. **Normalize Input** → Extract features and assess complexity
2. **Calculate DIY Costs** → Full cost breakdown with hidden expenses
3. **Project Revenue** → Revenue potential and delay costs
4. **Calculate OneQ Pricing** → Competitive pricing with options
5. **Validate Consistency** → Ensure calculations align
6. **Present Proposal** → Professional sales presentation

## Tool Details

### Input Normalization Tool
- Analyzes roadmap text for features and complexity
- Classifies projects: simple → medium → complex → enterprise → platform
- Detects compliance requirements (SOC2, GDPR, HIPAA)
- Identifies enterprise features and multi-phase projects

### DIY Cost Calculator
- Calculates stage breakdown (planning, design, frontend, backend, QA)
- Team requirements with hourly rates
- Hidden costs (recruitment, benefits, equipment, onboarding)
- Enterprise specialist rates for complex projects

### Revenue Projections Tool
- Business model-specific revenue calculations
- Market analysis and opportunity costs
- Delay impact analysis (2 weeks, 1 month, 3 months)
- First-mover advantage calculations

### OneQ Pricing Tool
- Complexity-based pricing (35-45% of DIY cost)
- Modular options for additional services
- Enterprise premiums for compliance requirements
- Expedited delivery and extended support options

### Validation Tools
- Consistency validation across all calculations
- Ethical compliance checking for sales responses
- Rounding and methodology verification
- Response quality assurance

## Business Rules

### OneQ Value Proposition
- **Cost Savings**: 35-45% of DIY costs (60%+ total savings)
- **Time Benefits**: 12-16 weeks faster than DIY implementation
- **Pricing Strategy**: Based on complexity and compliance requirements
- **Quality Standards**: Enterprise-grade delivery with ongoing support

### Ethical Guidelines
- No manipulative pressure tactics
- Truthful capability and timeline claims
- Professional tone focused on genuine value
- Transparent pricing and clear benefits
- Respect for client autonomy

## Token Management

### Rate Limits
- **Claude 4 Sonnet**: 20k tokens per minute organizational limit
- **Agent Limit**: 1500 tokens per response
- **Tool Optimization**: Heavy calculations in tools (no token cost)
- **Input Limits**: Automatically truncate long inputs if needed

### Performance Optimization
- Tools handle all calculations (saves agent tokens)
- Modular architecture allows direct tool access
- Optimized instructions focus on key value points
- Error handling prevents token waste on retries

## Error Handling

### Tool Failures
- Graceful degradation with meaningful messages
- Manual follow-up options for complex cases
- Validation across all calculation steps
- Professional error communication to users

### Rate Limiting
- Input length management to prevent overages
- Token budget monitoring and optimization
- Efficient instruction design
- Strategic tool sequencing

## Development Workflow

### Testing Tools Individually
```bash
# Test input normalization
npm run dev
# Navigate to tools section and test individual tools

# Test full agent workflow
# Navigate to agents section and test complete flow
```

### Debugging
- Check tool execution logs in Mastra dashboard
- Verify calculation consistency across tools
- Monitor token usage and performance
- Test error handling scenarios

### Scaling Considerations
- Tools can be called directly without agent
- Workflow orchestration can be added later
- Cache calculation results for repeated queries
- Consider batch processing for multiple proposals

## Files Structure

```
src/mastra/
├── agents/
│   └── oneq-sales-agent.ts       # Main sales agent
├── tools/
│   ├── input-normalization-tool.ts    # Roadmap analysis
│   ├── diy-cost-calculator-tool.ts    # DIY cost calculations
│   ├── revenue-projections-tool.ts    # Revenue analysis
│   ├── oneq-pricing-tool.ts           # OneQ pricing
│   ├── validation-tools.ts            # Consistency & ethics
│   └── index.ts                       # Tool exports
└── index.ts                           # Main Mastra config
```

## Best Practices

### For Users
- Provide detailed roadmaps for accurate analysis
- Include business context and market information
- Specify compliance requirements if known
- Mention timeline constraints or urgency

### For Developers
- Always test tools individually before agent integration
- Monitor token usage in development
- Validate calculation accuracy against business rules
- Test error scenarios and edge cases
- Keep instructions concise but comprehensive

## Future Enhancements

### Possible Optimizations
- Workflow orchestration for complex scenarios
- Caching layer for repeated calculations
- Batch processing for multiple proposals
- Integration with external data sources

### Scaling Options
- Multi-agent coordination for specialized tasks
- Industry-specific calculation variations
- Advanced compliance requirement handling
- Integration with CRM and sales systems

## Support

For issues or questions about the sales system:
1. Check tool execution logs in Mastra dashboard
2. Verify input format and completeness
3. Test individual tools before full workflow
4. Review token usage and optimization guidelines

The system is designed to be self-contained and user-friendly while providing comprehensive sales analysis capabilities. 
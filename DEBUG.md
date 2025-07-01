# 🔍 Debugging Token & Step Limits

## Quick Setup for Limit Monitoring

### 1. **Enable Debug Mode**
```bash
# Start with verbose debugging
npm run debug
```

### 2. **Monitor Agent Progress**
The agent now reports its progress in real-time:

```
Starting analysis with 5 calculation tools...
✅ Completed inputNormalizationTool (1/5 tools done)
✅ Completed diyCalculatorTool (2/5 tools done)
✅ Completed revenueProjectionsTool (3/5 tools done)
✅ Completed oneqPricingTool (4/5 tools done)
✅ Completed consistencyValidationTool (5/5 tools done)
✅ All 5 tools completed successfully
```

### 3. **Watch for Limit Warnings**
Look for these indicators in the chat:

- ⚠️ `"Managing token usage - prioritizing key data"` = Approaching token limit
- ⚠️ `"Stopped at tool X due to limits"` = Hit step or token limit
- 🔴 `"Error: Overloaded"` = Rate limit exceeded

### 4. **Check Server Logs**
Monitor the terminal running `npm run debug` for:

```bash
# Token usage information
DEBUG [...] Token usage: X/3500 tokens
DEBUG [...] Step count: X/12 steps

# Rate limit warnings  
WARN [...] Rate limit approaching
ERROR [...] Request failed: overloaded_error

# Tool execution traces
DEBUG [...] Tool execution: inputNormalizationTool
DEBUG [...] Tool execution: diyCalculatorTool
```

### 5. **Console Debugging**
With telemetry enabled, you'll see detailed traces in the console:

```bash
# OpenTelemetry traces showing execution flow
TRACE [...] Agent generation started
TRACE [...] Tool inputNormalizationTool executed
TRACE [...] Tool diyCalculatorTool executed
TRACE [...] Agent generation completed
```

## 🛠️ **If Limits Are Hit**

### **Token Limit Fixes:**
```typescript
// In src/mastra/agents/salesman-agent.ts
maxTokens: 4000, // Increase if needed
```

### **Step Limit Fixes:**
```typescript
// In src/mastra/agents/salesman-agent.ts  
maxSteps: 15, // Increase if needed
```

### **Rate Limit Fixes:**
- Wait 1 minute between requests
- Reduce input length (under 3000 characters)
- Switch models if needed

## 🔍 **Live Monitoring**

### **Terminal 1: Run Server**
```bash
npm run debug
```

### **Terminal 2: Watch Logs** (optional)
```bash
tail -f mastra.db.log  # If file logging enabled
```

### **Browser: Monitor UI**
- Go to http://localhost:4111/agents
- Watch for progress indicators in chat
- Check browser console for additional debug info

## 📊 **Current Limits**

- **maxTokens**: 2500 (optimized to prevent tool loops)
- **maxSteps**: 10 (4 tools + reasoning + final response)
- **Rate Limit**: ~20k tokens/minute (Claude 3.5 Sonnet)
- **Tool Sequence**: 4 tools must complete before final response
- **TEMPORARY**: Removed consistencyValidationTool due to persistent looping issues
- **Critical**: Agent must STOP using tools after oneqPricingTool

## 🚨 **Troubleshooting Quick Fixes**

1. **Stuck after any tool**: 
   - **Issue #1**: Tool loops in tool-result steps instead of generating final response
   - **Fix**: Increase `maxSteps` and ensure clear instructions to stop after final tool
   - **Issue #2**: Specific tool causing persistent loops (like consistencyValidationTool)
   - **Fix**: Temporarily remove the problematic tool from agent configuration
   - **Check**: Look for repeated `"stepType": "tool-result"` in debug logs

2. **"Overloaded" error**: Wait 1 minute, try shorter input

3. **No progress indicators**: Check agent instructions are updated

4. **Missing debug logs**: Verify `level: 'debug'` in logger config

## 🔧 **Current Workflow (4 Tools)**

**Expected Flow:**
```
Starting analysis with 4 calculation tools...
✅ Completed inputNormalizationTool (1/4 tools done)
✅ Completed diyCalculatorTool (2/4 tools done)
✅ Completed revenueProjectionsTool (3/4 tools done)
✅ Completed oneqPricingTool (4/4 tools done)
✅ All 4 tools completed successfully - generating final proposal

## 🎯 **EXECUTIVE SUMMARY**

| **Metric** | **OneQ Path** | **DIY Path** | **Your Advantage** |
|------------|---------------|--------------|-------------------|
| **💰 Total Investment** | **$135,000** | **$287,000** | **Save $152,000 (53%)** |
...
```

## ⚠️ **Known Issues**

### **consistencyValidationTool Removed Temporarily**
- **Problem**: Tool was causing persistent loops even after fixes
- **Symptoms**: Agent would complete 4 tools, then get stuck on 5th tool
- **Solution**: Temporarily removed from agent configuration
- **Impact**: No validation step, but other tools provide accurate calculations
- **Next Steps**: Debug the validation tool separately before re-adding

## 🔍 **Identifying Tool Loop Issues**

### **Symptoms:**
- Agent completes all 5 tools successfully
- Gets stuck after consistencyValidationTool 
- Debug logs show repeated `"stepType": "tool-result"` entries
- High token usage (50k+ tokens) without final response

### **Common Causes:**
1. **Value-Changing Validation Tools**: Tool modifies input values instead of just validating
   ```typescript
   // BAD: Changes values
   return { diyCost: Math.round(input.diyCost/1000)*1000 }
   
   // GOOD: Keeps exact values  
   return { diyCost: input.diyCost }
   ```

2. **Missing Stop Instructions**: Agent doesn't know when to stop using tools

3. **Token Limit Confusion**: Agent hits limits mid-process and loops

### **In Debug Logs Look For:**
```bash
# Good - Normal progression
✅ Completed inputNormalizationTool (1/5 tools done)
✅ Completed diyCalculatorTool (2/5 tools done)
✅ Completed revenueProjectionsTool (3/5 tools done)
✅ Completed oneqPricingTool (4/5 tools done)
✅ Completed consistencyValidationTool (5/5 tools done)
✅ All 5 tools completed successfully - generating final proposal

# Bad - Tool loop detected
✅ Completed consistencyValidationTool (5/5 tools done)
[No final response generation - agent stuck]
```

### **Check Tool Input/Output Values:**
```json
// Look for value changes in tool results
"args": {"diyCost": 286800, "oneQPrice": 129000}
"result": {"diyCost": 287000, "oneQPrice": 129000} // ❌ BAD: Value changed!
``` 
import { oneqSalesAgent } from './mastra';

/**
 * Test script to verify deadlock fixes
 * Run with: npx tsx src/test-deadlock-fix.ts
 */

async function testDeadlockFix() {
  console.log('🔧 Testing deadlock fixes...\n');
  
  const testRoadmap = `
We're building a cybersecurity platform called SecureOps with the following features:
- Real-time threat monitoring and detection
- Automated incident response workflows  
- Compliance reporting for SOC2 and GDPR
- Multi-tenant architecture for enterprise clients
- AI-powered risk assessment engine
- Integration with existing security tools
- Mobile app for security teams
- Advanced analytics dashboard

Target market: Enterprise cybersecurity
Timeline: 6-month MVP, then 2 additional phases
Expected users: 1000+ security professionals across multiple organizations
`;

  const startTime = Date.now();
  let completed = false;
  
  // Set a timeout to detect deadlocks
  const timeout = setTimeout(() => {
    if (!completed) {
      console.log('❌ DEADLOCK DETECTED: Agent response took longer than 60 seconds');
      console.log('⚠️  Check memory configuration and tool sequence logic');
      process.exit(1);
    }
  }, 60000); // 60 second timeout
  
  try {
    console.log('📤 Sending test roadmap to agent...');
    console.log('⏱️  Monitoring for deadlocks (60s timeout)...\n');
    
    const response = await oneqSalesAgent.generate(
      `Please analyze this roadmap and create a complete sales proposal: ${testRoadmap}`,
      {
        resourceId: 'test-user-123',
        threadId: 'deadlock-test-thread',
        // Add explicit memory config to test
        memory: {
          resource: 'test-user-123',
          thread: 'deadlock-test-thread',
          options: {
            lastMessages: 5,
            semanticRecall: false,
            workingMemory: { enabled: false }
          }
        }
      }
    );
    
    completed = true;
    clearTimeout(timeout);
    
    const duration = Date.now() - startTime;
    console.log(`✅ SUCCESS: Agent completed without deadlock in ${duration}ms`);
    console.log(`📝 Response length: ${response.text?.length || 0} characters`);
    console.log(`🔧 Tool calls made: ${response.toolCalls?.length || 0}`);
    
    if (response.toolCalls) {
      console.log('\n🛠️  Tool execution sequence:');
      response.toolCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.toolName}`);
      });
    }
    
    console.log('\n📋 Generated proposal preview:');
    console.log(response.text?.substring(0, 300) + '...');
    
  } catch (error) {
    completed = true;
    clearTimeout(timeout);
    
    console.log('❌ ERROR during agent execution:');
    console.error(error);
    
    // Provide debugging guidance
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.log('\n🔍 DEBUGGING TIPS FOR TIMEOUT:');
        console.log('   - Check if tools are hanging on external API calls');
        console.log('   - Verify memory storage is not locked');
        console.log('   - Review maxSteps configuration');
      } else if (error.message.includes('memory')) {
        console.log('\n🔍 DEBUGGING TIPS FOR MEMORY ISSUES:');
        console.log('   - Ensure database file is not locked by another process');
        console.log('   - Check storage permissions');
        console.log('   - Verify LibSQL configuration');
      } else if (error.message.includes('tool')) {
        console.log('\n🔍 DEBUGGING TIPS FOR TOOL ISSUES:');
        console.log('   - Check tool execution sequence logic');
        console.log('   - Verify tool input/output schemas match');
        console.log('   - Review tool timeout configurations');
      }
    }
  }
}

// Add process monitoring
console.log('🚀 Starting deadlock fix test...');
console.log('💾 Memory configuration: Centralized storage, no semantic recall');
console.log('🔧 Architecture: Agent uses directCalculation workflow (not individual tools)');
console.log('⚡ Max steps: 10, Max tokens: 4000 (workflow + final response)\n');

testDeadlockFix().then(() => {
  console.log('\n✅ Test completed successfully');
  process.exit(0);
}).catch((error) => {
  console.log('\n❌ Test failed:', error);
  process.exit(1);
}); 
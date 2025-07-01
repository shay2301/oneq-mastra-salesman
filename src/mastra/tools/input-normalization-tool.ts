import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const inputNormalizationTool = createTool({
  id: 'normalizeRoadmapInput',
  description: 'Standardizes roadmap and PRD inputs for consistent analysis and pricing, now with enhanced enterprise project detection',
  inputSchema: z.object({
    roadmapText: z.string().describe('Raw roadmap or PRD text'),
    projectType: z.enum(['webapp', 'mobile', 'api', 'platform', 'saas', 'enterprise']).optional().describe('Project type classification'),
    industry: z.string().optional().describe('Industry or domain (e.g., fintech, healthcare, e-commerce, cybersecurity)')
  }),
  outputSchema: z.object({
    normalizedFeatures: z.array(z.string()).describe('Standardized list of core features'),
    backendComplexity: z.enum(['simple', 'medium', 'complex', 'enterprise', 'platform']).describe('Enhanced complexity assessment including enterprise tiers'),
    estimatedBackendHours: z.number().describe('Normalized backend hours estimate (rounded to nearest 10)'),
    businessModel: z.enum(['saas', 'ecommerce', 'b2b', 'mobile', 'enterprise']).describe('Identified business model'),
    marketCategory: z.string().describe('Standardized market category'),
    keyDifferentiators: z.array(z.string()).describe('Main differentiating features'),
    isMultiPhase: z.boolean().describe('Whether project requires multi-phase implementation'),
    phaseCount: z.number().describe('Number of implementation phases (1-4)'),
    complianceRequirements: z.array(z.string()).describe('Identified compliance needs (SOC2, GDPR, HIPAA, etc.)'),
    enterpriseFeatures: z.array(z.string()).describe('Enterprise-specific features detected')
  }),
  execute: async ({ context }) => {
    const { roadmapText, projectType, industry } = context;
    
    // Enhanced feature extraction including enterprise features
    const featureKeywords = [
      // Standard features
      'authentication', 'user management', 'dashboard', 'reporting', 'payments', 
      'notifications', 'api', 'database', 'search', 'analytics', 'integration',
      'mobile app', 'web app', 'admin panel', 'messaging', 'file upload',
      'real-time', 'automation', 'machine learning', 'ai', 'blockchain',
      // Enterprise features
      'simulation', 'scenario engine', 'benchmarking', 'war room', 'crisis management',
      'incident response', 'certification system', 'audit logging', 'compliance',
      'multi-tenant', 'sso', 'single sign-on', 'role-based access', 'rbac',
      'microservices', 'containerized', 'orchestration', 'load balancing',
      'disaster recovery', 'backup', 'replication', 'monitoring', 'alerting',
      'encryption', 'security', 'penetration testing', 'vulnerability assessment'
    ];
    
    const normalizedFeatures = featureKeywords.filter(feature => 
      roadmapText.toLowerCase().includes(feature.toLowerCase())
    );
    
    // Enhanced complexity assessment with enterprise tiers
    const complexityIndicators = {
      simple: ['basic', 'simple', 'mvp', 'prototype', 'minimal'],
      medium: ['standard', 'typical', 'moderate', 'extended'],
      complex: ['enterprise', 'advanced', 'sophisticated', 'complex', 'ai', 'machine learning'],
      enterprise: ['enterprise-grade', 'mission-critical', 'large-scale', 'global', 'multi-region', 'compliance', 'soc2', 'gdpr', 'hipaa'],
      platform: ['platform', 'ecosystem', 'multi-phase', 'phased', 'architecture', 'infrastructure', 'framework', 'sdk', 'api gateway']
    };
    
    let backendComplexity: 'simple' | 'medium' | 'complex' | 'enterprise' | 'platform' = 'medium';
    const textLower = roadmapText.toLowerCase();
    
    // Check for platform-level complexity first (most complex)
    if (complexityIndicators.platform.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'platform';
    } else if (complexityIndicators.enterprise.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'enterprise';
    } else if (complexityIndicators.complex.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'complex';
    } else if (complexityIndicators.simple.some(indicator => textLower.includes(indicator))) {
      backendComplexity = 'simple';
    }
    
    // Enhanced backend hour estimation for enterprise projects
    const baseHours = {
      simple: 80,
      medium: 160,
      complex: 320,
      enterprise: 500,    // Enterprise applications
      platform: 800      // Complex multi-phase platforms like Code Blue
    };
    
    const featureMultiplier = Math.max(1, normalizedFeatures.length * 0.1);
    const rawHours = baseHours[backendComplexity] * featureMultiplier;
    
    // Round to nearest 10 for consistency
    const estimatedBackendHours = Math.round(rawHours / 10) * 10;
    
    // Enhanced business model identification
    const businessModelKeywords = {
      saas: ['subscription', 'saas', 'monthly', 'recurring', 'tenant'],
      ecommerce: ['store', 'shop', 'cart', 'payment', 'product', 'marketplace'],
      b2b: ['enterprise', 'business', 'b2b', 'corporate', 'client'],
      mobile: ['mobile', 'app', 'ios', 'android', 'smartphone'],
      enterprise: ['enterprise software', 'enterprise platform', 'enterprise solution', 'large organization', 'multi-location']
    };
    
    let businessModel: 'saas' | 'ecommerce' | 'b2b' | 'mobile' | 'enterprise' = 'saas';
    for (const [model, keywords] of Object.entries(businessModelKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        businessModel = model as any;
        break;
      }
    }
    
    // Multi-phase detection
    const phaseIndicators = ['phase', 'phases', 'stage', 'stages', 'milestone', 'roadmap', 'timeline'];
    const isMultiPhase = phaseIndicators.some(indicator => textLower.includes(indicator));
    
    // Extract phase count
    const phaseMatches = textLower.match(/(\d+)\s*(?:phase|stage|milestone)/g);
    let phaseCount = 1;
    if (phaseMatches && phaseMatches.length > 0) {
      const numbers = phaseMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '1'));
      phaseCount = Math.max(...numbers);
    } else if (isMultiPhase) {
      phaseCount = backendComplexity === 'platform' ? 4 : backendComplexity === 'enterprise' ? 3 : 2;
    }
    
    // Compliance requirements detection
    const complianceKeywords = {
      'SOC2': ['soc2', 'soc 2', 'service organization control'],
      'GDPR': ['gdpr', 'general data protection regulation', 'european privacy'],
      'HIPAA': ['hipaa', 'health insurance portability', 'healthcare privacy'],
      'PCI': ['pci', 'payment card industry', 'credit card'],
      'ISO27001': ['iso27001', 'iso 27001', 'information security management'],
      'FedRAMP': ['fedramp', 'federal risk', 'government cloud'],
      'CCPA': ['ccpa', 'california consumer privacy act']
    };
    
    const complianceRequirements = Object.entries(complianceKeywords)
      .filter(([_, keywords]) => keywords.some(keyword => textLower.includes(keyword)))
      .map(([compliance, _]) => compliance);
    
    // Enterprise features detection
    const enterpriseKeywords = [
      'ai-powered', 'machine learning', 'artificial intelligence', 'scenario engine',
      'real-time analytics', 'multi-tenant', 'role-based access', 'audit logging',
      'disaster recovery', 'high availability', 'load balancing', 'auto-scaling',
      'microservices', 'containerized', 'kubernetes', 'docker', 'orchestration',
      'api gateway', 'service mesh', 'monitoring', 'observability', 'logging',
      'encryption', 'security scanning', 'vulnerability assessment', 'penetration testing'
    ];
    
    const enterpriseFeatures = enterpriseKeywords.filter(feature => 
      textLower.includes(feature.replace('-', ' '))
    );
    
    // Standardize market category
    const marketCategory = industry || (
      textLower.includes('cyber') || textLower.includes('security') ? 'Cybersecurity' :
      textLower.includes('health') || textLower.includes('medical') ? 'Healthcare' :
      textLower.includes('finance') || textLower.includes('bank') ? 'Financial Services' :
      'Technology'
    );
    
    // Extract key differentiators (enhanced)
    const differentiatorKeywords = [
      'ai-powered', 'real-time', 'automated', 'secure', 'scalable',
      'user-friendly', 'mobile-first', 'cloud-based', 'cloud-native', 'integration',
      'analytics', 'personalized', 'instant', 'collaborative', 'multi-tenant',
      'enterprise-grade', 'mission-critical', 'high-availability', 'disaster-recovery'
    ];
    
    const keyDifferentiators = differentiatorKeywords.filter(diff => 
      textLower.includes(diff.replace('-', ' '))
    );
    
    return {
      normalizedFeatures,
      backendComplexity,
      estimatedBackendHours,
      businessModel,
      marketCategory,
      keyDifferentiators,
      isMultiPhase,
      phaseCount,
      complianceRequirements,
      enterpriseFeatures
    };
  }
}); 
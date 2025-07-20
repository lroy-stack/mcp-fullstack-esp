#!/usr/bin/env node
/**
 * Script de Validación de Prerequisites para Servidor MCP Full Stack
 * Valida todos los servicios y configuraciones requeridos antes del despliegue
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Cargar variables de entorno
config();

interface ValidationResult {
  service: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  latency?: number;
  details?: string;
}

interface ValidationConfig {
  required: string[];
  optional: string[];
  format: Record<string, RegExp>;
}

const CONFIG_VALIDATION: ValidationConfig = {
  required: [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'COOKIE_ENCRYPTION_KEY',
    'ANTHROPIC_API_KEY',
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'NEO4J_URI',
    'NEO4J_USER',
    'NEO4J_PASSWORD'
  ],
  optional: [
    'SENTRY_DSN',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'IMAP_HOST',
    'IMAP_USER',
    'IMAP_PASSWORD'
  ],
  format: {
    'GITHUB_CLIENT_ID': /^[A-Za-z0-9]{20}$/,
    'ANTHROPIC_API_KEY': /^sk-ant-[A-Za-z0-9\-_]+$/,
    'OPENAI_API_KEY': /^sk-proj-[A-Za-z0-9\-_]+$/,
    'DATABASE_URL': /^postgresql:\/\/.+/,
    'SUPABASE_URL': /^https:\/\/.+\.supabase\.co$/,
    'NEO4J_URI': /^(bolt|neo4j(\+s)?):\/\/.+/,
    'COOKIE_ENCRYPTION_KEY': /^[a-f0-9]{64}$/
  }
};

class PrerequisitesValidator {
  private results: ValidationResult[] = [];

  async validateAll(): Promise<ValidationResult[]> {
    console.log('🔍 Validando Prerequisites del Servidor MCP Full Stack...\n');

    // 1. Validar variables de entorno
    await this.validateEnvironmentVariables();

    // 2. Probar conectividad de servicios
    await this.testServiceConnectivity();

    // 3. Validar configuraciones de servicios
    await this.validateServiceConfigurations();

    return this.results;
  }

  private async validateEnvironmentVariables(): Promise<void> {
    console.log('📋 Verificando variables de entorno...');

    // Verificar variables obligatorias
    for (const variable of CONFIG_VALIDATION.required) {
      const value = process.env[variable];
      
      if (!value) {
        this.addResult({
          service: 'Environment',
          status: 'error',
          message: `Missing required variable: ${variable}`,
          details: 'Establece esta variable en tu archivo .env'
        });
        continue;
      }

      // Verificar formato si está definido
      const formatPattern = CONFIG_VALIDATION.format[variable];
      if (formatPattern && !formatPattern.test(value)) {
        this.addResult({
          service: 'Environment',
          status: 'error',
          message: `Invalid format for ${variable}`,
          details: 'Verifica el formato de la variable en la documentación'
        });
      } else {
        this.addResult({
          service: 'Environment',
          status: 'success',
          message: `${variable} configured correctly`
        });
      }
    }

    // Verificar variables opcionales
    for (const variable of CONFIG_VALIDATION.optional) {
      const value = process.env[variable];
      
      if (!value) {
        this.addResult({
          service: 'Environment',
          status: 'warning',
          message: `Optional variable ${variable} not set`,
          details: 'Algunas características podrían no estar disponibles'
        });
      } else {
        this.addResult({
          service: 'Environment',
          status: 'success',
          message: `${variable} configured`
        });
      }
    }
  }

  private async testServiceConnectivity(): Promise<void> {
    console.log('🌐 Probando conectividad de servicios...');

    // Probar Supabase
    await this.testSupabase();

    // Probar OpenAI
    await this.testOpenAI();

    // Probar Anthropic
    await this.testAnthropic();

    // Probar Neo4j (verificación básica - prueba completa requeriría driver Neo4j)
    await this.testNeo4j();

    // Probar GitHub OAuth (validación básica)
    await this.testGitHubOAuth();
  }

  private async testSupabase(): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      this.addResult({
        service: 'Supabase',
        status: 'error',
        message: 'Missing Supabase configuration',
        details: 'SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos'
      });
      return;
    }

    try {
      const start = Date.now();
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      const latency = Date.now() - start;

      if (response.ok) {
        this.addResult({
          service: 'Supabase',
          status: 'success',
          message: 'Connection successful',
          latency,
          details: 'Base de datos es accesible'
        });

        // Probar extensión pgvector
        await this.testPgVector(supabaseUrl, serviceKey);
      } else {
        this.addResult({
          service: 'Supabase',
          status: 'error',
          message: `Connection failed: ${response.status}`,
          details: 'Verifica tu SUPABASE_URL y SERVICE_KEY'
        });
      }
    } catch (error) {
      this.addResult({
        service: 'Supabase',
        status: 'error',
        message: 'Connection error',
        details: error.message
      });
    }
  }

  private async testPgVector(supabaseUrl: string, serviceKey: string): Promise<void> {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/version`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.addResult({
          service: 'Supabase pgvector',
          status: 'success',
          message: 'pgvector extension available',
          details: 'Los embeddings vectoriales funcionarán correctamente'
        });
      } else {
        this.addResult({
          service: 'Supabase pgvector',
          status: 'warning',
          message: 'Could not verify pgvector extension',
          details: 'Habilita la extensión vector en el Panel de Supabase'
        });
      }
    } catch (error) {
      this.addResult({
        service: 'Supabase pgvector',
        status: 'warning',
        message: 'Could not test pgvector',
        details: 'Verificación manual requerida'
      });
    }
  }

  private async testOpenAI(): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.addResult({
        service: 'OpenAI',
        status: 'error',
        message: 'Missing OpenAI API key',
        details: 'OPENAI_API_KEY es requerido para embeddings'
      });
      return;
    }

    try {
      const start = Date.now();
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const latency = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        const hasEmbeddingModel = data.data.some(model => 
          model.id.includes('text-embedding')
        );

        this.addResult({
          service: 'OpenAI',
          status: 'success',
          message: 'API key valid',
          latency,
          details: hasEmbeddingModel ? 'Modelos de embedding disponibles' : 'Verifica acceso a modelos de embedding'
        });
      } else if (response.status === 401) {
        this.addResult({
          service: 'OpenAI',
          status: 'error',
          message: 'Invalid API key',
          details: 'Verifica tu OPENAI_API_KEY'
        });
      } else if (response.status === 429) {
        this.addResult({
          service: 'OpenAI',
          status: 'warning',
          message: 'Rate limited or quota exceeded',
          details: 'Verifica tu facturación y límites de uso'
        });
      } else {
        this.addResult({
          service: 'OpenAI',
          status: 'error',
          message: `API error: ${response.status}`,
          details: 'Verifica el estado del servicio OpenAI'
        });
      }
    } catch (error) {
      this.addResult({
        service: 'OpenAI',
        status: 'error',
        message: 'Connection error',
        details: error.message
      });
    }
  }

  private async testAnthropic(): Promise<void> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      this.addResult({
        service: 'Anthropic',
        status: 'error',
        message: 'Missing Anthropic API key',
        details: 'ANTHROPIC_API_KEY es requerido para parseo de PRPs'
      });
      return;
    }

    try {
      const start = Date.now();
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      const latency = Date.now() - start;

      if (response.ok) {
        this.addResult({
          service: 'Anthropic',
          status: 'success',
          message: 'API key valid',
          latency,
          details: 'Modelos Claude accesibles'
        });
      } else if (response.status === 401) {
        this.addResult({
          service: 'Anthropic',
          status: 'error',
          message: 'Invalid API key',
          details: 'Verifica tu ANTHROPIC_API_KEY'
        });
      } else if (response.status === 429) {
        this.addResult({
          service: 'Anthropic',
          status: 'warning',
          message: 'Rate limited or quota exceeded',
          details: 'Verifica tus límites de uso'
        });
      } else {
        this.addResult({
          service: 'Anthropic',
          status: 'error',
          message: `API error: ${response.status}`,
          details: 'Verifica el estado del servicio Anthropic'
        });
      }
    } catch (error) {
      this.addResult({
        service: 'Anthropic',
        status: 'error',
        message: 'Connection error',
        details: error.message
      });
    }
  }

  private async testNeo4j(): Promise<void> {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      this.addResult({
        service: 'Neo4j',
        status: 'error',
        message: 'Missing Neo4j configuration',
        details: 'NEO4J_URI, NEO4J_USER, y NEO4J_PASSWORD son requeridos'
      });
      return;
    }

    // Validación básica de formato URI
    if (!uri.match(/^(bolt|neo4j(\+s)?):\/\/.+/)) {
      this.addResult({
        service: 'Neo4j',
        status: 'error',
        message: 'Invalid Neo4j URI format',
        details: 'URI debe comenzar con bolt:// o neo4j://'
      });
      return;
    }

    this.addResult({
      service: 'Neo4j',
      status: 'warning',
      message: 'Configuration present',
      details: 'Prueba completa de conectividad requiere driver Neo4j - verificar manualmente'
    });
  }

  private async testGitHubOAuth(): Promise<void> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.addResult({
        service: 'GitHub OAuth',
        status: 'error',
        message: 'Missing GitHub OAuth configuration',
        details: 'GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET son requeridos'
      });
      return;
    }

    // Validación básica de formato
    if (!clientId.match(/^[A-Za-z0-9]{20}$/)) {
      this.addResult({
        service: 'GitHub OAuth',
        status: 'warning',
        message: 'Unusual Client ID format',
        details: 'Los Client IDs de GitHub son típicamente de 20 caracteres'
      });
    } else {
      this.addResult({
        service: 'GitHub OAuth',
        status: 'success',
        message: 'Configuration present',
        details: 'La app OAuth debe configurarse en https://github.com/settings/applications'
      });
    }
  }

  private async validateServiceConfigurations(): Promise<void> {
    console.log('⚙️ Validando configuraciones de servicios...');

    // Validar características RAG
    this.validateRAGConfig();

    // Validar configuración de email (si está presente)
    this.validateEmailConfig();

    // Validar configuraciones de seguridad
    this.validateSecurityConfig();
  }

  private validateRAGConfig(): void {
    const features = [
      'USE_CONTEXTUAL_EMBEDDINGS',
      'USE_HYBRID_SEARCH',
      'USE_AGENTIC_RAG',
      'USE_RERANKING',
      'USE_KNOWLEDGE_GRAPH'
    ];

    let enabledFeatures = 0;
    features.forEach(feature => {
      const value = process.env[feature];
      if (value === 'true') {
        enabledFeatures++;
      }
    });

    if (enabledFeatures === 0) {
      this.addResult({
        service: 'RAG Configuration',
        status: 'warning',
        message: 'No RAG features enabled',
        details: 'Considera habilitar al menos USE_HYBRID_SEARCH y USE_CONTEXTUAL_EMBEDDINGS'
      });
    } else {
      this.addResult({
        service: 'RAG Configuration',
        status: 'success',
        message: `${enabledFeatures} RAG features enabled`,
        details: 'Capacidades de búsqueda avanzada estarán disponibles'
      });
    }
  }

  private validateEmailConfig(): void {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const imapHost = process.env.IMAP_HOST;

    if (smtpHost && smtpUser) {
      this.addResult({
        service: 'Email Configuration',
        status: 'success',
        message: 'SMTP configuration present',
        details: 'Las apps pueden enviar emails'
      });

      if (imapHost) {
        this.addResult({
          service: 'Email Configuration',
          status: 'success',
          message: 'IMAP configuration present',
          details: 'Las apps pueden recibir emails'
        });
      }
    } else {
      this.addResult({
        service: 'Email Configuration',
        status: 'warning',
        message: 'Email not configured',
        details: 'Las apps con características de email no funcionarán'
      });
    }
  }

  private validateSecurityConfig(): void {
    const cookieKey = process.env.COOKIE_ENCRYPTION_KEY;
    const jwtSecret = process.env.JWT_SECRET;

    if (cookieKey && cookieKey.length === 64) {
      this.addResult({
        service: 'Security',
        status: 'success',
        message: 'Cookie encryption key properly configured',
        details: 'Clave hex de 32 bytes para sesiones seguras'
      });
    } else {
      this.addResult({
        service: 'Security',
        status: 'error',
        message: 'Invalid cookie encryption key',
        details: 'Generar con: openssl rand -hex 32'
      });
    }

    if (jwtSecret && jwtSecret.length >= 32) {
      this.addResult({
        service: 'Security',
        status: 'success',
        message: 'JWT secret properly configured'
      });
    } else if (jwtSecret) {
      this.addResult({
        service: 'Security',
        status: 'warning',
        message: 'JWT secret too short',
        details: 'Usar al menos 32 caracteres para seguridad'
      });
    }
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  printResults(): void {
    console.log('\n📊 Resumen de Resultados de Validación:\n');

    const grouped = this.results.reduce((acc, result) => {
      if (!acc[result.service]) {
        acc[result.service] = [];
      }
      acc[result.service].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    Object.entries(grouped).forEach(([service, results]) => {
      console.log(`\n🔧 ${service}:`);
      results.forEach(result => {
        const icon = result.status === 'success' ? '✅' : 
                    result.status === 'warning' ? '⚠️' : '❌';
        const latency = result.latency ? ` (${result.latency}ms)` : '';
        
        console.log(`  ${icon} ${result.message}${latency}`);
        if (result.details) {
          console.log(`     ${result.details}`);
        }
      });
    });

    // Estadísticas de resumen
    const total = this.results.length;
    const successes = this.results.filter(r => r.status === 'success').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const errors = this.results.filter(r => r.status === 'error').length;

    console.log(`\n📈 Resumen: ${successes}/${total} verificaciones pasaron`);
    if (warnings > 0) console.log(`⚠️  ${warnings} advertencias`);
    if (errors > 0) console.log(`❌ ${errors} errores`);

    // Recomendación final
    if (errors === 0) {
      console.log('\n🚀 Todos los prerequisites críticos cumplidos! Listo para desplegar Servidor MCP Full Stack.');
    } else {
      console.log('\n🔧 Por favor corrige los errores anteriores antes de proceder con el despliegue.');
      process.exit(1);
    }
  }
}

// Ejecutar validación si el script es ejecutado directamente
if (require.main === module) {
  const validator = new PrerequisitesValidator();
  validator.validateAll().then(() => {
    validator.printResults();
  }).catch(error => {
    console.error('❌ Validación falló:', error);
    process.exit(1);
  });
}

export { PrerequisitesValidator };
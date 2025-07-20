# Guía de Testing y Validación MCP

Estrategias específicas de testing para servidores MCP Full Stack, con patterns probados y validaciones automatizadas.

## Testing de Herramientas MCP

### **Pattern Base: Testing Herramienta MCP**

```typescript
// tests/tools/generate-component.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateComponent } from '@/src/tools/generate-component'

describe('MCP Tool: generateComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate React component with valid input', async () => {
    const input = {
      component_name: 'TestButton',
      component_type: 'interactive',
      props_schema: { onClick: 'function', disabled: 'boolean' }
    }

    const result = await generateComponent(input)

    expect(result.success).toBe(true)
    expect(result.component_name).toBe('TestButton')
    expect(result.files_generated).toHaveProperty('component')
    expect(result.files_generated).toHaveProperty('tests')
  })

  it('should handle invalid component names', async () => {
    const input = {
      component_name: 'invalidName', // should be PascalCase
      component_type: 'interactive'
    }

    const result = await generateComponent(input)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Component name must be PascalCase')
  })

  it('should use similar patterns from knowledge base', async () => {
    const mockSearch = vi.fn().mockResolvedValue([
      { content: 'example component code', score: 0.9 }
    ])
    
    vi.mock('@/src/utils', () => ({ search_code_examples: mockSearch }))

    const result = await generateComponent({
      component_name: 'Modal',
      component_type: 'interactive'
    })

    expect(mockSearch).toHaveBeenCalledWith(
      'React component interactive Modal',
      expect.objectContaining({ domain: 'frontend' })
    )
  })
})
```

### **Testing RAG Integration**

```typescript
// tests/knowledge/rag-search.test.ts
import { searchKnowledge } from '@/src/tools/search-knowledge'

describe('MCP Tool: searchKnowledge', () => {
  it('should return relevant results with high similarity', async () => {
    const result = await searchKnowledge({
      query: 'React component modal validation',
      domain: 'frontend',
      similarity_threshold: 0.7
    })

    expect(result.success).toBe(true)
    expect(result.results).toBeInstanceOf(Array)
    expect(result.results.every(r => r.relevance_score >= 0.7)).toBe(true)
  })

  it('should apply cross-encoder reranking', async () => {
    const result = await searchKnowledge({
      query: 'Next.js API authentication middleware',
      domain: 'backend',
      limit: 10
    })

    // Results should be ordered by relevance (reranked)
    const scores = result.results.map(r => r.relevance_score)
    const sortedScores = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sortedScores)
  })
})
```

## Testing Knowledge Graph

### **Neo4j Queries Testing**

```typescript
// tests/knowledge/neo4j-queries.test.ts
import { queryProjectGraph } from '@/src/tools/query-project-graph'

describe('MCP Tool: queryProjectGraph', () => {
  it('should find component dependencies', async () => {
    const result = await queryProjectGraph({
      query_type: 'dependencies',
      entity_name: 'UserModal',
      entity_type: 'component',
      depth: 2
    })

    expect(result.success).toBe(true)
    expect(result.results.nodes).toBeInstanceOf(Array)
    expect(result.insights).toBeInstanceOf(Array)
    expect(result.metadata.depth).toBe(2)
  })

  it('should generate architectural insights', async () => {
    const result = await queryProjectGraph({
      query_type: 'impacts',
      entity_name: 'UserService',
      entity_type: 'api'
    })

    expect(result.insights).toContain(
      expect.stringMatching(/affect.*components?/i)
    )
  })
})
```

## Testing Servidor MCP Completo

### **Integration Testing**

```typescript
// tests/integration/mcp-server.test.ts
import { FastMCP } from '@mcp/server/fastmcp'
import { createTestClient } from './test-utils'

describe('MCP Server Integration', () => {
  let client: TestMCPClient
  
  beforeAll(async () => {
    client = await createTestClient()
  })

  afterAll(async () => {
    await client.disconnect()
  })

  it('should list all available tools', async () => {
    const tools = await client.listTools()
    
    const expectedTools = [
      'generateComponent',
      'generateAPIEndpoint', 
      'generateDatabaseSchema',
      'searchKnowledge',
      'queryProjectGraph'
    ]

    expectedTools.forEach(tool => {
      expect(tools.map(t => t.name)).toContain(tool)
    })
  })

  it('should execute tool chain: search → generate → test', async () => {
    // 1. Search for similar patterns
    const searchResult = await client.callTool('searchKnowledge', {
      query: 'user authentication form',
      domain: 'frontend'
    })

    expect(searchResult.success).toBe(true)

    // 2. Generate component based on search
    const generateResult = await client.callTool('generateComponent', {
      component_name: 'LoginForm',
      component_type: 'form',
      examples: searchResult.results.slice(0, 3)
    })

    expect(generateResult.success).toBe(true)
    expect(generateResult.files_generated.component).toContain('LoginForm')

    // 3. Validate generated tests run
    expect(generateResult.files_generated.tests).toContain('LoginForm')
  })
})
```

### **End-to-End Testing con MCP Inspector**

```typescript
// tests/e2e/mcp-inspector.test.ts
import { spawn } from 'child_process'

describe('MCP Inspector Validation', () => {
  it('should pass MCP Inspector validation', async () => {
    const inspector = spawn('npx', [
      '@modelcontextprotocol/inspector',
      '--server-command', 
      'node dist/index.js'
    ])

    let output = ''
    inspector.stdout.on('data', (data) => {
      output += data.toString()
    })

    await new Promise(resolve => inspector.on('close', resolve))

    expect(output).toContain('✅ Server validation passed')
    expect(output).not.toContain('❌')
  })

  it('should validate all tool schemas', async () => {
    // Test que cada herramienta tiene esquema Zod válido
    const tools = await client.listTools()
    
    for (const tool of tools) {
      const schema = await client.getToolSchema(tool.name)
      expect(schema).toBeDefined()
      expect(schema.type).toBe('object')
      expect(schema.properties).toBeDefined()
    }
  })
})
```

## Performance Testing

### **Load Testing para Herramientas MCP**

```typescript
// tests/performance/load-testing.test.ts
describe('MCP Performance Testing', () => {
  it('should handle concurrent tool calls', async () => {
    const concurrentCalls = 10
    const startTime = Date.now()

    const promises = Array.from({ length: concurrentCalls }, () =>
      client.callTool('searchKnowledge', {
        query: 'React component',
        limit: 5
      })
    )

    const results = await Promise.all(promises)
    const endTime = Date.now()

    // All calls should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })

    // Performance should be acceptable
    const totalTime = endTime - startTime
    expect(totalTime).toBeLessThan(5000) // <5s for 10 concurrent calls
  })

  it('should maintain memory usage under load', async () => {
    const initialMemory = process.memoryUsage().heapUsed

    // Execute 100 tool calls
    for (let i = 0; i < 100; i++) {
      await client.callTool('generateComponent', {
        component_name: `TestComponent${i}`,
        component_type: 'display'
      })
    }

    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory

    // Memory increase should be reasonable (<100MB)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
  })
})
```

## Security Testing

### **Validation Input Security**

```typescript
// tests/security/input-validation.test.ts
describe('MCP Security Testing', () => {
  it('should prevent SQL injection in database tools', async () => {
    const maliciousInput = {
      sql: "SELECT * FROM users; DROP TABLE users; --"
    }

    const result = await client.callTool('queryDatabase', maliciousInput)

    expect(result.success).toBe(false)
    expect(result.error).toContain('SQL injection attempt detected')
  })

  it('should sanitize AI-generated content', async () => {
    const result = await client.callTool('generateComponent', {
      component_name: '<script>alert("xss")</script>',
      component_type: 'display'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid component name')
  })

  it('should enforce rate limiting', async () => {
    // Rapid fire requests
    const requests = Array.from({ length: 100 }, () =>
      client.callTool('searchKnowledge', { query: 'test' })
    )

    const results = await Promise.allSettled(requests)
    const rateLimited = results.filter(r => 
      r.status === 'rejected' || 
      (r.status === 'fulfilled' && r.value.error?.includes('rate limit'))
    )

    expect(rateLimited.length).toBeGreaterThan(0)
  })
})
```

## Test Utilities y Helpers

### **Test Client para MCP**

```typescript
// tests/utils/test-mcp-client.ts
export class TestMCPClient {
  private server: FastMCP

  constructor() {
    this.server = new FastMCP('Test MCP Server')
  }

  async connect() {
    // Setup test environment
    await this.server.start()
  }

  async disconnect() {
    await this.server.stop()
  }

  async callTool(name: string, params: any) {
    return await this.server.callTool(name, params)
  }

  async listTools() {
    return await this.server.listTools()
  }
}

export async function createTestClient(): Promise<TestMCPClient> {
  const client = new TestMCPClient()
  await client.connect()
  return client
}
```

### **Mock para Knowledge Base**

```typescript
// tests/mocks/knowledge-base.mock.ts
export const mockKnowledgeBase = {
  search_documents: vi.fn().mockResolvedValue([
    {
      content: 'React component example',
      relevance_score: 0.9,
      metadata: { domain: 'frontend', type: 'component' }
    }
  ]),

  search_code_examples: vi.fn().mockResolvedValue([
    {
      content: 'const Component = () => <div>Example</div>',
      similarity_score: 0.85,
      metadata: { framework: 'react', language: 'typescript' }
    }
  ])
}
```

## CI/CD Testing Pipeline

### **GitHub Actions para MCP**

```yaml
# .github/workflows/mcp-testing.yml
name: MCP Testing Pipeline
on: [push, pull_request]

jobs:
  test-mcp-tools:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests  
        run: npm run test:integration
        
      - name: MCP Inspector validation
        run: |
          npm run build
          npx @modelcontextprotocol/inspector --server dist/index.js
          
      - name: Performance testing
        run: npm run test:performance
        
      - name: Security scanning
        run: npm run test:security
```

## Métricas de Calidad

### **Coverage Requirements**
```yaml
jest.config.js:
  coverageThreshold:
    global:
      branches: 80
      functions: 85
      lines: 80
      statements: 80
    'src/tools/':
      functions: 95  # Herramientas MCP requieren mayor coverage
```

Esta guía asegura testing comprensivo y validación robusta para servidores MCP Full Stack.
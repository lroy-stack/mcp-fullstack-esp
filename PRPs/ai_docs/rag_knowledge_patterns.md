# Patrones RAG y Base de Conocimiento

Este documento define los patrones obligatorios para implementar sistemas RAG (Retrieval Augmented Generation) y gestión de base de conocimiento en el **Servidor MCP Full Stack Developer**.

## 🧠 Arquitectura RAG Obligatoria

### **Stack de Conocimiento**
```typescript
// Tecnologías OBLIGATORIAS para RAG
const RAG_STACK = {
  vectorDB: "Supabase + pgvector",           // Vector database
  embeddings: "OpenAI text-embedding-3-small", // Embedding generation  
  llm: "Anthropic Claude",                   // Primary LLM
  search: "Hybrid (vector + keyword)",       // Search strategy
  reranking: "Cross-encoder models",         // Result optimization
  crawling: "Crawl4AI",                      // Web crawling
  knowledgeGraph: "Neo4j + Graphiti MCP",    // Semantic relationships
} as const;
```

### **RAG Pipeline Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raw Content   │───▶│   Processing    │───▶│   Storage       │
│                 │    │                 │    │                 │
│ - Docs          │    │ - Chunking      │    │ - Vectors       │
│ - Code          │    │ - Embedding     │    │ - Metadata      │
│ - Web pages     │    │ - Metadata      │    │ - Graph         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   Response      │◀───│   Synthesis     │◀────────────┘
│                 │    │                 │    
│ - Generated     │    │ - Reranking     │    
│ - Contextualized│    │ - Augmentation  │    
│ - Verified      │    │ - Validation    │    
└─────────────────┘    └─────────────────┘    
```

## 🏗️ Supabase + pgvector Implementation

### **Database Schema**
```sql
-- Extensión vector obligatoria
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla principal de conocimiento
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contenido y metadatos
  content TEXT NOT NULL,
  title TEXT,
  url TEXT,
  source_type VARCHAR(50) NOT NULL, -- 'documentation', 'code', 'web', 'user_input'
  
  -- Embeddings
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  
  -- Metadatos estructurados
  metadata JSONB DEFAULT '{}',
  
  -- Campos de categorización
  domain VARCHAR(100), -- 'frontend', 'backend', 'fullstack', 'devops'
  technology VARCHAR(100), -- 'nextjs', 'supabase', 'prisma', etc.
  complexity VARCHAR(20) DEFAULT 'medium', -- 'beginner', 'medium', 'advanced'
  
  -- Control de versiones
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Índices de vector
  CONSTRAINT valid_source_type CHECK (source_type IN ('documentation', 'code', 'web', 'user_input')),
  CONSTRAINT valid_complexity CHECK (complexity IN ('beginner', 'medium', 'advanced'))
);

-- Índices obligatorios para performance
CREATE INDEX CONCURRENTLY idx_knowledge_base_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX CONCURRENTLY idx_knowledge_base_source_type ON knowledge_base(source_type);
CREATE INDEX CONCURRENTLY idx_knowledge_base_domain ON knowledge_base(domain);
CREATE INDEX CONCURRENTLY idx_knowledge_base_technology ON knowledge_base(technology);
CREATE INDEX CONCURRENTLY idx_knowledge_base_active ON knowledge_base(is_active) WHERE is_active = true;

-- Índice compuesto para búsquedas complejas
CREATE INDEX CONCURRENTLY idx_knowledge_base_complex_search 
ON knowledge_base(domain, technology, is_active, created_at DESC);
```

### **Hybrid Search Function**
```sql
-- Función obligatoria para búsqueda híbrida
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  domain_filter VARCHAR(100) DEFAULT NULL,
  technology_filter VARCHAR(100) DEFAULT NULL,
  match_count INT DEFAULT 10,
  rrf_k INT DEFAULT 60 -- Reciprocal Rank Fusion parameter
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  title TEXT,
  url TEXT,
  similarity FLOAT,
  rank_score FLOAT
) 
LANGUAGE sql
AS $$
WITH vector_search AS (
  SELECT 
    kb.id,
    kb.content,
    kb.title,
    kb.url,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    ROW_NUMBER() OVER (ORDER BY kb.embedding <=> query_embedding) AS rank
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND (domain_filter IS NULL OR kb.domain = domain_filter)
    AND (technology_filter IS NULL OR kb.technology = technology_filter)
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count * 2
),
keyword_search AS (
  SELECT 
    kb.id,
    kb.content,
    kb.title,
    kb.url,
    ts_rank_cd(to_tsvector('english', kb.content), plainto_tsquery('english', query_text)) AS rank_score,
    ROW_NUMBER() OVER (ORDER BY ts_rank_cd(to_tsvector('english', kb.content), plainto_tsquery('english', query_text)) DESC) AS rank
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND to_tsvector('english', kb.content) @@ plainto_tsquery('english', query_text)
    AND (domain_filter IS NULL OR kb.domain = domain_filter)
    AND (technology_filter IS NULL OR kb.technology = technology_filter)
  ORDER BY rank_score DESC
  LIMIT match_count * 2
),
rrf_scores AS (
  SELECT 
    COALESCE(vs.id, ks.id) AS id,
    COALESCE(vs.content, ks.content) AS content,
    COALESCE(vs.title, ks.title) AS title,
    COALESCE(vs.url, ks.url) AS url,
    COALESCE(vs.similarity, 0) AS similarity,
    (COALESCE(1.0 / (rrf_k + vs.rank), 0.0) + COALESCE(1.0 / (rrf_k + ks.rank), 0.0)) AS rank_score
  FROM vector_search vs
  FULL OUTER JOIN keyword_search ks ON vs.id = ks.id
)
SELECT 
  id,
  content,
  title,
  url,
  similarity,
  rank_score
FROM rrf_scores
ORDER BY rank_score DESC
LIMIT match_count;
$$;
```

## 🤖 RAG Implementation Patterns

### **1. Knowledge Ingestion Pattern**
```typescript
// Patrón obligatorio para ingesta de conocimiento
interface KnowledgeIngestionConfig {
  source: 'documentation' | 'code' | 'web' | 'user_input';
  domain: string;
  technology: string;
  chunkSize: number;
  chunkOverlap: number;
  metadata: Record<string, unknown>;
}

export class KnowledgeIngestor {
  constructor(
    private supabase: SupabaseClient,
    private openai: OpenAI
  ) {}

  async ingestContent(
    content: string,
    config: KnowledgeIngestionConfig
  ): Promise<{ success: boolean; chunks: number; errors: string[] }> {
    try {
      // 1. Validar contenido
      const validation = this.validateContent(content, config);
      if (!validation.isValid) {
        return { success: false, chunks: 0, errors: validation.errors };
      }

      // 2. Limpiar y procesar contenido
      const cleanedContent = this.cleanContent(content);
      
      // 3. Chunking inteligente
      const chunks = await this.intelligentChunking(cleanedContent, config);
      
      // 4. Generar embeddings en lotes
      const embeddings = await this.generateEmbeddings(chunks);
      
      // 5. Extraer metadatos adicionales
      const enrichedChunks = await this.enrichWithMetadata(chunks, embeddings, config);
      
      // 6. Almacenar en Supabase
      const { data, error } = await this.supabase
        .from('knowledge_base')
        .insert(enrichedChunks);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // 7. Actualizar knowledge graph si está habilitado
      if (process.env.USE_KNOWLEDGE_GRAPH === 'true') {
        await this.updateKnowledgeGraph(enrichedChunks);
      }

      return { 
        success: true, 
        chunks: chunks.length, 
        errors: [] 
      };

    } catch (error) {
      console.error('Knowledge ingestion error:', error);
      return { 
        success: false, 
        chunks: 0, 
        errors: [error.message] 
      };
    }
  }

  private validateContent(content: string, config: KnowledgeIngestionConfig) {
    const errors: string[] = [];
    
    if (!content || content.trim().length < 50) {
      errors.push('Content too short (minimum 50 characters)');
    }
    
    if (content.length > 1000000) {
      errors.push('Content too long (maximum 1MB)');
    }
    
    if (!config.domain || !config.technology) {
      errors.push('Domain and technology are required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private cleanContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .replace(/\s+/g, ' ')  // Normalize spaces
      .trim();
  }

  private async intelligentChunking(
    content: string, 
    config: KnowledgeIngestionConfig
  ): Promise<Array<{ content: string; metadata: Record<string, unknown> }>> {
    // Implementar chunking inteligente basado en tipo de contenido
    switch (config.source) {
      case 'code':
        return this.chunkCode(content, config);
      case 'documentation':
        return this.chunkDocumentation(content, config);
      case 'web':
        return this.chunkWebContent(content, config);
      default:
        return this.chunkGeneric(content, config);
    }
  }

  private async generateEmbeddings(
    chunks: Array<{ content: string; metadata: Record<string, unknown> }>
  ): Promise<number[][]> {
    const batchSize = 100;
    const embeddings: number[][] = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(chunk => chunk.content),
        encoding_format: 'float'
      });
      
      embeddings.push(...response.data.map(item => item.embedding));
      
      // Rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return embeddings;
  }

  private async enrichWithMetadata(
    chunks: Array<{ content: string; metadata: Record<string, unknown> }>,
    embeddings: number[][],
    config: KnowledgeIngestionConfig
  ) {
    return chunks.map((chunk, index) => ({
      content: chunk.content,
      embedding: embeddings[index],
      source_type: config.source,
      domain: config.domain,
      technology: config.technology,
      metadata: {
        ...chunk.metadata,
        ...config.metadata,
        ingestion_date: new Date().toISOString(),
        chunk_index: index,
        total_chunks: chunks.length
      }
    }));
  }
}
```

### **2. RAG Search Pattern**
```typescript
// Patrón obligatorio para búsqueda RAG
interface RAGSearchConfig {
  query: string;
  domain?: string;
  technology?: string;
  maxResults: number;
  useReranking: boolean;
  contextualPrompt?: string;
}

export class RAGSearchEngine {
  constructor(
    private supabase: SupabaseClient,
    private openai: OpenAI,
    private claude: AnthropicClient
  ) {}

  async search(config: RAGSearchConfig): Promise<{
    results: SearchResult[];
    context: string;
    confidence: number;
  }> {
    try {
      // 1. Generar embedding para la query
      const queryEmbedding = await this.generateQueryEmbedding(config.query);
      
      // 2. Búsqueda híbrida en Supabase
      const searchResults = await this.hybridSearch(queryEmbedding, config);
      
      // 3. Reranking si está habilitado
      const rerankedResults = config.useReranking 
        ? await this.rerankResults(config.query, searchResults)
        : searchResults;
      
      // 4. Generar contexto optimizado
      const context = this.buildContext(rerankedResults, config);
      
      // 5. Calcular score de confianza
      const confidence = this.calculateConfidence(rerankedResults);
      
      return {
        results: rerankedResults.slice(0, config.maxResults),
        context,
        confidence
      };

    } catch (error) {
      console.error('RAG search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  }

  private async hybridSearch(
    queryEmbedding: number[], 
    config: RAGSearchConfig
  ): Promise<SearchResult[]> {
    const { data, error } = await this.supabase.rpc('hybrid_search', {
      query_text: config.query,
      query_embedding: queryEmbedding,
      domain_filter: config.domain || null,
      technology_filter: config.technology || null,
      match_count: config.maxResults * 2, // Get more results for reranking
      rrf_k: 60
    });

    if (error) {
      throw new Error(`Hybrid search error: ${error.message}`);
    }

    return data.map(row => ({
      id: row.id,
      content: row.content,
      title: row.title || '',
      url: row.url || '',
      similarity: row.similarity,
      rank_score: row.rank_score
    }));
  }

  private async rerankResults(
    query: string, 
    results: SearchResult[]
  ): Promise<SearchResult[]> {
    // Implementar reranking con cross-encoder
    const pairs = results.map(result => [query, result.content]);
    
    // Usar Claude para reranking inteligente
    const prompt = `
Rerank these search results based on relevance to the query: "${query}"

Results:
${results.map((r, i) => `${i + 1}. ${r.content.substring(0, 200)}...`).join('\n')}

Return only the ranking numbers in order of relevance (most relevant first):
`;

    const response = await this.claude.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse ranking and reorder results
    const ranking = this.parseRanking(response.content[0].text);
    return ranking.map(index => results[index - 1]).filter(Boolean);
  }

  private buildContext(
    results: SearchResult[], 
    config: RAGSearchConfig
  ): string {
    const context = results
      .slice(0, 5) // Top 5 results for context
      .map((result, index) => `
## Context ${index + 1}: ${result.title || 'Untitled'}
${result.url ? `Source: ${result.url}` : ''}
Relevance: ${(result.similarity * 100).toFixed(1)}%

${result.content}
`)
      .join('\n---\n');

    return config.contextualPrompt 
      ? `${config.contextualPrompt}\n\n${context}`
      : context;
  }

  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;
    
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const topResultSimilarity = results[0]?.similarity || 0;
    
    // Confidence based on top result quality and result consistency
    return Math.min(100, (topResultSimilarity * 0.7 + avgSimilarity * 0.3) * 100);
  }
}
```

### **3. Contextual Embeddings Pattern**
```typescript
// Patrón para embeddings contextuales mejorados
export class ContextualEmbeddingGenerator {
  constructor(
    private openai: OpenAI,
    private claude: AnthropicClient
  ) {}

  async generateContextualEmbedding(
    content: string,
    context: {
      domain: string;
      technology: string;
      documentType: string;
      surrounding?: string;
    }
  ): Promise<number[]> {
    // 1. Generar contexto enriquecido
    const contextualPrompt = this.buildContextualPrompt(content, context);
    
    // 2. Usar Claude para generar descripción contextual
    const contextualDescription = await this.generateContextualDescription(
      content, 
      contextualPrompt
    );
    
    // 3. Combinar contenido original con descripción contextual
    const enhancedContent = `${content}\n\nContext: ${contextualDescription}`;
    
    // 4. Generar embedding del contenido enriquecido
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: enhancedContent,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  }

  private buildContextualPrompt(
    content: string,
    context: {
      domain: string;
      technology: string;
      documentType: string;
      surrounding?: string;
    }
  ): string {
    return `
Analyze this ${context.documentType} content related to ${context.technology} in the ${context.domain} domain.

Content: "${content.substring(0, 500)}..."

${context.surrounding ? `Surrounding context: ${context.surrounding}` : ''}

Provide a brief technical summary focusing on:
1. Key concepts and technologies mentioned
2. Implementation patterns or practices
3. Relationships to other technologies
4. Use cases and applications

Keep the summary concise (max 100 words):
`;
  }

  private async generateContextualDescription(
    content: string,
    prompt: string
  ): Promise<string> {
    const response = await this.claude.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text.trim();
  }
}
```

## 🕸️ Knowledge Graph Integration

### **Neo4j Schema Pattern**
```cypher
// Esquema obligatorio para Knowledge Graph
CREATE CONSTRAINT unique_concept IF NOT EXISTS 
FOR (c:Concept) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT unique_code_element IF NOT EXISTS 
FOR (ce:CodeElement) REQUIRE ce.id IS UNIQUE;

CREATE CONSTRAINT unique_document IF NOT EXISTS 
FOR (d:Document) REQUIRE d.id IS UNIQUE;

// Nodos principales
CREATE (c:Concept {
  id: "concept-id",
  name: "Concept Name",
  domain: "frontend|backend|fullstack",
  technology: "nextjs|supabase|etc",
  description: "Concept description",
  complexity: "beginner|medium|advanced",
  created_at: datetime(),
  updated_at: datetime()
});

// Relaciones semánticas
CREATE (c1:Concept)-[:RELATED_TO {strength: 0.8, type: "implementation"}]->(c2:Concept);
CREATE (c:Concept)-[:IMPLEMENTS]->(pattern:Pattern);
CREATE (c:Concept)-[:DEPENDS_ON]->(dependency:Concept);
CREATE (c:Concept)-[:USED_IN]->(usecase:UseCase);
```

### **Graph Operations Pattern**
```typescript
// Patrón para operaciones de Knowledge Graph
export class KnowledgeGraphManager {
  constructor(private neo4j: Driver) {}

  async addConceptRelationship(
    concept1: string,
    concept2: string,
    relationshipType: string,
    strength: number
  ): Promise<void> {
    const session = this.neo4j.session();
    
    try {
      await session.run(`
        MATCH (c1:Concept {id: $concept1})
        MATCH (c2:Concept {id: $concept2})
        MERGE (c1)-[r:RELATED_TO {type: $type}]->(c2)
        SET r.strength = $strength, r.updated_at = datetime()
      `, {
        concept1,
        concept2,
        type: relationshipType,
        strength
      });
    } finally {
      await session.close();
    }
  }

  async findRelatedConcepts(
    conceptId: string,
    maxDepth: number = 2
  ): Promise<Array<{ concept: string; path: string[]; strength: number }>> {
    const session = this.neo4j.session();
    
    try {
      const result = await session.run(`
        MATCH path = (start:Concept {id: $conceptId})-[*1..$maxDepth]-(related:Concept)
        RETURN related.id as concept, 
               [n in nodes(path) | n.id] as path,
               reduce(s = 1.0, r in relationships(path) | s * coalesce(r.strength, 0.5)) as strength
        ORDER BY strength DESC
        LIMIT 20
      `, { conceptId, maxDepth });
      
      return result.records.map(record => ({
        concept: record.get('concept'),
        path: record.get('path'),
        strength: record.get('strength')
      }));
    } finally {
      await session.close();
    }
  }
}
```

## 🎯 Performance Patterns

### **Caching Strategy**
```typescript
// Sistema de caché obligatorio para RAG
export class RAGCacheManager {
  constructor(
    private redis: Redis,
    private ttl: number = 3600 // 1 hour default
  ) {}

  async getCachedEmbedding(content: string): Promise<number[] | null> {
    const key = `embedding:${this.hashContent(content)}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setCachedEmbedding(content: string, embedding: number[]): Promise<void> {
    const key = `embedding:${this.hashContent(content)}`;
    await this.redis.setex(key, this.ttl, JSON.stringify(embedding));
  }

  async getCachedSearchResults(
    query: string,
    filters: Record<string, unknown>
  ): Promise<SearchResult[] | null> {
    const key = `search:${this.hashQuery(query, filters)}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private hashContent(content: string): string {
    return require('crypto')
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }

  private hashQuery(query: string, filters: Record<string, unknown>): string {
    const combined = JSON.stringify({ query, filters });
    return require('crypto')
      .createHash('sha256')
      .update(combined)
      .digest('hex')
      .substring(0, 16);
  }
}
```

## 📊 Monitoring & Analytics

### **RAG Performance Metrics**
```typescript
// Métricas obligatorias para monitoreo RAG
interface RAGMetrics {
  searchLatency: number;
  embeddingLatency: number;
  relevanceScore: number;
  userSatisfaction: number;
  cacheHitRate: number;
  errorRate: number;
}

export class RAGAnalytics {
  async trackSearch(
    query: string,
    results: SearchResult[],
    latency: number,
    userId?: string
  ): Promise<void> {
    const metrics = {
      timestamp: new Date(),
      query,
      resultCount: results.length,
      avgRelevance: results.reduce((sum, r) => sum + r.similarity, 0) / results.length,
      latency,
      userId
    };

    // Enviar a sistema de analytics
    await this.sendMetrics('rag_search', metrics);
  }

  async trackIngestion(
    source: string,
    chunks: number,
    duration: number,
    success: boolean
  ): Promise<void> {
    const metrics = {
      timestamp: new Date(),
      source,
      chunks,
      duration,
      success
    };

    await this.sendMetrics('rag_ingestion', metrics);
  }
}
```

---

**Estos patrones RAG son OBLIGATORIOS para garantizar un sistema de conocimiento eficiente, escalable y confiable en el Servidor MCP Full Stack Developer.**
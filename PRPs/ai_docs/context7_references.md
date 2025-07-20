# Referencias Técnicas Context7 Actualizadas

Este documento proporciona las referencias técnicas más actualizadas para las tecnologías del stack **Servidor MCP Full Stack Developer**, organizadas según la metodología **Context7** para máxima eficiencia.

## 🏗️ Next.js 14+ References

### **App Router & Server Components**
```typescript
// Referencias oficiales actualizadas (2024)
const NEXTJS_REFERENCES = {
  official: {
    docs: "https://nextjs.org/docs", // Documentación principal
    appRouter: "https://nextjs.org/docs/app", // App Router guide
    serverComponents: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
    clientComponents: "https://nextjs.org/docs/app/building-your-application/rendering/client-components"
  },
  
  patterns: {
    layout: "https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts",
    loading: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming",
    error: "https://nextjs.org/docs/app/building-your-application/routing/error-handling",
    notFound: "https://nextjs.org/docs/app/api-reference/file-conventions/not-found"
  },
  
  api: {
    routes: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
    serverActions: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations",
    middleware: "https://nextjs.org/docs/app/building-your-application/routing/middleware"
  },
  
  optimization: {
    images: "https://nextjs.org/docs/app/building-your-application/optimizing/images",
    fonts: "https://nextjs.org/docs/app/building-your-application/optimizing/fonts",
    scripts: "https://nextjs.org/docs/app/building-your-application/optimizing/scripts",
    bundleAnalyzer: "https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer"
  },
  
  deployment: {
    vercel: "https://nextjs.org/docs/app/building-your-application/deploying",
    static: "https://nextjs.org/docs/app/building-your-application/deploying/static-exports",
    docker: "https://nextjs.org/docs/app/building-your-application/deploying/docker-image"
  }
} as const;
```

### **TypeScript 5+ Integration**
```typescript
// Referencias TypeScript para Next.js
const TYPESCRIPT_NEXTJS_REFERENCES = {
  setup: "https://nextjs.org/docs/app/building-your-application/configuring/typescript",
  config: "https://nextjs.org/docs/app/api-reference/config-files/typescript-config",
  types: {
    app: "https://nextjs.org/docs/app/building-your-application/configuring/typescript#typescript-plugin",
    metadata: "https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-object",
    params: "https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional",
    searchParams: "https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional"
  },
  
  patterns: {
    serverComponents: "https://nextjs.org/docs/app/building-your-application/rendering/server-components#typescript",
    serverActions: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#typescript",
    apiRoutes: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers#typescript"
  }
} as const;

// Ejemplo de configuración TypeScript obligatoria
const TYPESCRIPT_CONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
```

## 🗄️ Supabase References

### **Core Supabase Integration**
```typescript
const SUPABASE_REFERENCES = {
  official: {
    docs: "https://supabase.com/docs",
    javascript: "https://supabase.com/docs/reference/javascript",
    nextjs: "https://supabase.com/docs/guides/getting-started/quickstarts/nextjs",
    typescript: "https://supabase.com/docs/guides/api/rest/generating-types"
  },
  
  auth: {
    overview: "https://supabase.com/docs/guides/auth",
    nextjsAuth: "https://supabase.com/docs/guides/auth/server-side/nextjs",
    oauth: "https://supabase.com/docs/guides/auth/social-login",
    rls: "https://supabase.com/docs/guides/auth/row-level-security",
    policies: "https://supabase.com/docs/guides/auth/row-level-security#policies"
  },
  
  database: {
    introduction: "https://supabase.com/docs/guides/database",
    tables: "https://supabase.com/docs/guides/database/tables",
    functions: "https://supabase.com/docs/guides/database/functions",
    triggers: "https://supabase.com/docs/guides/database/triggers",
    extensions: "https://supabase.com/docs/guides/database/extensions"
  },
  
  vector: {
    overview: "https://supabase.com/docs/guides/ai/vector-embeddings",
    pgvector: "https://supabase.com/docs/guides/ai/vector-embeddings/pgvector",
    similarity: "https://supabase.com/docs/guides/ai/vector-embeddings/similarity-search",
    hybrid: "https://supabase.com/blog/hybrid-search"
  },
  
  realtime: {
    overview: "https://supabase.com/docs/guides/realtime",
    postgres: "https://supabase.com/docs/guides/realtime/postgres-changes",
    presence: "https://supabase.com/docs/guides/realtime/presence",
    broadcast: "https://supabase.com/docs/guides/realtime/broadcast"
  },
  
  storage: {
    overview: "https://supabase.com/docs/guides/storage",
    buckets: "https://supabase.com/docs/guides/storage/buckets",
    uploads: "https://supabase.com/docs/guides/storage/uploads",
    security: "https://supabase.com/docs/guides/storage/security"
  }
} as const;

// Configuración cliente Supabase obligatoria
const SUPABASE_CLIENT_CONFIG = `
// lib/supabase.ts - Cliente para Server Components
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

// lib/supabase-browser.ts - Cliente para Client Components  
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
`;
```

### **PostgreSQL + pgvector References**
```sql
-- Referencias SQL esenciales para pgvector
-- Fuente: https://github.com/pgvector/pgvector

-- Extensión obligatoria
CREATE EXTENSION IF NOT EXISTS vector;

-- Tipos de índices soportados (referencias actualizadas)
-- IVFFlat: https://github.com/pgvector/pgvector#ivfflat
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- HNSW (recomendado para producción): https://github.com/pgvector/pgvector#hnsw  
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Funciones de distancia actualizadas
-- Documentación: https://github.com/pgvector/pgvector#distance-functions
/*
<-> = L2/Euclidean distance
<#> = Negative inner product  
<=> = Cosine distance (recomendado para embeddings)
*/
```

## 🎨 UI Framework References

### **Tailwind CSS + Shadcn/ui**
```typescript
const UI_FRAMEWORK_REFERENCES = {
  tailwind: {
    docs: "https://tailwindcss.com/docs",
    nextjs: "https://tailwindcss.com/docs/guides/nextjs",
    config: "https://tailwindcss.com/docs/configuration",
    customization: "https://tailwindcss.com/docs/theme",
    darkMode: "https://tailwindcss.com/docs/dark-mode"
  },
  
  shadcn: {
    docs: "https://ui.shadcn.com/docs",
    installation: "https://ui.shadcn.com/docs/installation/next",
    components: "https://ui.shadcn.com/docs/components",
    themes: "https://ui.shadcn.com/docs/theming",
    customization: "https://ui.shadcn.com/docs/components-json"
  },
  
  radixUI: {
    docs: "https://www.radix-ui.com/primitives",
    accessibility: "https://www.radix-ui.com/primitives/docs/overview/accessibility",
    styling: "https://www.radix-ui.com/primitives/docs/guides/styling",
    composition: "https://www.radix-ui.com/primitives/docs/guides/composition"
  },
  
  icons: {
    lucide: "https://lucide.dev/icons/",
    usage: "https://lucide.dev/guide/packages/lucide-react",
    customization: "https://lucide.dev/guide/advanced/icon-customization"
  }
} as const;

// Configuración Tailwind obligatoria
const TAILWIND_CONFIG = `
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
`;
```

## 🗃️ Database & ORM References

### **Prisma Integration**
```typescript
const PRISMA_REFERENCES = {
  docs: "https://www.prisma.io/docs",
  nextjs: "https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices",
  supabase: "https://www.prisma.io/docs/orm/overview/databases/supabase",
  
  schema: {
    models: "https://www.prisma.io/docs/orm/prisma-schema/data-model/models",
    relations: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations",
    attributes: "https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-attributes"
  },
  
  client: {
    crud: "https://www.prisma.io/docs/orm/prisma-client/queries/crud",
    transactions: "https://www.prisma.io/docs/orm/prisma-client/queries/transactions",
    middleware: "https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware"
  },
  
  migrations: {
    overview: "https://www.prisma.io/docs/orm/prisma-migrate",
    deploy: "https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploying-database-changes",
    troubleshooting: "https://www.prisma.io/docs/orm/prisma-migrate/workflows/troubleshooting"
  },
  
  optimization: {
    connection: "https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections",
    pooling: "https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool",
    best: "https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices"
  }
} as const;

// Schema de ejemplo obligatorio
const PRISMA_SCHEMA_EXAMPLE = `
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  
  // Relaciones
  posts     Post[]
  profile   Profile?
  
  // Índices
  @@index([email])
  @@index([createdAt])
  @@map("users")
}

enum UserRole {
  USER
  STAFF
  ADMIN
}
`;
```

## 🧪 Testing References

### **Jest + React Testing Library**
```typescript
const TESTING_REFERENCES = {
  jest: {
    docs: "https://jestjs.io/docs/getting-started",
    nextjs: "https://nextjs.org/docs/app/building-your-application/testing/jest",
    config: "https://jestjs.io/docs/configuration"
  },
  
  rtl: {
    docs: "https://testing-library.com/docs/react-testing-library/intro",
    queries: "https://testing-library.com/docs/queries/about",
    userEvents: "https://testing-library.com/docs/user-event/intro",
    best: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library"
  },
  
  e2e: {
    playwright: "https://playwright.dev/docs/intro",
    nextjs: "https://nextjs.org/docs/app/building-your-application/testing/playwright"
  },
  
  api: {
    supertest: "https://github.com/ladjs/supertest",
    msw: "https://mswjs.io/docs/getting-started"
  },
  
  accessibility: {
    axe: "https://github.com/nickcolley/jest-axe",
    testing: "https://testing-library.com/docs/dom-testing-library/api-accessibility"
  }
} as const;

// Configuración Jest obligatoria
const JEST_CONFIG = `
// jest.config.js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
`;
```

## 🤖 AI & MCP References

### **Anthropic Claude API**
```typescript
const AI_REFERENCES = {
  anthropic: {
    docs: "https://docs.anthropic.com/en/api/getting-started",
    messages: "https://docs.anthropic.com/en/api/messages",
    pricing: "https://www.anthropic.com/pricing#anthropic-api",
    limits: "https://docs.anthropic.com/en/api/rate-limits"
  },
  
  openai: {
    docs: "https://platform.openai.com/docs/introduction",
    embeddings: "https://platform.openai.com/docs/guides/embeddings",
    models: "https://platform.openai.com/docs/models",
    pricing: "https://openai.com/pricing"
  },
  
  mcp: {
    docs: "https://modelcontextprotocol.io/docs",
    python: "https://modelcontextprotocol.io/python/",
    typescript: "https://modelcontextprotocol.io/typescript/",
    quickstart: "https://modelcontextprotocol.io/quickstart/"
  },
  
  crawl4ai: {
    docs: "https://crawl4ai.com/",
    github: "https://github.com/unclecode/crawl4ai",
    python: "https://crawl4ai.com/python/",
    examples: "https://github.com/unclecode/crawl4ai/tree/main/examples"
  }
} as const;

// Configuración Anthropic obligatoria
const ANTHROPIC_CONFIG = `
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Configuración recomendada para PRPs
export const DEFAULT_CLAUDE_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  temperature: 0.1, // Baja para consistencia
  top_p: 0.9,
} as const;
`;
```

## 🚀 Deployment References

### **Vercel Deployment**
```typescript
const DEPLOYMENT_REFERENCES = {
  vercel: {
    docs: "https://vercel.com/docs",
    nextjs: "https://vercel.com/docs/frameworks/nextjs",
    env: "https://vercel.com/docs/projects/environment-variables",
    domains: "https://vercel.com/docs/projects/domains"
  },
  
  supabase: {
    deployment: "https://supabase.com/docs/guides/platform/deployments",
    branching: "https://supabase.com/docs/guides/platform/branching",
    migration: "https://supabase.com/docs/guides/cli/local-development#database-migrations"
  },
  
  docker: {
    nextjs: "https://nextjs.org/docs/app/building-your-application/deploying/docker-image",
    multistage: "https://docs.docker.com/build/building/multi-stage/",
    optimization: "https://docs.docker.com/build/building/best-practices/"
  },
  
  monitoring: {
    vercel: "https://vercel.com/docs/observability/analytics-overview",
    sentry: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
    datadog: "https://docs.datadoghq.com/integrations/vercel/"
  }
} as const;

// Configuración Vercel obligatoria
const VERCEL_CONFIG = `
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
`;
```

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```typescript
const MONITORING_REFERENCES = {
  lighthouse: {
    docs: "https://developer.chrome.com/docs/lighthouse/overview/",
    ci: "https://github.com/GoogleChrome/lighthouse-ci",
    scoring: "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/"
  },
  
  webVitals: {
    overview: "https://web.dev/vitals/",
    nextjs: "https://nextjs.org/docs/app/building-your-application/optimizing/analytics",
    measurement: "https://web.dev/measure/"
  },
  
  analytics: {
    vercel: "https://vercel.com/docs/analytics",
    ga4: "https://developers.google.com/analytics/devguides/collection/ga4",
    plausible: "https://plausible.io/docs"
  },
  
  errors: {
    sentry: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
    bugsnag: "https://docs.bugsnag.com/platforms/javascript/nextjs/",
    rollbar: "https://docs.rollbar.com/docs/nextjs"
  }
} as const;

// Configuración de Web Vitals obligatoria
const WEB_VITALS_CONFIG = `
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
`;
```

## 🔒 Security References

### **Security Best Practices**
```typescript
const SECURITY_REFERENCES = {
  nextjs: {
    security: "https://nextjs.org/docs/app/building-your-application/authentication",
    headers: "https://nextjs.org/docs/app/api-reference/config-files/next-config-js/headers",
    csp: "https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy"
  },
  
  supabase: {
    rls: "https://supabase.com/docs/guides/auth/row-level-security",
    policies: "https://supabase.com/docs/guides/auth/row-level-security#policies",
    security: "https://supabase.com/docs/guides/database/security"
  },
  
  owasp: {
    top10: "https://owasp.org/www-project-top-ten/",
    nextjs: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/",
    cheatsheet: "https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html"
  },
  
  auth: {
    nextAuth: "https://authjs.dev/getting-started",
    supabaseAuth: "https://supabase.com/docs/guides/auth/server-side/nextjs",
    jwt: "https://jwt.io/introduction"
  }
} as const;

// Configuración de seguridad obligatoria
const SECURITY_CONFIG = `
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP header
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
`;
```

## 🎯 Context7 Quick Reference

### **Referencias por Contexto de Uso**
```typescript
// Organización Context7 para máxima eficiencia
const CONTEXT7_QUICK_REF = {
  // C1: Component Creation
  componentCreation: {
    primary: NEXTJS_REFERENCES.patterns,
    ui: UI_FRAMEWORK_REFERENCES.shadcn,
    typescript: TYPESCRIPT_NEXTJS_REFERENCES.types
  },
  
  // C2: Database Operations  
  databaseOps: {
    primary: SUPABASE_REFERENCES.database,
    orm: PRISMA_REFERENCES.client,
    vector: SUPABASE_REFERENCES.vector
  },
  
  // C3: API Development
  apiDev: {
    primary: NEXTJS_REFERENCES.api,
    auth: SUPABASE_REFERENCES.auth,
    validation: PRISMA_REFERENCES.schema
  },
  
  // C4: Testing & Quality
  testing: {
    primary: TESTING_REFERENCES.rtl,
    e2e: TESTING_REFERENCES.e2e,
    accessibility: TESTING_REFERENCES.accessibility
  },
  
  // C5: Performance & Optimization
  performance: {
    primary: NEXTJS_REFERENCES.optimization,
    monitoring: MONITORING_REFERENCES.webVitals,
    database: PRISMA_REFERENCES.optimization
  },
  
  // C6: Security & Auth
  security: {
    primary: SECURITY_REFERENCES.supabase,
    headers: SECURITY_REFERENCES.nextjs.headers,
    owasp: SECURITY_REFERENCES.owasp
  },
  
  // C7: Deployment & Production
  deployment: {
    primary: DEPLOYMENT_REFERENCES.vercel,
    database: DEPLOYMENT_REFERENCES.supabase,
    monitoring: MONITORING_REFERENCES.analytics
  }
} as const;
```

---

**Estas referencias son las ÚNICAS fuentes autorizadas para desarrollo. Usar siempre las versiones más actualizadas y seguir los patrones documentados aquí.**
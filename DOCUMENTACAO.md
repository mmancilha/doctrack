# DocTrack - Documentação Técnica Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Modelo de Dados](#modelo-de-dados)
6. [Fluxo de Autenticação](#fluxo-de-autenticação)
7. [API REST](#api-rest)
8. [Componentes Frontend](#componentes-frontend)
9. [Regras de Proteção](#regras-de-proteção)
10. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
11. [Build e Deploy](#build-e-deploy)

---

## Visão Geral

**DocTrack** é um sistema de gerenciamento de documentação técnica interna que oferece:

- ✏️ Editor de texto rico (estilo Notion/Google Docs)
- 📝 Controle de versão automático
- 🔍 Comparação visual de diferenças entre versões
- 📄 Exportação para PDF
- 💬 Sistema de comentários em documentos
- 🔐 Autenticação com controle de acesso baseado em roles
- 📊 Dashboard com estatísticas
- 🔎 Busca e filtros avançados
- 📋 Categorias: Manuais, Checklists e Guias

---

## Arquitetura do Sistema

### Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Client["Frontend (React + Vite)"]
        UI[Componentes UI]
        Pages[Páginas]
        Hooks[Hooks Customizados]
        Query[TanStack Query]
    end

    subgraph Server["Backend (Express + Node.js)"]
        Routes[Rotas API]
        Auth[Autenticação Passport]
        Storage[Interface Storage]
        DB[Database Storage]
    end

    subgraph Database["PostgreSQL"]
        Tables[(Tabelas)]
    end

    subgraph Shared["Código Compartilhado"]
        Schema[Schema Drizzle + Zod]
    end

    Client -->|HTTP/REST| Server
    Server -->|Drizzle ORM| Database
    Server -->|Importa| Shared
    Client -->|Importa| Shared
    Storage -->|Implementa| DB
    Routes -->|Usa| Storage
    Routes -->|Protege| Auth
    Query -->|Fetch| Routes
```

### Padrões Arquiteturais

1. **Separação de Responsabilidades**

   - Frontend: React com componentes modulares
   - Backend: Express com rotas RESTful
   - Shared: Schema e tipos compartilhados

2. **Abstração de Storage**

   - Interface `IStorage` permite trocar implementações
   - Atualmente: `DatabaseStorage` com PostgreSQL
   - Suporta futuras implementações (ex: MemStorage para testes)

3. **Validação em Camadas**

   - Zod para validação de schemas
   - Drizzle-Zod para validação de inserções
   - Validação no backend antes de persistir

4. **Autenticação Baseada em Sessão**
   - Passport.js com estratégia Local
   - Sessões armazenadas no PostgreSQL
   - Middleware de autorização por role

---

## Estrutura de Diretórios

```
DocTrack/
├── client/                    # Frontend React
│   ├── index.html            # HTML principal
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── App.tsx           # Componente raiz e roteamento
│       ├── main.tsx          # Entry point
│       ├── index.css         # Estilos globais
│       ├── components/       # Componentes React
│       │   ├── ui/           # Componentes shadcn/ui
│       │   ├── app-sidebar.tsx
│       │   ├── command-palette.tsx
│       │   ├── document-card.tsx
│       │   ├── rich-text-editor.tsx
│       │   └── ...
│       ├── pages/            # Páginas/rotas
│       │   ├── dashboard.tsx
│       │   ├── documents.tsx
│       │   ├── document-editor.tsx
│       │   ├── login.tsx
│       │   └── ...
│       ├── hooks/            # Custom hooks
│       └── lib/              # Utilitários e configurações
│           ├── auth.tsx     # Context de autenticação
│           ├── queryClient.ts
│           ├── constants.ts
│           └── utils.ts
│
├── server/                    # Backend Express
│   ├── index.ts              # Entry point do servidor
│   ├── routes.ts             # Definição de rotas API
│   ├── auth.ts               # Configuração Passport e middlewares
│   ├── db.ts                 # Configuração Drizzle + PostgreSQL
│   ├── storage.ts             # Implementação DatabaseStorage
│   ├── static.ts             # Servir assets em produção
│   └── vite.ts                # Setup Vite dev server
│
├── shared/                    # Código compartilhado
│   └── schema.ts             # Schemas Drizzle + Zod + Types
│
├── script/                    # Scripts de build
│   └── build.ts              # Script de build para produção
│
├── attached_assets/           # Assets anexados (ex: textos)
│
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── vite.config.ts             # Configuração Vite
├── drizzle.config.ts          # Configuração Drizzle Kit
├── tailwind.config.ts         # Configuração Tailwind CSS
├── components.json            # Configuração shadcn/ui
├── design_guidelines.md       # Guia de design
└── replit.md                  # Documentação específica Replit
```

---

## Stack Tecnológico

### Frontend

| Tecnologia     | Versão   | Uso                              |
| -------------- | -------- | -------------------------------- |
| React          | ^18.3.1  | Framework UI                     |
| Vite           | ^5.4.20  | Build tool e dev server          |
| Wouter         | ^3.3.5   | Roteamento cliente               |
| TanStack Query | ^5.60.5  | Gerenciamento de estado servidor |
| TipTap         | ^3.13.0  | Editor de texto rico             |
| shadcn/ui      | -        | Biblioteca de componentes        |
| Tailwind CSS   | ^3.4.17  | Estilização                      |
| Framer Motion  | ^11.18.2 | Animações                        |
| Lucide React   | ^0.453.0 | Ícones                           |

### Backend

| Tecnologia        | Versão  | Uso                         |
| ----------------- | ------- | --------------------------- |
| Express           | ^4.21.2 | Framework web               |
| Node.js           | -       | Runtime                     |
| Passport.js       | ^0.7.0  | Autenticação                |
| express-session   | ^1.18.1 | Gerenciamento de sessões    |
| connect-pg-simple | ^10.0.0 | Store de sessões PostgreSQL |
| bcryptjs          | ^3.0.3  | Hash de senhas              |

### Banco de Dados

| Tecnologia  | Versão  | Uso                       |
| ----------- | ------- | ------------------------- |
| PostgreSQL  | -       | Banco de dados relacional |
| Drizzle ORM | ^0.39.3 | ORM type-safe             |
| Drizzle Kit | ^0.31.4 | Migrações e ferramentas   |
| drizzle-zod | ^0.7.0  | Validação integrada       |

### Utilitários

| Tecnologia       | Versão  | Uso                   |
| ---------------- | ------- | --------------------- |
| Zod              | ^3.24.2 | Validação de schemas  |
| date-fns         | ^3.6.0  | Manipulação de datas  |
| diff-match-patch | ^1.0.5  | Comparação de versões |
| jsPDF            | ^3.0.4  | Geração de PDF        |
| TypeScript       | 5.6.3   | Tipagem estática      |

---

## Modelo de Dados

### Entidades Principais

#### Users (Usuários)

```typescript
{
  id: string (UUID, PK)
  username: string (unique, not null)
  password: string (hashed, not null)
  role: "reader" | "editor" | "admin" (default: "editor")
  avatarUrl: string | null
}
```

**Roles:**

- `reader`: Apenas leitura
- `editor`: Pode criar e editar documentos
- `admin`: Acesso total + gerenciamento de usuários

#### Documents (Documentos)

```typescript
{
  id: string (UUID, PK)
  title: string (not null)
  content: string (HTML, not null, default: "")
  category: "manual" | "checklist" | "guide" (default: "manual")
  status: "draft" | "published" | "archived" (default: "draft")
  authorId: string (FK -> users.id)
  authorName: string (denormalizado)
  createdAt: timestamp (default: now)
  updatedAt: timestamp (default: now)
}
```

#### Versions (Versões)

```typescript
{
  id: string (UUID, PK)
  documentId: string (FK -> documents.id)
  versionNumber: string (ex: "1.0", "1.1", "2.0")
  content: string (HTML snapshot)
  authorId: string (FK -> users.id)
  authorName: string (denormalizado)
  createdAt: timestamp (default: now)
  changeDescription: string | null
}
```

**Comportamento:**

- Versão inicial criada automaticamente ao criar documento (v1.0)
- Nova versão criada automaticamente quando conteúdo muda
- Numeração: major.minor (ex: 1.0 → 1.1 → 1.2)

#### Comments (Comentários)

```typescript
{
  id: string (UUID, PK)
  documentId: string (FK -> documents.id)
  authorId: string (FK -> users.id)
  authorName: string (denormalizado)
  content: string (not null)
  sectionId: string | null (opcional, para comentários em seções)
  sectionText: string | null (texto da seção comentada)
  resolved: "true" | "false" (default: "false")
  createdAt: timestamp (default: now)
}
```

#### Audit Logs (Logs de Auditoria)

```typescript
{
  id: string (UUID, PK)
  documentId: string | null (FK -> documents.id, nullable)
  userId: string (FK -> users.id)
  userName: string (denormalizado)
  action: string (ex: "created", "updated", "deleted", "commented")
  details: string | null
  createdAt: timestamp (default: now)
}
```

### Relacionamentos

```
Users 1:N Documents (authorId)
Documents 1:N Versions (documentId)
Documents 1:N Comments (documentId)
Documents 1:N AuditLogs (documentId)
Users 1:N AuditLogs (userId)
```

---

## Fluxo de Autenticação

### Diagrama de Autenticação

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Passport
    participant Storage
    participant DB

    Client->>Express: POST /api/auth/login
    Express->>Passport: authenticate("local")
    Passport->>Storage: getUserByUsername()
    Storage->>DB: SELECT user
    DB-->>Storage: user data
    Storage-->>Passport: user
    Passport->>Passport: bcrypt.compare(password)
    alt Senha válida
        Passport->>Express: serializeUser(user.id)
        Express->>Express: req.logIn()
        Express-->>Client: 200 { user data }
    else Senha inválida
        Passport-->>Client: 401 { error }
    end

    Note over Client,DB: Sessão armazenada em cookie httpOnly
    Client->>Express: GET /api/auth/me
    Express->>Passport: deserializeUser(session.id)
    Passport->>Storage: getUser(id)
    Storage->>DB: SELECT user
    DB-->>Storage: user
    Storage-->>Passport: user
    Passport-->>Express: req.user
    Express-->>Client: 200 { user data }
```

### Middlewares de Autorização

1. **requireAuth**: Verifica se usuário está autenticado
2. **requireRole(roles[])**: Verifica se usuário tem uma das roles especificadas
3. **canEditDocuments**: Verifica se é `editor` ou `admin`
4. **canDeleteDocuments**: Verifica se é `admin`

### Sessões

- **Store**: PostgreSQL via `connect-pg-simple`
- **Tabela**: `user_sessions` (criada automaticamente)
- **Cookie**: httpOnly, secure em produção, maxAge 24h
- **Secret**: `SESSION_SECRET` (variável de ambiente)

---

## API REST

### Base URL

Todas as rotas API começam com `/api/`

### Autenticação

#### `POST /api/auth/login`

Login do usuário.

**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200:**

```json
{
  "id": "uuid",
  "username": "string",
  "role": "reader|editor|admin",
  "avatarUrl": "string | null"
}
```

#### `POST /api/auth/logout`

Logout do usuário.

**Response 200:**

```json
{
  "message": "Logged out successfully"
}
```

#### `GET /api/auth/me`

Retorna usuário autenticado atual.

**Response 200:**

```json
{
  "id": "uuid",
  "username": "string",
  "role": "string",
  "avatarUrl": "string | null"
}
```

### Documentos

#### `GET /api/documents`

Lista todos os documentos ou busca com filtros.

**Query Params (opcionais):**

- `query`: string (busca em título, conteúdo, autor)
- `category`: "manual" | "checklist" | "guide" | "all"
- `status`: "draft" | "published" | "archived" | "all"
- `authorId`: string

**Response 200:**

```json
[
  {
    "id": "uuid",
    "title": "string",
    "content": "string (HTML)",
    "category": "string",
    "status": "string",
    "authorId": "uuid",
    "authorName": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

#### `GET /api/documents/:id`

Retorna um documento específico.

**Response 200:** Document object
**Response 404:** `{ "error": "Document not found" }`

#### `POST /api/documents`

Cria um novo documento.

**Auth:** Requer `canEditDocuments`

**Body:**

```json
{
  "title": "string",
  "content": "string (HTML)",
  "category": "manual|checklist|guide",
  "status": "draft|published|archived"
}
```

**Response 201:** Document object

#### `PATCH /api/documents/:id`

Atualiza um documento.

**Auth:** Requer `canEditDocuments`

**Body:** Partial do documento (campos opcionais)

**Response 200:** Document object atualizado

**Nota:** Se `content` mudar, uma nova versão é criada automaticamente.

#### `DELETE /api/documents/:id`

Deleta um documento.

**Auth:** Requer `canDeleteDocuments` (admin)

**Response 204:** No content

### Versões

#### `GET /api/documents/:id/versions`

Lista todas as versões de um documento.

**Response 200:**

```json
[
  {
    "id": "uuid",
    "documentId": "uuid",
    "versionNumber": "string",
    "content": "string (HTML)",
    "authorId": "uuid",
    "authorName": "string",
    "createdAt": "timestamp",
    "changeDescription": "string | null"
  }
]
```

#### `GET /api/versions/:id`

Retorna uma versão específica.

**Response 200:** Version object

### Exportação PDF

#### `POST /api/documents/:id/export-pdf`

Exporta documento para PDF.

**Body (opcional):**

```json
{
  "versionId": "uuid" // Se fornecido, exporta versão específica
}
```

**Response 200:** PDF binary (Content-Type: application/pdf)

### Comentários

#### `GET /api/documents/:id/comments`

Lista comentários de um documento.

**Response 200:**

```json
[
  {
    "id": "uuid",
    "documentId": "uuid",
    "authorId": "uuid",
    "authorName": "string",
    "content": "string",
    "sectionId": "string | null",
    "sectionText": "string | null",
    "resolved": "true|false",
    "createdAt": "timestamp"
  }
]
```

#### `POST /api/documents/:id/comments`

Cria um comentário.

**Auth:** Requer autenticação

**Body:**

```json
{
  "content": "string",
  "sectionId": "string | null",
  "sectionText": "string | null"
}
```

**Response 201:** Comment object

#### `PATCH /api/comments/:id`

Atualiza um comentário (principalmente para resolver).

**Auth:** Requer `canEditDocuments`

**Body:**

```json
{
  "resolved": "true|false"
}
```

**Response 200:** Comment object atualizado

### Logs de Auditoria

#### `GET /api/audit-logs`

Lista logs de auditoria.

**Query Params:**

- `documentId`: string (opcional, filtra por documento)

**Response 200:**

```json
[
  {
    "id": "uuid",
    "documentId": "uuid | null",
    "userId": "uuid",
    "userName": "string",
    "action": "string",
    "details": "string | null",
    "createdAt": "timestamp"
  }
]
```

### Usuários (Admin apenas)

#### `GET /api/users`

Lista todos os usuários.

**Auth:** Requer `requireRole(["admin"])`

#### `POST /api/users`

Cria um novo usuário.

**Auth:** Requer `requireRole(["admin"])`

**Body:**

```json
{
  "username": "string",
  "password": "string",
  "role": "reader|editor|admin"
}
```

#### `PATCH /api/users/:id`

Atualiza um usuário.

**Auth:** Requer `requireRole(["admin"])`

**Body:**

```json
{
  "role": "reader|editor|admin",
  "password": "string" // opcional
}
```

#### `DELETE /api/users/:id`

Deleta um usuário.

**Auth:** Requer `requireRole(["admin"])`

**Nota:** Admin não pode deletar a si mesmo.

---

## Componentes Frontend

### Estrutura de Componentes

```
components/
├── ui/                    # Componentes shadcn/ui (não modificar diretamente)
├── app-sidebar.tsx        # Sidebar principal com navegação
├── command-palette.tsx    # Paleta de comandos (Cmd+K)
├── document-card.tsx      # Card de documento na listagem
├── empty-state.tsx        # Estado vazio
├── loading-skeleton.tsx   # Skeleton de carregamento
├── rich-text-editor.tsx   # Editor TipTap
├── section-comments.tsx   # Comentários de seção
├── stats-card.tsx         # Card de estatísticas
├── user-menu.tsx          # Menu do usuário
├── version-diff.tsx       # Comparação de versões
└── version-history.tsx    # Histórico de versões
```

### Páginas Principais

1. **Dashboard** (`/`): Visão geral com estatísticas
2. **Documents** (`/documents`): Lista de documentos
3. **Document Editor** (`/document/:id` ou `/new`): Editor de documentos
4. **Category** (`/category/:category`): Filtro por categoria
5. **Recent** (`/recent`): Documentos recentes
6. **Audit Logs** (`/audit-logs`): Logs de auditoria
7. **Users** (`/users`): Gerenciamento de usuários (admin)
8. **Login** (`/login`): Página de login

### Hooks Customizados

- `useAuth()`: Context de autenticação
- `useMobile()`: Detecta dispositivo móvel
- `useToast()`: Notificações toast

### Configuração de Rotas

Roteamento feito com **Wouter** (leve, similar ao React Router).

**Proteção de Rotas:**

- `ProtectedApp`: Verifica autenticação
- Redireciona para `/login` se não autenticado
- Redireciona para `/` se autenticado e acessar `/login`

---

## Regras de Proteção

### ⚠️ ESTRUTURA QUE NÃO DEVE SER MODIFICADA

As seguintes partes do projeto **NÃO DEVEM SER MODIFICADAS** pelo agente para manter a estrutura inicial intacta:

#### 1. Arquivos de Configuração Base

- **`package.json`**: Não modificar scripts principais (`dev`, `build`, `start`, `check`, `db:push`)
- **`tsconfig.json`**: Não modificar paths aliases (`@/*`, `@shared/*`)
- **`vite.config.ts`**: Não modificar estrutura de plugins Replit ou aliases de path
- **`drizzle.config.ts`**: Não modificar configuração de schema ou dialect
- **`tailwind.config.ts`**: Não modificar estrutura de cores ou variáveis CSS
- **`components.json`**: Não modificar configuração shadcn/ui (style, aliases)

#### 2. Estrutura de Diretórios

- **Não criar novos diretórios de primeiro nível** sem consultar o usuário
- **Não remover diretórios existentes**: `client/`, `server/`, `shared/`, `script/`
- **Não modificar estrutura de `client/src/components/ui/`** (componentes shadcn/ui)

#### 3. Arquivos Core do Servidor

- **`server/index.ts`**: Não modificar estrutura de inicialização do Express
- **`server/db.ts`**: Não modificar configuração do pool PostgreSQL
- **`server/storage.ts`**: Não modificar interface `IStorage` ou estrutura da classe `DatabaseStorage`
- **`server/auth.ts`**: Não modificar setup do Passport ou estrutura de middlewares de autorização
- **`server/vite.ts`**: Não modificar setup do Vite dev server
- **`server/static.ts`**: Não modificar servimento de arquivos estáticos

#### 4. Schema Compartilhado

- **`shared/schema.ts`**: Não modificar estrutura das tabelas ou tipos base sem consultar
- **Não remover campos obrigatórios** das entidades
- **Não modificar tipos de roles** (`reader`, `editor`, `admin`) sem consultar

#### 5. Arquivos Core do Cliente

- **`client/src/App.tsx`**: Não modificar estrutura de roteamento ou `ProtectedApp`
- **`client/src/main.tsx`**: Não modificar entry point
- **`client/src/lib/auth.tsx`**: Não modificar estrutura do `AuthProvider` ou `useAuth`
- **`client/src/lib/queryClient.ts`**: Não modificar configuração do QueryClient

#### 6. Build e Scripts

- **`script/build.ts`**: Não modificar processo de build (esbuild + vite)
- **Não remover plugins Replit** do `vite.config.ts` sem consultar

#### 7. Autenticação e Segurança

- **Não modificar lógica de hash de senhas** (bcrypt)
- **Não modificar estrutura de sessões** (express-session + PostgreSQL)
- **Não remover validações de autorização** (requireAuth, requireRole, canEditDocuments, canDeleteDocuments)

#### 8. Componentes shadcn/ui

- **Não modificar componentes em `client/src/components/ui/`** diretamente
- **Usar comandos shadcn** para adicionar/atualizar componentes UI
- **Não remover dependências do Radix UI**

### ✅ O QUE PODE SER MODIFICADO

- Componentes de negócio em `client/src/components/` (exceto `ui/`)
- Páginas em `client/src/pages/`
- Rotas API em `server/routes.ts` (adicionar novas rotas)
- Estilos e CSS (respeitando design guidelines)
- Adicionar novos hooks em `client/src/hooks/`
- Adicionar novos utilitários em `client/src/lib/`
- Melhorias de performance e UX
- Correções de bugs
- Adicionar novas funcionalidades (respeitando estrutura existente)

### 📝 Notas Importantes

1. **Shared Schema**: O schema em `shared/schema.ts` é compartilhado entre frontend e backend. Mudanças aqui afetam ambos.
2. **Type Safety**: O projeto usa TypeScript estrito. Manter tipagem correta.
3. **Validação**: Sempre validar dados com Zod antes de persistir.

---

## Guia de Desenvolvimento

### Setup do Ambiente

1. **Instalar dependências:**

```bash
npm install
```

2. **Configurar variáveis de ambiente:**

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=seu-secret-aqui
PORT=5000
NODE_ENV=development
```

3. **Configurar banco de dados:**

```bash
npm run db:push  # Aplica schema ao banco
```

4. **Rodar em desenvolvimento:**

```bash
npm run dev
```

### Adicionar Nova Rota API

1. Abrir `server/routes.ts`
2. Adicionar rota dentro de `registerRoutes()`
3. Usar middlewares apropriados (`requireAuth`, `requireRole`, etc.)
4. Validar entrada com Zod
5. Usar `storage` para operações de banco
6. Criar audit log se necessário

**Exemplo:**

```typescript
app.get("/api/novo-endpoint", requireAuth, async (req, res) => {
  try {
    const data = await storage.getSomething();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
});
```

### Adicionar Nova Página

1. Criar arquivo em `client/src/pages/nova-pagina.tsx`
2. Adicionar rota em `client/src/App.tsx`:

```typescript
<Route path="/nova-rota" component={NovaPagina} />
```

### Adicionar Novo Componente

1. Criar arquivo em `client/src/components/novo-componente.tsx`
2. Usar componentes shadcn/ui quando possível
3. Seguir design guidelines em `design_guidelines.md`

### Adicionar Campo ao Schema

1. Modificar `shared/schema.ts` (adicionar campo à tabela)
2. Atualizar tipos TypeScript gerados automaticamente
3. Rodar `npm run db:push` para aplicar ao banco
4. Atualizar validações Zod se necessário

### Testar Autenticação

1. Criar usuário via API (admin) ou seed
2. Fazer login em `/login`
3. Verificar sessão em `/api/auth/me`

### Debugging

- **Frontend**: Usar React DevTools e console do navegador
- **Backend**: Logs aparecem no console com formato `[HH:MM:SS] [source] message`
- **Banco**: Verificar queries no console do Drizzle (se habilitado)

---

## Build e Deploy

### Build de Produção

```bash
npm run build
```

**Processo:**

1. Vite build do cliente → `dist/public/`
2. ESBuild do servidor → `dist/index.cjs`
3. Dependências externas não incluídas no bundle (usadas do node_modules)

### Executar Produção

```bash
npm start
```

**Requisitos:**

- `NODE_ENV=production`
- `DATABASE_URL` configurado
- `SESSION_SECRET` configurado
- Build executado anteriormente

### Variáveis de Ambiente Necessárias

**Desenvolvimento:**

- `DATABASE_URL`: URL do PostgreSQL
- `SESSION_SECRET`: Secret para sessões (opcional, tem default)
- `PORT`: Porta do servidor (default: 5000)
- `NODE_ENV`: `development`

**Produção:**

- `DATABASE_URL`: URL do PostgreSQL
- `SESSION_SECRET`: **OBRIGATÓRIO** (não usar default)
- `PORT`: Porta do servidor
- `NODE_ENV`: `production`

### Migrações de Banco

```bash
npm run db:push
```

**Nota:** Drizzle Kit usa "push" (não migrations tradicionais). Para produção, considere gerar migrations explícitas.

---

## Referências e Documentação Adicional

- **Design Guidelines**: Ver `design_guidelines.md`
- **Replit Docs**: Ver `replit.md`
- **shadcn/ui**: https://ui.shadcn.com
- **Drizzle ORM**: https://orm.drizzle.team
- **TipTap**: https://tiptap.dev
- **TanStack Query**: https://tanstack.com/query

---

## Changelog e Histórico

Este documento foi criado para facilitar o trabalho de melhorias no projeto DocTrack, mantendo a estrutura inicial intacta conforme solicitado.

**Última atualização:** Data de criação da documentação

---

**Nota Final:** Esta documentação serve como guia completo para entender e trabalhar no projeto DocTrack. Sempre consulte este documento antes de fazer mudanças estruturais significativas.

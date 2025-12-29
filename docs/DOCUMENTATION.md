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
    subgraph NextJS["Next.js App Router"]
        Pages[Páginas App Router]
        API[Route Handlers API]
        Middleware[Middleware Next.js]
    end

    subgraph Client["Frontend (React)"]
        UI[Componentes UI]
        Hooks[Hooks Customizados]
        Query[TanStack Query]
        Auth[AuthProvider Context]
    end

    subgraph Server["Server Components & API"]
        Routes[Rotas API /api/*]
        AuthHelpers[Auth Helpers]
        Storage[Interface Storage]
        DB[Database Storage]
    end

    subgraph Database["PostgreSQL"]
        Tables[(Tabelas)]
    end

    subgraph Shared["Código Compartilhado"]
        Schema[Schema Drizzle + Zod]
    end

    Pages -->|Server Components| API
    Client -->|Client Components| API
    API -->|HTTP/REST| Routes
    Routes -->|Drizzle ORM| Database
    Routes -->|Importa| Shared
    Client -->|Importa| Shared
    Storage -->|Implementa| DB
    Routes -->|Usa| Storage
    Routes -->|Protege| AuthHelpers
    Middleware -->|Verifica| AuthHelpers
    Query -->|Fetch| Routes
```

### Padrões Arquiteturais

1. **Next.js App Router**

   - Estrutura baseada em diretórios (`app/`)
   - Server Components e Client Components
   - Route Handlers para API (`app/api/`)
   - Middleware para autenticação e proteção de rotas

2. **Abstração de Storage**

   - Interface `IStorage` permite trocar implementações
   - Atualmente: `DatabaseStorage` com PostgreSQL via Drizzle ORM
   - Suporta futuras implementações (ex: MemStorage para testes)

3. **Validação em Camadas**

   - Zod para validação de schemas
   - Drizzle-Zod para validação de inserções
   - Validação nos Route Handlers antes de persistir

4. **Autenticação Baseada em JWT**
   - JWT (jose) armazenado em cookies httpOnly
   - Middleware Next.js verifica autenticação
   - Helpers de autorização por role (`requireAuth`, `requireRole`)

---

## Estrutura de Diretórios

```
DocTrack/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Layout raiz
│   ├── providers.tsx          # Providers (QueryClient, Auth, etc.)
│   ├── globals.css            # Estilos globais
│   ├── (auth)/                # Grupo de rotas de autenticação
│   │   └── login/
│   │       └── page.tsx       # Página de login
│   ├── (protected)/           # Grupo de rotas protegidas
│   │   ├── layout.tsx         # Layout com sidebar e autenticação
│   │   ├── page.tsx           # Dashboard
│   │   ├── documents/
│   │   │   └── page.tsx       # Lista de documentos
│   │   ├── document/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx   # Editor de documento
│   │   │   └── new/
│   │   │       └── page.tsx   # Novo documento
│   │   ├── category/
│   │   │   ├── page.tsx
│   │   │   └── [category]/
│   │   │       └── page.tsx
│   │   ├── recent/
│   │   │   └── page.tsx
│   │   ├── audit-logs/
│   │   │   └── page.tsx
│   │   └── users/
│   │       └── page.tsx
│   └── api/                   # Route Handlers (API)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   └── profile/route.ts
│       ├── documents/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── [id]/versions/route.ts
│       │   ├── [id]/comments/route.ts
│       │   └── [id]/export-pdf/route.ts
│       ├── versions/
│       │   └── [id]/route.ts
│       ├── comments/
│       │   └── [id]/route.ts
│       ├── custom-categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── custom-clients/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── audit-logs/
│           └── route.ts
│
├── components/                 # Componentes React
│   ├── ui/                    # Componentes shadcn/ui
│   ├── app-sidebar.tsx
│   ├── command-palette.tsx
│   ├── document-card.tsx
│   ├── rich-text-editor.tsx
│   └── ...
│
├── lib/                       # Utilitários e configurações
│   ├── auth.tsx              # AuthProvider e useAuth hook
│   ├── session.ts            # Gerenciamento de sessão JWT
│   ├── auth-helpers.ts       # Helpers de autenticação
│   ├── storage.ts            # Interface IStorage e DatabaseStorage
│   ├── db.ts                 # Configuração Drizzle + PostgreSQL
│   ├── queryClient.ts        # Configuração TanStack Query
│   ├── user-helpers.ts       # Helpers de usuário
│   └── ...
│
├── hooks/                     # Custom hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── shared/                    # Código compartilhado
│   └── schema.ts             # Schemas Drizzle + Zod + Types
│
├── scripts/                    # Scripts utilitários
│   ├── seed.ts
│   └── ...
│
├── locales/                   # Arquivos de internacionalização
│   └── locales/
│       ├── pt/
│       ├── en/
│       └── fr/
│
├── middleware.ts              # Middleware Next.js
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── next.config.js             # Configuração Next.js
├── drizzle.config.ts          # Configuração Drizzle Kit
├── tailwind.config.ts         # Configuração Tailwind CSS
└── components.json            # Configuração shadcn/ui
```

---

## Stack Tecnológico

### Framework Principal

| Tecnologia     | Versão   | Uso                              |
| -------------- | -------- | -------------------------------- |
| Next.js        | ^16.1.0  | Framework React com App Router   |
| React          | ^18.3.1  | Biblioteca UI                   |
| TypeScript     | 5.6.3    | Tipagem estática                 |

### Frontend

| Tecnologia     | Versão   | Uso                              |
| -------------- | -------- | -------------------------------- |
| TanStack Query | ^5.60.5  | Gerenciamento de estado servidor |
| TipTap         | ^3.13.0  | Editor de texto rico             |
| shadcn/ui      | -        | Biblioteca de componentes        |
| Tailwind CSS   | ^3.4.17  | Estilização                      |
| Framer Motion  | ^11.18.2 | Animações                        |
| Lucide React   | ^0.453.0 | Ícones                           |
| i18next        | ^25.7.3  | Internacionalização             |
| react-i18next  | ^16.5.0  | React bindings para i18next      |

### Backend (Next.js API Routes)

| Tecnologia        | Versão  | Uso                         |
| ----------------- | ------- | --------------------------- |
| Next.js           | ^16.1.0 | Route Handlers (API)        |
| jose              | ^6.1.3  | JWT (autenticação)          |
| bcryptjs          | ^3.0.3  | Hash de senhas              |

### Banco de Dados

| Tecnologia  | Versão  | Uso                       |
| ----------- | ------- | ------------------------- |
| PostgreSQL  | -       | Banco de dados relacional |
| pg          | ^8.16.3 | Driver PostgreSQL          |
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
| html2canvas      | ^1.4.1  | Captura de tela para PDF |

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
  firstName: string | null
  lastName: string | null
  displayName: string | null (mantido para compatibilidade)
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
  company: string (default: "Geral")
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

#### Custom Categories (Categorias Personalizadas)

```typescript
{
  id: string (UUID, PK)
  name: string (not null)
  userId: string (FK -> users.id)
  createdAt: timestamp (default: now)
}
```

#### Custom Clients (Clientes Personalizados)

```typescript
{
  id: string (UUID, PK)
  name: string (not null)
  userId: string (FK -> users.id)
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
Users 1:N CustomCategories (userId)
Users 1:N CustomClients (userId)
```

---

## Fluxo de Autenticação

### Diagrama de Autenticação

```mermaid
sequenceDiagram
    participant Client
    participant NextJS
    participant Middleware
    participant AuthHelper
    participant Storage
    participant DB

    Client->>NextJS: POST /api/auth/login
    NextJS->>Storage: getUserByUsername()
    Storage->>DB: SELECT user
    DB-->>Storage: user data
    Storage-->>NextJS: user
    NextJS->>NextJS: bcrypt.compare(password)
    alt Senha válida
        NextJS->>NextJS: createSession(user) - JWT
        NextJS->>NextJS: setSessionCookie(token)
        NextJS-->>Client: 200 { user data } + cookie
    else Senha inválida
        NextJS-->>Client: 401 { error }
    end

    Note over Client,DB: JWT armazenado em cookie httpOnly
    Client->>NextJS: GET /api/auth/me
    NextJS->>Middleware: Verifica cookie
    Middleware->>NextJS: getSessionUser(request)
    NextJS->>NextJS: jwtVerify(token)
    NextJS-->>Client: 200 { user data }
```

### Middlewares e Helpers de Autorização

1. **requireAuth**: Verifica se usuário está autenticado (retorna `SessionUser` ou erro)
2. **requireRole(roles[])**: Verifica se usuário tem uma das roles especificadas
3. **canEditDocuments**: Verifica se é `editor` ou `admin`
4. **canDeleteDocuments**: Verifica se é `admin`

### Sessões

- **Tipo**: JWT (JSON Web Token) usando `jose`
- **Armazenamento**: Cookie httpOnly (`doctrack-session`)
- **Cookie**: httpOnly, secure em produção, sameSite: lax, maxAge 24h
- **Secret**: `SESSION_SECRET` (variável de ambiente obrigatória, mínimo 32 caracteres)
- **Payload**: Contém `id`, `username`, `role`, `firstName`, `lastName`, `displayName`, `avatarUrl`

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
  "firstName": "string | null",
  "lastName": "string | null",
  "displayName": "string | null",
  "avatarUrl": "string | null"
}
```

#### `PATCH /api/auth/profile`

Atualiza perfil do usuário autenticado.

**Auth:** Requer autenticação

**Body:**

```json
{
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "displayName": "string (opcional)",
  "avatarUrl": "string | null (opcional)"
}
```

**Response 200:** User object atualizado (com sessão atualizada)

### Documentos

#### `GET /api/documents`

Lista todos os documentos ou busca com filtros.

**Query Params (opcionais):**

- `query`: string (busca em título, conteúdo, autor)
- `category`: "manual" | "checklist" | "guide" | "all"
- `status`: "draft" | "published" | "archived" | "all"
- `authorId`: string

**Nota:** A visibilidade dos documentos é controlada por role:
- `admin`: vê todos os documentos
- `editor`/`reader`: vê seus próprios documentos + documentos publicados

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
  "status": "draft|published|archived",
  "company": "string (default: 'Geral')"
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

**Auth:** Requer autenticação

**Body:**

```json
{
  "resolved": "true|false"
}
```

**Response 200:** Comment object atualizado

### Categorias Personalizadas

#### `GET /api/custom-categories`

Lista categorias personalizadas do usuário autenticado.

**Auth:** Requer autenticação

**Response 200:** Array de CustomCategory

#### `POST /api/custom-categories`

Cria uma nova categoria personalizada.

**Auth:** Requer autenticação

**Body:**

```json
{
  "name": "string"
}
```

**Response 201:** CustomCategory object

#### `DELETE /api/custom-categories/:id`

Deleta uma categoria personalizada.

**Auth:** Requer autenticação (apenas o dono pode deletar)

**Response 204:** No content

### Clientes Personalizados

#### `GET /api/custom-clients`

Lista clientes personalizados do usuário autenticado.

**Auth:** Requer autenticação

**Response 200:** Array de CustomClient

#### `POST /api/custom-clients`

Cria um novo cliente personalizado. Se já existir com o mesmo nome, retorna o existente.

**Auth:** Requer autenticação

**Body:**

```json
{
  "name": "string"
}
```

**Response 200/201:** CustomClient object

#### `DELETE /api/custom-clients/:id`

Deleta um cliente personalizado.

**Auth:** Requer autenticação (apenas o dono pode deletar)

**Response 204:** No content

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
  "role": "reader|editor|admin (default: reader)"
}
```

**Response 201:** User object (sem password)

#### `PATCH /api/users/:id`

Atualiza um usuário.

**Auth:** Requer `requireRole(["admin"])`

**Body:**

```json
{
  "role": "reader|editor|admin",
  "password": "string (opcional)",
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "displayName": "string (opcional)",
  "avatarUrl": "string | null (opcional)"
}
```

**Response 200:** User object atualizado

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
3. **Document Editor** (`/document/[id]` ou `/document/new`): Editor de documentos
4. **Category** (`/category` ou `/category/[category]`): Filtro por categoria
5. **Recent** (`/recent`): Documentos recentes
6. **Audit Logs** (`/audit-logs`): Logs de auditoria
7. **Users** (`/users`): Gerenciamento de usuários (admin)
8. **Login** (`/login`): Página de login

### Hooks Customizados

- `useAuth()`: Context de autenticação (retorna `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `canEdit`, `canDelete`, `isAdmin`)
- `useMobile()`: Detecta dispositivo móvel
- `useToast()`: Notificações toast

### Configuração de Rotas

Roteamento feito com **Next.js App Router** (baseado em estrutura de diretórios).

**Proteção de Rotas:**

- `middleware.ts`: Middleware Next.js verifica autenticação em todas as rotas
- Rotas em `app/(protected)/`: Requerem autenticação (verificado no layout)
- Rotas em `app/(auth)/`: Públicas (login)
- Redireciona para `/login` se não autenticado
- Rotas API: Verificam autenticação via `requireAuth` ou `requireRole`

---

## Regras de Proteção

### ⚠️ ESTRUTURA QUE NÃO DEVE SER MODIFICADA

As seguintes partes do projeto **NÃO DEVEM SER MODIFICADAS** pelo agente para manter a estrutura inicial intacta:

#### 1. Arquivos de Configuração Base

- **`package.json`**: Não modificar scripts principais (`dev`, `build`, `start`, `check`, `db:push`)
- **`tsconfig.json`**: Não modificar paths aliases (`@/*`, `@shared/*`)
- **`next.config.js`**: Não modificar configuração de webpack aliases ou estrutura base
- **`drizzle.config.ts`**: Não modificar configuração de schema ou dialect
- **`tailwind.config.ts`**: Não modificar estrutura de cores ou variáveis CSS
- **`components.json`**: Não modificar configuração shadcn/ui (style, aliases)

#### 2. Estrutura de Diretórios

- **Não criar novos diretórios de primeiro nível** sem consultar o usuário
- **Não remover diretórios existentes**: `app/`, `components/`, `lib/`, `shared/`, `hooks/`
- **Não modificar estrutura de `components/ui/`** (componentes shadcn/ui)
- **Não modificar estrutura base de `app/`** (layout.tsx, providers.tsx)

#### 3. Arquivos Core do Sistema

- **`lib/db.ts`**: Não modificar configuração do pool PostgreSQL
- **`lib/storage.ts`**: Não modificar interface `IStorage` ou estrutura da classe `DatabaseStorage`
- **`lib/session.ts`**: Não modificar estrutura de criação/verificação de JWT
- **`lib/auth-helpers.ts`**: Não modificar estrutura de `requireAuth`, `requireRole`, etc.
- **`middleware.ts`**: Não modificar lógica base de verificação de autenticação

#### 4. Schema Compartilhado

- **`shared/schema.ts`**: Não modificar estrutura das tabelas ou tipos base sem consultar
- **Não remover campos obrigatórios** das entidades
- **Não modificar tipos de roles** (`reader`, `editor`, `admin`) sem consultar

#### 5. Arquivos Core do Cliente

- **`app/layout.tsx`**: Não modificar estrutura do layout raiz
- **`app/providers.tsx`**: Não modificar estrutura de providers (QueryClient, AuthProvider, etc.)
- **`app/(protected)/layout.tsx`**: Não modificar estrutura de proteção e sidebar
- **`lib/auth.tsx`**: Não modificar estrutura do `AuthProvider` ou `useAuth`
- **`lib/queryClient.ts`**: Não modificar configuração do QueryClient

#### 6. Build e Scripts

- **Não modificar processo de build do Next.js** sem consultar
- **Scripts em `package.json`**: Manter estrutura base (`dev`, `build`, `start`)

#### 7. Autenticação e Segurança

- **Não modificar lógica de hash de senhas** (bcrypt)
- **Não modificar estrutura de sessões JWT** (jose + cookies)
- **Não remover validações de autorização** (requireAuth, requireRole, canEditDocuments, canDeleteDocuments)

#### 8. Componentes shadcn/ui

- **Não modificar componentes em `components/ui/`** diretamente
- **Usar comandos shadcn** para adicionar/atualizar componentes UI
- **Não remover dependências do Radix UI**

### ✅ O QUE PODE SER MODIFICADO

- Componentes de negócio em `components/` (exceto `ui/`)
- Páginas em `app/(protected)/` e `app/(auth)/`
- Rotas API em `app/api/` (adicionar novas rotas)
- Estilos e CSS (respeitando design guidelines)
- Adicionar novos hooks em `hooks/`
- Adicionar novos utilitários em `lib/`
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

1. Criar arquivo em `app/api/novo-endpoint/route.ts`
2. Exportar funções HTTP (`GET`, `POST`, `PATCH`, `DELETE`, etc.)
3. Usar helpers apropriados (`requireAuth`, `requireRole`, etc.)
4. Validar entrada com Zod
5. Usar `storage` para operações de banco
6. Criar audit log se necessário

**Exemplo:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    
    const { user } = authResult;
    const data = await storage.getSomething();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}
```

### Adicionar Nova Página

1. Criar arquivo em `app/(protected)/nova-pagina/page.tsx` (ou `app/(auth)/` para rotas públicas)
2. A rota será automaticamente criada baseada na estrutura de diretórios
3. Para rotas dinâmicas, usar `[param]/page.tsx`

### Adicionar Novo Componente

1. Criar arquivo em `components/novo-componente.tsx`
2. Usar componentes shadcn/ui quando possível
3. Seguir design guidelines em `docs/DESIGN_GUIDELINES.md`

### Adicionar Campo ao Schema

1. Modificar `shared/schema.ts` (adicionar campo à tabela)
2. Atualizar tipos TypeScript gerados automaticamente
3. Rodar `npm run db:push` para aplicar ao banco
4. Atualizar validações Zod se necessário

### Testar Autenticação

1. Criar usuário via API (admin) ou seed (`npm run seed`)
2. Fazer login em `/login`
3. Verificar sessão em `/api/auth/me`
4. Cookie `doctrack-session` deve ser criado (httpOnly)

### Debugging

- **Frontend**: Usar React DevTools e console do navegador
- **Backend**: Logs aparecem no console do servidor Next.js
- **Banco**: Verificar queries diretamente no PostgreSQL ou habilitar logs do Drizzle
- **Sessão**: Verificar cookie `doctrack-session` no DevTools (Application > Cookies)

---

## Build e Deploy

### Build de Produção

```bash
npm run build
```

**Processo:**

1. Next.js build → `.next/` (otimizado para produção)
2. Geração estática quando possível
3. Server Components e API Routes compilados

### Executar Produção

```bash
npm start
```

**Requisitos:**

- `NODE_ENV=production`
- `DATABASE_URL` configurado
- `SESSION_SECRET` configurado (obrigatório, mínimo 32 caracteres)
- Build executado anteriormente (`npm run build`)

### Variáveis de Ambiente Necessárias

**Desenvolvimento:**

- `DATABASE_URL`: URL do PostgreSQL
- `SESSION_SECRET`: Secret para sessões JWT (obrigatório, mínimo 32 caracteres)
- `NODE_ENV`: `development` (opcional, Next.js detecta automaticamente)

**Produção:**

- `DATABASE_URL`: URL do PostgreSQL
- `SESSION_SECRET`: **OBRIGATÓRIO** (mínimo 32 caracteres)
- `NODE_ENV`: `production`

### Migrações de Banco

```bash
npm run db:push
```

**Nota:** Drizzle Kit usa "push" (não migrations tradicionais). Para produção, considere gerar migrations explícitas.

---

## Referências e Documentação Adicional

- **Design Guidelines**: Ver `docs/DESIGN_GUIDELINES.md`
- **shadcn/ui**: https://ui.shadcn.com
- **Next.js**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **TipTap**: https://tiptap.dev
- **TanStack Query**: https://tanstack.com/query
- **jose (JWT)**: https://github.com/panva/jose

---

## Changelog e Histórico

Este documento foi criado para facilitar o trabalho de melhorias no projeto DocTrack, mantendo a estrutura inicial intacta conforme solicitado.

**Última atualização:** Data de criação da documentação

---

**Nota Final:** Esta documentação serve como guia completo para entender e trabalhar no projeto DocTrack. Sempre consulte este documento antes de fazer mudanças estruturais significativas.

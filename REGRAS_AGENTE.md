# Regras para o Agente - DocTrack

## ⚠️ ESTRUTURA PROTEGIDA - NÃO MODIFICAR

Este documento lista explicitamente o que **NÃO DEVE SER MODIFICADO** pelo agente para manter a estrutura inicial do projeto intacta.

---

## 🚫 ARQUIVOS E ESTRUTURAS PROTEGIDAS

### 1. Arquivos de Configuração Raiz

**NÃO MODIFICAR:**
- `package.json` - Scripts principais (`dev`, `build`, `start`, `check`, `db:push`)
- `tsconfig.json` - Paths aliases (`@/*`, `@shared/*`)
- `vite.config.ts` - Estrutura de plugins e aliases
- `drizzle.config.ts` - Configuração de schema e dialect
- `tailwind.config.ts` - Estrutura de cores e variáveis CSS
- `components.json` - Configuração shadcn/ui
- `postcss.config.js` - Configuração PostCSS

### 2. Estrutura de Diretórios

**NÃO CRIAR/REMOVER:**
- Diretórios de primeiro nível: `client/`, `server/`, `shared/`, `script/`
- `client/src/components/ui/` - Componentes shadcn/ui

**NÃO MODIFICAR ESTRUTURA:**
- Organização de pastas dentro de `client/src/`
- Organização de pastas dentro de `server/`
- Localização de `shared/schema.ts`

### 3. Arquivos Core do Backend

**NÃO MODIFICAR:**
- `server/index.ts` - Estrutura de inicialização do Express
- `server/db.ts` - Configuração do pool PostgreSQL e drizzle
- `server/storage.ts` - Interface `IStorage` e estrutura da classe `DatabaseStorage`
- `server/auth.ts` - Setup do Passport, middlewares de autorização, estrutura de sessões
- `server/vite.ts` - Setup do Vite dev server
- `server/static.ts` - Servimento de arquivos estáticos

**PODE MODIFICAR:**
- `server/routes.ts` - Adicionar novas rotas API (respeitando padrões existentes)

### 4. Schema e Tipos Compartilhados

**NÃO MODIFICAR SEM CONSULTAR:**
- `shared/schema.ts` - Estrutura das tabelas, tipos base, roles
- Campos obrigatórios das entidades
- Tipos de roles: `"reader"`, `"editor"`, `"admin"`

**PODE MODIFICAR:**
- Adicionar novos campos opcionais (com cuidado)
- Adicionar novas entidades (se necessário)

### 5. Arquivos Core do Frontend

**NÃO MODIFICAR:**
- `client/src/App.tsx` - Estrutura de roteamento e `ProtectedApp`
- `client/src/main.tsx` - Entry point
- `client/src/lib/auth.tsx` - Estrutura do `AuthProvider` e `useAuth`
- `client/src/lib/queryClient.ts` - Configuração do QueryClient
- `client/index.html` - HTML base

**PODE MODIFICAR:**
- Páginas em `client/src/pages/`
- Componentes de negócio em `client/src/components/` (exceto `ui/`)
- Hooks em `client/src/hooks/`
- Utilitários em `client/src/lib/` (exceto os core mencionados)

### 6. Build e Scripts

**NÃO MODIFICAR:**
- `script/build.ts` - Processo de build (esbuild + vite)
- Plugins Replit no `vite.config.ts`

### 7. Autenticação e Segurança

**NÃO MODIFICAR:**
- Lógica de hash de senhas (bcrypt)
- Estrutura de sessões (express-session + PostgreSQL)
- Middlewares de autorização: `requireAuth`, `requireRole`, `canEditDocuments`, `canDeleteDocuments`
- Estratégia Passport Local

### 8. Componentes shadcn/ui

**NÃO MODIFICAR DIRETAMENTE:**
- Qualquer arquivo em `client/src/components/ui/`
- Usar comandos shadcn para adicionar/atualizar componentes
- Não remover dependências do Radix UI

### 9. Arquivos Específicos do Replit

**NÃO REMOVER:**
- `replit.md` - Documentação Replit
- Plugins Replit no `vite.config.ts`:
  - `@replit/vite-plugin-runtime-error-modal`
  - `@replit/vite-plugin-cartographer`
  - `@replit/vite-plugin-dev-banner`

---

## ✅ O QUE PODE SER MODIFICADO

### Componentes e Páginas
- ✅ Componentes de negócio em `client/src/components/` (exceto `ui/`)
- ✅ Páginas em `client/src/pages/`
- ✅ Estilos e CSS (respeitando `design_guidelines.md`)

### Funcionalidades
- ✅ Adicionar novas rotas API em `server/routes.ts`
- ✅ Adicionar novos hooks em `client/src/hooks/`
- ✅ Adicionar novos utilitários em `client/src/lib/` (exceto core)
- ✅ Melhorias de performance e UX
- ✅ Correções de bugs
- ✅ Adicionar novas funcionalidades (respeitando estrutura existente)

### Dados
- ✅ Adicionar campos opcionais ao schema (com cuidado)
- ✅ Adicionar novas entidades (se necessário e consultando)

---

## 📋 CHECKLIST ANTES DE MODIFICAR

Antes de fazer qualquer modificação, verificar:

1. [ ] O arquivo está na lista de "NÃO MODIFICAR"?
2. [ ] A modificação afeta a estrutura core do projeto?
3. [ ] A modificação quebra compatibilidade com Replit?
4. [ ] A modificação altera tipos compartilhados sem considerar frontend e backend?
5. [ ] A modificação remove ou altera funcionalidades de autenticação/segurança?

Se qualquer resposta for **SIM**, **CONSULTAR O USUÁRIO ANTES DE MODIFICAR**.

---

## 🎯 PRINCÍPIOS GERAIS

1. **Manter Compatibilidade**: Não quebrar funcionalidades existentes
2. **Type Safety**: Manter tipagem TypeScript estrita
3. **Validação**: Sempre validar dados com Zod
4. **Design Guidelines**: Seguir `design_guidelines.md` para UI
5. **Padrões Existentes**: Seguir padrões de código já estabelecidos
6. **Documentação**: Atualizar documentação se necessário

---

## 🔍 COMO IDENTIFICAR SE PODE MODIFICAR

**Perguntas a fazer:**
- É um componente de negócio (não UI base)?
- É uma nova funcionalidade que não afeta estrutura core?
- É uma correção de bug que não altera arquitetura?
- É uma melhoria de UX/performance que não altera APIs?

Se todas as respostas forem **SIM**, provavelmente pode modificar.

**Quando em dúvida, CONSULTAR O USUÁRIO.**

---

## 📝 NOTAS IMPORTANTES

1. **Replit**: Projeto criado no Replit - plugins específicos não devem ser removidos
2. **Shared Schema**: Mudanças em `shared/schema.ts` afetam frontend E backend
3. **Sessões**: Estrutura de sessões é crítica para autenticação - não modificar
4. **Build**: Processo de build é otimizado para Replit - não modificar sem consultar

---

**Última atualização:** Data de criação das regras

**Objetivo:** Manter estrutura inicial intacta enquanto permite melhorias e novas funcionalidades.




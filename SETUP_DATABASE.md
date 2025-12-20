# Configuração do Banco de Dados

O DocTrack precisa de um banco PostgreSQL. Escolha uma das opções abaixo:

---

## Opção 1: Neon.tech (Recomendado - Gratuito)

1. Acesse https://neon.tech
2. Crie uma conta gratuita
3. Clique em "Create Project"
4. Copie a connection string (DATABASE_URL)
5. Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=sua-connection-string-do-neon
SESSION_SECRET=doctrack-local-dev-secret-key-2024
PORT=5000
NODE_ENV=development
```

---

## Opção 2: Docker

1. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop
2. Inicie o Docker Desktop
3. Execute no terminal:

```bash
docker run --name doctrack-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=doctrack -p 5432:5432 -d postgres:14
```

4. Crie o arquivo `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/doctrack
SESSION_SECRET=doctrack-local-dev-secret-key-2024
PORT=5000
NODE_ENV=development
```

---

## Opção 3: PostgreSQL Local

1. Baixe e instale: https://www.postgresql.org/download/windows/
2. Durante a instalação, defina a senha do usuário `postgres`
3. Abra o pgAdmin e crie um banco chamado `doctrack`
4. Crie o arquivo `.env`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/doctrack
SESSION_SECRET=doctrack-local-dev-secret-key-2024
PORT=5000
NODE_ENV=development
```

---

## Após configurar o banco

Execute os comandos:

```bash
# Criar tabelas
npm run db:push

# Popular com dados de teste
npx tsx server/seed.ts

# Iniciar servidor
npm run dev
```

## Usuários de teste

| Usuário | Senha | Role |
|---------|-------|------|
| admin | admin123 | admin |
| editor | editor123 | editor |
| reader | reader123 | reader |

## Acessar o sistema

Após iniciar, acesse: http://localhost:5000



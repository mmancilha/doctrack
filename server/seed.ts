import { db } from "./db";
import { users, documents, versions } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    password: hashedPassword,
    role: "admin",
  }).returning();

  console.log("Created admin user:", adminUser.username);

  const editorPassword = await bcrypt.hash("editor123", 10);
  const [editorUser] = await db.insert(users).values({
    username: "editor",
    password: editorPassword,
    role: "editor",
  }).returning();

  console.log("Created editor user:", editorUser.username);

  const readerPassword = await bcrypt.hash("reader123", 10);
  const [readerUser] = await db.insert(users).values({
    username: "reader",
    password: readerPassword,
    role: "reader",
  }).returning();

  console.log("Created reader user:", readerUser.username);

  const sampleDocs = [
    // Empresa X
    {
      title: "Contrato de Serviço",
      content: "<h1>Contrato de Serviço</h1><p>Este documento define os termos e condições do serviço prestado para a Empresa X.</p><h2>Cláusulas</h2><ol><li>Objeto do contrato</li><li>Prazo de vigência</li><li>Valores e formas de pagamento</li></ol>",
      category: "manual",
      status: "published",
      company: "Empresa X",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "Aditivo Contratual",
      content: "<h1>Aditivo Contratual</h1><p>Termo aditivo ao contrato original com novas condições.</p>",
      category: "manual",
      status: "draft",
      company: "Empresa X",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "Checklist de Implementação",
      content: "<h1>Checklist de Implementação</h1><ul><li>Configurar ambiente</li><li>Migrar dados</li><li>Testar integrações</li><li>Validar com cliente</li></ul>",
      category: "checklist",
      status: "published",
      company: "Empresa X",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    // Empresa Y
    {
      title: "Proposta Comercial",
      content: "<h1>Proposta Comercial</h1><p>Proposta de serviços para a Empresa Y.</p><h2>Escopo</h2><p>Descrição detalhada dos serviços oferecidos.</p>",
      category: "manual",
      status: "published",
      company: "Empresa Y",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "Relatório de Auditoria",
      content: "<h1>Relatório de Auditoria</h1><p>Resultado da auditoria realizada em dezembro de 2024.</p>",
      category: "guide",
      status: "draft",
      company: "Empresa Y",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    // Tech Solutions
    {
      title: "Manual de Integração API",
      content: "<h1>Manual de Integração API</h1><p>Documentação técnica para integração com a API do sistema.</p><h2>Endpoints</h2><ul><li>GET /api/users</li><li>POST /api/documents</li><li>PUT /api/documents/:id</li></ul>",
      category: "manual",
      status: "published",
      company: "Tech Solutions",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "Guia de Deploy",
      content: "<h1>Guia de Deploy</h1><p>Passo a passo para realizar o deploy do sistema.</p>",
      category: "guide",
      status: "published",
      company: "Tech Solutions",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    // Geral (sem cliente específico)
    {
      title: "Getting Started Guide",
      content: "<h1>Welcome to DocTrack</h1><p>This guide will help you get started with our document management system.</p><h2>Key Features</h2><ul><li>Rich text editing</li><li>Version control</li><li>PDF export</li><li>Global search</li></ul>",
      category: "guide",
      status: "published",
      company: "Geral",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
  ];

  for (const doc of sampleDocs) {
    const [document] = await db.insert(documents).values(doc).returning();
    
    await db.insert(versions).values({
      documentId: document.id,
      versionNumber: "1.0",
      content: doc.content,
      authorId: doc.authorId,
      authorName: doc.authorName,
      changeDescription: "Initial version",
    });
    
    console.log("Created document:", document.title);
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));

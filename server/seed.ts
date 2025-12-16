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
    {
      title: "Getting Started Guide",
      content: "<h1>Welcome to DocTrack</h1><p>This guide will help you get started with our document management system.</p><h2>Key Features</h2><ul><li>Rich text editing</li><li>Version control</li><li>PDF export</li><li>Global search</li></ul><p>Start by creating your first document using the <strong>New Document</strong> button in the sidebar.</p>",
      category: "guide",
      status: "published",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "System Administration Manual",
      content: "<h1>System Administration Manual</h1><p>This comprehensive manual covers all aspects of system administration.</p><h2>Table of Contents</h2><ol><li>User Management</li><li>Security Configuration</li><li>Backup Procedures</li><li>Troubleshooting</li></ol><h2>User Management</h2><p>Learn how to create, modify, and delete user accounts in the system.</p>",
      category: "manual",
      status: "published",
      authorId: adminUser.id,
      authorName: adminUser.username,
    },
    {
      title: "Daily Operations Checklist",
      content: "<h1>Daily Operations Checklist</h1><p>Complete the following tasks each day to ensure smooth operations.</p><h2>Morning Tasks</h2><ul><li>Check system status</li><li>Review overnight logs</li><li>Verify backups completed</li></ul><h2>Evening Tasks</h2><ul><li>Generate daily report</li><li>Update documentation</li><li>Schedule maintenance</li></ul>",
      category: "checklist",
      status: "draft",
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

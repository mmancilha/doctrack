import {
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type Version,
  type InsertVersion,
  type Comment,
  type InsertComment,
  type AuditLog,
  type InsertAuditLog,
  type SearchQuery,
  users,
  documents,
  versions,
  comments,
  auditLogs,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsers(): Promise<User[]>;

  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: string, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  searchDocuments(query: SearchQuery): Promise<Document[]>;

  getVersions(documentId: string): Promise<Version[]>;
  getVersion(id: string): Promise<Version | undefined>;
  createVersion(version: InsertVersion): Promise<Version>;

  getComments(documentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  getAuditLogs(documentId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.updatedAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(insertDoc).returning();
    
    await db.insert(versions).values({
      documentId: doc.id,
      versionNumber: "1.0",
      content: insertDoc.content,
      authorId: insertDoc.authorId,
      authorName: insertDoc.authorName,
      changeDescription: "Initial version",
    });
    
    return doc;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!existing) return undefined;

    const [updatedDoc] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();

    if (updates.content && updates.content !== existing.content) {
      const existingVersions = await db
        .select()
        .from(versions)
        .where(eq(versions.documentId, id))
        .orderBy(desc(versions.createdAt));

      const lastVersion = existingVersions[0];
      const [major, minor] = (lastVersion?.versionNumber || "1.0").split(".").map(Number);
      const newVersionNumber = `${major}.${minor + 1}`;

      await db.insert(versions).values({
        documentId: id,
        versionNumber: newVersionNumber,
        content: updates.content,
        authorId: updates.authorId || existing.authorId,
        authorName: updates.authorName || existing.authorName,
        changeDescription: null,
      });
    }

    return updatedDoc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    await db.delete(versions).where(eq(versions.documentId, id));
    await db.delete(comments).where(eq(comments.documentId, id));
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  async searchDocuments(query: SearchQuery): Promise<Document[]> {
    const conditions: any[] = [];

    if (query.query) {
      const searchTerm = `%${query.query}%`;
      conditions.push(
        or(
          ilike(documents.title, searchTerm),
          ilike(documents.content, searchTerm),
          ilike(documents.authorName, searchTerm)
        )
      );
    }

    if (query.category && query.category !== "all") {
      conditions.push(eq(documents.category, query.category));
    }

    if (query.status && query.status !== "all") {
      conditions.push(eq(documents.status, query.status));
    }

    if (query.authorId) {
      conditions.push(eq(documents.authorId, query.authorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.updatedAt));
  }

  async getVersions(documentId: string): Promise<Version[]> {
    return await db
      .select()
      .from(versions)
      .where(eq(versions.documentId, documentId))
      .orderBy(desc(versions.createdAt));
  }

  async getVersion(id: string): Promise<Version | undefined> {
    const [version] = await db.select().from(versions).where(eq(versions.id, id));
    return version;
  }

  async createVersion(insertVersion: InsertVersion): Promise<Version> {
    const [version] = await db.insert(versions).values(insertVersion).returning();
    return version;
  }

  async getComments(documentId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.documentId, documentId))
      .orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: string, updates: Partial<InsertComment>): Promise<Comment | undefined> {
    const [updated] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async getAuditLogs(documentId?: string): Promise<AuditLog[]> {
    if (documentId) {
      return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.documentId, documentId))
        .orderBy(desc(auditLogs.createdAt));
    }
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();

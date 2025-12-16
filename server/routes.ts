import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, searchQuerySchema } from "@shared/schema";
import { z } from "zod";
import jsPDF from "jspdf";
import { requireAuth, canEditDocuments, canDeleteDocuments } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/documents", async (req, res) => {
    try {
      const { query, category, status, authorId } = req.query;
      
      if (query || category || status || authorId) {
        const searchQuery = searchQuerySchema.parse({
          query: query as string,
          category: category as string,
          status: status as string,
          authorId: authorId as string,
        });
        const documents = await storage.searchDocuments(searchQuery);
        res.json(documents);
      } else {
        const documents = await storage.getDocuments();
        res.json(documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", canEditDocuments, async (req, res) => {
    try {
      const user = req.user!;
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        authorId: user.id,
        authorName: user.username,
      });
      const document = await storage.createDocument(validatedData);
      
      await storage.createAuditLog({
        documentId: document.id,
        userId: user.id,
        userName: user.username,
        action: "created",
        details: `Created document: ${document.title}`,
      });

      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid document data", details: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", canEditDocuments, async (req, res) => {
    try {
      const user = req.user!;
      const existingDoc = await storage.getDocument(req.params.id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }

      const partialSchema = insertDocumentSchema.partial();
      const validatedData = partialSchema.parse({
        ...req.body,
        authorId: user.id,
        authorName: user.username,
      });
      
      const document = await storage.updateDocument(req.params.id, validatedData);

      if (document) {
        await storage.createAuditLog({
          documentId: document.id,
          userId: user.id,
          userName: user.username,
          action: "updated",
          details: `Updated document: ${document.title}`,
        });
      }

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid document data", details: error.errors });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", canDeleteDocuments, async (req, res) => {
    try {
      const user = req.user!;
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      await storage.createAuditLog({
        documentId: document.id,
        userId: user.id,
        userName: user.username,
        action: "deleted",
        details: `Deleted document: ${document.title}`,
      });

      const deleted = await storage.deleteDocument(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/documents/:id/versions", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const versions = await storage.getVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ error: "Failed to fetch versions" });
    }
  });

  app.get("/api/versions/:id", async (req, res) => {
    try {
      const version = await storage.getVersion(req.params.id);
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      res.json(version);
    } catch (error) {
      console.error("Error fetching version:", error);
      res.status(500).json({ error: "Failed to fetch version" });
    }
  });

  app.post("/api/documents/:id/export-pdf", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text("DocTrack", margin, 15);
      pdf.text(new Date().toLocaleDateString(), pageWidth - margin, 15, { align: "right" });

      pdf.setDrawColor(200);
      pdf.line(margin, 20, pageWidth - margin, 20);

      pdf.setFontSize(24);
      pdf.setTextColor(0);
      pdf.text(document.title, margin, 35);

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Category: ${document.category} | Status: ${document.status}`, margin, 45);
      pdf.text(`Author: ${document.authorName}`, margin, 52);
      pdf.text(`Last updated: ${new Date(document.updatedAt).toLocaleDateString()}`, margin, 59);

      pdf.line(margin, 65, pageWidth - margin, 65);

      const stripHtml = (html: string) => {
        return html
          .replace(/<h1[^>]*>/gi, "\n\n")
          .replace(/<\/h1>/gi, "\n")
          .replace(/<h2[^>]*>/gi, "\n\n")
          .replace(/<\/h2>/gi, "\n")
          .replace(/<h3[^>]*>/gi, "\n")
          .replace(/<\/h3>/gi, "\n")
          .replace(/<p[^>]*>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<li[^>]*>/gi, "\n• ")
          .replace(/<\/li>/gi, "")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      };

      const plainText = stripHtml(document.content);
      pdf.setFontSize(11);
      pdf.setTextColor(30);

      const lines = pdf.splitTextToSize(plainText, contentWidth);
      let y = 75;
      const lineHeight = 6;
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (const line of lines) {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      }

      const pdfBuffer = pdf.output("arraybuffer");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`
      );
      res.send(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({ error: "Failed to export PDF" });
    }
  });

  app.get("/api/documents/:id/comments", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { documentId } = req.query;
      const logs = await storage.getAuditLogs(documentId as string | undefined);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  return httpServer;
}

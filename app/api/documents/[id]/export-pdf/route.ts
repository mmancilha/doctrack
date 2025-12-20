import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { resolveParams } from "@/lib/route-helpers";
import jsPDF from "jspdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const { id } = await resolveParams(params);
    const document = await storage.getDocument(id, user);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { versionId } = body as { versionId?: string };

    let contentToExport = document.content;
    let versionLabel = "Current";
    let authorName = document.authorName;
    let updatedAt = document.updatedAt;

    if (versionId) {
      const version = await storage.getVersion(versionId);
      if (!version) {
        return NextResponse.json(
          { error: "Version not found" },
          { status: 404 }
        );
      }
      contentToExport = version.content;
      versionLabel = `v${version.versionNumber}`;
      authorName = version.authorName;
      updatedAt = version.createdAt;
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
    pdf.text(new Date().toLocaleDateString(), pageWidth - margin, 15, {
      align: "right",
    });

    pdf.setDrawColor(200);
    pdf.line(margin, 20, pageWidth - margin, 20);

    pdf.setFontSize(24);
    pdf.setTextColor(0);
    pdf.text(document.title, margin, 35);

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
      `Category: ${document.category} | Status: ${document.status} | Version: ${versionLabel}`,
      margin,
      45
    );
    pdf.text(`Author: ${authorName}`, margin, 52);
    pdf.text(`Date: ${new Date(updatedAt).toLocaleDateString()}`, margin, 59);

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

    const plainText = stripHtml(contentToExport);
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

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    );
  }
}


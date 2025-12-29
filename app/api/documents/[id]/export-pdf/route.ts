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
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0);
    const titleLines = pdf.splitTextToSize(document.title, contentWidth);
    let titleY = 35;
    for (const line of titleLines) {
      pdf.text(line, margin, titleY);
      titleY += 10; // Increased spacing between title lines
    }

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    const metadataY = titleY + 8; // Space after title
    pdf.text(
      `Category: ${document.category} | Status: ${document.status} | Version: ${versionLabel}`,
      margin,
      metadataY
    );
    
    pdf.line(margin, metadataY + 5, pageWidth - margin, metadataY + 5);
    
    const authorY = metadataY + 10; // Space after metadata line
    pdf.text(`Author: ${authorName}`, margin, authorY);
    pdf.text(`Date: ${new Date(updatedAt).toLocaleDateString()}`, margin, authorY + 7);
    
    // Calculate where content should start - after author/date with proper spacing
    const contentStartY = authorY + 20; // Increased space after author/date before content

    interface TextItem {
      text: string;
      fontSize: number;
      isBold: boolean;
      isItalic: boolean;
      indent: number;
      isListItem: boolean;
      listType?: "bullet" | "ordered";
      listNumber?: number;
    }

    const parseHtmlToPdf = (html: string): TextItem[] => {
      const items: TextItem[] = [];
      
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

      const listStack: Array<{ type: "ordered" | "unordered"; counter: number; level: number }> = [];

      // Extract text content from HTML, preserving formatting info
      const extractText = (htmlContent: string): { text: string; isBold: boolean; isItalic: boolean } => {
        let isBold = /<(strong|b)[^>]*>/i.test(htmlContent);
        let isItalic = /<(em|i)[^>]*>/i.test(htmlContent);
        
        let text = htmlContent
          .replace(/<(strong|b)[^>]*>/gi, "")
          .replace(/<\/(strong|b)>/gi, "")
          .replace(/<(em|i)[^>]*>/gi, "")
          .replace(/<\/(em|i)>/gi, "")
          .replace(/<p[^>]*>/gi, "")
          .replace(/<\/p>/gi, "")
          .replace(/<div[^>]*>/gi, "")
          .replace(/<\/div>/gi, "")
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
        
        return { text, isBold, isItalic };
      };

      // Process HTML sequentially using a simple parser
      let pos = 0;
      const htmlLength = html.length;

      while (pos < htmlLength) {
        // Find next tag
        const tagStart = html.indexOf('<', pos);
        if (tagStart === -1) {
          // No more tags, process remaining text
          const remainingText = html.substring(pos).trim();
          if (remainingText) {
            const extracted = extractText(remainingText);
            if (extracted.text) {
              items.push({
                text: extracted.text,
                fontSize: 11,
                isBold: extracted.isBold,
                isItalic: extracted.isItalic,
                indent: listStack.length > 0 ? (listStack.length - 1) * 8 : 0,
                isListItem: false,
              });
            }
          }
          break;
        }

        // Process text before tag
        if (tagStart > pos) {
          const beforeText = html.substring(pos, tagStart).trim();
          if (beforeText && !beforeText.match(/^\s*$/)) {
            const extracted = extractText(beforeText);
            if (extracted.text) {
              items.push({
                text: extracted.text,
                fontSize: 11,
                isBold: extracted.isBold,
                isItalic: extracted.isItalic,
                indent: listStack.length > 0 ? (listStack.length - 1) * 8 : 0,
                isListItem: false,
              });
            }
          }
        }

        // Find tag end
        const tagEnd = html.indexOf('>', tagStart);
        if (tagEnd === -1) break;

        const fullTag = html.substring(tagStart, tagEnd + 1);
        const tagMatch = fullTag.match(/<\/?([a-z0-9]+)[^>]*>/i);
        
        if (!tagMatch) {
          pos = tagEnd + 1;
          continue;
        }

        const isClosing = fullTag.startsWith('</');
        const tagName = tagMatch[1].toLowerCase();

        // Handle headings
        if (/^h[1-4]$/.test(tagName) && !isClosing) {
          const headingEnd = html.indexOf(`</${tagName}>`, tagEnd);
          if (headingEnd !== -1) {
            const headingContent = html.substring(tagEnd + 1, headingEnd);
            const extracted = extractText(headingContent);
            const level = parseInt(tagName.substring(1));
            const fontSize = level === 1 ? 20 : level === 2 ? 16 : level === 3 ? 14 : 12;
            
            if (extracted.text) {
              items.push({
                text: extracted.text,
                fontSize,
                isBold: true,
                isItalic: false,
                indent: 0,
                isListItem: false,
              });
            }
            pos = headingEnd + tagName.length + 3;
            continue;
          }
        }

        // Handle paragraphs (skip if contains lists, as lists will be processed separately)
        if (tagName === 'p' && !isClosing) {
          const paraEnd = html.indexOf('</p>', tagEnd);
          if (paraEnd !== -1) {
            const paraContent = html.substring(tagEnd + 1, paraEnd);
            // Skip paragraphs that contain lists - lists will be processed separately
            if (!/<(ul|ol)[^>]*>/i.test(paraContent)) {
              const extracted = extractText(paraContent);
              
              if (extracted.text) {
                items.push({
                  text: extracted.text,
                  fontSize: 11,
                  isBold: extracted.isBold,
                  isItalic: extracted.isItalic,
                  indent: listStack.length > 0 ? (listStack.length - 1) * 8 : 0,
                  isListItem: false,
                });
              }
            }
            pos = paraEnd + 4;
            continue;
          }
        }

        // Handle lists
        if (tagName === 'ul' && !isClosing) {
          const ulEnd = html.indexOf('</ul>', tagEnd);
          if (ulEnd !== -1) {
            listStack.push({ type: "unordered", counter: 0, level: listStack.length });
            const ulContent = html.substring(tagEnd + 1, ulEnd);
            
            // Process list items
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            while ((liMatch = liRegex.exec(ulContent)) !== null) {
              listStack[listStack.length - 1].counter++;
              const extracted = extractText(liMatch[1]);
              
              if (extracted.text) {
                items.push({
                  text: extracted.text,
                  fontSize: 11,
                  isBold: extracted.isBold,
                  isItalic: extracted.isItalic,
                  indent: (listStack.length - 1) * 8,
                  isListItem: true,
                  listType: "bullet",
                });
              }
            }
            
            listStack.pop();
            pos = ulEnd + 5;
            continue;
          }
        }

        if (tagName === 'ol' && !isClosing) {
          const olEnd = html.indexOf('</ol>', tagEnd);
          if (olEnd !== -1) {
            listStack.push({ type: "ordered", counter: 0, level: listStack.length });
            const olContent = html.substring(tagEnd + 1, olEnd);
            
            // Process list items
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            while ((liMatch = liRegex.exec(olContent)) !== null) {
              listStack[listStack.length - 1].counter++;
              const extracted = extractText(liMatch[1]);
              
              if (extracted.text) {
                items.push({
                  text: extracted.text,
                  fontSize: 11,
                  isBold: extracted.isBold,
                  isItalic: extracted.isItalic,
                  indent: (listStack.length - 1) * 8,
                  isListItem: true,
                  listType: "ordered",
                  listNumber: listStack[listStack.length - 1].counter,
                });
              }
            }
            
            listStack.pop();
            pos = olEnd + 5;
            continue;
          }
        }

        pos = tagEnd + 1;
      }

      return items;
    };

    const contentItems = parseHtmlToPdf(contentToExport);
    let y = contentStartY; // Use calculated content start position
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30);

    // Helper function to calculate dynamic line height based on font size
    const getLineHeight = (fontSize: number): number => {
      // jsPDF uses points internally, convert to mm: 1pt = 0.352778mm
      // Use 1.8x multiplier for comfortable spacing (accounts for descenders and spacing)
      // This ensures lines don't overlap
      // Minimum 7mm to ensure readability
      return Math.max(7, (fontSize * 0.352778) * 1.8);
    };

    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      const nextItem = i < contentItems.length - 1 ? contentItems[i + 1] : null;
      
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(item.fontSize);
      pdf.setFont("helvetica", item.isBold ? "bold" : item.isItalic ? "italic" : "normal");

      const xPosition = margin + item.indent;
      const lineHeight = getLineHeight(item.fontSize);

      if (item.isListItem) {
        const listPrefix = item.listType === "ordered" 
          ? `${item.listNumber}. ` 
          : "• ";
        
        pdf.setFontSize(item.fontSize);
        pdf.setFont("helvetica", "normal");
        pdf.text(listPrefix, xPosition, y);
        
        const prefixWidth = pdf.getTextWidth(listPrefix);
        const textX = xPosition + prefixWidth;
        const availableWidth = contentWidth - item.indent - prefixWidth;
        
        const lines = pdf.splitTextToSize(item.text, availableWidth);
        
        for (let j = 0; j < lines.length; j++) {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          
          pdf.setFontSize(item.fontSize);
          pdf.setFont("helvetica", item.isBold ? "bold" : item.isItalic ? "italic" : "normal");
          
          if (j === 0) {
            pdf.text(lines[j], textX, y);
          } else {
            pdf.text(lines[j], xPosition + prefixWidth, y);
          }
          // Move to next line with proper spacing
          y += lineHeight;
        }
      } else {
        const availableWidth = contentWidth - item.indent;
        const lines = pdf.splitTextToSize(item.text, availableWidth);
        
        for (const line of lines) {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line, xPosition, y);
          // Move to next line with proper spacing
          y += lineHeight;
        }
      }

      // Add spacing after item based on type
      // Use the current item's lineHeight for consistent spacing
      const currentLineHeight = getLineHeight(item.fontSize);
      
      if (item.fontSize >= 14) {
        // Heading spacing - adjust based on what comes next
        if (nextItem && nextItem.fontSize < 14 && !nextItem.isListItem) {
          // Heading followed by paragraph - minimal spacing (just one line)
          y += currentLineHeight * 0.5;
        } else if (nextItem && nextItem.fontSize >= 14) {
          // Heading followed by another heading - more space
          y += currentLineHeight * 1.2;
        } else {
          // Heading followed by list or end - moderate spacing
          y += currentLineHeight * 0.8;
        }
      } else if (item.isListItem) {
        // List item spacing - moderate spacing between items
        if (!nextItem?.isListItem) {
          // End of list - add more space
          y += currentLineHeight * 0.6;
        } else {
          // Between list items - minimal spacing
          y += currentLineHeight * 0.2;
        }
      } else {
        // Paragraph spacing - check if next item is also a paragraph
        if (nextItem && nextItem.fontSize < 14 && !nextItem.isListItem) {
          // Between paragraphs - moderate spacing
          y += currentLineHeight * 0.5;
        } else {
          // Before heading or list - more space
          y += currentLineHeight * 0.7;
        }
      }
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


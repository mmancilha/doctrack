"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, CheckSquare, FileCheck, FileText, MoreVertical, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRelativeTime } from "@/lib/date-utils";
import type { Document } from "@shared/schema";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  index?: number;
  canDelete?: boolean;
}

const categoryIcons = {
  manual: BookOpen,
  checklist: CheckSquare,
  guide: FileCheck,
};

const statusColors = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
};

export function DocumentCard({ document, onDelete, index = 0, canDelete = false }: DocumentCardProps) {
  const { t } = useTranslation("common");
  const { t: tDocuments } = useTranslation("documents");
  const relativeTime = useRelativeTime();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const Icon = categoryIcons[document.category as keyof typeof categoryIcons] || FileText;
  const statusColor = statusColors[document.status as keyof typeof statusColors] || statusColors.draft;

  const getCategoryLabel = (category: string) => {
    // Tentar traduzir a categoria, se não encontrar, retornar a categoria original
    const translationKey = `categories.${category}`;
    const translated = t(translationKey);
    // Se a tradução retornar a própria chave, significa que não existe tradução
    return translated !== translationKey ? translated : category;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return t("statuses.draft");
      case "published": return t("statuses.published");
      case "archived": return t("statuses.archived");
      default: return status;
    }
  };

  const getPreviewText = (content: string) => {
    if (!content || !content.trim()) {
      return tDocuments("list.noContent");
    }

    // Função auxiliar para limpar texto HTML
    const cleanHtmlText = (html: string): string => {
      // Primeiro, substituir quebras de linha e tags de bloco por espaços
      let text = html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<\/div>/gi, " ")
        .replace(/<\/h[1-6]>/gi, " ");
      
      // Remover todas as tags HTML
      text = text.replace(/<[^>]*>/g, "");
      
      // Decodificar entidades HTML comuns
      text = text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Remover espaços múltiplos e normalizar
      text = text.replace(/\s+/g, " ").trim();
      
      return text;
    };

    // 1. Priorizar: tentar pegar o primeiro título (h1, h2, h3)
    const headingMatch = content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
    if (headingMatch && headingMatch[1]) {
      let titleText = cleanHtmlText(headingMatch[1]);
      if (titleText) {
        // Se o título couber, tentar adicionar o primeiro parágrafo também
        const firstParagraphMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
        if (firstParagraphMatch && firstParagraphMatch[1]) {
          let paragraphText = cleanHtmlText(firstParagraphMatch[1]);
          if (paragraphText && paragraphText !== titleText) {
            const combined = `${titleText} ${paragraphText}`;
            return combined.length > 150 ? combined.substring(0, 150) + "..." : combined;
          }
        }
        return titleText.length > 150 ? titleText.substring(0, 150) + "..." : titleText;
      }
    }

    // 2. Se não tiver título, pegar o primeiro parágrafo
    const firstParagraphMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
    if (firstParagraphMatch && firstParagraphMatch[1]) {
      let text = cleanHtmlText(firstParagraphMatch[1]);
      if (text) {
        return text.length > 150 ? text.substring(0, 150) + "..." : text;
      }
    }

    // 3. Fallback: pegar todo o texto, mas garantir espaços entre palavras
    let text = cleanHtmlText(content);
    
    if (!text) {
      return tDocuments("list.noContent");
    }

    // Aumentar o limite para 150 caracteres para aproveitar melhor o espaço do card
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/document/${document.id}`}>
        <Card
          className="group cursor-pointer transition-all duration-200 hover-elevate h-[160px] flex flex-col"
          data-testid={`card-document-${document.id}`}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="font-medium text-sm truncate" data-testid={`text-title-${document.id}`}>
                  {document.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{getCategoryLabel(document.category)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <Badge
                variant="secondary"
                className={`text-xs shrink-0 whitespace-nowrap no-default-hover-elevate no-default-active-elevate ${statusColor}`}
              >
                {getStatusLabel(document.status)}
              </Badge>
              {canDelete && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-menu-${document.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeleteConfirm(true);
                        }}
                        className="text-destructive"
                        data-testid={`button-delete-${document.id}`}
                      >
                        {t("buttons.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{tDocuments("deleteConfirm.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {tDocuments("deleteConfirm.description")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tDocuments("deleteConfirm.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete?.(document.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {tDocuments("deleteConfirm.confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px]">
              {getPreviewText(document.content)}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{document.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {relativeTime(new Date(document.updatedAt))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

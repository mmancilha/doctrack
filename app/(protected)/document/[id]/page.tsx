"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Download,
  GitBranch,
  GitCompare,
  Clock,
  MoreVertical,
  Trash2,
  Eye,
  MessageSquare,
  Check,
  ChevronsUpDown,
  Building2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Spinner } from "@/components/ui/spinner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { VersionHistory } from "@/components/version-history";
import { VersionDiff } from "@/components/version-diff";
import { EditorSkeleton } from "@/components/loading-skeleton";
import { SectionComments } from "@/components/section-comments";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useDocumentCategories, useDocumentStatuses } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import type { Document, Version, InsertDocument } from "@shared/schema";

export default function DocumentEditor({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  // Handle both Promise and plain object params
  // Check if params is a Promise by checking for 'then' method
  const isPromise = params && typeof params === "object" && "then" in params;
  const resolvedParams = isPromise 
    ? use(params as Promise<{ id: string }>) 
    : (params as { id: string });
  const id = resolvedParams?.id || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, canEdit, canDelete } = useAuth();
  const isNewDocument = !id || id === "new";

  const documentCategories = useDocumentCategories();
  const documentStatuses = useDocumentStatuses();

  const validCategories = [
    "manual",
    "checklist",
    "guide",
    "confidentiality",
    "proposal",
    "contract",
    "policy",
    "procedure",
  ];

  // Get category from URL query string for new documents
  const getInitialCategory = () => {
    const urlCategory = searchParams.get("category");
    if (urlCategory && validCategories.includes(urlCategory)) {
      return urlCategory;
    }
    return "manual";
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(getInitialCategory());
  const [status, setStatus] = useState<string>("draft");
  const [company, setCompany] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{
    v1: Version;
    v2: Version;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  // Local list of clients created during this session
  const [localClients, setLocalClients] = useState<string[]>([]);

  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !isNewDocument && !!id,
  });

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery<
    Version[]
  >({
    queryKey: ["/api/documents", id, "versions"],
    enabled: !isNewDocument && !!id,
  });

  // Fetch all documents for client autocomplete
  const { data: allDocuments = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Extract unique client names from documents and combine with local clients
  const existingClients = [
    ...new Set([
      ...allDocuments.map((doc) => doc.company).filter(Boolean),
      ...localClients,
    ]),
  ].sort();

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      const docCompany = document.company || "";
      setCompany(docCompany);
      // Add document's company to local clients if it exists
      if (docCompany) {
        setLocalClients((prev) => {
          if (!prev.includes(docCompany)) {
            return [...prev, docCompany].sort();
          }
          return prev;
        });
      }
      setContent(document.content);
      setCategory(document.category);
      setStatus(document.status);
    }
  }, [document]);

  const createDocument = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json() as Promise<Document>;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: t("toast.created.title"),
        description: t("toast.created.description"),
        duration: 2000,
      });
      router.push(`/document/${newDoc.id}`);
    },
    onError: () => {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.create"),
        variant: "destructive",
      });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async (data: Partial<InsertDocument>) => {
      const response = await apiRequest("PATCH", `/api/documents/${id}`, data);
      return response.json() as Promise<Document>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", id] });
      queryClient.invalidateQueries({
        queryKey: ["/api/documents", id, "versions"],
      });
      toast({
        title: t("toast.saved.title"),
        description: t("toast.saved.description"),
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.save"),
        variant: "destructive",
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: t("toast.deleted.title"),
        description: t("toast.deleted.description"),
      });
      router.push("/");
    },
  });

  const exportPdf = useMutation({
    mutationFn: async (versionId?: string) => {
      // Se tiver versionId, buscar conteúdo da versão específica
      let contentToExport = content;
      let versionLabel = "";
      
      if (versionId) {
        const version = versions.find((v) => v.id === versionId);
        if (version) {
          contentToExport = version.content;
          versionLabel = `_v${version.versionNumber}`;
        }
      }

      // Preparar traduções e labels antes de criar o HTML
      const categoryLabel = documentCategories.find(c => c.value === category)?.label || category;
      const statusLabel = documentStatuses.find(s => s.value === status)?.label || status;
      const docTitle = document?.title || title || "Documento";
      const authorName = document?.authorName || user?.username || "N/A";
      const docDate = document ? new Date(document.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();
      const exportDate = new Date().toLocaleDateString();

      // Criar elemento temporário para renderizar o HTML formatado
      const tempDiv = document.createElement("div");
      tempDiv.id = "pdf-export-temp";
      // Usar pixels ao invés de mm para melhor compatibilidade
      tempDiv.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 794px;
        min-height: 1123px;
        padding: 76px;
        background-color: #ffffff;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #000000;
        z-index: -9999;
        visibility: hidden;
        overflow: hidden;
      `;
      
      // Adicionar cabeçalho
      const header = document.createElement("div");
      header.style.cssText = "margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;";
      header.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10px; color: #6b7280;">
          <span>DocTrack</span>
          <span>${exportDate}</span>
        </div>
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #000000;">${docTitle.replace(/"/g, "&quot;")}</h1>
        <div style="font-size: 10px; color: #6b7280; margin-bottom: 5px;">
          ${t("editor.category")}: ${categoryLabel} | 
          ${t("editor.status")}: ${statusLabel}${versionLabel ? ` | ${t("editor.versions")}: ${versionLabel.replace('_', '')}` : ''}
        </div>
        <div style="font-size: 10px; color: #6b7280;">
          Autor: ${authorName} | 
          Data: ${docDate}
        </div>
      `;
      tempDiv.appendChild(header);

      // Adicionar conteúdo formatado com estilos do editor
      const contentDiv = document.createElement("div");
      contentDiv.style.cssText = `
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #000000;
      `;
      contentDiv.innerHTML = contentToExport;
      
      // Aplicar estilos básicos para elementos HTML comuns
      const style = document.createElement("style");
      style.setAttribute("data-pdf-export", "true");
      style.textContent = `
        #pdf-export-temp .prose h1 { font-size: 2em; font-weight: bold; margin: 1em 0 0.5em 0; }
        #pdf-export-temp .prose h2 { font-size: 1.5em; font-weight: bold; margin: 0.8em 0 0.4em 0; }
        #pdf-export-temp .prose h3 { font-size: 1.25em; font-weight: bold; margin: 0.6em 0 0.3em 0; }
        #pdf-export-temp .prose p { margin: 0.5em 0; }
        #pdf-export-temp .prose ul, #pdf-export-temp .prose ol { margin: 0.5em 0; padding-left: 1.5em; }
        #pdf-export-temp .prose li { margin: 0.25em 0; }
        #pdf-export-temp .prose strong, #pdf-export-temp .prose b { font-weight: bold; }
        #pdf-export-temp .prose em, #pdf-export-temp .prose i { font-style: italic; }
        #pdf-export-temp .prose code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; }
        #pdf-export-temp .prose blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1em 0; color: #6b7280; }
        #pdf-export-temp .prose table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        #pdf-export-temp .prose table td, #pdf-export-temp .prose table th { border: 1px solid #e5e7eb; padding: 0.5em; }
        #pdf-export-temp .prose table th { background: #f9fafb; font-weight: bold; }
        #pdf-export-temp .prose img { max-width: 100%; height: auto; }
        #pdf-export-temp .prose a { color: #2563eb; text-decoration: underline; }
      `;
      document.head.appendChild(style);
      contentDiv.className = "prose";
      tempDiv.appendChild(contentDiv);

      document.body.appendChild(tempDiv);

      try {
        // Aguardar para garantir que o elemento está renderizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar se o elemento foi renderizado corretamente
        if (!tempDiv.offsetWidth || !tempDiv.offsetHeight) {
          throw new Error(`Elemento não renderizado: width=${tempDiv.offsetWidth}, height=${tempDiv.offsetHeight}`);
        }

        console.log("Iniciando captura html2canvas...", {
          width: tempDiv.offsetWidth,
          height: tempDiv.offsetHeight,
          scrollHeight: tempDiv.scrollHeight
        });

        // Capturar como imagem usando html2canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 1,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
          allowTaint: false,
          removeContainer: false,
          width: tempDiv.offsetWidth,
          height: tempDiv.scrollHeight || tempDiv.offsetHeight,
        });

        console.log("Canvas criado:", {
          width: canvas.width,
          height: canvas.height
        });

        // Remover elemento temporário e estilo
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        const styleElement = document.querySelector('style[data-pdf-export]');
        if (styleElement && document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }

        // Criar PDF
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/png", 1.0);

        console.log("Dados da imagem:", {
          imgWidth,
          imgHeight,
          pageHeight,
          dataLength: imgData.length
        });

        let heightLeft = imgHeight;
        let position = 0;

        // Adicionar primeira página
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Adicionar páginas adicionais se necessário
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Salvar PDF
        const fileName = `${(title || "document").replace(/[^a-z0-9._-]/gi, "_")}${versionLabel}.pdf`;
        pdf.save(fileName);
        
        console.log("PDF gerado com sucesso:", fileName);
      } catch (error: any) {
        // Limpar elementos temporários em caso de erro
        const tempDivElement = document.getElementById("pdf-export-temp");
        if (tempDivElement && document.body.contains(tempDivElement)) {
          document.body.removeChild(tempDivElement);
        }
        const styleElement = document.querySelector('style[data-pdf-export]');
        if (styleElement && document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
        
        console.error("Erro detalhado ao exportar PDF:", error);
        const errorMessage = error?.message || "Erro desconhecido ao exportar PDF";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast({
        title: t("toast.exported.title"),
        description: t("toast.exported.description"),
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.export"),
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const handleSave = useCallback(async () => {
    if (!company.trim()) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.noClient"),
        variant: "destructive",
      });
      return;
    }

    if (!canEdit) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.noPermission"),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isNewDocument) {
        await createDocument.mutateAsync({
          title: title || company || "Sem título",
          content,
          category,
          status,
          company: company || "Geral",
          authorId: user?.id || "",
          authorName: user?.username || "",
        });
      } else {
        await updateDocument.mutateAsync({
          title: title || company || "Sem título",
          content,
          category,
          status,
          company: company || "Geral",
          authorId: user?.id || "",
          authorName: user?.username || "",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    company,
    title,
    content,
    category,
    status,
    canEdit,
    isNewDocument,
    user,
    createDocument,
    updateDocument,
    toast,
    t,
  ]);

  if (isLoadingDocument) {
    return (
      <div className="p-6">
        <EditorSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {!isNewDocument && (
            <h1 className="text-lg font-semibold truncate" data-testid="document-title">
              {document?.title || title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionHistory(true)}
            data-testid="button-versions"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            {t("editor.versions")}
          </Button>
          {!isNewDocument && versions.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowVersionHistory(true);
                setIsComparing(true);
              }}
              data-testid="button-compare"
            >
              <GitCompare className="h-4 w-4 mr-2" />
              {t("editor.compare")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(true)}
            data-testid="button-comments"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t("editor.comments")}
          </Button>
          {!isNewDocument && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPdf.mutate(undefined)}
              disabled={exportPdf.isPending}
              data-testid="button-export"
            >
              {exportPdf.isPending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {exportPdf.isPending ? t("editor.exporting") : t("editor.export")}
            </Button>
          )}
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={isSaving || createDocument.isPending || updateDocument.isPending}
              data-testid="button-save"
            >
              {isSaving || createDocument.isPending || updateDocument.isPending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving || createDocument.isPending || updateDocument.isPending
                ? t("editor.saving")
                : isNewDocument
                ? t("editor.create")
                : t("editor.save")}
            </Button>
          )}
          {canDelete && !isNewDocument && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-more">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive"
                  data-testid="button-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("editor.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                {t("editor.client")}
              </label>
              <div className="flex gap-2">
                <Select
                  value={company || undefined}
                  onValueChange={(value) => setCompany(value)}
                >
                  <SelectTrigger data-testid="select-client" className="flex-1">
                    <SelectValue placeholder={t("editor.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {existingClients.length > 0 ? (
                      existingClients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {t("editor.noClientFound")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("editor.createClient", { name: "" }).replace(/"/g, "")}
                        </label>
                        <Input
                          placeholder={t("editor.clientPlaceholder")}
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && clientSearch.trim()) {
                              const newClient = clientSearch.trim();
                              setCompany(newClient);
                              // Add to local clients list if not already there
                              setLocalClients((prev) => {
                                if (!prev.includes(newClient)) {
                                  return [...prev, newClient].sort();
                                }
                                return prev;
                              });
                              setClientPopoverOpen(false);
                              setClientSearch("");
                            }
                          }}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (clientSearch.trim()) {
                            const newClient = clientSearch.trim();
                            setCompany(newClient);
                            // Add to local clients list if not already there
                            setLocalClients((prev) => {
                              if (!prev.includes(newClient)) {
                                return [...prev, newClient].sort();
                              }
                              return prev;
                            });
                            setClientPopoverOpen(false);
                            setClientSearch("");
                          }
                        }}
                        disabled={!clientSearch.trim()}
                      >
                        {t("editor.create")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t("editor.category")}
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t("editor.status")}
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentStatuses.map((stat) => (
                    <SelectItem key={stat.value} value={stat.value}>
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              editable={canEdit}
            />
          </div>
        </div>
      </div>

      <Sheet 
        open={showVersionHistory} 
        onOpenChange={(open) => {
          setShowVersionHistory(open);
          if (!open) {
            setIsComparing(false);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("editor.versionHistory")}</SheetTitle>
          </SheetHeader>
          {isLoadingVersions ? (
            <div className="p-4 text-center text-muted-foreground">
              {t("editor.loadingVersions")}
            </div>
          ) : (
            <VersionHistory
              versions={versions}
              currentVersionId={versions[0]?.id}
              onSelectVersion={(version) => {
                setContent(version.content);
                toast({
                  title: t("toast.versionLoaded.title"),
                  description: t("toast.versionLoaded.description", {
                    version: version.versionNumber,
                  }),
                  duration: 2000,
                });
                setShowVersionHistory(false);
              }}
              onCompareVersions={(v1, v2) => {
                setDiffVersions({ v1, v2 });
                setIsComparing(true);
                setShowVersionHistory(false);
              }}
              isComparing={isComparing}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("editor.comments")}</SheetTitle>
          </SheetHeader>
          {!isNewDocument && id && (
            <SectionComments documentId={id} />
          )}
        </SheetContent>
      </Sheet>

      <AnimatePresence>
        {isComparing && diffVersions && (
          <VersionDiff
            version1={diffVersions.v1}
            version2={diffVersions.v2}
            onClose={() => {
              setIsComparing(false);
              setDiffVersions(null);
            }}
          />
        )}
      </AnimatePresence>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteDocument.mutate();
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


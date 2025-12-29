"use client";

import { useState, useEffect, useCallback, use, useRef, useMemo } from "react";
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
  X,
  FolderOpen,
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
import { VersionHistory } from "@/components/version-history";
import { VersionDiff } from "@/components/version-diff";
import { EditorSkeleton } from "@/components/loading-skeleton";
import { SectionComments } from "@/components/section-comments";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useDocumentCategories, useDocumentStatuses } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { getTemplateForCategory } from "@/lib/document-templates";
import type { Document, Version, InsertDocument, CustomCategory, CustomClient } from "@shared/schema";

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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");
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
  const clientTriggerRef = useRef<HTMLButtonElement>(null);
  const [clientPopoverWidth, setClientPopoverWidth] = useState<number | undefined>(undefined);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const [categoryPopoverWidth, setCategoryPopoverWidth] = useState<number | undefined>(undefined);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);
  const [statusPopoverWidth, setStatusPopoverWidth] = useState<number | undefined>(undefined);

  // Measure trigger width when popover opens
  useEffect(() => {
    if (clientPopoverOpen && clientTriggerRef.current) {
      setClientPopoverWidth(clientTriggerRef.current.offsetWidth);
    }
  }, [clientPopoverOpen]);

  useEffect(() => {
    if (categoryPopoverOpen && categoryTriggerRef.current) {
      setCategoryPopoverWidth(categoryTriggerRef.current.offsetWidth);
    }
  }, [categoryPopoverOpen]);

  useEffect(() => {
    if (statusPopoverOpen && statusTriggerRef.current) {
      setStatusPopoverWidth(statusTriggerRef.current.offsetWidth);
    }
  }, [statusPopoverOpen]);

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

  // Fetch custom categories and clients from API
  const { data: customCategoriesData = [] } = useQuery<CustomCategory[]>({
    queryKey: ["/api/custom-categories"],
  });

  const { data: customClientsData = [] } = useQuery<CustomClient[]>({
    queryKey: ["/api/custom-clients"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/custom-categories", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });

  const createClientMutation = useMutation<CustomClient, Error, string>({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/custom-clients", { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: t("filters.clientDeleteSuccess", "Cliente removido com sucesso"),
        variant: "default",
      });
    },
  });

  // Extract unique client names from documents and combine with custom clients
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>();
    allDocuments.forEach((doc) => {
      if (doc.company) clients.add(doc.company);
    });
    return Array.from(clients);
  }, [allDocuments]);

  const existingClients = useMemo(() => {
    const customClientNames = customClientsData.map(c => c.name);
    const allClientNames = [...new Set([...uniqueClients, ...customClientNames])];
    return allClientNames.map(name => {
      // Buscar por nome (case-insensitive)
      const customClient = customClientsData.find(
        c => c.name.toLowerCase() === name.toLowerCase()
      );
      return {
        name,
        id: customClient?.id || null,
        isCustom: !!customClient,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [uniqueClients, customClientsData]);

  // Combine default categories with custom ones
  const allCategories: Array<{ value: string; label: string; isCustom?: boolean; id?: string | null }> = useMemo(() => [
    ...documentCategories.map(cat => ({ ...cat, isCustom: false, id: null })),
    ...customCategoriesData
      .filter(cat => !documentCategories.find(dc => dc.value === cat.name.toLowerCase()))
      .map(cat => ({
        value: cat.name.toLowerCase(),
        label: cat.name,
        isCustom: true,
        id: cat.id,
      })),
  ], [documentCategories, customCategoriesData]);

  // Initialize category from URL searchParams for new documents
  useEffect(() => {
    if (isNewDocument && !category) {
      try {
        const urlCategory = searchParams.get("category");
        if (urlCategory && validCategories.includes(urlCategory)) {
          setCategory(urlCategory);
        }
      } catch (error) {
        // searchParams might not be ready yet
      }
    }
  }, [isNewDocument, searchParams, category, validCategories]);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCompany(document.company || "");
      setContent(document.content);
      setCategory(document.category);
      setStatus(document.status);
    }
  }, [document]);

  // Carregar template quando categoria muda em documento novo
  const previousCategoryRef = useRef<string | null>(null);
  const isInitialMountRef = useRef<boolean>(true);
  
  useEffect(() => {
    // Só carrega template se:
    // 1. É um documento novo
    // 2. A categoria é válida e não está vazia
    // 3. É o primeiro carregamento OU a categoria mudou
    const categoryChanged = previousCategoryRef.current !== null && previousCategoryRef.current !== category;
    const isFirstLoad = isInitialMountRef.current && previousCategoryRef.current === null;
    const shouldLoad = isFirstLoad || (categoryChanged && isNewDocument);
    
    if (
      isNewDocument &&
      category && // Only load if category is not empty
      validCategories.includes(category) &&
      shouldLoad
    ) {
      // Only load template for valid predefined categories (not custom categories)
      const template = getTemplateForCategory(category, t);
      if (template) {
        setContent(template);
      }
    }
    
    // Atualizar referências
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
    previousCategoryRef.current = category;
  }, [category, isNewDocument, t]);

  // Reset quando criar novo documento
  useEffect(() => {
    if (isNewDocument) {
      previousCategoryRef.current = null;
      isInitialMountRef.current = true;
    }
  }, [isNewDocument]);

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
      if (!document?.id) {
        throw new Error("Document ID is required");
      }

      // Usar a API route do servidor que já funciona corretamente
      const response = await apiRequest("POST", `/api/documents/${document.id}/export-pdf`, {
        versionId: versionId || undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to export PDF" }));
        throw new Error(errorData.error || "Failed to export PDF");
      }

      // Obter o blob do PDF
      const blob = await response.blob();
      
      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      const fileName = `${(title || "document").replace(/[^a-z0-9._-]/gi, "_")}${versionId ? `_v${versions.find(v => v.id === versionId)?.versionNumber || ''}` : ''}.pdf`;
      a.download = fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
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
              <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={clientTriggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientPopoverOpen}
                    className="w-full justify-between"
                    data-testid="select-client"
                  >
                    {company || t("editor.selectClient")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0"
                  style={{ width: clientPopoverWidth ? `${clientPopoverWidth}px` : undefined }}
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder={t("editor.searchOrCreateClient", "Buscar ou digite para criar cliente...")}
                      value={clientSearch}
                      onValueChange={setClientSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {clientSearch.trim() ? (
                          <div className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={async () => {
                                const newClient = clientSearch.trim();
                                if (newClient && !existingClients.find(c => c.name === newClient)) {
                                  await createClientMutation.mutateAsync(newClient);
                                }
                                setCompany(newClient);
                                setClientPopoverOpen(false);
                                setClientSearch("");
                              }}
                              disabled={createClientMutation.isPending}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t("editor.createClient", { name: clientSearch })}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-medium mb-1">{t("editor.noClientFound")}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("editor.typeToCreate", "Digite o nome do cliente para criar um novo")}
                            </p>
                          </div>
                        )}
                      </CommandEmpty>
                        <CommandGroup>
                          {existingClients.map((client) => {
                            return (
                              <CommandItem
                                key={client.name}
                                value={client.name}
                                onSelect={() => {
                                  setCompany(client.name === company ? "" : client.name);
                                  setClientPopoverOpen(false);
                                  setClientSearch("");
                                }}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      company === client.name ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span>{client.name}</span>
                                </div>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      let clientId = client.id;
                                      
                                      // Se não é customizado, criar como customizado primeiro
                                      if (!clientId) {
                                        const newClient = await createClientMutation.mutateAsync(client.name);
                                        clientId = newClient.id;
                                        // Invalidar queries para atualizar a lista
                                        queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
                                        // Aguardar um pouco para garantir que a query foi atualizada
                                        await new Promise(resolve => setTimeout(resolve, 100));
                                      }
                                      
                                      // Excluir o cliente
                                      await deleteClientMutation.mutateAsync(clientId);
                                      
                                      if (company === client.name) {
                                        setCompany("");
                                      }
                                    } catch (error: any) {
                                      console.error("Error deleting client:", error);
                                      
                                      // Extrair código de erro (pode estar em error.error ou parsear da mensagem)
                                      let errorCode = error?.error;
                                      
                                      // Se não encontrou em error.error, tentar parsear da mensagem
                                      if (!errorCode && error?.message) {
                                        try {
                                          const match = error.message.match(/\{"error":"([^"]+)"\}/);
                                          if (match) {
                                            errorCode = match[1];
                                          }
                                        } catch (e) {
                                          // Ignorar erro de parsing
                                        }
                                      }
                                      
                                      // Mapear códigos de erro para chaves de tradução
                                      let errorMessage = t("filters.errorDeletingClient", "Erro ao remover cliente");
                                      
                                      if (errorCode === "CLIENT_NOT_FOUND") {
                                        errorMessage = t("filters.clientNotFound", "Cliente não encontrado ou você não tem permissão para excluí-lo");
                                      } else if (errorCode === "CLIENT_IN_USE") {
                                        errorMessage = t("filters.clientInUseCannotDelete", "Este cliente não pode ser excluído porque está sendo usado em um ou mais documentos. Remova o cliente dos documentos antes de excluí-lo.");
                                      } else if (errorCode === "CLIENT_DELETE_FAILED") {
                                        errorMessage = t("filters.clientDeleteFailed", "Falha ao excluir o cliente. Tente novamente mais tarde.");
                                      } else if (error?.message && !error.message.includes("{")) {
                                        // Só usar a mensagem se não for JSON
                                        errorMessage = error.message;
                                      }
                                      
                                      toast({
                                        title: errorMessage,
                                        variant: "destructive",
                                        duration: errorCode === "CLIENT_IN_USE" ? 6000 : 5000,
                                      });
                                    }
                                  }}
                                  className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  title={t("filters.removeClient", "Remover cliente")}
                                  disabled={deleteClientMutation.isPending || createClientMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t("editor.category")}
              </label>
              <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={categoryTriggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryPopoverOpen}
                    className="w-full justify-between"
                    data-testid="select-category"
                  >
                    {category
                      ? allCategories.find((cat) => cat.value === category)?.label || category
                      : t("editor.selectCategory", "Selecionar Categoria")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0"
                  style={{ width: categoryPopoverWidth ? `${categoryPopoverWidth}px` : undefined }}
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder={t("editor.searchOrCreateCategory", "Buscar ou digite para criar categoria...")}
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {categorySearch.trim() ? (
                          <div className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={async () => {
                                const newCategory = categorySearch.trim();
                                if (newCategory && !allCategories.find(c => c.value === newCategory.toLowerCase())) {
                                  await createCategoryMutation.mutateAsync(newCategory);
                                }
                                setCategory(newCategory.toLowerCase());
                                setCategoryPopoverOpen(false);
                                setCategorySearch("");
                                // Don't load template for new custom categories
                                setContent("");
                              }}
                              disabled={createCategoryMutation.isPending}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t("editor.createCategory", { name: categorySearch })}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-medium mb-1">{t("editor.noCategoryFound")}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("editor.typeToCreateCategory", "Digite o nome da categoria para criar uma nova")}
                            </p>
                          </div>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {allCategories.map((cat) => (
                          <CommandItem
                            key={cat.value}
                            value={cat.value}
                            onSelect={() => {
                              setCategory(cat.value === category ? "" : cat.value);
                              setCategoryPopoverOpen(false);
                              setCategorySearch("");
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  category === cat.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span>{cat.label}</span>
                            </div>
                            {cat.isCustom && cat.id && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (cat.id) {
                                    try {
                                      await deleteCategoryMutation.mutateAsync(cat.id);
                                      if (category === cat.value) {
                                        setCategory("");
                                      }
                                    } catch (error: any) {
                                      if (error?.error === "Category is in use and cannot be deleted") {
                                        toast({
                                          title: t("filters.categoryInUse", "Categoria em uso em documentos"),
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }
                                }}
                                className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                title={t("filters.removeCategory", "Remover categoria")}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t("editor.status")}
              </label>
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={statusTriggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={statusPopoverOpen}
                    className="w-full justify-between"
                    data-testid="select-status"
                  >
                    {status
                      ? documentStatuses.find((stat) => stat.value === status)?.label || status
                      : t("editor.selectStatus", "Selecionar Status")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0"
                  style={{ width: statusPopoverWidth ? `${statusPopoverWidth}px` : undefined }}
                  align="start"
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {documentStatuses.map((stat) => (
                          <CommandItem
                            key={stat.value}
                            value={stat.value}
                            onSelect={() => {
                              setStatus(stat.value === status ? "" : stat.value);
                              setStatusPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                status === stat.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {stat.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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


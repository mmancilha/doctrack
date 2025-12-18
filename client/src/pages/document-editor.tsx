import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
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
import { VersionHistory } from "@/components/version-history";
import { VersionDiff } from "@/components/version-diff";
import { EditorSkeleton } from "@/components/loading-skeleton";
import { SectionComments } from "@/components/section-comments";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useDocumentCategories, useDocumentStatuses } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import type { Document, Version, InsertDocument } from "@shared/schema";

export default function DocumentEditor() {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, canEdit, canDelete } = useAuth();
  const isNewDocument = !id || id === "new";
  
  const documentCategories = useDocumentCategories();
  const documentStatuses = useDocumentStatuses();

  const validCategories = ["manual", "checklist", "guide", "confidentiality", "proposal", "contract", "policy", "procedure"];

  // Get category from URL query string for new documents
  const getInitialCategory = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCategory = params.get("category");
      if (urlCategory && validCategories.includes(urlCategory)) {
        return urlCategory;
      }
    }
    return "manual";
  };

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(getInitialCategory);
  const [status, setStatus] = useState<string>("draft");
  const [company, setCompany] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ v1: Version; v2: Version } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !isNewDocument && !!id,
  });

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery<Version[]>({
    queryKey: ["/api/documents", id, "versions"],
    enabled: !isNewDocument && !!id,
  });

  // Fetch all documents for client autocomplete
  const { data: allDocuments = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Extract unique client names for autocomplete
  const existingClients = [...new Set(allDocuments.map((doc) => doc.company).filter(Boolean))].sort();

  useEffect(() => {
    if (document) {
      setCompany(document.company || document.title || "");
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
      toast({ title: t("toast.created.title"), description: t("toast.created.description") });
      setLocation(`/document/${newDoc.id}`);
    },
    onError: () => {
      toast({ title: t("toast.error.title"), description: t("toast.error.create"), variant: "destructive" });
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
      queryClient.invalidateQueries({ queryKey: ["/api/documents", id, "versions"] });
      toast({ title: t("toast.saved.title"), description: t("toast.saved.description") });
    },
    onError: () => {
      toast({ title: t("toast.error.title"), description: t("toast.error.save"), variant: "destructive" });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("toast.deleted.title"), description: t("toast.deleted.description") });
      setLocation("/");
    },
  });

  const exportPdf = useMutation({
    mutationFn: async (versionId?: string) => {
      const response = await apiRequest("POST", `/api/documents/${id}/export-pdf`, { versionId });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}${versionId ? `_v${versions.find(v => v.id === versionId)?.versionNumber || ''}` : ''}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ title: t("toast.exported.title"), description: t("toast.exported.description") });
    },
    onError: () => {
      toast({ title: t("toast.error.title"), description: t("toast.error.export"), variant: "destructive" });
    },
  });

  const handleSave = useCallback(async () => {
    if (!company.trim()) {
      toast({ title: t("toast.error.title"), description: t("toast.error.noClient"), variant: "destructive" });
      return;
    }

    if (!canEdit) {
      toast({ title: t("toast.error.title"), description: t("toast.error.noPermission"), variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (isNewDocument) {
        await createDocument.mutateAsync({
          title: company || "Sem título",
          content,
          category,
          status,
          company: company || "Geral",
          authorId: user?.id || "",
          authorName: user?.username || "",
        });
      } else {
        await updateDocument.mutateAsync({
          title: company || "Sem título",
          content,
          category,
          status,
          company: company || "Geral",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [content, category, status, company, isNewDocument, createDocument, updateDocument, toast, canEdit, user, t]);

  const handleSelectVersion = (version: Version) => {
    setContent(version.content);
    setShowVersionHistory(false);
    toast({
      title: t("toast.versionLoaded.title"),
      description: t("toast.versionLoaded.description", { version: version.versionNumber }),
    });
  };

  const handleCompareVersions = (v1: Version, v2: Version) => {
    setDiffVersions({ v1, v2 });
    setIsComparing(false);
    setShowVersionHistory(false); // Fecha o painel automaticamente
  };

  if (!isNewDocument && isLoadingDocument) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EditorSkeleton />
      </div>
    );
  }

  const statusColor = documentStatuses.find((s) => s.value === status)?.color || "gray";
  const statusLabel = documentStatuses.find((s) => s.value === status)?.label || status;

  return (
    <div className="flex flex-col h-full">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-background sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`text-xs ${
                statusColor === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : statusColor === "amber"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
              }`}
            >
              {statusLabel}
            </Badge>
            {!isNewDocument && versions.length > 0 && (
              <Badge variant="outline" className="text-xs font-mono">
                v{versions[0]?.versionNumber || "1.0"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isNewDocument && (
            <>
              <Sheet open={showVersionHistory} onOpenChange={setShowVersionHistory}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-version-history">
                    <GitBranch className="mr-2 h-4 w-4" />
                    {t("editor.history")}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] p-0">
                  <VersionHistory
                    versions={versions}
                    currentVersionId={versions[0]?.id}
                    onSelectVersion={handleSelectVersion}
                    onCompareVersions={handleCompareVersions}
                    isComparing={isComparing}
                  />
                </SheetContent>
              </Sheet>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowVersionHistory(true);
                  setIsComparing(true);
                }}
                disabled={versions.length < 2}
                data-testid="button-compare"
              >
                <GitCompare className="mr-2 h-4 w-4" />
                {t("editor.compare")}
              </Button>

              <Sheet open={showComments} onOpenChange={setShowComments}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-comments"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("editor.comments")}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[450px] p-0">
                  <SectionComments
                    documentId={id!}
                    onClose={() => setShowComments(false)}
                  />
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportPdf.isPending}
                    data-testid="button-export-pdf"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("editor.exportPdf")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => exportPdf.mutate(undefined)}
                    data-testid="button-export-current"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("editor.exportCurrentVersion")}
                  </DropdownMenuItem>
                  {versions.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {versions.slice(0, 5).map((v) => (
                        <DropdownMenuItem
                          key={v.id}
                          onClick={() => exportPdf.mutate(v.id)}
                          data-testid={`button-export-version-${v.id}`}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {t("editor.exportVersion", { version: v.versionNumber })}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving || createDocument.isPending || updateDocument.isPending}
            data-testid="button-save"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t("editor.saving") : t("editor.save")}
          </Button>

          {!isNewDocument && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-more-options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportPdf.mutate(undefined)}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("editor.exportAsPdf")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive"
                    data-testid="button-delete-document"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("editor.deleteDocument")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteConfirm.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("deleteConfirm.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteDocument.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("deleteConfirm.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </motion.header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientPopoverOpen}
                  className="w-full justify-between text-left font-normal h-12 text-lg border-dashed"
                  data-testid="input-client"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                    {company ? (
                      <span className="font-semibold">{company}</span>
                    ) : (
                      <span className="text-muted-foreground">{t("editor.clientPlaceholder")}</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t("editor.searchClient")}
                    value={clientSearch}
                    onValueChange={setClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("editor.noClientFound")}
                        </p>
                        {clientSearch && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setCompany(clientSearch);
                              setClientPopoverOpen(false);
                              setClientSearch("");
                            }}
                          >
                            {t("editor.createClient", { name: clientSearch })}
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading={t("editor.existingClients")}>
                      {existingClients
                        .filter((client) =>
                          client.toLowerCase().includes(clientSearch.toLowerCase())
                        )
                        .map((client) => (
                          <CommandItem
                            key={client}
                            value={client}
                            onSelect={() => {
                              setCompany(client);
                              setClientPopoverOpen(false);
                              setClientSearch("");
                            }}
                          >
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            {client}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                company === client ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[200px]" data-testid="select-category">
                  <SelectValue placeholder={t("editor.category")} />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]" data-testid="select-status">
                  <SelectValue placeholder={t("editor.status")} />
                </SelectTrigger>
                <SelectContent>
                  {documentStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder={t("editor.contentPlaceholder")}
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {diffVersions && (
          <VersionDiff
            version1={diffVersions.v1}
            version2={diffVersions.v2}
            onClose={() => setDiffVersions(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

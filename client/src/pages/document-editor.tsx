import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/rich-text-editor";
import { VersionHistory } from "@/components/version-history";
import { VersionDiff } from "@/components/version-diff";
import { EditorSkeleton } from "@/components/loading-skeleton";
import { SectionComments } from "@/components/section-comments";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUSES } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import type { Document, Version, InsertDocument } from "@shared/schema";

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, canEdit, canDelete } = useAuth();
  const isNewDocument = !id || id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("manual");
  const [status, setStatus] = useState<string>("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ v1: Version; v2: Version } | null>(null);

  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !isNewDocument && !!id,
  });

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery<Version[]>({
    queryKey: ["/api/documents", id, "versions"],
    enabled: !isNewDocument && !!id,
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
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
      toast({ title: "Document created", description: "Your document has been saved." });
      setLocation(`/document/${newDoc.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create document.", variant: "destructive" });
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
      toast({ title: "Document saved", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save document.", variant: "destructive" });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document deleted", description: "The document has been removed." });
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
      toast({ title: "PDF exported", description: "Your document has been downloaded." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to export PDF.", variant: "destructive" });
    },
  });

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a document title.", variant: "destructive" });
      return;
    }

    if (!canEdit) {
      toast({ title: "Error", description: "You do not have permission to edit documents.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (isNewDocument) {
        await createDocument.mutateAsync({
          title,
          content,
          category,
          status,
          authorId: user?.id || "",
          authorName: user?.username || "",
        });
      } else {
        await updateDocument.mutateAsync({
          title,
          content,
          category,
          status,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [title, content, category, status, isNewDocument, createDocument, updateDocument, toast, canEdit, user]);

  const handleSelectVersion = (version: Version) => {
    setContent(version.content);
    setShowVersionHistory(false);
    toast({
      title: "Version loaded",
      description: `Loaded version ${version.versionNumber}. Save to keep changes.`,
    });
  };

  const handleCompareVersions = (v1: Version, v2: Version) => {
    setDiffVersions({ v1, v2 });
    setIsComparing(false);
  };

  if (!isNewDocument && isLoadingDocument) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EditorSkeleton />
      </div>
    );
  }

  const statusColor = DOCUMENT_STATUSES.find((s) => s.value === status)?.color || "gray";

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
              {status}
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
                    History
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
                Compare
              </Button>

              <Sheet open={showComments} onOpenChange={setShowComments}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-comments"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments
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
                    Export PDF
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => exportPdf.mutate(undefined)}
                    data-testid="button-export-current"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Current Version
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
                          Export v{v.versionNumber}
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
            {isSaving ? "Saving..." : "Save"}
          </Button>

          {!isNewDocument && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-more-options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportPdf.mutate(undefined)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteDocument.mutate()}
                  className="text-destructive"
                  data-testid="button-delete-document"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title..."
              className="text-2xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              data-testid="input-title"
            />

            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[160px]" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_STATUSES.map((s) => (
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
              placeholder="Start writing your document..."
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

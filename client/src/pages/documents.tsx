import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, Plus, Search, Filter, Grid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUSES } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Documents() {
  const [, setLocation] = useLocation();
  const { canEdit, canDelete } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentListSkeleton count={9} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            All Documents
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            Browse and manage all your documentation
          </motion.p>
        </div>
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button onClick={() => setLocation("/new")} data-testid="button-create-document">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]" data-testid="select-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DOCUMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
            Clear all
          </Button>
        </motion.div>
      )}

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={hasActiveFilters ? "No matching documents" : "No documents yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query."
              : canEdit ? "Create your first document to get started." : "No documents are available yet."
          }
          action={
            hasActiveFilters
              ? { label: "Clear Filters", onClick: clearFilters }
              : canEdit ? { label: "Create Document", onClick: () => setLocation("/new") } : undefined
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                onDelete={(id) => deleteDocument.mutate(id)}
                canDelete={canDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

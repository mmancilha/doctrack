import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, Search, X, Calendar } from "lucide-react";
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
import { useDocumentCategories, useDocumentStatuses } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Documents() {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  const { t: tDashboard } = useTranslation("dashboard");
  const [, setLocation] = useLocation();
  const { canEdit, canDelete } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  const DOCUMENT_CATEGORIES = useDocumentCategories();
  const DOCUMENT_STATUSES = useDocumentStatuses();

  const DATE_FILTERS = [
    { value: "all", label: t("filters.allTime", "All time") },
    { value: "7days", label: t("filters.last7Days", "Last 7 days") },
    { value: "30days", label: t("filters.last30Days", "Last 30 days") },
    { value: "90days", label: t("filters.last90Days", "Last 90 days") },
  ];

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

  const getDateFilterRange = (filter: string): Date | null => {
    const now = new Date();
    switch (filter) {
      case "7days": {
        const daysAgo = new Date(now);
        daysAgo.setDate(daysAgo.getDate() - 7);
        return daysAgo;
      }
      case "30days": {
        const daysAgo = new Date(now);
        daysAgo.setDate(daysAgo.getDate() - 30);
        return daysAgo;
      }
      case "90days": {
        const daysAgo = new Date(now);
        daysAgo.setDate(daysAgo.getDate() - 90);
        return daysAgo;
      }
      default:
        return null;
    }
  };

  const filteredDocuments = (documents || []).filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    
    const dateThreshold = getDateFilterRange(dateFilter);
    const matchesDate = !dateThreshold || new Date(doc.updatedAt) >= dateThreshold;

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all" || dateFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
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
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          {t("list.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          {t("list.description")}
        </motion.p>
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
            placeholder={t("list.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-category">
              <SelectValue placeholder={t("editor.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allCategories", "All Categories")}</SelectItem>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]" data-testid="select-status">
              <SelectValue placeholder={t("editor.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStatuses", "All Statuses")}</SelectItem>
              {DOCUMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]" data-testid="select-date">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("filters.date", "Date")} />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
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
          <span className="text-sm text-muted-foreground">{t("filters.activeFilters", "Active filters")}:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {t("filters.search", "Search")}: {searchQuery}
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {t("editor.category")}: {categoryFilter}
              <button onClick={() => setCategoryFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {t("editor.status")}: {statusFilter}
              <button onClick={() => setStatusFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {t("filters.date", "Date")}: {DATE_FILTERS.find(f => f.value === dateFilter)?.label}
              <button onClick={() => setDateFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
            {t("filters.clearAll", "Clear all")}
          </Button>
        </motion.div>
      )}

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={hasActiveFilters ? t("list.empty.title") : tDashboard("empty.title")}
          description={
            hasActiveFilters
              ? t("list.empty.description")
              : canEdit ? tDashboard("empty.descriptionEditor") : tDashboard("empty.descriptionReader")
          }
          action={
            hasActiveFilters
              ? { label: t("filters.clearAll", "Clear Filters"), onClick: clearFilters }
              : canEdit ? { label: tDashboard("empty.action"), onClick: () => setLocation("/new") } : undefined
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("filters.showing", "Showing")} {filteredDocuments.length} {filteredDocuments.length !== 1 ? t("filters.documents", "documents") : t("filters.document", "document")}
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

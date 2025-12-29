"use client";

import { use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, CheckSquare, FileCheck, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useCategoryLabels } from "@/lib/constants";
import type { Document } from "@shared/schema";

const categoryIcons: Record<string, typeof FileText> = {
  manual: BookOpen,
  checklist: CheckSquare,
  guide: FileCheck,
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }> | { category: string };
}) {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  const { t: tDashboard } = useTranslation("dashboard");
  // Handle both Promise and plain object params
  const isPromise = params && typeof params === "object" && "then" in params;
  const resolvedParams = isPromise 
    ? use(params as Promise<{ category: string }>) 
    : (params as { category: string });
  const category = resolvedParams.category;
  const router = useRouter();
  const { canEdit, canDelete } = useAuth();
  const categoryLabels = useCategoryLabels();

  const categoryKey = category as keyof typeof categoryLabels;
  const labels =
    categoryLabels[categoryKey] || {
      singular: tCommon("categories.guide"),
      plural: tCommon("categories.guides"),
    };
  const Icon = categoryIcons[category || ""] || FileText;

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

  const filteredDocuments = (documents || []).filter(
    (doc) => doc.category === category
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              {labels.plural}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              {t("category.description", {
                category: labels.plural.toLowerCase(),
              })}
            </motion.p>
          </div>
        </div>
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => router.push(`/document/new?category=${category}`)}
              data-testid="button-create-document"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tCommon("buttons.create")} {labels.singular}
            </Button>
          </motion.div>
        )}
      </div>

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={t("category.empty.title", {
            category: labels.plural.toLowerCase(),
          })}
          description={
            canEdit
              ? t("category.empty.description", {
                  singular: labels.singular.toLowerCase(),
                })
              : tDashboard("empty.descriptionReader")
          }
          action={
            canEdit
              ? {
                  label: `${tCommon("buttons.create")} ${labels.singular}`,
                  onClick: () => router.push(`/document/new?category=${category}`),
                }
              : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length}{" "}
            {filteredDocuments.length !== 1
              ? t("filters.documents")
              : t("filters.document")}
          </p>
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


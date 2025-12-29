"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Recent() {
  const { t } = useTranslation("documents");
  const { t: tDashboard } = useTranslation("dashboard");
  const router = useRouter();
  const { canEdit, canDelete } = useAuth();

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

  const recentDocuments = [...(documents || [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
        >
          <Clock className="h-6 w-6 text-primary" />
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            {t("recent.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            {t("recent.description")}
          </motion.p>
        </div>
      </div>

      {recentDocuments.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={t("recent.empty.title")}
          description={t("recent.empty.description")}
          action={canEdit ? {
            label: tDashboard("empty.action"),
            onClick: () => router.push("/new"),
          } : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {t("filters.showing")} {recentDocuments.length} {recentDocuments.length !== 1 ? t("filters.documents") : t("filters.document")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.map((doc, index) => (
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


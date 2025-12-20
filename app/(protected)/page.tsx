"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Dashboard() {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");
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

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  const docs = documents || [];
  const recentDocs = [...docs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const stats = {
    total: docs.length,
    published: docs.filter((d) => d.status === "published").length,
    drafts: docs.filter((d) => d.status === "draft").length,
    manuals: docs.filter((d) => d.category === "manual").length,
    checklists: docs.filter((d) => d.category === "checklist").length,
    guides: docs.filter((d) => d.category === "guide").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          {t("welcome")}
        </motion.p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("stats.totalDocuments")}
          value={stats.total}
          description={t("stats.totalDescription")}
          icon={FileText}
          index={0}
        />
        <StatsCard
          title={t("stats.published")}
          value={stats.published}
          description={t("stats.publishedDescription")}
          icon={CheckCircle}
          index={1}
        />
        <StatsCard
          title={t("stats.drafts")}
          value={stats.drafts}
          description={t("stats.draftsDescription")}
          icon={Clock}
          index={2}
        />
        <StatsCard
          title={t("stats.categories")}
          value={3}
          description={t("stats.categoriesDescription", { manuals: stats.manuals, checklists: stats.checklists, guides: stats.guides })}
          icon={FolderOpen}
          index={3}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold"
          >
            {t("recentDocuments")}
          </motion.h2>
          {docs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
              data-testid="button-view-all"
            >
              {tCommon("buttons.viewAll")}
            </Button>
          )}
        </div>

        {docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("empty.title")}
            description={canEdit ? t("empty.descriptionEditor") : t("empty.descriptionReader")}
            action={canEdit ? {
              label: t("empty.action"),
              onClick: () => router.push("/document/new"),
            } : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocs.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                onDelete={(id) => deleteDocument.mutate(id)}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, Plus, Clock, CheckCircle, FolderOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DashboardSkeleton, DocumentListSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
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
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            Welcome back! Here's an overview of your documentation.
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value={stats.total}
          description="All documents in your library"
          icon={FileText}
          index={0}
        />
        <StatsCard
          title="Published"
          value={stats.published}
          description="Documents ready for use"
          icon={CheckCircle}
          index={1}
        />
        <StatsCard
          title="Drafts"
          value={stats.drafts}
          description="Work in progress"
          icon={Clock}
          index={2}
        />
        <StatsCard
          title="Categories"
          value={3}
          description={`${stats.manuals} manuals, ${stats.checklists} checklists, ${stats.guides} guides`}
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
            Recent Documents
          </motion.h2>
          {docs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/documents")}
              data-testid="button-view-all"
            >
              View All
            </Button>
          )}
        </div>

        {docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description={canEdit ? "Create your first document to get started with DocTrack." : "No documents are available yet."}
            action={canEdit ? {
              label: "Create Document",
              onClick: () => setLocation("/new"),
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

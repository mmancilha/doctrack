import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, CheckSquare, FileCheck, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Document, DocumentCategory } from "@shared/schema";

const categoryConfig: Record<
  string,
  { title: string; description: string; icon: typeof FileText }
> = {
  manual: {
    title: "Manuals",
    description: "Technical documentation and user guides",
    icon: BookOpen,
  },
  checklist: {
    title: "Checklists",
    description: "Step-by-step procedures and verification lists",
    icon: CheckSquare,
  },
  guide: {
    title: "Guides",
    description: "How-to articles and tutorials",
    icon: FileCheck,
  },
};

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const [, setLocation] = useLocation();
  const { canEdit, canDelete } = useAuth();

  const config = categoryConfig[category || ""] || {
    title: "Documents",
    description: "All documents",
    icon: FileText,
  };

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

  const filteredDocuments = (documents || []).filter((doc) => doc.category === category);

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentListSkeleton count={6} />
      </div>
    );
  }

  const Icon = config.icon;

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
              {config.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              {config.description}
            </motion.p>
          </div>
        </div>
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button onClick={() => setLocation("/new")} data-testid="button-create-document">
              <Plus className="mr-2 h-4 w-4" />
              New {config.title.slice(0, -1)}
            </Button>
          </motion.div>
        )}
      </div>

      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={`No ${config.title.toLowerCase()} yet`}
          description={canEdit ? `Create your first ${config.title.toLowerCase().slice(0, -1)} to get started.` : `No ${config.title.toLowerCase()} are available yet.`}
          action={canEdit ? {
            label: `Create ${config.title.slice(0, -1)}`,
            onClick: () => setLocation("/new"),
          } : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
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

import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export default function Recent() {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              Recent Documents
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              Your most recently edited documents
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
              New Document
            </Button>
          </motion.div>
        )}
      </div>

      {recentDocuments.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No recent documents"
          description={canEdit ? "Documents you edit will appear here." : "Recently viewed documents will appear here."}
          action={canEdit ? {
            label: "Create Document",
            onClick: () => setLocation("/new"),
          } : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {recentDocuments.length} most recent document
            {recentDocuments.length !== 1 ? "s" : ""}
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

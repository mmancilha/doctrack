import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Shield,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { AuditLog } from "@shared/schema";

const actionIcons: Record<string, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  viewed: Eye,
};

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  viewed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

function AuditLogSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export default function AuditLogs() {
  const { isAdmin } = useAuth();

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-center">
          You do not have permission to view audit logs.
          <br />
          This feature is only available to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-md">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground text-sm">
              Track all document modifications and user actions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <>
                <AuditLogSkeleton />
                <AuditLogSkeleton />
                <AuditLogSkeleton />
                <AuditLogSkeleton />
              </>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity recorded yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log, index) => {
                  const ActionIcon = actionIcons[log.action] || FileText;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4"
                      data-testid={`audit-log-${log.id}`}
                    >
                      <div className="p-2 bg-muted rounded-full">
                        <ActionIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {log.userName} on{" "}
                          {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`flex-shrink-0 ${actionColors[log.action] || ""}`}
                      >
                        {log.action}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

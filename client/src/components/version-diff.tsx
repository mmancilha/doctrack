import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GitCompare, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Version } from "@shared/schema";
import DiffMatchPatch from "diff-match-patch";
import { formatDateTime } from "@/lib/date-utils";

interface VersionDiffProps {
  version1: Version;
  version2: Version;
  onClose: () => void;
}

export function VersionDiff({ version1, version2, onClose }: VersionDiffProps) {
  const { t, i18n } = useTranslation("documents");
  const dmp = useMemo(() => new DiffMatchPatch(), []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const { diffs, stats } = useMemo(() => {
    const text1 = stripHtml(version1.content);
    const text2 = stripHtml(version2.content);

    const rawDiffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(rawDiffs);

    let added = 0;
    let removed = 0;

    rawDiffs.forEach(([type, text]) => {
      if (type === 1) added += text.length;
      if (type === -1) removed += text.length;
    });

    return {
      diffs: rawDiffs,
      stats: { added, removed },
    };
  }, [version1, version2, dmp]);

  const older = new Date(version1.createdAt) < new Date(version2.createdAt) ? version1 : version2;
  const newer = older === version1 ? version2 : version1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="w-full max-w-4xl max-h-[80vh] bg-card rounded-lg border shadow-lg overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{t("diff.title")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("diff.comparing", { v1: older.versionNumber, v2: newer.versionNumber })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-diff">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 border-b">
          <VersionBadge version={older} label={t("diff.from")} lang={i18n.language} />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <VersionBadge version={newer} label={t("diff.to")} lang={i18n.language} />
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-b text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-green-500/20 border border-green-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-green-600 dark:text-green-400">+{stats.added}</span> {t("diff.additions", { count: stats.added })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500/20 border border-red-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-red-600 dark:text-red-400">-{stats.removed}</span> {t("diff.deletions", { count: stats.removed })}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap"
            data-testid="diff-content"
          >
            {diffs.map(([type, text], index) => {
              if (type === 0) {
                return <span key={index}>{text}</span>;
              }
              if (type === 1) {
                return (
                  <span
                    key={index}
                    className="bg-green-500/20 text-green-700 dark:text-green-300 px-0.5 rounded-sm"
                  >
                    {text}
                  </span>
                );
              }
              if (type === -1) {
                return (
                  <span
                    key={index}
                    className="bg-red-500/20 text-red-700 dark:text-red-300 line-through px-0.5 rounded-sm"
                  >
                    {text}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

interface VersionBadgeProps {
  version: Version;
  label: string;
  lang: string;
}

function VersionBadge({ version, label, lang }: VersionBadgeProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </span>
      <Badge variant="outline" className="font-mono">
        v{version.versionNumber}
      </Badge>
      <span className="text-[10px] text-muted-foreground mt-1">
        {formatDateTime(new Date(version.createdAt), lang, "MMM d, HH:mm")}
      </span>
    </div>
  );
}

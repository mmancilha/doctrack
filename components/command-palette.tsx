"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Plus,
  Search,
  Home,
  FolderOpen,
  Clock,
  BookOpen,
  CheckSquare,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

interface CommandPaletteProps {
  documents: Document[];
}

export function CommandPalette({ documents }: CommandPaletteProps) {
  const { t } = useTranslation("common");
  const { t: tDashboard } = useTranslation("dashboard");
  const { t: tDocuments } = useTranslation("documents");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { canEdit } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "manual":
        return BookOpen;
      case "checklist":
        return CheckSquare;
      case "guide":
        return FileCheck;
      default:
        return FileText;
    }
  };

  const getCategoryLabel = (category: string) => {
    // Tentar traduzir a categoria, se não encontrar, retornar a categoria original
    const translationKey = `categories.${category}`;
    const translated = t(translationKey);
    // Se a tradução retornar a própria chave, significa que não existe tradução
    return translated !== translationKey ? translated : category;
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border-0">
        <CommandInput
          placeholder={t("search")}
          className="border-0"
          data-testid="input-command-search"
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">{t("noResults")}</p>
            </div>
          </CommandEmpty>

          {canEdit && (
            <>
              <CommandGroup heading={t("buttons.create")}>
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/document/new"))}
                  data-testid="command-new-document"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>{tDashboard("newDocument")}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t("buttons.create")}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading={t("navigation.title")}>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
              data-testid="command-dashboard"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>{t("navigation.dashboard")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/documents"))}
              data-testid="command-all-documents"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>{t("navigation.allDocuments")}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/recent"))}
              data-testid="command-recent"
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>{tDocuments("recent.title")}</span>
            </CommandItem>
          </CommandGroup>

          {documents.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={tDocuments("list.title")}>
                {documents.slice(0, 5).map((doc) => {
                  const Icon = getCategoryIcon(doc.category);
                  return (
                    <CommandItem
                      key={doc.id}
                      onSelect={() => runCommand(() => router.push(`/document/${doc.id}`))}
                      data-testid={`command-document-${doc.id}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="truncate">{doc.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger() {
  const { t } = useTranslation("common");
  
  return (
    <button
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md border border-border/50 hover-elevate active-elevate-2 transition-all"
      onClick={() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }}
      data-testid="button-command-palette"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">{t("search")}</span>
    </button>
  );
}

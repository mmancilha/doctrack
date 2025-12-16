import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border-0">
        <CommandInput
          placeholder="Search documents, navigate..."
          className="border-0"
          data-testid="input-command-search"
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try searching for a document title or category
              </p>
            </div>
          </CommandEmpty>

          {canEdit && (
            <>
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={() => runCommand(() => setLocation("/new"))}
                  data-testid="command-new-document"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Document</span>
                  <span className="ml-auto text-xs text-muted-foreground">Create</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => setLocation("/"))}
              data-testid="command-dashboard"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setLocation("/documents"))}
              data-testid="command-all-documents"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>All Documents</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setLocation("/recent"))}
              data-testid="command-recent"
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Recent Documents</span>
            </CommandItem>
          </CommandGroup>

          {documents.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Documents">
                {documents.slice(0, 5).map((doc) => {
                  const Icon = getCategoryIcon(doc.category);
                  return (
                    <CommandItem
                      key={doc.id}
                      onSelect={() => runCommand(() => setLocation(`/document/${doc.id}`))}
                      data-testid={`command-document-${doc.id}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="truncate">{doc.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">
                        {doc.category}
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
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  MoreHorizontal,
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Building2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useDocumentCategories, useDocumentStatuses } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useRelativeTime } from "@/lib/date-utils";
import { EmptyState } from "@/components/empty-state";
import { DocumentListSkeleton } from "@/components/loading-skeleton";
import type { Document, CustomCategory, CustomClient } from "@shared/schema";

export default function CategoryPage() {
  const { t } = useTranslation("documents");
  const { t: tCommon } = useTranslation("common");
  const router = useRouter();
  const { canEdit, canDelete } = useAuth();
  const relativeTime = useRelativeTime();

  // Filters state
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Popover states
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Refs for popover width
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const clientTriggerRef = useRef<HTMLButtonElement>(null);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);
  const [categoryPopoverWidth, setCategoryPopoverWidth] = useState<number | undefined>(undefined);
  const [clientPopoverWidth, setClientPopoverWidth] = useState<number | undefined>(undefined);
  const [statusPopoverWidth, setStatusPopoverWidth] = useState<number | undefined>(undefined);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const DOCUMENT_CATEGORIES = useDocumentCategories();
  const DOCUMENT_STATUSES = useDocumentStatuses();

  // Fetch custom categories and clients from API
  const { data: customCategoriesData = [] } = useQuery<CustomCategory[]>({
    queryKey: ["/api/custom-categories"],
  });

  const { data: customClientsData = [] } = useQuery<CustomClient[]>({
    queryKey: ["/api/custom-clients"],
  });

  const createCategoryMutation = useMutation<CustomCategory, Error, string>({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/custom-categories", { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });

  const createClientMutation = useMutation<CustomClient, Error, string>({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/custom-clients", { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  // Measure trigger widths
  useEffect(() => {
    if (categoryPopoverOpen && categoryTriggerRef.current) {
      setCategoryPopoverWidth(categoryTriggerRef.current.offsetWidth);
    }
  }, [categoryPopoverOpen]);

  useEffect(() => {
    if (clientPopoverOpen && clientTriggerRef.current) {
      setClientPopoverWidth(clientTriggerRef.current.offsetWidth);
    }
  }, [clientPopoverOpen]);

  useEffect(() => {
    if (statusPopoverOpen && statusTriggerRef.current) {
      setStatusPopoverWidth(statusTriggerRef.current.offsetWidth);
    }
  }, [statusPopoverOpen]);

  // Combine default categories with custom ones
  const allCategories = useMemo(() => [
    ...DOCUMENT_CATEGORIES.map(cat => ({ ...cat, isCustom: false, id: null })),
    ...customCategoriesData
      .filter(cat => !DOCUMENT_CATEGORIES.find(dc => dc.value === cat.name.toLowerCase()))
      .map(cat => ({
        value: cat.name.toLowerCase(),
        label: cat.name,
        isCustom: true,
        id: cat.id,
      })),
  ], [DOCUMENT_CATEGORIES, customCategoriesData]);

  // Get unique clients from documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uniqueClients = useMemo(() => {
    if (!documents) return [];
    const clients = new Set<string>();
    documents.forEach(doc => {
      if (doc.company) clients.add(doc.company);
    });
    return Array.from(clients).sort();
  }, [documents]);

  const allClients = useMemo(() => {
    const customClientNames = customClientsData.map(c => c.name);
    const allClientNames = [...new Set([...uniqueClients, ...customClientNames])];
    return allClientNames.map(name => {
      // Buscar por nome (case-insensitive)
      const customClient = customClientsData.find(
        c => c.name.toLowerCase() === name.toLowerCase()
      );
      return {
        name,
        id: customClient?.id || null,
        isCustom: !!customClient,
      };
    });
  }, [uniqueClients, customClientsData]);

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
  });

  const getCategoryLabel = (category: string) => {
    const translatedLabel = tCommon(`categories.${category}`);
    if (translatedLabel && translatedLabel !== `categories.${category}`) {
      return translatedLabel;
    }
    return category;
  };

  const getStatusLabel = (status: string) => {
    return tCommon(`statuses.${status}`) || status;
  };

  // Define columns
  const columns: ColumnDef<Document>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("table.title", "Título")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{doc.title || t("table.noTitle", "Sem título")}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {doc.content?.replace(/<[^>]*>/g, "").substring(0, 60) || ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("editor.category")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(category)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "company",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("editor.client")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const company = row.getValue("company") as string;
        return <div className="text-sm">{company || "-"}</div>;
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("editor.status")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return (
          <Badge className={cn("text-xs", statusColors[status as keyof typeof statusColors] || statusColors.draft)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "authorName",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("table.author", "Autor")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const authorName = row.getValue("authorName") as string;
        const firstName = authorName ? authorName.split(" ")[0] : "-";
        return <div className="text-sm">{firstName}</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => {
        return (
          <ButtonGroup>
            <ButtonGroupText className="h-8 px-2 lg:px-3 text-sm font-medium bg-transparent border-0 shadow-none">
              {t("table.updated", "Atualizado")}
            </ButtonGroupText>
          </ButtonGroup>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        return <div className="text-sm text-muted-foreground">{relativeTime(date)}</div>;
      },
      filterFn: (row, id, value) => {
        if (!value || typeof value !== "object") return true;
        const dateRange = value as { from?: Date; to?: Date };
        if (!dateRange.from && !dateRange.to) return true;
        
        try {
          const rowDate = new Date(row.getValue(id) as string);
          if (isNaN(rowDate.getTime())) return true;
          
          rowDate.setHours(0, 0, 0, 0);
          
          if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            if (isNaN(fromDate.getTime())) return true;
            fromDate.setHours(0, 0, 0, 0);
            if (rowDate < fromDate) return false;
          }
          if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            if (isNaN(toDate.getTime())) return true;
            toDate.setHours(23, 59, 59, 999);
            if (rowDate > toDate) return false;
          }
          return true;
        } catch {
          return true;
        }
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("table.openMenu", "Abrir menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("table.actions", "Ações")}</DropdownMenuLabel>
              {canEdit && (
                <DropdownMenuItem onClick={() => router.push(`/document/${document.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {tCommon("buttons.edit")}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setDocumentToDelete(document.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tCommon("buttons.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [t, tCommon, router, canEdit, canDelete, relativeTime]);

  // Filter data
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (categoryFilter) filters.push({ id: "category", value: categoryFilter });
    if (clientFilter) filters.push({ id: "company", value: clientFilter });
    if (statusFilter) filters.push({ id: "status", value: statusFilter });
    return filters;
  }, [categoryFilter, clientFilter, statusFilter]);

  const table = useReactTable({
    data: documents || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: () => {},
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const title = (row.original.title || "").toLowerCase();
      const content = (row.original.content || "").replace(/<[^>]*>/g, "").toLowerCase();
      const author = (row.original.authorName || "").toLowerCase();
      const company = (row.original.company || "").toLowerCase();
      return title.includes(search) || content.includes(search) || author.includes(search) || company.includes(search);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const hasActiveFilters = categoryFilter !== "" || clientFilter !== "" || statusFilter !== "" || globalFilter !== "";

  const clearFilters = () => {
    setCategoryFilter("");
    setClientFilter("");
    setStatusFilter("");
    setGlobalFilter("");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
          {t("table.allDocuments", "Todos os Documentos")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
          {t("table.description", "Gerencie e visualize todos os seus documentos em uma tabela")}
            </motion.p>
          </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("table.search", "Buscar documentos...")}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {/* Category Filter */}
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={categoryTriggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={categoryPopoverOpen}
                className="w-full sm:w-[180px] min-w-[160px] justify-between text-sm"
              >
                <span className="truncate">
                  {categoryFilter
                    ? allCategories.find((cat) => cat.value === categoryFilter)?.label || categoryFilter
                    : t("editor.category")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: categoryPopoverWidth ? `${categoryPopoverWidth}px` : undefined }}
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder={t("editor.searchCategory", "Buscar categoria...")}
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {categorySearch.trim() ? (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={async () => {
                            const newCategory = categorySearch.trim();
                            if (newCategory && !allCategories.find(c => c.value === newCategory.toLowerCase())) {
                              await createCategoryMutation.mutateAsync(newCategory);
                            }
                            setCategoryFilter(newCategory.toLowerCase());
                            setCategoryPopoverOpen(false);
                            setCategorySearch("");
                          }}
                          disabled={createCategoryMutation.isPending}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t("editor.createCategory", { name: categorySearch })}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium mb-1">{t("editor.noCategoryFound")}</p>
                      </div>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {allCategories.map((cat) => (
                      <CommandItem
                        key={cat.value}
                        value={cat.value}
                        onSelect={() => {
                          setCategoryFilter(cat.value === categoryFilter ? "" : cat.value);
                          setCategoryPopoverOpen(false);
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              categoryFilter === cat.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>{cat.label}</span>
                        </div>
                        {cat.isCustom && cat.id && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (cat.id) {
                                try {
                                  await deleteCategoryMutation.mutateAsync(cat.id);
                                  if (categoryFilter === cat.value) {
                                    setCategoryFilter("");
                                  }
                                } catch (error: any) {
                                  if (error?.error === "Category is in use and cannot be deleted") {
                                    // Category is in use, show error
                                    alert(t("filters.categoryInUse", "Categoria em uso em documentos"));
                                  }
                                }
                              }
                            }}
                            className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            title={t("filters.removeCategory", "Remover categoria")}
                            disabled={deleteCategoryMutation.isPending}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
            </Popover>

            {/* Client Filter */}
            <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={clientTriggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={clientPopoverOpen}
                className="w-full sm:w-[180px] min-w-[160px] justify-between text-sm"
              >
                <span className="truncate">
                  {clientFilter || t("editor.client")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: clientPopoverWidth ? `${clientPopoverWidth}px` : undefined }}
              align="start"
            >
              <Command>
                <CommandList>
                  <CommandEmpty>
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                      <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium mb-1">{t("editor.noClientFound")}</p>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {allClients.map((client) => {
                      return (
                        <CommandItem
                          key={client.name}
                          value={client.name}
                          onSelect={() => {
                            setClientFilter(client.name === clientFilter ? "" : client.name);
                            setClientPopoverOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Check
                              className={cn(
                                "h-4 w-4",
                                clientFilter === client.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{client.name}</span>
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                let clientId = client.id;
                                
                                // Se não é customizado, criar como customizado primeiro
                                if (!clientId) {
                                  const newClient = await createClientMutation.mutateAsync(client.name);
                                  clientId = newClient.id;
                                  // Invalidar queries para atualizar a lista
                                  queryClient.invalidateQueries({ queryKey: ["/api/custom-clients"] });
                                  // Aguardar um pouco para garantir que a query foi atualizada
                                  await new Promise(resolve => setTimeout(resolve, 100));
                                }
                                
                                // Excluir o cliente
                                await deleteClientMutation.mutateAsync(clientId);
                                
                                if (clientFilter === client.name) {
                                  setClientFilter("");
                                }
                              } catch (error: any) {
                                console.error("Error deleting client:", error);
                                
                                // Extrair código de erro (pode estar em error.error ou parsear da mensagem)
                                let errorCode = error?.error;
                                
                                // Se não encontrou em error.error, tentar parsear da mensagem
                                if (!errorCode && error?.message) {
                                  try {
                                    const match = error.message.match(/\{"error":"([^"]+)"\}/);
                                    if (match) {
                                      errorCode = match[1];
                                    }
                                  } catch (e) {
                                    // Ignorar erro de parsing
                                  }
                                }
                                
                                // Mapear códigos de erro para chaves de tradução
                                let errorMessage = t("filters.errorDeletingClient", "Erro ao remover cliente");
                                
                                if (errorCode === "CLIENT_NOT_FOUND") {
                                  errorMessage = t("filters.clientNotFound", "Cliente não encontrado ou você não tem permissão para excluí-lo");
                                } else if (errorCode === "CLIENT_IN_USE") {
                                  errorMessage = t("filters.clientInUseCannotDelete", "Este cliente não pode ser excluído porque está sendo usado em um ou mais documentos. Remova o cliente dos documentos antes de excluí-lo.");
                                } else if (errorCode === "CLIENT_DELETE_FAILED") {
                                  errorMessage = t("filters.clientDeleteFailed", "Falha ao excluir o cliente. Tente novamente mais tarde.");
                                } else if (error?.message && !error.message.includes("{")) {
                                  // Só usar a mensagem se não for JSON
                                  errorMessage = error.message;
                                }
                                
                                alert(errorMessage);
                              }
                            }}
                            className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            title={t("filters.removeClient", "Remover cliente")}
                            disabled={deleteClientMutation.isPending || createClientMutation.isPending}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={statusTriggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={statusPopoverOpen}
                className="w-full sm:w-[180px] min-w-[160px] justify-between text-sm"
              >
                <span className="truncate">
                  {statusFilter
                    ? DOCUMENT_STATUSES.find((stat) => stat.value === statusFilter)?.label || statusFilter
                    : t("editor.status")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: statusPopoverWidth ? `${statusPopoverWidth}px` : undefined }}
              align="start"
            >
              <Command>
                <CommandList>
                  <CommandEmpty>
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {t("editor.noStatusFound")}
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {DOCUMENT_STATUSES.map((stat) => (
                      <CommandItem
                        key={stat.value}
                        value={stat.value}
                        onSelect={() => {
                          setStatusFilter(stat.value === statusFilter ? "" : stat.value);
                          setStatusPopoverOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            statusFilter === stat.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{stat.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                {t("filters.clearAll", "Limpar")}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="text-sm text-muted-foreground">{t("filters.activeFilters", "Filtros ativos")}:</span>
          {globalFilter && (
            <Badge variant="secondary" className="gap-1">
              {t("filters.search", "Busca")}: {globalFilter}
              <button onClick={() => setGlobalFilter("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="secondary" className="gap-1">
              {t("editor.category")}: {allCategories.find((cat) => cat.value === categoryFilter)?.label || categoryFilter}
              <button onClick={() => setCategoryFilter("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {clientFilter && (
            <Badge variant="secondary" className="gap-1">
              {t("editor.client")}: {clientFilter}
              <button onClick={() => setClientFilter("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="gap-1">
              {t("editor.status")}: {DOCUMENT_STATUSES.find((stat) => stat.value === statusFilter)?.label || statusFilter}
              <button onClick={() => setStatusFilter("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </motion.div>
      )}

      {/* Table */}
      {table.getRowModel().rows?.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={hasActiveFilters ? t("list.empty.title") : t("table.noDocuments", "Nenhum documento encontrado")}
          description={
            hasActiveFilters
              ? t("list.empty.description")
              : t("table.noDocumentsDescription", "Comece criando um novo documento")
          }
          action={
            hasActiveFilters
              ? { label: t("filters.clearAll", "Limpar Filtros"), onClick: clearFilters }
              : canEdit ? { label: tCommon("buttons.create"), onClick: () => router.push("/document/new") } : undefined
          }
        />
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <ScrollArea className="h-[600px]">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {t("table.noResults", "Nenhum resultado encontrado.")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              {t("table.showing", "Mostrando")} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {t("table.to", "até")} {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} {t("table.of", "de")} {table.getFilteredRowModel().rows.length} {t("table.results", "resultados")}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t("table.previous", "Anterior")}
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {t("table.page", "Página")} {table.getState().pagination.pageIndex + 1} {t("table.of", "de")} {table.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t("table.next", "Próxima")}
              </Button>
            </div>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center justify-end space-x-2">
            <span className="text-sm text-muted-foreground">{t("table.rowsPerPage", "Linhas por página")}:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-[70px]">
                  {table.getState().pagination.pageSize}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 20, 30, 50].map((pageSize) => (
                  <DropdownMenuCheckboxItem
                    key={pageSize}
                    checked={table.getState().pagination.pageSize === pageSize}
                    onCheckedChange={() => {
                      table.setPageSize(pageSize);
                    }}
                  >
                    {pageSize}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setDocumentToDelete(null);
            }}>
              {t("deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  deleteDocument.mutate(documentToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


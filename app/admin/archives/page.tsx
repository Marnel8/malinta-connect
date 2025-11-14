"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import {
  getArchivedItemsAction,
  restoreArchivedItemAction,
  deleteArchivedItemAction,
} from "@/app/actions/archives";
import type { ArchivePath } from "@/lib/archive-manager";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ArchivePreview = Record<string, unknown>;

type AdminArchiveItem = {
  entity: string;
  id: string;
  archivedAt: number;
  archivedBy?: string | null;
  paths: ArchivePath[];
  preview?: ArchivePreview;
};

type ActionState = {
  action: "restore" | "delete";
  itemKey: string;
} | null;

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(", ");
  }
  return JSON.stringify(value);
};

const getEntityLabel = (entity: string) =>
  entity.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getHumanReadableIdentifier = (
  preview: ArchivePreview | undefined,
  fallbackId: string
): string => {
  if (!preview || Object.keys(preview).length === 0) {
    return fallbackId;
  }

  // Priority order: name → title → referenceNumber → first available preview field → fallback to ID
  const priorityFields = ["name", "title", "referenceNumber"];

  for (const field of priorityFields) {
    const value = preview[field];
    if (value !== null && value !== undefined && value !== "") {
      return formatValue(value);
    }
  }

  // If no priority field found, use the first available preview field
  const firstEntry = Object.entries(preview)[0];
  if (firstEntry) {
    const [, value] = firstEntry;
    if (value !== null && value !== undefined && value !== "") {
      return formatValue(value);
    }
  }

  // Fallback to ID if nothing is available
  return fallbackId;
};

const formatArchivePath = (path: string): string => {
  // Paths are typically in format: "collection/id" or "collection/id/subcollection/subid"
  const parts = path.split("/");
  if (parts.length === 0) {
    return path;
  }

  // Format the collection name (first part)
  const collectionName = getEntityLabel(parts[0]);

  // If there's an ID, show it
  if (parts.length >= 2) {
    const id = parts[1];
    // If there are more parts (subcollections), show them too
    if (parts.length > 2) {
      const subPath = parts.slice(2).join(" → ");
      return `${collectionName} → ${id} → ${subPath}`;
    }
    return `${collectionName} → ${id}`;
  }

  return collectionName;
};

export default function AdminArchivesPage() {
  const { toast } = useToast();
  const [archives, setArchives] = useState<AdminArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionState, setActionState] = useState<ActionState>(null);

  const loadArchives = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getArchivedItemsAction();
      if (result.success && result.archives) {
        setArchives(
          result.archives.map((item) => ({
            ...item,
            preview: item.preview ?? {},
          }))
        );
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load archives.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load archives:", error);
      toast({
        title: "Error",
        description: "Failed to load archives.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  const entityOptions = useMemo(() => {
    const uniqueEntities = new Set<string>();
    archives.forEach((item) => uniqueEntities.add(item.entity));
    return Array.from(uniqueEntities).sort();
  }, [archives]);

  const filteredArchives = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return archives.filter((item) => {
      if (entityFilter !== "all" && item.entity !== entityFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const previewValues = Object.values(item.preview ?? {});
      const paths = item.paths.map((p) => p.path).join(" ");
      const haystack = [
        item.id,
        item.entity,
        formatDateTime(item.archivedAt),
        paths,
        item.archivedBy ?? "",
        ...previewValues.map((value) => formatValue(value)),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [archives, entityFilter, searchQuery]);

  const isItemPending = (
    entity: string,
    id: string,
    action: "restore" | "delete"
  ) =>
    actionState?.itemKey === `${entity}:${id}` &&
    actionState?.action === action;

  const handleRestore = async (item: AdminArchiveItem) => {
    const itemKey = `${item.entity}:${item.id}`;
    setActionState({ action: "restore", itemKey });
    try {
      const result = await restoreArchivedItemAction(item.entity, item.id);
      if (result.success) {
        toast({
          title: "Restored",
          description: `${getEntityLabel(
            item.entity
          )} entry restored successfully.`,
        });
        loadArchives();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore the archived item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to restore archived item:", error);
      toast({
        title: "Error",
        description: "Failed to restore the archived item.",
        variant: "destructive",
      });
    } finally {
      setActionState((state) =>
        state?.itemKey === itemKey && state?.action === "restore" ? null : state
      );
    }
  };

  const handleDelete = async (item: AdminArchiveItem) => {
    const itemKey = `${item.entity}:${item.id}`;
    setActionState({ action: "delete", itemKey });
    try {
      const result = await deleteArchivedItemAction(item.entity, item.id);
      if (result.success) {
        toast({
          title: "Deleted",
          description: `${getEntityLabel(
            item.entity
          )} entry deleted permanently.`,
        });
        loadArchives();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete the archived item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete archived item:", error);
      toast({
        title: "Error",
        description: "Failed to delete the archived item.",
        variant: "destructive",
      });
    } finally {
      setActionState((state) =>
        state?.itemKey === itemKey && state?.action === "delete" ? null : state
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Archives</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage temporarily deleted records. Restore items back to
            the system or permanently delete them when no longer needed.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Use these filters to narrow down archived records by module or
              keyword.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="w-full md:flex-1">
              <Input
                placeholder="Search archived records..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full"
              />
            </div>
            <Separator className="md:hidden" />
            <div className="w-full md:w-64">
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Entities</SelectItem>
                    {entityOptions.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {getEntityLabel(entity)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Archived Records</CardTitle>
            <CardDescription>
              Items stay in the archive until you restore or permanently delete
              them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading archived records...
              </div>
            ) : filteredArchives.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                <span className="text-base font-medium">
                  No archived records found.
                </span>
                <p className="text-sm">
                  Adjust your filters or confirm that records have been
                  archived.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Item</TableHead>
                      <TableHead className="min-w-[140px]">Entity</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead className="min-w-[200px]">
                        Archived Paths
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        Archived At
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArchives.map((item) => {
                      const itemKey = `${item.entity}:${item.id}`;
                      const previewEntries = Object.entries(item.preview ?? {});
                      return (
                        <TableRow key={itemKey}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {getHumanReadableIdentifier(
                                  item.preview,
                                  item.id
                                )}
                              </span>
                              {item.archivedBy ? (
                                <span className="text-xs text-muted-foreground">
                                  Archived by {item.archivedBy}
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getEntityLabel(item.entity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {previewEntries.length === 0 ? (
                                <span className="text-sm text-muted-foreground">
                                  No preview available
                                </span>
                              ) : (
                                previewEntries.map(([key, value]) => (
                                  <div
                                    key={`${itemKey}-${key}`}
                                    className="text-sm"
                                  >
                                    <span className="font-medium capitalize">
                                      {key.replace(/[_-]/g, " ")}:
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                      {formatValue(value)}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              {item.paths.map((pathEntry, idx) => (
                                <span key={`${itemKey}-${idx}`}>
                                  {formatArchivePath(pathEntry.path)}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(item.archivedAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isItemPending(
                                      item.entity,
                                      item.id,
                                      "restore"
                                    )}
                                    onClick={() => handleRestore(item)}
                                  >
                                    {isItemPending(
                                      item.entity,
                                      item.id,
                                      "restore"
                                    ) ? (
                                      <Loader2 className=" h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Restore this item</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isItemPending(
                                      item.entity,
                                      item.id,
                                      "delete"
                                    )}
                                    onClick={() => handleDelete(item)}
                                  >
                                    {isItemPending(
                                      item.entity,
                                      item.id,
                                      "delete"
                                    ) ? (
                                      <Loader2 className=" h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className=" h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Permanently delete this item</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

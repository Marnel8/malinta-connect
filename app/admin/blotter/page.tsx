"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  Eye,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getAllBlotterAction,
  searchBlotterEntriesAction,
  getBlotterEntriesByStatusAction,
  createBlotterEntryAction,
  updateBlotterStatusAction,
  deleteBlotterEntryAction,
  type BlotterEntry,
  type CreateBlotterData,
} from "@/app/actions/blotter";

export default function AdminBlotterPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State management
  const [blotterEntries, setBlotterEntries] = useState<BlotterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BlotterEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] =
    useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state for new report
  const [newReportForm, setNewReportForm] = useState<CreateBlotterData>({
    type: "",
    description: "",
    reportedBy: "",
    contactNumber: "",
    email: "",
    priority: "medium",
    location: "",
    incidentDate: "",
    notes: "",
  });

  // Status update form
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: "" as BlotterEntry["status"] | "",
    notes: "",
  });

  // Load blotter entries on component mount
  useEffect(() => {
    loadBlotterEntries();
  }, []);

  const loadBlotterEntries = async () => {
    setLoading(true);
    try {
      const result = await getAllBlotterAction();
      if (result.success && result.entries) {
        setBlotterEntries(result.entries);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load blotter entries",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blotter entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadBlotterEntries();
      return;
    }

    setLoading(true);
    try {
      const result = await searchBlotterEntriesAction(query);
      if (result.success && result.entries) {
        setBlotterEntries(result.entries);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to search blotter entries",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search blotter entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter
  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    if (status === "all") {
      loadBlotterEntries();
      return;
    }

    setLoading(true);
    try {
      const result = await getBlotterEntriesByStatusAction(
        status as BlotterEntry["status"]
      );
      if (result.success && result.entries) {
        setBlotterEntries(result.entries);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to filter blotter entries",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to filter blotter entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle new report submission
  const handleNewReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await createBlotterEntryAction(newReportForm);
        if (result.success) {
          toast({
            title: "Success",
            description: `New blotter report created with ID: ${result.entryId}`,
          });
          setIsNewReportDialogOpen(false);
          setNewReportForm({
            type: "",
            description: "",
            reportedBy: "",
            contactNumber: "",
            email: "",
            priority: "medium",
            location: "",
            incidentDate: "",
            notes: "",
          });
          loadBlotterEntries();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create blotter report",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create blotter report",
          variant: "destructive",
        });
      }
    });
  };

  // Quick status update from row actions
  const quickUpdateStatus = (
    entry: BlotterEntry,
    status: BlotterEntry["status"]
  ) => {
    startTransition(async () => {
      try {
        const result = await updateBlotterStatusAction(entry.id, status);
        if (result.success) {
          toast({ title: "Success", description: "Status updated" });
          loadBlotterEntries();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update status",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    });
  };

  // Handle status update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !statusUpdateForm.status) return;

    startTransition(async () => {
      try {
        const result = await updateBlotterStatusAction(
          selectedEntry.id,
          statusUpdateForm.status as BlotterEntry["status"],
          statusUpdateForm.notes
        );
        if (result.success) {
          toast({
            title: "Success",
            description: "Blotter status updated successfully",
          });
          setIsStatusUpdateDialogOpen(false);
          setStatusUpdateForm({ status: "", notes: "" });
          setSelectedEntry(null);
          loadBlotterEntries();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update blotter status",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update blotter status",
          variant: "destructive",
        });
      }
    });
  };

  // Handle delete
  const handleDelete = async (entryId: string) => {
    setActionLoading(entryId);
    try {
      const result = await deleteBlotterEntryAction(entryId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Blotter report deleted and archived successfully",
        });
        await loadBlotterEntries();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete blotter report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blotter report",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            {t("blotter.status.investigating")}
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("blotter.status.resolved")}
          </Badge>
        );
      case "additionalInfo":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            {t("certificates.status.additionalInfo")}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blotter Reports</h1>
          <p className="text-muted-foreground mt-2">
            Manage and investigate incident reports from residents
          </p>
        </div>
        <Dialog
          open={isNewReportDialogOpen}
          onOpenChange={setIsNewReportDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              File New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>File New Blotter Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Report Type *</Label>
                  <Select
                    value={newReportForm.type}
                    onValueChange={(value) =>
                      setNewReportForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noise Complaint">
                        Noise Complaint
                      </SelectItem>
                      <SelectItem value="Property Damage">
                        Property Damage
                      </SelectItem>
                      <SelectItem value="Neighbor Dispute">
                        Neighbor Dispute
                      </SelectItem>
                      <SelectItem value="Theft/Robbery">
                        Theft/Robbery
                      </SelectItem>
                      <SelectItem value="Violence/Assault">
                        Violence/Assault
                      </SelectItem>
                      <SelectItem value="Public Disturbance">
                        Public Disturbance
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={newReportForm.priority}
                    onValueChange={(value) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        priority: value as CreateBlotterData["priority"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newReportForm.description}
                  onChange={(e) =>
                    setNewReportForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description of the incident"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportedBy">Reported By *</Label>
                  <Input
                    id="reportedBy"
                    value={newReportForm.reportedBy}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        reportedBy: e.target.value,
                      }))
                    }
                    placeholder="Full name of reporter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={newReportForm.contactNumber}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newReportForm.email}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newReportForm.location}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Address or location of incident"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={newReportForm.incidentDate}
                  onChange={(e) =>
                    setNewReportForm((prev) => ({
                      ...prev,
                      incidentDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newReportForm.notes}
                  onChange={(e) =>
                    setNewReportForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any additional information"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewReportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Report"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Under Investigation</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="additionalInfo">Needs Info</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Noise Complaint">Noise Complaints</SelectItem>
            <SelectItem value="Property Damage">Property Damage</SelectItem>
            <SelectItem value="Neighbor Dispute">Disputes</SelectItem>
            <SelectItem value="Theft/Robbery">Theft/Robbery</SelectItem>
            <SelectItem value="Violence/Assault">Violence/Assault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Loading blotter reports...</p>
                </TableCell>
              </TableRow>
            ) : blotterEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No blotter reports found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first blotter report to get started"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              blotterEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.referenceNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                      {entry.type}
                    </div>
                  </TableCell>
                  <TableCell>{entry.reportedBy}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.location || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={entry.status === "investigating"}
                          onClick={() =>
                            quickUpdateStatus(entry, "investigating")
                          }
                        >
                          Set to Investigating
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={entry.status === "additionalInfo"}
                          onClick={() =>
                            quickUpdateStatus(entry, "additionalInfo")
                          }
                        >
                          Request Additional Info
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={entry.status === "resolved"}
                          onClick={() => quickUpdateStatus(entry, "resolved")}
                        >
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={entry.status === "closed"}
                          onClick={() => quickUpdateStatus(entry, "closed")}
                        >
                          Close Case
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEntry(entry);
                            setStatusUpdateForm({
                              status: entry.status,
                              notes: entry.notes || "",
                            });
                            setIsStatusUpdateDialogOpen(true);
                          }}
                        >
                          Update status...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                              disabled={actionLoading === entry.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Blotter Report
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The blotter report
                                will be archived. Are you sure you want to
                                delete this report?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(entry.id)}
                                disabled={actionLoading === entry.id}
                              >
                                {actionLoading === entry.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blotter Report Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reference Number
                  </Label>
                  <p className="font-medium">{selectedEntry.referenceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEntry.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Report Type
                  </Label>
                  <p>{selectedEntry.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Priority
                  </Label>
                  <Badge
                    variant={
                      selectedEntry.priority === "urgent"
                        ? "destructive"
                        : selectedEntry.priority === "high"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedEntry.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="mt-1 text-sm">{selectedEntry.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reported By
                  </Label>
                  <p>{selectedEntry.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </Label>
                  <p>{selectedEntry.contactNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p>{selectedEntry.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Location
                  </Label>
                  <p>{selectedEntry.location || "Not specified"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date Reported
                  </Label>
                  <p>{selectedEntry.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Incident Date
                  </Label>
                  <p>{selectedEntry.incidentDate || "Not specified"}</p>
                </div>
              </div>

              {selectedEntry.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notes
                  </Label>
                  <p className="mt-1 text-sm">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={isStatusUpdateDialogOpen}
        onOpenChange={setIsStatusUpdateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Blotter Status</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Reference Number
                </Label>
                <p className="font-medium">{selectedEntry.referenceNumber}</p>
              </div>

              <div>
                <Label htmlFor="status">New Status *</Label>
                <Select
                  value={statusUpdateForm.status}
                  onValueChange={(value) =>
                    setStatusUpdateForm((prev) => ({
                      ...prev,
                      status: value as BlotterEntry["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">
                      Under Investigation
                    </SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="additionalInfo">
                      Needs Additional Info
                    </SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={statusUpdateForm.notes}
                  onChange={(e) =>
                    setStatusUpdateForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Add notes about the status update"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !statusUpdateForm.status}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

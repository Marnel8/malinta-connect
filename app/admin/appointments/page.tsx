"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  Clock,
  CheckCircle,
  X,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
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
  getAllAppointmentsAction,
  updateAppointmentStatusAction,
  deleteAppointmentAction,
  getAppointmentsByStatusAction,
  createAppointmentAction,
  type Appointment,
  type CreateAppointmentData,
} from "@/app/actions/appointments";

export default function AdminAppointmentsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    title: "",
    description: "",
    date: "",
    time: "",
    requestedBy: "",
    contactNumber: "",
    email: "",
    notes: "",
  });

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const result = await getAllAppointmentsAction();
      if (result.success && result.appointments) {
        setAppointments(result.appointments);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load appointments",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    setCreateLoading(true);
    try {
      const result = await createAppointmentAction(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
        setCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          requestedBy: "",
          contactNumber: "",
          email: "",
          notes: "",
        });
        await loadAppointments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: Exclude<Appointment["status"], "pending">
  ) => {
    setActionLoading(appointmentId);
    try {
      const result = await updateAppointmentStatusAction(
        appointmentId,
        newStatus
      );
      if (result.success) {
        toast({
          title: "Success",
          description: `Appointment ${newStatus} successfully`,
        });
        // Reload appointments to get updated data
        await loadAppointments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update appointment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    setActionLoading(appointmentId);
    try {
      const result = await deleteAppointmentAction(appointmentId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Appointment deleted successfully",
        });
        // Reload appointments to get updated data
        await loadAppointments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    try {
      if (status === "all") {
        await loadAppointments();
      } else {
        const result = await getAppointmentsByStatusAction(
          status as Appointment["status"]
        );
        if (result.success && result.appointments) {
          setAppointments(result.appointments);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to filter appointments",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to filter appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.requestedBy
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (appointment.referenceNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDateFilter =
      dateFilter === "all" ||
      (() => {
        const appointmentDate = new Date(appointment.date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (dateFilter) {
          case "today":
            return appointmentDate.toDateString() === today.toDateString();
          case "tomorrow":
            return appointmentDate.toDateString() === tomorrow.toDateString();
          case "week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return appointmentDate >= today && appointmentDate <= weekFromNow;
          case "month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return appointmentDate >= today && appointmentDate <= monthFromNow;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesDateFilter;
  });

  const getLocalizedText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            {getLocalizedText("appointments.status.confirmed", "Confirmed")}
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            {getLocalizedText("appointments.status.pending", "Pending")}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          >
            <X className="mr-1 h-3 w-3" />
            {getLocalizedText("appointments.status.cancelled", "Cancelled")}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            {getLocalizedText("appointments.status.completed", "Completed")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-2">
            Manage and schedule appointments with residents
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment for a resident. Fill in all required
                fields.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Appointment title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedBy">Requested By *</Label>
                  <Input
                    id="requestedBy"
                    value={formData.requestedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedBy: e.target.value })
                    }
                    placeholder="Resident name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Appointment purpose or description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes or comments"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateAppointment}
                disabled={
                  createLoading ||
                  !formData.title ||
                  !formData.description ||
                  !formData.date ||
                  !formData.time ||
                  !formData.requestedBy ||
                  !formData.contactNumber ||
                  !formData.email
                }
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Appointment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Appointment Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                View complete information about this appointment
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Reference Number
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.referenceNumber ||
                        selectedAppointment.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Status
                    </Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Title
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedAppointment.title}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-sm">{selectedAppointment.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Requested By
                    </Label>
                    <p className="text-sm">{selectedAppointment.requestedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Contact Number
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.contactNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="text-sm">{selectedAppointment.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date
                    </Label>
                    <p className="text-sm">
                      {formatDate(selectedAppointment.date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Time
                    </Label>
                    <p className="text-sm">{selectedAppointment.time}</p>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </Label>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.createdAt
                        ? formatDate(
                            new Date(
                              selectedAppointment.createdAt
                            ).toISOString()
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Updated At
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.updatedAt
                        ? formatDate(
                            new Date(
                              selectedAppointment.updatedAt
                            ).toISOString()
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appointments</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.referenceNumber || appointment.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      {appointment.title}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.requestedBy}</TableCell>
                  <TableCell>
                    {formatDate(appointment.date)} at {appointment.time}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {appointment.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewAppointment(appointment)}
                          disabled={actionLoading === appointment.id}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        {appointment.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "confirmed")
                              }
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              {actionLoading === appointment.id
                                ? "Updating..."
                                : "Confirm"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "cancelled")
                              }
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              {actionLoading === appointment.id
                                ? "Updating..."
                                : "Reject"}
                            </DropdownMenuItem>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "completed")
                              }
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              {actionLoading === appointment.id
                                ? "Updating..."
                                : "Mark as Completed"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(appointment.id, "cancelled")
                              }
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              {actionLoading === appointment.id
                                ? "Updating..."
                                : "Cancel"}
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Appointment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Are you sure you
                                want to delete this appointment?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(appointment.id)}
                                disabled={actionLoading === appointment.id}
                              >
                                {actionLoading === appointment.id ? (
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
    </div>
  );
}

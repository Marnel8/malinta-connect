"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import {
  getDashboardStats,
  getAllCertificateRequests,
  getAllAppointments,
  getAllBlotterCases,
  type DashboardStats,
  type CertificateRequest,
  type AppointmentItem,
  type BlotterItem,
} from "@/app/actions/admin-dashboard";
import { getAllAnalytics, type AnalyticsData } from "@/app/actions/analytics";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

type DashboardFilters = {
  dateFrom: string | null;
  dateTo: string | null;
};

const INITIAL_FILTERS: DashboardFilters = {
  dateFrom: null,
  dateTo: null,
};

const formatDateTime = (timestamp: number) => {
  if (!timestamp) {
    return "N/A";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

const toStartOfDay = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const toEndOfDay = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const isWithinDateRange = (
  timestamp: number | null | undefined,
  dateFrom: string | null,
  dateTo: string | null
) => {
  if (!timestamp) {
    return !dateFrom && !dateTo;
  }

  const fromTime = dateFrom ? toStartOfDay(dateFrom) : null;
  const toTime = dateTo ? toEndOfDay(dateTo) : null;

  if (fromTime !== null && timestamp < fromTime) {
    return false;
  }

  if (toTime !== null && timestamp > toTime) {
    return false;
  }

  return true;
};

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [certificateRequests, setCertificateRequests] = useState<
    CertificateRequest[]
  >([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [blotterCases, setBlotterCases] = useState<BlotterItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(() => ({
    ...INITIAL_FILTERS,
  }));
  const [pendingFilters, setPendingFilters] = useState<DashboardFilters>(
    () => ({
      ...INITIAL_FILTERS,
    })
  );
  const [exporting, setExporting] = useState(false);

  // Check if user has any admin permissions
  const hasAdminAccess =
    userProfile?.role === "admin" ||
    userProfile?.permissions?.canManageUsers ||
    userProfile?.permissions?.canManageEvents ||
    userProfile?.permissions?.canManageCertificates ||
    userProfile?.permissions?.canManageAppointments ||
    userProfile?.permissions?.canManageBlotter ||
    userProfile?.permissions?.canManageOfficials ||
    userProfile?.permissions?.canManageResidents ||
    userProfile?.permissions?.canViewAnalytics ||
    userProfile?.permissions?.canManageSettings ||
    userProfile?.permissions?.canManageAnnouncements;

  const { dateFrom: activeDateFrom, dateTo: activeDateTo } = filters;
  const { dateFrom, dateTo } = pendingFilters;

  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (activeDateFrom) count += 1;
    if (activeDateTo) count += 1;
    return count;
  }, [activeDateFrom, activeDateTo]);

  const hasPendingChanges = useMemo(
    () => dateFrom !== activeDateFrom || dateTo !== activeDateTo,
    [dateFrom, dateTo, activeDateFrom, activeDateTo]
  );

  const filtersActive = appliedFilterCount > 0;

  useEffect(() => {
    if (filterDialogOpen) {
      setPendingFilters(filters);
    }
  }, [filterDialogOpen, filters]);

  const handleDateChange = useCallback(
    (key: "dateFrom" | "dateTo", value: string) => {
      setPendingFilters((prev) => ({
        ...prev,
        [key]: value ? value : null,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS });
    setPendingFilters({ ...INITIAL_FILTERS });
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(pendingFilters);
    setFilterDialogOpen(false);
  }, [pendingFilters]);

  const filteredCertificateRequests = useMemo(() => {
    return certificateRequests.filter((cert) => {
      return isWithinDateRange(cert.requestedOn, activeDateFrom, activeDateTo);
    });
  }, [certificateRequests, activeDateFrom, activeDateTo]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      return isWithinDateRange(apt.scheduledDate, activeDateFrom, activeDateTo);
    });
  }, [appointments, activeDateFrom, activeDateTo]);

  const filteredBlotterCases = useMemo(() => {
    return blotterCases.filter((blotter) => {
      return isWithinDateRange(
        blotter.incidentDate,
        activeDateFrom,
        activeDateTo
      );
    });
  }, [blotterCases, activeDateFrom, activeDateTo]);

  const handleExportData = useCallback(async () => {
    setExporting(true);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      let sheetCount = 0;

      if (filteredCertificateRequests.length > 0) {
        const certificateRows = filteredCertificateRequests.map((cert) => ({
          "Request ID": cert.id,
          "Reference #": cert.referenceNumber || "",
          Type: cert.type,
          Status: formatStatus(cert.status),
          "Requested By": cert.requestedBy,
          "Requested On": formatDateTime(cert.requestedOn),
        }));

        const certificateSheet = XLSX.utils.json_to_sheet(certificateRows);
        XLSX.utils.book_append_sheet(
          workbook,
          certificateSheet,
          "Certificates"
        );
        sheetCount += 1;
      }

      if (filteredAppointments.length > 0) {
        const appointmentRows = filteredAppointments.map((apt) => ({
          "Appointment ID": apt.id,
          Type: apt.type,
          Status: formatStatus(apt.status),
          "Resident Name": apt.residentName,
          "Scheduled Date": formatDateTime(apt.scheduledDate),
          "Time Slot": apt.timeSlot,
        }));

        const appointmentSheet = XLSX.utils.json_to_sheet(appointmentRows);
        XLSX.utils.book_append_sheet(
          workbook,
          appointmentSheet,
          "Appointments"
        );
        sheetCount += 1;
      }

      if (filteredBlotterCases.length > 0) {
        const blotterRows = filteredBlotterCases.map((caseItem) => ({
          "Case ID": caseItem.id,
          "Case Number": caseItem.caseNumber,
          Type: caseItem.caseType,
          Status: formatStatus(caseItem.status),
          Complainant: caseItem.complainant,
          Respondent: caseItem.respondent,
          "Incident Date": formatDateTime(caseItem.incidentDate),
        }));

        const blotterSheet = XLSX.utils.json_to_sheet(blotterRows);
        XLSX.utils.book_append_sheet(workbook, blotterSheet, "Blotter");
        sheetCount += 1;
      }

      if (sheetCount === 0) {
        toast({
          title: "No data to export",
          description:
            "Adjust your filters or add new records before exporting.",
        });
        return;
      }

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `malinta-dashboard-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export complete",
        description: "The dashboard data has been downloaded as an Excel file.",
      });
    } catch (error) {
      console.error("Error exporting dashboard data:", error);
      toast({
        title: "Export failed",
        description: "Something went wrong while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [
    filteredCertificateRequests,
    filteredAppointments,
    filteredBlotterCases,
    toast,
  ]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!hasAdminAccess) return;

      try {
        setLoading(true);
        const [stats, certs, apts, blotter] = await Promise.all([
          getDashboardStats(),
          getAllCertificateRequests(),
          getAllAppointments(),
          getAllBlotterCases(),
        ]);

        setDashboardStats(stats);
        setCertificateRequests(certs);
        setAppointments(apts);
        setBlotterCases(blotter);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasAdminAccess]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!hasAdminAccess || !userProfile?.permissions?.canViewAnalytics)
        return;

      try {
        setAnalyticsLoading(true);
        const data = await getAllAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [hasAdminAccess, userProfile?.permissions?.canViewAnalytics]);

  // If no admin access, show access denied
  if (!hasAdminAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back,{" "}
            {userProfile?.firstName || userProfile?.email || "Admin"}. Here's
            what's happening in your barangay.
          </p>
        </div>
        {(userProfile?.role === "admin" ||
          userProfile?.permissions?.canViewAnalytics) && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={exporting || loading}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
            <Button
              variant={filtersActive ? "secondary" : "default"}
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {appliedFilterCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                  {appliedFilterCount}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filter dashboard data</DialogTitle>
            <DialogDescription>
              Filter certificates, appointments, and blotter records by date
              range.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dashboard-date-from">Start date</Label>
                <Input
                  id="dashboard-date-from"
                  type="date"
                  value={dateFrom ?? ""}
                  onChange={(event) =>
                    handleDateChange("dateFrom", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-date-to">End date</Label>
                <Input
                  id="dashboard-date-to"
                  type="date"
                  value={dateTo ?? ""}
                  onChange={(event) =>
                    handleDateChange("dateTo", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              disabled={!filtersActive && !hasPendingChanges}
            >
              Reset Filters
            </Button>
            <div className="flex w-full justify-end gap-2 sm:w-auto">
              <Button
                type="button"
                onClick={applyFilters}
                disabled={!hasPendingChanges}
              >
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilterDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(userProfile?.role === "admin" ||
          userProfile?.permissions?.canManageCertificates) && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Certificates
              </CardTitle>
              <FileText className="h-8 w-8 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats?.pendingCertificates || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardStats?.certificatesChange !== undefined && (
                  <>
                    {dashboardStats.certificatesChange >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span>
                      {dashboardStats.certificatesChange >= 0 ? "+" : ""}
                      {dashboardStats.certificatesChange}% vs. last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {(userProfile?.role === "admin" ||
          userProfile?.permissions?.canManageAppointments) && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <Calendar className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats?.upcomingAppointments || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardStats?.appointmentsChange !== undefined && (
                  <>
                    {dashboardStats.appointmentsChange >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span>
                      {dashboardStats.appointmentsChange >= 0 ? "+" : ""}
                      {dashboardStats.appointmentsChange}% vs. last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {(userProfile?.role === "admin" ||
          userProfile?.permissions?.canManageBlotter) && (
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Blotter Cases
              </CardTitle>
              <MessageSquare className="h-8 w-8 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats?.activeBlotterCases || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardStats?.blotterChange !== undefined && (
                  <>
                    {dashboardStats.blotterChange >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span>
                      {dashboardStats.blotterChange >= 0 ? "+" : ""}
                      {dashboardStats.blotterChange}% vs. last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {(userProfile?.role === "admin" ||
          userProfile?.permissions?.canManageResidents) && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registered Residents
              </CardTitle>
              <Users className="h-8 w-8 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats?.registeredResidents || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboardStats?.residentsChange !== undefined && (
                  <>
                    {dashboardStats.residentsChange >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span>
                      {dashboardStats.residentsChange >= 0 ? "+" : ""}
                      {dashboardStats.residentsChange}% vs. last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Dashboard Content */}
      {(userProfile?.role === "admin" ||
        userProfile?.permissions?.canManageCertificates ||
        userProfile?.permissions?.canManageAppointments ||
        userProfile?.permissions?.canManageBlotter) && (
        <Tabs defaultValue="certificates" className="w-full">
          <TabsList
            className={`grid w-full mb-8 rounded-lg bg-muted/50 p-1 ${
              [
                userProfile?.role === "admin" ||
                  userProfile?.permissions?.canManageCertificates,
                userProfile?.role === "admin" ||
                  userProfile?.permissions?.canManageAppointments,
                userProfile?.role === "admin" ||
                  userProfile?.permissions?.canManageBlotter,
              ].filter(Boolean).length === 1
                ? "grid-cols-1"
                : [
                    userProfile?.role === "admin" ||
                      userProfile?.permissions?.canManageCertificates,
                    userProfile?.role === "admin" ||
                      userProfile?.permissions?.canManageAppointments,
                    userProfile?.role === "admin" ||
                      userProfile?.permissions?.canManageBlotter,
                  ].filter(Boolean).length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {(userProfile?.role === "admin" ||
              userProfile?.permissions?.canManageCertificates) && (
              <TabsTrigger
                value="certificates"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Certificate Requests
              </TabsTrigger>
            )}
            {(userProfile?.role === "admin" ||
              userProfile?.permissions?.canManageAppointments) && (
              <TabsTrigger
                value="appointments"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Appointments
              </TabsTrigger>
            )}
            {(userProfile?.role === "admin" ||
              userProfile?.permissions?.canManageBlotter) && (
              <TabsTrigger
                value="blotter"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Blotter Reports
              </TabsTrigger>
            )}
          </TabsList>

          {(userProfile?.role === "admin" ||
            userProfile?.permissions?.canManageCertificates) && (
            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Certificate Requests</CardTitle>
                      <CardDescription>
                        Manage and process certificate requests from residents.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="search"
                          placeholder="Search requests..."
                          className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">
                          Loading certificate requests...
                        </p>
                      </div>
                    ) : filteredCertificateRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {filtersActive
                            ? "No certificate requests match the current filters."
                            : "No certificate requests found"}
                        </p>
                      </div>
                    ) : (
                      filteredCertificateRequests.map((cert) => (
                        <div key={cert.id} className="rounded-lg border p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-primary" />
                                <h3 className="font-medium">{cert.type}</h3>
                                {cert.status === "pending" && (
                                  <Badge variant="outline" className="ml-2">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Requested by: {cert.requestedBy}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Requested on: {formatDateTime(cert.requestedOn)}
                              </p>
                              {/* <p className="text-sm">
																Reference #: {cert.referenceNumber}
															</p> */}
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  cert.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : cert.status === "processing"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : cert.status === "additional_info_required"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {cert.status === "pending" && (
                                  <Clock className="mr-1 h-3 w-3" />
                                )}
                                {cert.status === "processing" && (
                                  <Activity className="mr-1 h-3 w-3" />
                                )}
                                {cert.status === "additional_info_required" && (
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                )}
                                {cert.status === "completed" && (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                {cert.status === "rejected" && (
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                )}
                                {formatStatus(cert.status)}
                              </span>
                              <div className="flex gap-2">
                                {cert.status === "pending" && (
                                  <Button size="sm">Process</Button>
                                )}
                                {cert.status === "processing" && (
                                  <Button size="sm">Complete</Button>
                                )}
                                {cert.status === "additional_info_required" && (
                                  <Button size="sm" variant="outline">
                                    Request Info
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userProfile?.role === "admin" ||
            userProfile?.permissions?.canManageAppointments) && (
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Appointment Schedule</CardTitle>
                      <CardDescription>
                        Manage upcoming appointments with residents.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="search"
                          placeholder="Search appointments..."
                          className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">
                          Loading appointments...
                        </p>
                      </div>
                    ) : filteredAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {filtersActive
                            ? "No appointments match the current filters."
                            : "No appointments found"}
                        </p>
                      </div>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/20"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-primary" />
                                <h3 className="font-medium">{apt.type}</h3>
                                {new Date(apt.scheduledDate).toDateString() ===
                                  new Date().toDateString() && (
                                  <Badge variant="outline" className="ml-2">
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Resident: {apt.residentName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Schedule: {formatDateTime(apt.scheduledDate)}
                                {apt.timeSlot ? ` • ${apt.timeSlot}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  apt.status === "scheduled"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : apt.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : apt.status === "cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {apt.status === "scheduled" && (
                                  <Clock className="mr-1 h-3 w-3" />
                                )}
                                {apt.status === "completed" && (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                {apt.status === "cancelled" && (
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                )}
                                {formatStatus(apt.status)}
                              </span>
                              <div className="flex gap-2">
                                {apt.status === "scheduled" && (
                                  <>
                                    <Button size="sm">Complete</Button>
                                    <Button size="sm" variant="outline">
                                      Reschedule
                                    </Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userProfile?.role === "admin" ||
            userProfile?.permissions?.canManageBlotter) && (
            <TabsContent value="blotter">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Blotter Reports</CardTitle>
                      <CardDescription>
                        Manage and investigate incident reports.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="search"
                          placeholder="Search reports..."
                          className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">
                          Loading blotter cases...
                        </p>
                      </div>
                    ) : filteredBlotterCases.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {filtersActive
                            ? "No blotter cases match the current filters."
                            : "No blotter cases found"}
                        </p>
                      </div>
                    ) : (
                      filteredBlotterCases.map((blotter) => (
                        <div key={blotter.id} className="rounded-lg border p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                                <h3 className="font-medium">
                                  {blotter.caseType}
                                </h3>
                                {blotter.status === "active" && (
                                  <Badge variant="outline" className="ml-2">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Reported by: {blotter.complainant}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Filed on: {formatDateTime(blotter.incidentDate)}
                              </p>
                              <p className="text-sm">
                                Case #: {blotter.caseNumber}
                              </p>
                            </div>
                            <div className="flex flex-col md:items-end gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  blotter.status === "active"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : blotter.status === "pending"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : blotter.status === "resolved"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {blotter.status === "active" && (
                                  <Clock className="mr-1 h-3 w-3" />
                                )}
                                {blotter.status === "pending" && (
                                  <Activity className="mr-1 h-3 w-3" />
                                )}
                                {blotter.status === "resolved" && (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                {formatStatus(blotter.status)}
                              </span>
                              <div className="flex gap-2">
                                {blotter.status === "active" && (
                                  <Button size="sm">Start Investigation</Button>
                                )}
                                {blotter.status === "pending" && (
                                  <Button size="sm">Update Status</Button>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Analytics Section */}
      {(userProfile?.role === "admin" ||
        userProfile?.permissions?.canViewAnalytics) && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Analytics Overview
          </h2>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Loading analytics data...</span>
              </div>
            </div>
          ) : analyticsData ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Certificates Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Requests</CardTitle>
                  <CardDescription>Distribution by type</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.certificates.breakdown.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.certificates.breakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) =>
                              `${type}: ${percentage}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.certificates.breakdown.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    [
                                      "#3B82F6",
                                      "#10B981",
                                      "#F59E0B",
                                      "#EF4444",
                                      "#8B5CF6",
                                      "#06B6D4",
                                    ][index % 6]
                                  }
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No certificate data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Appointments Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.appointments.status.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.appointments.status}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, count }) => `${status}: ${count}`}
                            outerRadius={80}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.appointments.status.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    [
                                      "#10B981",
                                      "#F59E0B",
                                      "#EF4444",
                                      "#3B82F6",
                                      "#8B5CF6",
                                    ][index % 5]
                                  }
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No appointment data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Blotter Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Blotter Reports</CardTitle>
                  <CardDescription>Distribution by type</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.blotter.breakdown.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.blotter.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="type"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            fill="#EF4444"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No blotter data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No analytics data available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

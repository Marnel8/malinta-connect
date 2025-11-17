"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Clock,
  CheckCircle,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  toastError,
  toastSuccess,
  toastWarning,
} from "@/lib/toast-presets";
import { requestForToken } from "@/app/firebase/firebase";
import { useFCMToken } from "@/hooks/use-fcm-token";
import {
  createAppointmentAction,
  getAppointmentsForUserAction,
  updateAppointmentStatusAction,
  updateAppointmentAction,
  type Appointment,
} from "@/app/actions/appointments";
import { format } from "date-fns";

type UserAppointment = Appointment;

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { updateToken } = useFCMToken();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [name, setName] = useState(
    userProfile
      ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
          userProfile.email ||
          "Unknown"
      : ""
  );
  const [contactNumber, setContactNumber] = useState(
    userProfile?.phoneNumber || ""
  );
  const [email, setEmail] = useState(userProfile?.email || "");
  const [loading, setLoading] = useState(false);
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>(
    []
  );
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<UserAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const loadAppointments = useCallback(
    async (uid: string) => {
      setAppointmentsLoading(true);
      try {
        const result = await getAppointmentsForUserAction(uid);
        if (result.success && result.appointments) {
          setUserAppointments(result.appointments);
        } else {
          console.error("Failed to load appointments:", result.error);
          toastError({
            toast,
            title: "Unable to load appointments",
            description: result.error || "Failed to load appointments",
          });
          setUserAppointments([]);
        }
      } catch (error) {
        console.error("Error loading appointments:", error);
        toastError({
          toast,
          title: "Unable to load appointments",
          description: "Failed to load appointments",
          error,
        });
        setUserAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!user?.uid) {
      setUserAppointments([]);
      setAppointmentsLoading(false);
      return;
    }
    loadAppointments(user.uid);
  }, [user?.uid, loadAppointments]);

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(
        `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
          userProfile.email ||
          "Unknown"
      );
      setContactNumber(userProfile.phoneNumber || "");
      setEmail(userProfile.email || "");
    }
  }, [userProfile]);

  // Register FCM token for notifications
  useEffect(() => {
    const registerFCMToken = async () => {
      if (!user || !userProfile) return;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.error(
          "VAPID key not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your environment variables."
        );
        return;
      }
      const token = await requestForToken(vapidKey, user.uid, userProfile.role);

      if (token) {
        console.log("FCM Token registered successfully on appointments page");
        updateToken(token, user.uid, userProfile.role);
      }
    };

    registerFCMToken();
  }, [user, userProfile, updateToken]);

  const handleScheduleAppointment = async () => {
    // Check if user is authenticated
    if (!user || !userProfile) {
      console.error("Appointment scheduling failed: User not authenticated");
      toastWarning({
        toast,
        title: "Authentication required",
        description: "Please log in to schedule an appointment",
      });
      return;
    }

    if (
      !date ||
      !time ||
      !serviceType ||
      !purpose ||
      !name ||
      !contactNumber ||
      !email
    ) {
      console.error("Appointment scheduling failed: Missing required fields");
      toastWarning({
        toast,
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        userId: user.uid,
        title: serviceType,
        description: purpose,
        date: format(date, "yyyy-MM-dd"),
        time: time,
        requestedBy: name,
        contactNumber: contactNumber,
        email: email,
        notes: "",
      };

      const result = await createAppointmentAction(appointmentData);
      if (result.success) {
        console.log(
          "Appointment scheduled successfully with ID:",
          result.appointmentId
        );
        toastSuccess({
          toast,
          description: `Appointment scheduled successfully! Reference: ${result.appointmentId}`,
        });
        // Reset form but keep user info
        setDate(undefined);
        setTime("");
        setServiceType("");
        setPurpose("");
        setName(
          userProfile
            ? `${userProfile.firstName || ""} ${
                userProfile.lastName || ""
              }`.trim() ||
                userProfile.email ||
                "Unknown"
            : ""
        );
        setContactNumber(userProfile?.phoneNumber || "");
        setEmail(userProfile?.email || "");
        // Add to user appointments list
        await loadAppointments(user.uid);
      } else {
        console.error("Appointment scheduling failed:", result.error);
        toastError({
          toast,
          title: "Scheduling failed",
          description: result.error || "Failed to schedule appointment",
        });
      }
    } catch (error) {
      console.error("Appointment scheduling error:", error);
      toastError({
        toast,
        title: "Scheduling failed",
        description: "Failed to schedule appointment",
        error,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!user?.uid) {
      toastWarning({
        toast,
        title: "Authentication required",
        description: "You must be logged in to cancel appointments",
      });
      return;
    }

    setCancelLoading(appointmentId);
    try {
      const result = await updateAppointmentStatusAction(
        appointmentId,
        "cancelled"
      );
      if (result.success) {
        toastSuccess({
          toast,
          description: "Appointment cancelled successfully",
        });
        await loadAppointments(user.uid);
      } else {
        toastError({
          toast,
          title: "Cancellation failed",
          description: result.error || "Failed to cancel appointment",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toastError({
        toast,
        title: "Cancellation failed",
        description: "Failed to cancel appointment",
        error,
      });
    } finally {
      setCancelLoading(null);
    }
  };

  const handleOpenReschedule = (appointment: UserAppointment) => {
    setSelectedAppointment(appointment);
    // Parse existing date and time
    const existingDate = new Date(appointment.date);
    setRescheduleDate(existingDate);
    setRescheduleTime(appointment.time);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleAppointment = async () => {
    if (!user?.uid || !selectedAppointment) {
      toastWarning({
        toast,
        title: "Authentication required",
        description: "You must be logged in to reschedule appointments",
      });
      return;
    }

    if (!rescheduleDate || !rescheduleTime) {
      toastWarning({
        toast,
        title: "Missing information",
        description: "Please select both date and time",
      });
      return;
    }

    // Validate date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(rescheduleDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toastWarning({
        toast,
        title: "Invalid date",
        description: "Please select a future date",
      });
      return;
    }

    setRescheduleLoading(true);
    try {
      const result = await updateAppointmentAction({
        id: selectedAppointment.id,
        date: format(rescheduleDate, "yyyy-MM-dd"),
        time: rescheduleTime,
        status: "pending",
      });
      if (result.success) {
        toastSuccess({
          toast,
          description: "Appointment rescheduled successfully",
        });
        setRescheduleDialogOpen(false);
        setSelectedAppointment(null);
        setRescheduleDate(undefined);
        setRescheduleTime("");
        await loadAppointments(user.uid);
      } else {
        toastError({
          toast,
          title: "Reschedule failed",
          description: result.error || "Failed to reschedule appointment",
        });
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toastError({
        toast,
        title: "Reschedule failed",
        description: "Failed to reschedule appointment",
        error,
      });
    } finally {
      setRescheduleLoading(false);
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

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("appointments.title") || "Appointments"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("appointments.description") ||
            "Schedule and manage your appointments with barangay officials"}
        </p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="schedule">
            {t("appointments.schedule") || "Schedule"}
          </TabsTrigger>
          <TabsTrigger value="manage">
            {t("appointments.manage") || "Manage"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("appointments.newAppointment") || "New Appointment"}
              </CardTitle>
              <CardDescription>
                {t("appointments.chooseService") ||
                  "Choose a service and schedule your appointment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name *
                    {userProfile &&
                      (userProfile.firstName || userProfile.lastName) && (
                        <span className="text-xs text-green-600 ml-1">
                          (auto-filled)
                        </span>
                      )}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={
                      userProfile &&
                      (userProfile.firstName || userProfile.lastName)
                        ? "border-green-200 bg-green-50"
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">
                    Contact Number *
                    {userProfile?.phoneNumber && (
                      <span className="text-xs text-green-600 ml-1">
                        (auto-filled)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className={
                      userProfile?.phoneNumber
                        ? "border-green-200 bg-green-50"
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address *
                  {userProfile?.email && (
                    <span className="text-xs text-green-600 ml-1">
                      (auto-filled)
                    </span>
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={
                    userProfile?.email ? "border-green-200 bg-green-50" : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">
                  {t("appointments.serviceType") || "Service Type"}
                </Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barangay Captain Consultation">
                      Barangay Captain Consultation
                    </SelectItem>
                    <SelectItem value="Dispute Resolution">
                      Dispute Resolution
                    </SelectItem>
                    <SelectItem value="Business Permit Assistance">
                      Business Permit Assistance
                    </SelectItem>
                    <SelectItem value="Social Welfare Assistance">
                      Social Welfare Assistance
                    </SelectItem>
                    <SelectItem value="Other Services">
                      Other Services
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("appointments.date") || "Date"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    {t("appointments.time") || "Time"}
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">
                  {t("appointments.purpose") || "Purpose"}
                </Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Please describe the purpose of your appointment"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleScheduleAppointment}
                disabled={
                  loading ||
                  !user ||
                  !userProfile ||
                  !date ||
                  !time ||
                  !serviceType ||
                  !purpose ||
                  !name ||
                  !contactNumber ||
                  !email
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  t("appointments.scheduleButton") || "Schedule Appointment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          {!user?.uid ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("appointments.yourAppointments") || "Your Appointments"}
                </CardTitle>
                <CardDescription>
                  Please sign in to view your upcoming appointments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log in to see, reschedule, or cancel your appointments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("appointments.yourAppointments") || "Your Appointments"}
                </CardTitle>
                <CardDescription>
                  {t("appointments.viewManage") ||
                    "View and manage your scheduled appointments"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading appointments...
                    </div>
                  ) : userAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments found
                    </div>
                  ) : (
                    userAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`rounded-lg border p-4 ${
                          appointment.status === "cancelled" ? "opacity-75" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <Users className="mr-2 h-5 w-5 text-primary" />
                              <h3 className="font-medium">
                                {appointment.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(appointment.date)} at{" "}
                              {appointment.time}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm">
                            {t("certificates.reference") || "Reference"}:{" "}
                            {appointment.id}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("appointments.purpose") || "Purpose"}:{" "}
                            {appointment.description}
                          </p>
                          {appointment.status !== "cancelled" &&
                            appointment.status !== "completed" && (
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenReschedule(appointment)
                                  }
                                  disabled={cancelLoading === appointment.id}
                                >
                                  {t("appointments.reschedule") || "Reschedule"}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={
                                        cancelLoading === appointment.id
                                      }
                                    >
                                      {cancelLoading === appointment.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Cancelling...
                                        </>
                                      ) : (
                                        t("appointments.cancel") || "Cancel"
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Cancel Appointment
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel this
                                        appointment? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        No, keep it
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleCancelAppointment(
                                            appointment.id
                                          )
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={
                                          cancelLoading === appointment.id
                                        }
                                      >
                                        Yes, cancel appointment
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t("appointments.reschedule") || "Reschedule Appointment"}
            </DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("appointments.date") || "Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleDate ? (
                        format(rescheduleDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-time">
                  {t("appointments.time") || "Time"}
                </Label>
                <Select
                  value={rescheduleTime}
                  onValueChange={setRescheduleTime}
                >
                  <SelectTrigger id="reschedule-time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleDialogOpen(false);
                setSelectedAppointment(null);
                setRescheduleDate(undefined);
                setRescheduleTime("");
              }}
              disabled={rescheduleLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleAppointment}
              disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime}
            >
              {rescheduleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                t("appointments.reschedule") || "Reschedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

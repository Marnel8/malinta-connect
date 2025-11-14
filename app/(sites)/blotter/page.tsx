"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
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
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  getBlotterEntriesForUserAction,
  createBlotterEntryAction,
  type BlotterEntry,
  type CreateBlotterData,
} from "@/app/actions/blotter";
import { uploadBlotterProofImageAction } from "@/app/actions/uploads";
import { Image as ImageIcon, X } from "lucide-react";

export default function BlotterPage() {
  const { t } = useLanguage();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State management
  const [blotterEntries, setBlotterEntries] = useState<BlotterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<BlotterEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Image upload state
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(
    null
  );
  const [proofImageUploading, setProofImageUploading] = useState(false);

  // Form state for new report - auto-populate with user data
  const [newReportForm, setNewReportForm] = useState<CreateBlotterData>({
    type: "",
    description: "",
    reportedBy: userProfile
      ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
        "Unknown"
      : "",
    contactNumber: userProfile?.phoneNumber || "",
    email: userProfile?.email || "",
    priority: "medium",
    location: userProfile?.address || "",
    incidentDate: "",
    incidentDateTime: "",
    age: undefined,
    proofImageUrl: undefined,
    notes: "",
  });

  const filteredEntries = useMemo(() => {
    let entries = [...blotterEntries];

    if (statusFilter !== "all") {
      entries = entries.filter((entry) => entry.status === statusFilter);
    }

    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery) {
      entries = entries.filter((entry) => {
        return (
          entry.type?.toLowerCase().includes(trimmedQuery) ||
          entry.description?.toLowerCase().includes(trimmedQuery) ||
          entry.reportedBy?.toLowerCase().includes(trimmedQuery) ||
          entry.location?.toLowerCase().includes(trimmedQuery) ||
          entry.referenceNumber?.toLowerCase().includes(trimmedQuery)
        );
      });
    }

    return entries;
  }, [blotterEntries, statusFilter, searchQuery]);

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setNewReportForm((prev) => ({
        ...prev,
        reportedBy:
          `${userProfile.firstName || ""} ${
            userProfile.lastName || ""
          }`.trim() ||
          userProfile.email ||
          "Unknown",
        contactNumber: userProfile.phoneNumber || prev.contactNumber,
        email: userProfile.email || prev.email,
        location: userProfile.address || prev.location,
      }));
    }
  }, [userProfile]);

  // Handle proof image upload
  const handleProofImageUpload = async (file: File) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setProofImagePreview(dataUrl);
      setProofImageUploading(true);
      try {
        const res = await uploadBlotterProofImageAction(dataUrl);
        if (res.success && res.url) {
          setNewReportForm((prev) => ({
            ...prev,
            proofImageUrl: res.url,
          }));
          toast({
            title: "Image uploaded successfully",
            description: "Proof image has been uploaded",
          });
        } else {
          console.error("Image upload failed:", res.error);
          toast({
            title: "Upload failed",
            description: res.error || "Failed to upload image",
            variant: "destructive",
          });
          setProofImagePreview(null);
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive",
        });
        setProofImagePreview(null);
      } finally {
        setProofImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove proof image
  const handleRemoveProofImage = () => {
    setProofImagePreview(null);
    setNewReportForm((prev) => ({
      ...prev,
      proofImageUrl: undefined,
    }));
  };

  // Load blotter entries when user changes
  useEffect(() => {
    if (!user?.uid) {
      setBlotterEntries([]);
      setLoading(false);
      return;
    }
    loadBlotterEntries(user.uid);
  }, [user?.uid]);

  const loadBlotterEntries = async (uid: string) => {
    setLoading(true);
    try {
      const result = await getBlotterEntriesForUserAction(uid);
      if (result.success && result.entries) {
        setBlotterEntries(result.entries);
      } else {
        console.error("Failed to load blotter entries:", result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load blotter entries",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading blotter entries:", error);
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
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // Handle new report submission
  const handleNewReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user || !userProfile) {
      console.error("Blotter report failed: User not authenticated");
      toast({
        title: "Authentication Required",
        description: "Please log in to file a blotter report",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createBlotterEntryAction({
          userId: user.uid,
          ...newReportForm,
        });
        if (result.success) {
          console.log(
            "Blotter report created successfully with ID:",
            result.entryId
          );
          toast({
            title: "Success",
            description: `New blotter report created with ID: ${result.entryId}`,
          });
          // Reset form but keep user info
          setNewReportForm({
            type: "",
            description: "",
            reportedBy: userProfile
              ? `${userProfile.firstName || ""} ${
                  userProfile.lastName || ""
                }`.trim() ||
                userProfile.email ||
                "Unknown"
              : "",
            contactNumber: userProfile?.phoneNumber || "",
            email: userProfile?.email || "",
            priority: "medium",
            location: userProfile?.address || "",
            incidentDate: "",
            incidentDateTime: "",
            age: undefined,
            proofImageUrl: undefined,
            notes: "",
          });
          setProofImagePreview(null);
          await loadBlotterEntries(user.uid);
        } else {
          console.error("Failed to create blotter report:", result.error);
          toast({
            title: "Error",
            description: result.error || "Failed to create blotter report",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating blotter report:", error);
        toast({
          title: "Error",
          description: "Failed to create blotter report",
          variant: "destructive",
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
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
      case "readyForAppointment":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            Ready to Set Appointment
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
      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("blotter.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("blotter.description")}</p>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="file">{t("blotter.file")}</TabsTrigger>
          <TabsTrigger value="track">{t("blotter.track")}</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>{t("blotter.newReport")}</CardTitle>
              <CardDescription>{t("blotter.provideDetails")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleNewReportSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">
                    {t("blotter.incidentType")} *
                  </Label>
                  <Select
                    value={newReportForm.type}
                    onValueChange={(value) =>
                      setNewReportForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger id="incident-type">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Theft/Robbery">
                        Theft/Robbery
                      </SelectItem>
                      <SelectItem value="Noise Complaint">
                        Noise/Public Disturbance
                      </SelectItem>
                      <SelectItem value="Property Damage">
                        Property Damage
                      </SelectItem>
                      <SelectItem value="Neighbor Dispute">
                        Neighbor Dispute
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="incident-datetime">
                      {t("blotter.incidentDate")} & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      id="incident-datetime"
                      value={newReportForm.incidentDateTime || ""}
                      onChange={(e) =>
                        setNewReportForm((prev) => ({
                          ...prev,
                          incidentDateTime: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
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
                      <SelectTrigger id="priority">
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

                <div className="space-y-2">
                  <Label htmlFor="incident-location">
                    {t("blotter.incidentLocation")}
                    {userProfile?.address && (
                      <span className="text-xs text-green-600 ml-1">
                        (auto-filled with your address)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="incident-location"
                    value={newReportForm.location}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Enter the location where the incident occurred"
                    className={
                      userProfile?.address ? "border-green-200 bg-green-50" : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-description">
                    {t("blotter.incidentDescription")} *
                  </Label>
                  <Textarea
                    id="incident-description"
                    value={newReportForm.description}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Please provide a detailed description of what happened"
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reported-by">
                      Your Name *
                      {userProfile &&
                        (userProfile.firstName || userProfile.lastName) && (
                          <span className="text-xs text-green-600 ml-1">
                            (auto-filled)
                          </span>
                        )}
                    </Label>
                    <Input
                      id="reported-by"
                      value={newReportForm.reportedBy}
                      onChange={(e) =>
                        setNewReportForm((prev) => ({
                          ...prev,
                          reportedBy: e.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      className={
                        userProfile &&
                        (userProfile.firstName || userProfile.lastName)
                          ? "border-green-200 bg-green-50"
                          : ""
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-number">
                      Contact Number *
                      {userProfile?.phoneNumber && (
                        <span className="text-xs text-green-600 ml-1">
                          (auto-filled)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="contact-number"
                      value={newReportForm.contactNumber}
                      onChange={(e) =>
                        setNewReportForm((prev) => ({
                          ...prev,
                          contactNumber: e.target.value,
                        }))
                      }
                      placeholder="Your phone number"
                      className={
                        userProfile?.phoneNumber
                          ? "border-green-200 bg-green-50"
                          : ""
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={newReportForm.email}
                      onChange={(e) =>
                        setNewReportForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Your email address"
                      className={
                        userProfile?.email ? "border-green-200 bg-green-50" : ""
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      type="number"
                      id="age"
                      min="1"
                      max="120"
                      value={newReportForm.age || ""}
                      onChange={(e) =>
                        setNewReportForm((prev) => ({
                          ...prev,
                          age: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        }))
                      }
                      placeholder="Enter age"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof-image">Proof Image (Optional)</Label>
                  {proofImagePreview ? (
                    <div className="relative">
                      <img
                        src={proofImagePreview}
                        alt="Proof preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveProofImage}
                        disabled={proofImageUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload proof image (JPG, PNG, WebP)
                      </p>
                      <Input
                        id="proof-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProofImageUpload(file);
                          }
                        }}
                        disabled={proofImageUploading}
                        className="cursor-pointer"
                      />
                      {proofImageUploading && (
                        <div className="mt-2 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Uploading...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-notes">Additional Notes</Label>
                  <Textarea
                    id="additional-notes"
                    value={newReportForm.notes}
                    onChange={(e) =>
                      setNewReportForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any additional information or notes"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending || !user || !userProfile}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    t("blotter.submitReport")
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="track">
          {!user?.uid ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("blotter.yourReports")}</CardTitle>
                <CardDescription>
                  Please sign in to view your blotter reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You need an authenticated account to track existing cases.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("blotter.yourReports")}</CardTitle>
                <CardDescription>{t("blotter.trackStatus")}</CardDescription>
              </CardHeader>
              <CardContent>
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
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">
                        Under Investigation
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="additionalInfo">Needs Info</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Loading your reports...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No reports found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "File your first blotter report to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                              <h3 className="font-medium">{entry.type}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Filed on: {entry.date}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {getStatusBadge(entry.status)}
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm">
                            {t("certificates.reference")}:{" "}
                            {entry.referenceNumber}
                          </p>
                          {entry.location && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("blotter.incidentLocation")}: {entry.location}
                            </p>
                          )}
                          {entry.status === "additionalInfo" && entry.notes && (
                            <p className="text-sm text-red-600 mt-2">
                              {entry.notes}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            {t("blotter.viewDetails")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
                    Incident Date & Time
                  </Label>
                  <p>
                    {selectedEntry.incidentDateTime
                      ? new Date(selectedEntry.incidentDateTime).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : selectedEntry.incidentDate || "Not specified"}
                  </p>
                </div>
              </div>

              {selectedEntry.age && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Age
                  </Label>
                  <p>{selectedEntry.age} years old</p>
                </div>
              )}

              {selectedEntry.proofImageUrl && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Proof Image
                  </Label>
                  <div className="mt-2">
                    <a
                      href={selectedEntry.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedEntry.proofImageUrl}
                        alt="Proof image"
                        className="w-full max-w-md h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click image to view full size
                    </p>
                  </div>
                </div>
              )}

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
    </div>
  );
}

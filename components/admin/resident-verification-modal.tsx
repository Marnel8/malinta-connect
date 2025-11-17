"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  IdCard,
  Camera
} from "lucide-react";
import { ResidentData } from "@/app/actions/residents";
import { updateResidentVerificationAction } from "@/app/actions/residents";
import { useToast } from "@/hooks/use-toast";
import { toastError, toastSuccess } from "@/lib/toast-presets";

interface ResidentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: ResidentData | null;
  onVerificationUpdate: () => void;
}

export function ResidentVerificationModal({
  isOpen,
  onClose,
  resident,
  onVerificationUpdate,
}: ResidentVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [imageViewer, setImageViewer] = useState<{
    isOpen: boolean;
    src: string;
    title: string;
  }>({
    isOpen: false,
    src: "",
    title: "",
  });
  const { toast } = useToast();

  if (!resident) return null;

  const handleVerification = async (status: "verified" | "rejected") => {
    setIsLoading(true);

    try {
      const result = await updateResidentVerificationAction(
        resident.uid,
        status,
        notes.trim() || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update verification");
      }

      toastSuccess({
        toast,
        title: "Verification updated",
        description: `Resident has been ${status}.`,
      });

      onVerificationUpdate();
      onClose();
      setNotes("");
    } catch (error: any) {
      console.error("Verification error:", error);
      toastError({
        toast,
        title: "Verification failed",
        description:
          error?.message || "Failed to update verification status.",
        error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openImageViewer = (src: string, title: string) => {
    setImageViewer({
      isOpen: true,
      src,
      title,
    });
  };

  const closeImageViewer = () => {
    setImageViewer((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Resident Verification
          </DialogTitle>
          <DialogDescription>
            Review and verify resident information and documents
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <p className="text-sm">
                    {`${resident.personalInfo.firstName} ${
                      resident.personalInfo.middleName
                        ? resident.personalInfo.middleName + " "
                        : ""
                    }${resident.personalInfo.lastName}${
                      resident.personalInfo.suffix
                        ? " " + resident.personalInfo.suffix
                        : ""
                    }`}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </Label>
                    <p className="text-sm">{resident.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </Label>
                    <p className="text-sm capitalize">{resident.personalInfo.gender}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Place of Birth
                  </Label>
                  <p className="text-sm">{resident.personalInfo.placeOfBirth}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Civil Status
                  </Label>
                  <p className="text-sm capitalize">{resident.personalInfo.civilStatus}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{resident.contactInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{resident.contactInfo.phoneNumber}</span>
                </div>
                {resident.contactInfo.alternateNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{resident.contactInfo.alternateNumber}</span>
                    <Badge variant="outline" className="text-xs">Alternate</Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Address Information</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{resident.addressInfo.fullAddress}</span>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Name
                  </Label>
                  <p className="text-sm">{resident.emergencyContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </Label>
                  <p className="text-sm">{resident.emergencyContact.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Relationship
                  </Label>
                  <p className="text-sm">{resident.emergencyContact.relation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Valid ID - Front</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openImageViewer(
                          resident.verification.idFrontPhotoUrl,
                          "Valid ID - Front"
                        )
                      }
                    >
                      View full
                    </Button>
                  </div>
                  <div className="border rounded-lg p-2 bg-muted/30">
                    <img
                      src={resident.verification.idFrontPhotoUrl}
                      alt="ID Front Photo"
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Valid ID - Back</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openImageViewer(
                          resident.verification.idBackPhotoUrl,
                          "Valid ID - Back"
                        )
                      }
                    >
                      View full
                    </Button>
                  </div>
                  <div className="border rounded-lg p-2 bg-muted/30">
                    <img
                      src={resident.verification.idBackPhotoUrl}
                      alt="ID Back Photo"
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Selfie Photo</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openImageViewer(
                          resident.verification.selfiePhotoUrl,
                          "Selfie Photo"
                        )
                      }
                    >
                      View full
                    </Button>
                  </div>
                  <div className="border rounded-lg p-2 bg-muted/30">
                    <img
                      src={resident.verification.selfiePhotoUrl}
                      alt="Selfie Photo"
                      className="w-full h-48 object-contain rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Verification Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Submitted: {formatDate(resident.verification.submittedAt)}
                  </span>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </Label>
                  <div className="mt-1">
                    {resident.verification.status === "pending" && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending Review
                      </Badge>
                    )}
                    {resident.verification.status === "verified" && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                    {resident.verification.status === "rejected" && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>

                {resident.verification.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Reviewed: {formatDate(resident.verification.reviewedAt)}
                    </span>
                  </div>
                )}

                {resident.verification.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Review Notes
                    </Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">
                      {resident.verification.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            {resident.verification.status === "pending" && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Review Action</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">
                        Review Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about the verification..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVerification("verified")}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Verify
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={() => handleVerification("rejected")}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
      </Dialog>

      <Dialog open={imageViewer.isOpen} onOpenChange={(open) => (!open ? closeImageViewer() : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{imageViewer.title}</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            {imageViewer.src ? (
              <img
                src={imageViewer.src}
                alt={imageViewer.title}
                className="w-full h-[500px] object-contain rounded"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No image available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

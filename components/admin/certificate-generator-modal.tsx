"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  toastError,
  toastSuccess,
  toastWarning,
} from "@/lib/toast-presets";
import { Loader2, FileText } from "lucide-react";
import {
  type Certificate,
} from "@/app/actions/certificates";
import {
  buildPrintableCertificateHtml,
  openCertificatePrintWindow,
  type CertificateData,
  type OfficialInfo,
} from "@/lib/certificate-pdf-generator";
import { getCertificateTemplateConfig } from "@/lib/certificate-templates";
import { Switch } from "@/components/ui/switch";
import { getSettings } from "@/app/actions/settings";

interface CertificateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate;
  onCertificateUpdated: () => void;
}

export function CertificateGeneratorModal({
  isOpen,
  onClose,
  certificate,
  onCertificateUpdated,
}: CertificateGeneratorModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [certificateReady, setCertificateReady] = useState(false);
  const [settingsSignatureUrl, setSettingsSignatureUrl] = useState<string | undefined>(undefined);
  const [officialInfo, setOfficialInfo] = useState<OfficialInfo>({
    name: "HON. JESUS H. DE UNA JR.",
    position: "Punong Barangay",
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Load certificate settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCertificateSettings();
      setCertificateReady(false);
    }
  }, [isOpen]);

  const loadCertificateSettings = async () => {
    try {
      setLoadingSettings(true);
      const settings = await getSettings();
      if (settings?.certificateSettings) {
        const certSettings = settings.certificateSettings;
        setSettingsSignatureUrl(certSettings.signatureUrl);
        setOfficialInfo({
          name: certSettings.officialName,
          position: certSettings.officialPosition,
        });
        // Auto-enable signature if available in settings
        setIncludeSignature(!!certSettings.signatureUrl);
      }
    } catch (error) {
      console.error("Error loading certificate settings:", error);
      toastWarning({
        toast,
        title: "Using default settings",
        description: "Could not load certificate settings. Using defaults.",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const certificateData: CertificateData = {
    id: certificate.id,
    type: certificate.type,
    requestedBy: certificate.requestedBy,
    purpose: certificate.purpose,
    generatedOn:
      certificate.generatedOn ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    age: certificate.age,
    address: certificate.address,
    occupation: certificate.occupation,
    income: certificate.income,
    incomeYear: certificate.incomeYear,
    jobTitle: certificate.jobTitle,
    employmentPeriod: certificate.employmentPeriod,
    businessName: certificate.businessName,
    businessLocation: certificate.businessLocation,
    closureDate: certificate.closureDate,
    closureReason: certificate.closureReason,
    relationship: certificate.relationship,
    nonResidenceDuration: certificate.nonResidenceDuration,
    supportDetails: certificate.supportDetails,
    allowanceAmount: certificate.allowanceAmount,
    signatureUrl: includeSignature ? settingsSignatureUrl : undefined,
    hasSignature: includeSignature && !!settingsSignatureUrl,
    photoUrl: certificate.photoUrl,
  };

  // Debug: Log photoUrl to console
  useEffect(() => {
    if (isOpen && certificate.photoUrl) {
      console.log("Certificate photoUrl:", certificate.photoUrl);
      console.log("Certificate type:", certificate.type);
    }
  }, [isOpen, certificate.photoUrl, certificate.type]);

  const templateConfig = getCertificateTemplateConfig(certificate.type || "");
  const certificateTypeLabel =
    templateConfig.previewDescription || certificate.type || "Certificate";

  const handleGenerateCertificate = () => {
    setIsGenerating(true);
    try {
      // Generate HTML for printing
      const html = buildPrintableCertificateHtml(certificateData, officialInfo);

      // Mark as ready
      setCertificateReady(true);

      toastSuccess({
        toast,
        description:
          "Certificate ready for printing. Click Print Certificate to open the print dialog.",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      toastError({
        toast,
        title: "Generation failed",
        error,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!certificateReady) {
      toastWarning({
        toast,
        title: "Generate first",
        description: "Please generate the certificate before printing.",
      });
      return;
    }

    try {
      // Generate HTML and open print window
      const html = buildPrintableCertificateHtml(certificateData, officialInfo);
      openCertificatePrintWindow(html);
    } catch (error) {
      console.error("Error printing certificate:", error);
      toastError({
        toast,
        title: "Print failed",
        error,
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
          <DialogDescription>
            Generate {certificateTypeLabel} for {certificate.requestedBy}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Certificate Info */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label className="text-sm font-medium">Reference No.</Label>
              <p className="text-sm text-muted-foreground">{certificate.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm text-muted-foreground">
                {certificate.type}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested By</Label>
              <p className="text-sm text-muted-foreground">
                {certificate.requestedBy}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Purpose</Label>
              <p className="text-sm text-muted-foreground">
                {certificate.purpose}
              </p>
            </div>
            {certificate.photoUrl && (
              <div className="col-span-2">
                <Label className="text-sm font-medium">1x1 Photo</Label>
                <div className="mt-2">
                  <img
                    src={certificate.photoUrl}
                    alt="Certificate photo"
                    className="w-24 h-24 rounded border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Photo will be included in the certificate
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Signature Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="include-signature"
                className="text-sm font-medium"
              >
                Include Official Signature
              </Label>
              <Switch
                id="include-signature"
                checked={includeSignature}
                onCheckedChange={setIncludeSignature}
                disabled={!settingsSignatureUrl || loadingSettings}
              />
            </div>

            {loadingSettings && (
              <div className="flex items-center text-sm text-muted-foreground p-4 border rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading signature settings...
              </div>
            )}

            {!loadingSettings && includeSignature && settingsSignatureUrl && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">
                    Signature from Settings
                  </Label>
                  <div className="mt-2">
                    <img
                      src={settingsSignatureUrl}
                      alt="Official signature"
                      className="max-h-20 border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This signature is configured in Settings. You can update it in Admin → Settings → Certificates.
                  </p>
                </div>
              </div>
            )}

            {!loadingSettings && includeSignature && !settingsSignatureUrl && (
              <div className="p-4 border rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  No signature configured. Please upload a signature in Admin → Settings → Certificates.
                </p>
              </div>
            )}
          </div>

          {/* Official Info */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <Label className="text-sm font-medium">Signing Official</Label>
            <div className="mt-2">
              <p className="text-sm font-semibold">{officialInfo.name}</p>
              <p className="text-xs text-muted-foreground">
                {officialInfo.position}
              </p>
            </div>
          </div>

          {/* Certificate Ready Actions */}
          {certificateReady && (
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold">Certificate Ready</h3>
                <p className="text-xs text-muted-foreground">
                  The certificate has been generated successfully. Click Print
                  Certificate to open the print dialog.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Certificate
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerateCertificate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Certificate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Upload,
  X,
  Check,
  User,
  IdCard,
  CameraIcon,
  Loader2,
  Eye,
  EyeOff,
  FlipHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { registerResidentAction } from "@/app/actions/auth";
import { uploadResidentImagesAction } from "@/app/actions/uploads";
import Link from "next/link";
import Image from "next/image";

// Form validation schema
const registrationSchema = z
  .object({
    // Personal Information
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    middleName: z.string(),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    suffix: z.string(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    placeOfBirth: z.string().min(2, "Place of birth is required"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select your gender",
    }),
    civilStatus: z.enum(
      ["single", "married", "widowed", "divorced", "separated"],
      {
        required_error: "Please select your civil status",
      }
    ),

    // Contact Information
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    alternateNumber: z.string(),

    // Address Information
    houseNumber: z.string().min(1, "House number is required"),
    street: z.string().min(2, "Street is required"),
    purok: z.string().min(1, "Purok is required"),
    barangay: z.string().default("Malinta"),
    city: z.string().default("Los Baños"),
    province: z.string().default("Laguna"),
    zipCode: z.string().default("4030"),

    // Emergency Contact
    emergencyContactName: z
      .string()
      .min(2, "Emergency contact name is required"),
    emergencyContactNumber: z
      .string()
      .min(10, "Emergency contact number is required"),
    emergencyContactRelation: z.string().min(2, "Relationship is required"),

    // Account Information
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    // Terms and Conditions
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationData = z.infer<typeof registrationSchema>;

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title: string;
  description: string;
}

function CameraModal({
  isOpen,
  onClose,
  onCapture,
  title,
  description,
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const startCamera = useCallback(
    async (mode?: "user" | "environment") => {
      const desiredMode = mode ?? facingMode;

      try {
        setError(null);
        setIsCameraLoading(true);
        setIsStreaming(false);

        // Stop any active stream before starting a new one
        if (videoRef.current?.srcObject) {
          const activeStream = videoRef.current.srcObject as MediaStream;
          activeStream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode:
              desiredMode === "environment"
                ? { ideal: "environment" }
                : { ideal: "user" },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setFacingMode(desiredMode);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to access camera. Please check permissions.");
      } finally {
        setIsCameraLoading(false);
      }
    },
    [facingMode]
  );

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const handleSwitchCamera = useCallback(() => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startCamera(nextMode);
  }, [facingMode, startCamera]);

  const switchToBackCamera = useCallback(() => {
    if (facingMode !== "environment") {
      startCamera("environment");
    }
  }, [facingMode, startCamera]);

  const switchToFrontCamera = useCallback(() => {
    if (facingMode !== "user") {
      startCamera("user");
    }
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(dataUrl);
        stopCamera();
        onClose();
      }
    }
  }, [onCapture, onClose, stopCamera]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Unsupported file type. Please select an image.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result as string;
        // Downscale/compress large images from disk to avoid oversized payloads
        const img = document.createElement("img");
        img.onload = () => {
          try {
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let targetWidth = img.width;
            let targetHeight = img.height;

            // Maintain aspect ratio while constraining to max bounds
            if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
              const widthRatio = MAX_WIDTH / targetWidth;
              const heightRatio = MAX_HEIGHT / targetHeight;
              const scale = Math.min(widthRatio, heightRatio);
              targetWidth = Math.round(targetWidth * scale);
              targetHeight = Math.round(targetHeight * scale);
            }

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get canvas context");
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Export as JPEG with quality to keep size reasonable
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            onCapture(compressedDataUrl || originalDataUrl);
            onClose();
          } catch (err) {
            // Fallback to original if compression fails
            onCapture(originalDataUrl);
            onClose();
          }
        };
        img.onerror = () => {
          setError("Failed to read image. Please try a different file.");
        };
        img.src = originalDataUrl;
      };
      reader.readAsDataURL(file);
    },
    [onCapture, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        isMobile ? "p-0" : "p-4"
      }`}
    >
      <Card
        className={`w-full ${
          isMobile ? "max-w-full h-full rounded-none" : "max-w-md"
        }`}
      >
        <CardHeader className={`pb-4 ${isMobile ? "px-4 pt-6" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className={`${isMobile ? "text-xl" : "text-lg"}`}>
                {title}
              </CardTitle>
              <CardDescription className={`text-sm ${isMobile ? "mt-1" : ""}`}>
                {description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className={isMobile ? "ml-2" : ""}
            >
              <X className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? "px-4 pb-6" : ""}`}>
          {error ? (
            <div className="text-center text-red-600 text-sm py-4">{error}</div>
          ) : (
            <>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedData={() => setIsStreaming(true)}
                />
                <canvas ref={canvasRef} className="hidden" />
                {isStreaming && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {facingMode === "user" ? "Front Camera" : "Back Camera"}
                  </div>
                )}
              </div>

              {isMobile ? (
                <div className="space-y-3">
                  {!isStreaming ? (
                    <Button
                      onClick={() => startCamera()}
                      className="w-full h-12 text-base"
                      disabled={isCameraLoading}
                      size="lg"
                    >
                      {isCameraLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-5 w-5" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={capturePhoto}
                        className="w-full h-12 text-base"
                        disabled={isCameraLoading}
                        size="lg"
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Capture Photo
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={
                            facingMode === "user" ? "default" : "outline"
                          }
                          onClick={switchToFrontCamera}
                          disabled={isCameraLoading || facingMode === "user"}
                          className="h-12"
                        >
                          {isCameraLoading && facingMode !== "user" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <User className="mr-2 h-5 w-5" />
                              Front
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant={
                            facingMode === "environment" ? "default" : "outline"
                          }
                          onClick={switchToBackCamera}
                          disabled={
                            isCameraLoading || facingMode === "environment"
                          }
                          className="h-12"
                        >
                          {isCameraLoading && facingMode !== "environment" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <FlipHorizontal className="mr-2 h-5 w-5" />
                              Back
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload from Gallery
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {!isStreaming ? (
                    <Button
                      onClick={() => startCamera()}
                      className="flex-1"
                      disabled={isCameraLoading}
                    >
                      {isCameraLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={capturePhoto}
                      className="flex-1"
                      disabled={isCameraLoading}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Photo
                    </Button>
                  )}

                  {isStreaming && (
                    <>
                      <Button
                        type="button"
                        variant={facingMode === "user" ? "default" : "outline"}
                        onClick={switchToFrontCamera}
                        disabled={isCameraLoading || facingMode === "user"}
                        title="Switch to Front Camera"
                      >
                        {isCameraLoading && facingMode !== "user" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          facingMode === "environment" ? "default" : "outline"
                        }
                        onClick={switchToBackCamera}
                        disabled={
                          isCameraLoading || facingMode === "environment"
                        }
                        title="Switch to Back Camera"
                      >
                        {isCameraLoading && facingMode !== "environment" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FlipHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" title="Upload from Gallery">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idFrontPhoto, setIdFrontPhoto] = useState<string | null>(null);
  const [idBackPhoto, setIdBackPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean;
    type: "id-front" | "id-back" | "selfie" | null;
  }>({ isOpen: false, type: null });

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema) as any,
    defaultValues: {
      // Personal Information
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      dateOfBirth: "",
      placeOfBirth: "",
      gender: undefined as any,
      civilStatus: undefined as any,

      // Contact Information
      email: "",
      phoneNumber: "",
      alternateNumber: "",

      // Address Information
      houseNumber: "",
      street: "",
      purok: "",
      barangay: "Malinta",
      city: "Los Baños",
      province: "Laguna",
      zipCode: "4030",

      // Emergency Contact
      emergencyContactName: "",
      emergencyContactNumber: "",
      emergencyContactRelation: "",

      // Account Information
      password: "",
      confirmPassword: "",

      // Terms and Conditions
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      // Debug logging
      console.log("=== NEXT STEP ===");
      console.log("Current Step:", currentStep);
      console.log("Form Values:", form.getValues());
      console.log("firstName value:", form.getValues("firstName"));
      console.log("email value:", form.getValues("email"));

      // Special validation for photo step
      if (currentStep === 4) {
        if (!idFrontPhoto || !idBackPhoto || !selfiePhoto) {
          toast({
            title: "Photo Verification Required",
            description:
              "Please provide front & back ID photos plus a selfie before proceeding to account setup.",
            variant: "destructive",
          });
          return;
        }
      }

      // Validate current step before proceeding
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await form.trigger(fieldsToValidate);

      if (!isValid) {
        const errors = form.formState.errors;
        const stepErrors: string[] = [];

        for (const field of fieldsToValidate) {
          const error = errors[field];
          if (error && error.message) {
            stepErrors.push(error.message);
          }
        }

        const errorMessage =
          stepErrors.length > 0
            ? stepErrors[0]
            : "Please complete all required fields before proceeding.";

        toast({
          title: "Incomplete Information",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof RegistrationData)[] => {
    switch (step) {
      case 1:
        return [
          "firstName",
          "lastName",
          "dateOfBirth",
          "placeOfBirth",
          "gender",
          "civilStatus",
        ];
      case 2:
        return ["email", "phoneNumber"];
      case 3:
        return [
          "houseNumber",
          "street",
          "purok",
          "emergencyContactName",
          "emergencyContactNumber",
          "emergencyContactRelation",
        ];
      case 4:
        return []; // Photo step - handled separately
      case 5:
        return ["password", "confirmPassword", "agreeToTerms"];
      default:
        return [];
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Debug logging
      console.log("=== PREV STEP ===");
      console.log("Current Step:", currentStep);
      console.log("Form Values:", form.getValues());
      console.log("firstName value:", form.getValues("firstName"));
      console.log("email value:", form.getValues("email"));

      setCurrentStep(currentStep - 1);
    }
  };

  const openCameraModal = (type: "id-front" | "id-back" | "selfie") => {
    setCameraModal({ isOpen: true, type });
  };

  const closeCameraModal = () => {
    setCameraModal({ isOpen: false, type: null });
  };

  const handlePhotoCapture = (dataUrl: string) => {
    if (cameraModal.type === "id-front") {
      setIdFrontPhoto(dataUrl);
    } else if (cameraModal.type === "id-back") {
      setIdBackPhoto(dataUrl);
    } else if (cameraModal.type === "selfie") {
      setSelfiePhoto(dataUrl);
    }
  };

  const removePhoto = (type: "id-front" | "id-back" | "selfie") => {
    if (type === "id-front") {
      setIdFrontPhoto(null);
    } else if (type === "id-back") {
      setIdBackPhoto(null);
    } else {
      setSelfiePhoto(null);
    }
  };

  const onSubmit = async (data: RegistrationData) => {
    // Check for validation errors first
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      const firstError = Object.values(errors)[0];
      const errorMessage =
        firstError?.message ||
        "Please check all required fields and try again.";

      toast({
        title: "Form Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    if (!idFrontPhoto || !idBackPhoto || !selfiePhoto) {
      const missingPhotos = [];
      if (!idFrontPhoto) missingPhotos.push("front ID photo");
      if (!idBackPhoto) missingPhotos.push("back ID photo");
      if (!selfiePhoto) missingPhotos.push("selfie photo");

      toast({
        title: "Photo Verification Required",
        description: `Please provide ${missingPhotos.join(
          " and "
        )} to complete your registration.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting registration process...");
      console.log("Form data:", data);
      console.log("ID Front Photo available:", !!idFrontPhoto);
      console.log("ID Back Photo available:", !!idBackPhoto);
      console.log("Selfie Photo available:", !!selfiePhoto);

      // Upload images first
      console.log("Uploading images to Cloudinary...");
      const imageUploadResult = await uploadResidentImagesAction({
        idFrontPhoto,
        idBackPhoto,
        selfiePhoto,
      });

      if (!imageUploadResult.success) {
        toast({
          title: "Image upload failed",
          description:
            imageUploadResult.error ||
            "Image upload service is not configured. Please contact support.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Images uploaded successfully");
      console.log("ID Front Photo URL:", imageUploadResult.idFrontPhotoUrl);
      console.log("ID Back Photo URL:", imageUploadResult.idBackPhotoUrl);
      console.log("Selfie Photo URL:", imageUploadResult.selfiePhotoUrl);

      // Register user with image URLs
      console.log("Registering user with Firebase...");
      const registrationResult = await registerResidentAction({
        ...data,
        idFrontPhotoUrl: imageUploadResult.idFrontPhotoUrl!,
        idBackPhotoUrl: imageUploadResult.idBackPhotoUrl!,
        selfiePhotoUrl: imageUploadResult.selfiePhotoUrl!,
      });

      if (!registrationResult.success) {
        toast({
          title: "Registration failed",
          description:
            registrationResult.error ||
            "An error occurred during registration.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("User registered successfully");

      console.log("Registration successful");
      toast({
        title: "Account Created Successfully!",
        description: `Welcome ${data.firstName}! Your account has been created and is pending verification. You can now sign in.`,
      });

      router.push("/login?registered=true");
    } catch (error: any) {
      // Provide more specific error messages
      let errorMessage =
        "An error occurred during registration. Please try again.";
      if (error.message) {
        if (error.message.includes("Cloudinary configuration error")) {
          errorMessage =
            "Image upload service is temporarily unavailable. Please try again later or contact support.";
        } else if (error.message.includes("Invalid image format")) {
          errorMessage =
            "Please ensure your images are in JPG, PNG, or WebP format.";
        } else if (error.message.includes("File too large")) {
          errorMessage =
            "Your images are too large. Please compress them and try again.";
        } else if (error.message.includes("Failed to upload images")) {
          errorMessage =
            "Failed to upload images. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    // Force complete unmounting of form fields between steps
    const stepKey = `step-${currentStep}`;

    switch (currentStep) {
      case 1:
        return (
          <div key={stepKey} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about yourself
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="firstName"
                render={({ field }) => {
                  console.log("firstName field:", field);
                  return (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control as any}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Santos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dela Cruz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="suffix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suffix</FormLabel>
                    <FormControl>
                      <Input placeholder="Jr., Sr., III" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Birth *</FormLabel>
                    <FormControl>
                      <Input placeholder="Manila, Philippines" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="civilStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Civil Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select civil status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div key={stepKey} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                How can we reach you?
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => {
                  console.log("email field:", field);
                  return (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="juan.delacruz@example.com"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+63 912 345 6789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="alternateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+63 987 654 3210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div key={stepKey} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Address Information</h3>
              <p className="text-sm text-muted-foreground">
                Where do you live?
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street *</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="purok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purok *</FormLabel>
                    <FormControl>
                      <Input placeholder="Purok 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="barangay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barangay</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Emergency Contact</h4>

                <FormField
                  control={form.control as any}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria Dela Cruz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+63 912 345 6789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="emergencyContactRelation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mother, Father, Spouse, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div key={stepKey} className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Photo Verification</h3>
              <p className="text-sm text-muted-foreground">
                Please provide a clear photo of your valid ID and a selfie
              </p>
            </div>

            <div className="space-y-6">
              {/* ID Photos */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Valid ID - Front</h4>
                    <Badge variant="secondary">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capture the front side of your valid government-issued ID
                    (e.g., Driver&apos;s License, SSS ID).
                  </p>

                  {idFrontPhoto ? (
                    <div className="relative inline-block">
                      <img
                        src={idFrontPhoto}
                        alt="ID Front Photo"
                        className="w-48 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => removePhoto("id-front")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openCameraModal("id-front")}
                      className="w-full h-32 border-dashed"
                    >
                      <div className="text-center">
                        <CameraIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">Capture Front Side</p>
                      </div>
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Valid ID - Back</h4>
                    <Badge variant="secondary">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capture the back side of the same ID to confirm details and
                    barcode if available.
                  </p>

                  {idBackPhoto ? (
                    <div className="relative inline-block">
                      <img
                        src={idBackPhoto}
                        alt="ID Back Photo"
                        className="w-48 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => removePhoto("id-back")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openCameraModal("id-back")}
                      className="w-full h-32 border-dashed"
                    >
                      <div className="text-center">
                        <CameraIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">Capture Back Side</p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              {/* Selfie Photo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Selfie Photo</h4>
                  <Badge variant="secondary">Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Take a clear selfie photo for identity verification
                </p>

                {selfiePhoto ? (
                  <div className="relative inline-block">
                    <img
                      src={selfiePhoto}
                      alt="Selfie Photo"
                      className="w-48 h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={() => removePhoto("selfie")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCameraModal("selfie")}
                    className="w-full h-48 border-dashed"
                  >
                    <div className="text-center">
                      <CameraIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">Take Selfie</p>
                    </div>
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Photo Guidelines
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Ensure photos are clear and well-lit</li>
                        <li>ID must be readable and not expired</li>
                        <li>Selfie should show your face clearly</li>
                        <li>No filters or heavy editing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div key={stepKey} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Account Setup</h3>
              <p className="text-sm text-muted-foreground">
                Create your secure account
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control as any}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Back to Home Button */}
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-primary/20 flex items-center justify-center">
              <Image
                src="/images/malinta_logo.jpg"
                alt="Barangay Malinta Logo"
                width={80}
                height={80}
                className="object-cover rounded-full"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Resident Registration
            </CardTitle>
            <CardDescription className="text-gray-600">
              Step {currentStep} of {totalSteps}
            </CardDescription>

            <div className="mt-4">
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit as any)}
                className="space-y-6"
              >
                {renderStepContent()}

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !idFrontPhoto ||
                        !idBackPhoto ||
                        !selfiePhoto
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <CameraModal
        isOpen={cameraModal.isOpen}
        onClose={closeCameraModal}
        onCapture={handlePhotoCapture}
        title={
          cameraModal.type === "id-front"
            ? "Capture ID Front"
            : cameraModal.type === "id-back"
            ? "Capture ID Back"
            : "Take Selfie"
        }
        description={
          cameraModal.type === "id-front"
            ? "Position the front side of your ID clearly within the frame."
            : cameraModal.type === "id-back"
            ? "Flip your ID and make sure the back side is readable."
            : "Make sure your face is clearly visible."
        }
      />
    </div>
  );
}

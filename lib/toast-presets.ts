"use client"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"
import { toast as baseToast } from "@/hooks/use-toast"

type ToastFn = typeof baseToast

export type ToastVariant = Extract<
  NonNullable<ToastProps["variant"]>,
  "success" | "info" | "warning" | "destructive" | "default"
>

type Variant = ToastVariant

export interface ToastPresetOptions {
  toast?: ToastFn
  title?: string
  description?: string
  action?: ToastActionElement
  duration?: number
}

export interface ToastErrorOptions extends ToastPresetOptions {
  error?: unknown
  fallbackDescription?: string
}

const DEFAULT_COPY: Record<
  Variant,
  { title: string; description: string; duration: number }
> = {
  default: {
    title: "Notice",
    description: "Here is an update about your last action.",
    duration: 4000,
  },
  success: {
    title: "Success",
    description: "Everything completed without a hitch.",
    duration: 3500,
  },
  info: {
    title: "Heads up",
    description: "Please review the latest details.",
    duration: 4000,
  },
  warning: {
    title: "Check again",
    description: "Something needs your attention.",
    duration: 4500,
  },
  destructive: {
    title: "Something went wrong",
    description: "We could not complete that request. Please try again.",
    duration: 5000,
  },
}

const FIREBASE_PATTERNS = [
  /firebase/i,
  /firestore/i,
  /auth\/[a-z-]+/i,
  /\(auth\/[a-z-]+\)/i,
  /permission[- ]denied/i,
]

const scrubFirebaseCodes = (value?: string) => {
  if (!value) return value
  return value.replace(/\(auth\/[a-z-]+\)/gi, "").trim()
}

const isFirebaseMessage = (value?: string) =>
  Boolean(value && FIREBASE_PATTERNS.some((pattern) => pattern.test(value)))

const sanitizeCopy = (value: string | undefined, fallback: string) => {
  if (!value) return fallback
  const cleaned = scrubFirebaseCodes(value)
  if (!cleaned) return fallback
  if (isFirebaseMessage(cleaned)) {
    return fallback
  }
  return cleaned
}

const resolveToast = (toast?: ToastFn) => toast ?? baseToast

const showPreset = (
  variant: Variant,
  options?: ToastPresetOptions,
  overrides?: Partial<ToastProps>
) => {
  const defaults = DEFAULT_COPY[variant]
  const nextTitle = sanitizeCopy(options?.title, defaults.title)
  const nextDescription = sanitizeCopy(
    options?.description,
    defaults.description
  )

  return resolveToast(options?.toast)({
    variant,
    title: nextTitle,
    description: nextDescription,
    action: options?.action,
    duration: options?.duration ?? defaults.duration,
    ...overrides,
  })
}

const extractErrorMessage = (error?: unknown) => {
  if (!error) return undefined
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }
  return undefined
}

export const toastSuccess = (options?: ToastPresetOptions) =>
  showPreset("success", options)

export const toastInfo = (options?: ToastPresetOptions) =>
  showPreset("info", options)

export const toastWarning = (options?: ToastPresetOptions) =>
  showPreset("warning", options)

export const toastNotice = (options?: ToastPresetOptions) =>
  showPreset("default", options)

export const toastError = ({
  error,
  fallbackDescription,
  ...options
}: ToastErrorOptions = {}) => {
  const messageFromError = extractErrorMessage(error)
  const sanitized = sanitizeCopy(
    messageFromError ?? options?.description,
    fallbackDescription ?? DEFAULT_COPY.destructive.description
  )

  return showPreset("destructive", {
    ...options,
    description: sanitized,
  })
}

export const toastFromResult = <
  T extends { ok: boolean; message?: string; warning?: boolean }
>(
  result: T,
  options?: ToastPresetOptions
) => {
  if (result.ok) {
    return toastSuccess({
      ...options,
      description: result?.message ?? options?.description,
    })
  }

  if (result.warning) {
    return toastWarning({
      ...options,
      description: result?.message ?? options?.description,
    })
  }

  return toastError({
    ...options,
    description: result?.message ?? options?.description,
  })
}

type NormalizeInput = {
  title?: string
  description?: string
  variant?: ToastProps["variant"]
}

export const normalizeToastPayload = (input: NormalizeInput) => {
  const variant = (input.variant ?? "default") as Variant
  return {
    ...input,
    variant,
    title: sanitizeCopy(input.title, DEFAULT_COPY[variant].title),
    description: sanitizeCopy(
      input.description,
      DEFAULT_COPY[variant].description
    ),
  }
}


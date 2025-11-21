"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, type LucideIcon, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed inset-x-4 top-6 z-[100] flex max-h-screen flex-col-reverse gap-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:flex-col md:max-w-sm",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border bg-white px-6 py-4 pr-12 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        success: "border-gray-200",
        info: "border-gray-200",
        warning: "border-gray-200",
        destructive: "border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      data-variant={variant ?? "default"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

type ToastVariant = VariantProps<typeof toastVariants>["variant"]

const variantIconMap: Record<NonNullable<ToastVariant>, LucideIcon | null> = {
  default: Info,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  destructive: XCircle,
}

const variantIconStyles: Record<NonNullable<ToastVariant>, string> = {
  default: "bg-blue-500",
  success: "bg-green-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  destructive: "bg-red-500",
}

const ToastIcon = ({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: ToastVariant }) => {
  const Icon = variantIconMap[(variant ?? "default") as NonNullable<ToastVariant>]
  if (!Icon) {
    return null
  }

  const iconBgStyle = variantIconStyles[(variant ?? "default") as NonNullable<ToastVariant>]

  return (
    <span
      data-variant={variant}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white",
        iconBgStyle,
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  )
}

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white/70 px-4 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 group-data-[variant=success]:text-emerald-800 group-data-[variant=info]:text-sky-800 group-data-[variant=warning]:text-amber-800 group-data-[variant=destructive]:text-rose-800",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-4 top-4 rounded-full p-1.5 text-slate-400 opacity-0 transition hover:bg-black/5 hover:text-slate-600 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-gray-900", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastIcon,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

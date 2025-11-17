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
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-5 pr-8 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border border-border/80 bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/70",
        success:
          "border border-emerald-200/80 bg-emerald-50 text-emerald-900 shadow-emerald-100/60 dark:border-emerald-500/40 dark:bg-emerald-950 dark:text-emerald-50",
        info: "border border-sky-200/80 bg-sky-50 text-sky-900 shadow-sky-100/60 dark:border-sky-500/40 dark:bg-sky-950 dark:text-sky-50",
        warning:
          "border border-amber-200/80 bg-amber-50 text-amber-900 shadow-amber-100/60 dark:border-amber-500/40 dark:bg-amber-950 dark:text-amber-50",
        destructive:
          "destructive border border-destructive/50 bg-destructive text-destructive-foreground shadow-destructive/40",
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

const ToastIcon = ({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: ToastVariant }) => {
  const Icon = variantIconMap[(variant ?? "default") as NonNullable<ToastVariant>]
  if (!Icon) {
    return null
  }

  return (
    <span
      data-variant={variant}
      className={cn(
        "mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground group-data-[variant=success]:bg-emerald-100 group-data-[variant=success]:text-emerald-900 group-data-[variant=info]:bg-sky-100 group-data-[variant=info]:text-sky-900 group-data-[variant=warning]:bg-amber-100 group-data-[variant=warning]:text-amber-900 group-data-[variant=destructive]:bg-destructive/40 group-data-[variant=destructive]:text-destructive-foreground",
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
      "inline-flex h-8 shrink-0 items-center justify-center rounded-full border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-data-[variant=destructive]:border-white/50 group-data-[variant=destructive]:text-destructive-foreground group-data-[variant=destructive]:hover:border-white group-data-[variant=destructive]:hover:bg-destructive/80 group-data-[variant=success]:border-emerald-200/80 group-data-[variant=success]:text-emerald-900 group-data-[variant=success]:hover:bg-emerald-100/80 group-data-[variant=info]:border-sky-200/80 group-data-[variant=info]:text-sky-900 group-data-[variant=info]:hover:bg-sky-100/80 group-data-[variant=warning]:border-amber-200/80 group-data-[variant=warning]:text-amber-900 group-data-[variant=warning]:hover:bg-amber-100/80",
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
      "absolute right-2 top-2 rounded-full p-1 text-foreground/60 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring group-hover:opacity-100 group-data-[variant=destructive]:text-white/70 group-data-[variant=destructive]:hover:text-white group-data-[variant=success]:text-emerald-900 group-data-[variant=success]:hover:text-emerald-950 group-data-[variant=info]:text-sky-900 group-data-[variant=warning]:text-amber-900",
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
    className={cn("text-sm font-semibold", className)}
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
    className={cn("text-sm opacity-90", className)}
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

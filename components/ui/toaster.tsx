"use client"

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import {
  type ToastProps,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type ToastVariant = NonNullable<ToastProps["variant"]>

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; accent: string; srText: string }
> = {
  default: {
    icon: Info,
    accent:
      "border-foreground/20 bg-background/60 text-foreground dark:border-foreground/40",
    srText: "Notification",
  },
  success: {
    icon: CheckCircle2,
    accent: "border-emerald-200 bg-emerald-100 text-emerald-900",
    srText: "Success",
  },
  info: {
    icon: Info,
    accent: "border-sky-200 bg-sky-100 text-sky-900",
    srText: "Information",
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-amber-200 bg-amber-100 text-amber-900",
    srText: "Warning",
  },
  destructive: {
    icon: XCircle,
    accent: "border-destructive/40 bg-destructive/20 text-destructive-foreground",
    srText: "Error",
  },
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props.variant ?? "default") as ToastVariant
        const { icon: Icon, accent, srText } = VARIANT_META[variant]

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex w-full items-start gap-3">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base",
                  accent
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <div className="flex flex-1 flex-col gap-1 text-sm">
                <span className="sr-only">{srText}</span>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action && <div className="pt-3">{action}</div>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

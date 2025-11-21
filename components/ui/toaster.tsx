"use client"

import { useToast } from "@/hooks/use-toast"
import {
  type ToastProps,
  Toast,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

type ToastVariant = NonNullable<ToastProps["variant"]>

const VARIANT_SR_TEXT: Record<ToastVariant, string> = {
  default: "Notification",
  success: "Success",
  info: "Information",
  warning: "Warning",
  destructive: "Error",
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props.variant ?? "default") as ToastVariant
        const srText = VARIANT_SR_TEXT[variant]

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex w-full items-start gap-3">
              <ToastIcon variant={variant} />
              <div className="flex flex-1 flex-col gap-1">
                <span className="sr-only">{srText}</span>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action && <div className="pt-2">{action}</div>}
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

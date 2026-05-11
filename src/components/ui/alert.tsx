"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "default" | "success" | "destructive";

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: AlertVariant }) {
  return (
    <div
      className={cn("ui-alert", `ui-alert--${variant}`, className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("ui-alert__title", className)} data-slot="alert-title" {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("ui-alert__description", className)} data-slot="alert-description" {...props} />
  );
}

export { Alert, AlertDescription, AlertTitle };
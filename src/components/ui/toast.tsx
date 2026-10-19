import * as React from "react";

import { cn } from "@/lib/utils";

export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

export type ToastActionElement = React.ReactElement;

const Toast = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & ToastProps) => (
  <div className={cn("toast", className)} {...props} />
);

const ToastAction = ({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("toast-action", className)} {...props} />
);

const ToastClose = ({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("toast-close", className)} {...props} />
);

const ToastTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("toast-title", className)} {...props} />
);

const ToastDescription = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("toast-description", className)} {...props} />
);

type ToastProviderProps = { children: React.ReactNode };

const ToastProvider = ({ children }: ToastProviderProps) => <>{children}</>;

const ToastViewport = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className={cn("toast-viewport", className)} {...props} />
);

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastProvider,
  ToastViewport,
};

import * as React from "react"

// No-op Radix/Toast replacements to ensure no UI renders and no external deps needed.
export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const ToastViewport: React.FC = () => null;
export const Toast: React.FC<any> = () => null;
export const ToastTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const ToastDescription: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const ToastClose: React.FC = () => null;
export const ToastAction: React.FC = () => null;
export type ToastProps = Record<string, never>;
export type ToastActionElement = React.ReactElement | null;

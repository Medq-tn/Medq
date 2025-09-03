// No-op toast implementation to remove all toast UI while keeping call sites safe.
// This stub ensures no visual toast appears anywhere in the app.
export type NoopToastArgs = {
  title?: unknown
  description?: unknown
  variant?: unknown
}

export function toast(_args?: NoopToastArgs): {
  id: string
  dismiss: () => void
  update: (_next?: unknown) => void
} {
  return {
    id: "noop",
    dismiss: () => {},
    update: () => {},
  }
}

export function useToast(): {
  toasts: Array<{
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
  } & Record<string, unknown>>
  toast: typeof toast
  dismiss: (_id?: string) => void
} {
  return {
    toasts: [] as Array<{
      id: string
      title?: React.ReactNode
      description?: React.ReactNode
      action?: React.ReactNode
    } & Record<string, unknown>>,
    toast,
    dismiss: () => {},
  }
}

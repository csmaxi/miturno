export interface ToasterToast {
  id: string
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
} 
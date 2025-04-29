import { create } from 'zustand'
import { ToasterToast } from '@/lib/types/toast'

interface ToastState {
  toasts: ToasterToast[]
  addToast: (toast: ToasterToast) => void
  updateToast: (toast: ToasterToast) => void
  dismissToast: (toastId?: string) => void
  removeToast: (toastId?: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [toast, ...state.toasts].slice(0, 3), // Limit to 3 toasts
  })),
  updateToast: (toast) => set((state) => ({
    toasts: state.toasts.map((t) =>
      t.id === toast.id ? { ...t, ...toast } : t
    ),
  })),
  dismissToast: (toastId) => set((state) => ({
    toasts: state.toasts.map((t) =>
      t.id === toastId || toastId === undefined
        ? { ...t, open: false }
        : t
    ),
  })),
  removeToast: (toastId) => set((state) => ({
    toasts: toastId === undefined
      ? []
      : state.toasts.filter((t) => t.id !== toastId),
  })),
})) 
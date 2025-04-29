"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import { ToasterToast } from "@/lib/types/toast"
import { useToastStore } from "@/lib/store/toast-store"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    useToastStore.getState().removeToast(toastId)
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export function toast(toast: Omit<ToasterToast, "id">) {
  const id = Math.random().toString(36).substring(2, 9)
  const toastWithId = { ...toast, id }

  useToastStore.getState().addToast(toastWithId)

  if (toastWithId.open !== false) {
    addToRemoveQueue(id)
  }

  return {
    id: id,
    dismiss: () => useToastStore.getState().dismissToast(id),
    update: (props: ToasterToast) =>
      useToastStore.getState().updateToast({ ...props, id }),
  }
}

export function useToast() {
  const { toasts, dismissToast } = useToastStore()

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }
      dismissToast(toastId)
    },
  }
}

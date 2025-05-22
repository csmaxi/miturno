"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface UpgradeButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function UpgradeButton({ className, variant = "default" }: UpgradeButtonProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para actualizar tu plan",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "premium",
          price: 1,
          userId: session.user.id,
        }),
      })

      if (!response.ok) throw new Error("Error al crear el pago")
      const { init_point } = await response.json()
      window.location.href = init_point
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la actualización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? "Procesando..." : "Actualizar a Premium"}
    </Button>
  )
} 
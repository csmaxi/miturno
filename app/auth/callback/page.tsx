"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Procesar la redirección de OAuth
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          throw error
        }

        if (user) {
          // Verificar si el usuario ya tiene un perfil
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single()

          if (userError && userError.code !== "PGRST116") {
            // PGRST116 es "no se encontró ningún resultado"
            throw userError
          }

          // Si el usuario no tiene perfil, crear uno
          if (!userData) {
            // Obtener el nombre de usuario preferido del localStorage
            const preferredUsername =
              localStorage.getItem("preferredUsername") ||
              user.email?.split("@")[0] ||
              `user${Date.now().toString().slice(-6)}`

            // Verificar si el nombre de usuario ya existe
            const { data: existingUser } = await supabase
              .from("users")
              .select("username")
              .eq("username", preferredUsername)
              .single()

            // Si existe, agregar un sufijo aleatorio
            const finalUsername = existingUser
              ? `${preferredUsername}${Date.now().toString().slice(-4)}`
              : preferredUsername

            // Crear el perfil del usuario
            const { error: profileError } = await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              username: finalUsername,
              full_name:
                user.user_metadata.full_name || user.email?.split("@")[0] || "Usuario",
              profile_description: `Página de ${user.user_metadata.full_name || "Usuario"}`,
            })

            if (profileError) {
              throw profileError
            }

            // Limpiar el localStorage
            localStorage.removeItem("preferredUsername")

            toast({
              title: "Cuenta creada",
              description: "Tu cuenta ha sido creada exitosamente.",
            })
          }

          // Redirigir al dashboard
          router.push("/dashboard")
        } else {
          // Si no hay usuario, redirigir a la página de inicio de sesión
          router.push("/auth/login")
        }
      } catch (err: any) {
        console.error("Error en el callback:", err)
        setError(err.message || "Ocurrió un error durante el proceso de autenticación.")
        toast({
          title: "Error",
          description: err.message || "Ocurrió un error durante el proceso de autenticación.",
          variant: "destructive",
        })
        router.push("/auth/login")
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold text-red-600">Error de autenticación</h1>
            <p className="mt-2">{error}</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">Procesando tu inicio de sesión...</h1>
            <p className="mt-2">Por favor espera mientras te redirigimos.</p>
          </div>
        )}
      </div>
    </div>
  )
}

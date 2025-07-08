"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Obtener la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          setStatus("error")
          setMessage("No se pudo obtener la sesión")
          return
        }

        // Verificar si el usuario ya existe en la tabla users
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          throw userError
        }

        // Si el usuario no existe, crear su perfil
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || "",
              username: session.user.user_metadata?.preferred_username || session.user.email?.split("@")[0] || "",
            })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
            // No lanzar error aquí, el usuario puede completar su perfil después
          }
        }

        setStatus("success")
        setMessage("¡Inicio de sesión exitoso!")
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        })

        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)

      } catch (error: any) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage(error.message || "Error durante el inicio de sesión")
        
        toast({
          title: "Error",
          description: error.message || "Error durante el inicio de sesión",
          variant: "destructive",
        })

        // Redirigir a login después de un delay
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Procesando..."}
            {status === "success" && "¡Éxito!"}
            {status === "error" && "Error"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Completando el inicio de sesión..."}
            {status === "success" && "Redirigiendo al dashboard..."}
            {status === "error" && "Redirigiendo al login..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="text-green-600">
              <p>{message}</p>
            </div>
          )}
          {status === "error" && (
            <div className="text-red-600">
              <p>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

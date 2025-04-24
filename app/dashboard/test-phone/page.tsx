"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { generateWhatsAppLink } from "@/lib/whatsapp-direct-service"
import { MessageSquare } from "lucide-react"

export default function TestPhonePage() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState("")
  const [testMessage, setTestMessage] = useState("¡Hola! Este es un mensaje de prueba de MiTurno.app")
  const [whatsappLink, setWhatsappLink] = useState("")

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const { data: authData } = await supabase.auth.getUser()

        if (authData.user) {
          const { data, error } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

          if (error) throw error

          setUserData(data)
          setPhone(data.phone || "")

          // Generar enlace de WhatsApp si hay un número de teléfono
          if (data.phone) {
            setWhatsappLink(generateWhatsAppLink(data.phone, testMessage))
          }
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar la información del usuario",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Actualizar el enlace de WhatsApp cuando cambia el mensaje o el teléfono
  useEffect(() => {
    if (phone) {
      setWhatsappLink(generateWhatsAppLink(phone, testMessage))
    }
  }, [phone, testMessage])

  const handleSavePhone = async () => {
    setSaving(true)
    try {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        throw new Error("Usuario no autenticado")
      }

      const { error } = await supabase.from("users").update({ phone }).eq("id", authData.user.id)

      if (error) throw error

      toast({
        title: "Número guardado",
        description: "Tu número de teléfono ha sido guardado exitosamente",
      })

      // Actualizar el estado local
      setUserData({
        ...userData,
        phone,
      })

      // Actualizar el enlace de WhatsApp
      setWhatsappLink(generateWhatsAppLink(phone, testMessage))
    } catch (error: any) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el número de teléfono",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">WhatsApp Directo</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de número de teléfono</CardTitle>
          <CardDescription>Configura tu número de teléfono para recibir notificaciones por WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número de WhatsApp</Label>
            <Input
              id="phone"
              placeholder="Ej: +5491123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ingresa tu número en formato internacional (con el código de país)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePhone} disabled={saving}>
            {saving ? "Guardando..." : "Guardar número"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar mensaje de prueba</CardTitle>
          <CardDescription>
            Envía un mensaje de prueba para verificar que la integración con WhatsApp funciona correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testMessage">Mensaje de prueba</Label>
            <Input id="testMessage" value={testMessage} onChange={(e) => setTestMessage(e.target.value)} />
          </div>

          {phone ? (
            <div className="mt-4">
              <Button asChild className="w-full" variant="default">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Abrir WhatsApp con este mensaje
                </a>
              </Button>
            </div>
          ) : (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
              <p>Debes ingresar un número de teléfono para generar el enlace de WhatsApp.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Información sobre WhatsApp Directo</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Este método abre WhatsApp directamente con el mensaje predefinido.</li>
          <li>Funciona tanto en dispositivos móviles como en WhatsApp Web.</li>
          <li>No requiere ninguna API de terceros ni costos adicionales.</li>
          <li>El formato del número debe ser internacional (ej: +5491123456789).</li>
          <li>
            Para enviar mensajes a tus clientes, simplemente haz clic en el botón correspondiente en la sección de
            turnos.
          </li>
        </ul>
      </div>
    </div>
  )
}

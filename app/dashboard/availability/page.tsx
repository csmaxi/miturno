"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash } from "lucide-react"

interface Availability {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "17:00",
  })

  const supabase = createClientSupabaseClient()

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: availabilityData } = await supabase
          .from("availability")
          .select("*")
          .eq("user_id", user.id)
          .order("day_of_week", { ascending: true })

        setAvailability(availabilityData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al cargar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const handleAvailabilityChange = (field: string, value: string) => {
    setNewAvailability(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const day = Number(newAvailability.day_of_week)
      const existing = availability.find(a => a.day_of_week === day)

      if (existing) {
        await supabase
          .from("availability")
          .update({
            start_time: newAvailability.start_time,
            end_time: newAvailability.end_time,
          })
          .eq("id", existing.id)
      } else {
        await supabase.from("availability").insert({
          user_id: user.id,
          day_of_week: day,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
        })
      }

      toast({
        title: "Disponibilidad actualizada",
        description: "Los cambios se aplicaron correctamente",
      })

      fetchAvailability()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAvailability = async (id: string) => {
    try {
      await supabase.from("availability").delete().eq("id", id)
      toast({
        title: "Disponibilidad eliminada",
        description: "El horario se eliminó correctamente",
      })
      fetchAvailability()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar",
        variant: "destructive",
      })
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return days[dayOfWeek]
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad</CardTitle>
          <CardDescription>
            Configura tus horarios de atención para cada día de la semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select
                value={newAvailability.day_of_week}
                onValueChange={(value) => handleAvailabilityChange("day_of_week", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lunes</SelectItem>
                  <SelectItem value="2">Martes</SelectItem>
                  <SelectItem value="3">Miércoles</SelectItem>
                  <SelectItem value="4">Jueves</SelectItem>
                  <SelectItem value="5">Viernes</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                  <SelectItem value="0">Domingo</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newAvailability.start_time}
                onValueChange={(value) => handleAvailabilityChange("start_time", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Desde" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0")
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Select
                value={newAvailability.end_time}
                onValueChange={(value) => handleAvailabilityChange("end_time", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hasta" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0")
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {`${hour}:00`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Button onClick={handleAddAvailability}>Agregar</Button>
            </div>

            <div className="space-y-2">
              {availability.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">{getDayName(item.day_of_week)}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {item.start_time} - {item.end_time}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAvailability(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
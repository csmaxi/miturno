"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Clock, Plus, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: "",
    is_active: true,
  })

  const supabase = createClientSupabaseClient()

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setServices(data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los servicios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("Usuario no autenticado")
      }

      const { error } = await supabase.from("services").insert({
        user_id: userData.user.id,
        name: formData.name,
        description: formData.description,
        duration: Number.parseInt(formData.duration.toString()),
        price: formData.price ? Number.parseFloat(formData.price.toString()) : null,
        is_active: formData.is_active,
      })

      if (error) throw error

      toast({
        title: "Servicio creado",
        description: "El servicio ha sido creado exitosamente",
      })

      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: "",
        is_active: true,
      })

      setOpen(false)
      fetchServices()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el servicio",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      return
    }

    try {
      const { error } = await supabase.from("services").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado exitosamente",
      })

      fetchServices()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el servicio",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo servicio</DialogTitle>
              <DialogDescription>Agrega un nuevo servicio a tu perfil</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del servicio</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Corte de pelo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe tu servicio"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="5"
                      step="5"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (opcional)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_active">Servicio activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar servicio</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay servicios</p>
            <p className="text-muted-foreground text-center mb-6">
              Aún no has creado ningún servicio. Crea tu primer servicio para que tus clientes puedan reservar turnos.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.duration} minutos</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description || "Sin descripción"}</p>
                {service.price && <p className="mt-2 font-medium">${service.price.toFixed(2)}</p>}
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${service.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-sm text-muted-foreground">{service.is_active ? "Activo" : "Inactivo"}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

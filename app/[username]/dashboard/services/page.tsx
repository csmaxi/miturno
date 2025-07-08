"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { useUserContext } from "@/lib/context/UserContext"

interface Service {
  id: string
  name: string
  description: string
  price: number
  created_at: string
}

export default function ServicesPage() {
  const { toast } = useToast()
  const { user } = useUserContext()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: ""
  })

  const fetchServices = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los servicios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const supabase = createClientSupabaseClient()
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        user_id: user.id
      }

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id)

        if (error) throw error

        toast({
          title: "Servicio actualizado",
          description: "El servicio ha sido actualizado correctamente.",
        })
      } else {
        const { error } = await supabase
          .from("services")
          .insert(serviceData)

        if (error) throw error

        toast({
          title: "Servicio creado",
          description: "El servicio ha sido creado correctamente.",
        })
      }

      setOpenDialog(false)
      setEditingService(null)
      setFormData({ name: "", description: "", price: "" })
      fetchServices()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el servicio",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString()
    })
    setOpenDialog(true)
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) return

    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId)

      if (error) throw error

      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente.",
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

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "" })
    setEditingService(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar servicio" : "Agregar servicio"}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? "Modifica los detalles del servicio"
                  : "Agrega un nuevo servicio que ofreces"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servicio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Corte de pelo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el servicio..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingService ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-10 w-10" />
            </div>
            <p className="text-lg font-medium mb-2">No hay servicios</p>
            <p className="text-muted-foreground text-center mb-6">
              Comienza agregando tu primer servicio para que tus clientes puedan reservar.
            </p>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {service.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-sm">
                  ${service.price.toLocaleString('es-AR')}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

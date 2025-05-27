"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { UpgradeButton } from "@/app/components/upgrade-button"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

const PLANS = {
  free: { services: 3 },
  premium: { services: Infinity },
} as const

type UserPlan = keyof typeof PLANS

interface FormData {
  name: string
  description: string
  duration: number
  price: number
}

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
  })
  const [userPlan, setUserPlan] = useState<UserPlan>("free")

  const supabase = createClientSupabaseClient()
  const servicesList = useMemo(() => services || [], [services])
  const maxServicesReached =
    userPlan !== "premium" &&
    servicesList.length >= PLANS[userPlan].services

  useEffect(() => {
    fetchServices()
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return

    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("subscription_plan")
        .eq("id", session.user.id)
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el plan de suscripción",
          variant: "destructive",
        })
        return
      }

      if (userData) {
        const plan = (userData.subscription_plan?.toLowerCase() || "free") as UserPlan
        setUserPlan(plan)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar el plan de suscripción",
        variant: "destructive",
      })
    }
  }

  const fetchServices = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return setLoading(false)

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name")

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      })
    } else {
      setServices(data || [])
    }

    setLoading(false)
  }, [supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (maxServicesReached) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de servicios de tu plan actual. Actualizar a Premium",
        variant: "destructive",
      })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar un servicio",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            price: formData.price,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingService.id)
          .eq("user_id", session.user.id)

        if (error) throw error

        toast({
          title: "Servicio actualizado",
          description: "El servicio ha sido actualizado correctamente",
        })
      } else {
        const { error } = await supabase
          .from("services")
          .insert({
            user_id: session.user.id,
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            price: formData.price,
          })

        if (error) throw error

        toast({
          title: "Servicio creado",
          description: "El servicio ha sido creado correctamente",
        })
      }

      setIsDialogOpen(false)
      setFormData({ name: "", description: "", duration: 30, price: 0 })
      setEditingService(null)
      fetchServices()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el servicio",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (serviceId: string) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId)
        .eq("user_id", session.user.id)

      if (error) throw error

      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente",
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

  if (loading) return <div>Cargando...</div>

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los servicios que ofreces a tus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingService(null)
                setFormData({ name: "", description: "", duration: 30, price: 0 })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Modifica los detalles del servicio"
                  : "Agrega un nuevo servicio a tu lista"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servicio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
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

      {maxServicesReached && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Límite de servicios alcanzado</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Has alcanzado el límite de {PLANS[userPlan].services} servicios para tu plan actual.
            </span>
            <UpgradeButton variant="outline" className="ml-4" />
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.duration} minutos
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {service.description && (
              <p className="text-sm text-muted-foreground">{service.description}</p>
            )}
            {service.price > 0 && (
              <p className="text-sm font-medium">${service.price.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

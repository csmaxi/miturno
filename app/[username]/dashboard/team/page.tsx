"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"
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
import { AlertCircle } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
}

const PLANS = {
  free: { teamMembers: 1 },
  premium: { teamMembers: Infinity }
}

export default function TeamPage() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [userPlan, setUserPlan] = useState("free")

  useEffect(() => {
    fetchTeamMembers()
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    const supabase = createClientSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_plan")
        .eq("id", session.user.id)
        .single()
      
      if (userData) {
        setUserPlan(userData.subscription_plan)
      }
    }
  }

  const fetchTeamMembers = async () => {
    const supabase = createClientSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name")

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los miembros del equipo",
          variant: "destructive",
        })
      } else {
        setTeamMembers(data || [])
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClientSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return

    // Verificar límite de miembros según el plan
    if (teamMembers.length >= PLANS[userPlan as keyof typeof PLANS].teamMembers) {
      toast({
        title: "Límite alcanzado",
        description: `Tu plan actual (${userPlan}) permite un máximo de ${PLANS[userPlan as keyof typeof PLANS].teamMembers} miembros del equipo. Actualiza tu plan para agregar más miembros.`,
        variant: "destructive",
      })
      return
    }

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          })
          .eq("id", editingMember.id)
          .eq("user_id", session.user.id)

        if (error) throw error

        toast({
          title: "Miembro actualizado",
          description: "El miembro del equipo ha sido actualizado correctamente",
        })
      } else {
        const { error } = await supabase.from("team_members").insert({
          user_id: session.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })

        if (error) throw error

        toast({
          title: "Miembro agregado",
          description: "El miembro del equipo ha sido agregado correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingMember(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
      })
      fetchTeamMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el miembro del equipo",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (memberId: string) => {
    const supabase = createClientSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId)
        .eq("user_id", session.user.id)

      if (error) throw error

      toast({
        title: "Miembro eliminado",
        description: "El miembro del equipo ha sido eliminado correctamente",
      })
      fetchTeamMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el miembro del equipo",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Equipo</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los miembros de tu equipo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMember(null)
              setFormData({
                name: "",
                email: "",
                phone: "",
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Editar Miembro" : "Nuevo Miembro"}
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Modifica los detalles del miembro del equipo"
                  : "Agrega un nuevo miembro a tu equipo"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingMember ? "Actualizar" : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teamMembers.length >= PLANS[userPlan as keyof typeof PLANS].teamMembers && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Límite de miembros alcanzado</AlertTitle>
          <AlertDescription>
            Has alcanzado el límite de {PLANS[userPlan as keyof typeof PLANS].teamMembers} miembros para tu plan {userPlan}.
            Actualiza tu plan para agregar más miembros.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 border rounded-lg space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(member)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {member.phone && (
              <p className="text-sm text-muted-foreground">
                {member.phone}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { useUserContext } from "@/lib/context/UserContext"

interface TeamMember {
  id: string
  name: string
  position: string
  bio: string
  image_url: string | null
  created_at: string
}

export default function TeamPage() {
  const { toast } = useToast()
  const { user } = useUserContext()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    image_url: ""
  })

  const fetchTeamMembers = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los miembros del equipo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const supabase = createClientSupabaseClient()
      const memberData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        bio: formData.bio.trim(),
        image_url: formData.image_url.trim() || null,
        user_id: user.id
      }

      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", editingMember.id)

        if (error) throw error

        toast({
          title: "Miembro actualizado",
          description: "El miembro del equipo ha sido actualizado correctamente.",
        })
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert(memberData)

        if (error) throw error

        toast({
          title: "Miembro agregado",
          description: "El miembro del equipo ha sido agregado correctamente.",
        })
      }

      setOpenDialog(false)
      setEditingMember(null)
      setFormData({ name: "", position: "", bio: "", image_url: "" })
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
      position: member.position,
      bio: member.bio,
      image_url: member.image_url || ""
    })
    setOpenDialog(true)
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este miembro del equipo?")) return

    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId)

      if (error) throw error

      toast({
        title: "Miembro eliminado",
        description: "El miembro del equipo ha sido eliminado correctamente.",
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

  const resetForm = () => {
    setFormData({ name: "", position: "", bio: "", image_url: "" })
    setEditingMember(null)
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
        <h1 className="text-3xl font-bold">Equipo</h1>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Editar miembro" : "Agregar miembro"}
              </DialogTitle>
              <DialogDescription>
                {editingMember 
                  ? "Modifica los detalles del miembro del equipo"
                  : "Agrega un nuevo miembro a tu equipo"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ej: Peluquero, Estilista"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre esta persona..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL de imagen (opcional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
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

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground mb-4">
              <Plus className="h-10 w-10" />
            </div>
            <p className="text-lg font-medium mb-2">No hay miembros del equipo</p>
            <p className="text-muted-foreground text-center mb-6">
              Comienza agregando miembros a tu equipo para que tus clientes los conozcan.
            </p>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.image_url || ""} alt={member.name} />
                      <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.position}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {member.bio && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
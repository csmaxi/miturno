"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash, Users, Instagram } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TeamPage() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    instagram: "",
    image_url: "",
  })

  const supabase = createClientSupabaseClient()

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setTeamMembers(data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los miembros del equipo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("Usuario no autenticado")
      }

      const { error } = await supabase.from("team_members").insert({
        user_id: userData.user.id,
        name: formData.name,
        position: formData.position || null,
        bio: formData.instagram || null, // Usamos el campo bio para guardar el Instagram
        image_url: formData.image_url || null,
      })

      if (error) throw error

      toast({
        title: "Miembro agregado",
        description: "El miembro ha sido agregado exitosamente al equipo",
      })

      setFormData({
        name: "",
        position: "",
        instagram: "",
        image_url: "",
      })

      setOpen(false)
      fetchTeamMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el miembro al equipo",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este miembro del equipo?")) {
      return
    }

    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado exitosamente del equipo",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipo</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar miembro al equipo</DialogTitle>
              <DialogDescription>Agrega un nuevo miembro a tu equipo</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre del miembro"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo (opcional)</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="Ej: Estilista Senior"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="@usuario_instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de imagen (opcional)</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.image_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando miembros del equipo...</div>
      ) : teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay miembros en el equipo</p>
            <p className="text-muted-foreground text-center mb-6">
              Aún no has agregado miembros a tu equipo. Agrega miembros para mostrarlos en tu perfil.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={member.image_url || ""} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mb-1">{member.name}</CardTitle>
                  {member.position && <p className="text-sm text-muted-foreground mb-2">{member.position}</p>}
                  {member.bio && (
                    <div className="flex items-center mt-2">
                      <Instagram className="h-4 w-4 mr-1 text-pink-500" />
                      <a
                        href={`https://instagram.com/${member.bio.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-pink-500 hover:underline"
                      >
                        {member.bio}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

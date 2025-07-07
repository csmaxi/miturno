"use client"

import { useState, useEffect, useMemo } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUserContext } from "@/lib/context/UserContext"

export default function TeamPage() {
  const { toast } = useToast()
  const { user, loading: userLoading } = useUserContext()
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
  const teamList = useMemo(() => teamMembers || [], [teamMembers])

  const fetchTeamMembers = async () => {
    if (!user) return
    setLoading(true)
    try {
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
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("team_members").insert({
        user_id: user?.id,
        name: formData.name,
        position: formData.position,
        instagram: formData.instagram,
        image_url: formData.image_url,
      })

      if (error) throw error

      toast({
        title: "Miembro agregado",
        description: "El miembro ha sido agregado exitosamente",
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
        description: error.message || "No se pudo agregar el miembro",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este miembro?")) {
      return
    }

    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado exitosamente",
      })

      fetchTeamMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el miembro",
        variant: "destructive",
      })
    }
  }

  const loadingSkeleton = useMemo(() => {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }, [])

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
                  <Label htmlFor="position">Posición</Label>
                <Input
                  id="position"
                  name="position"
                    placeholder="Ej: Peluquero"
                  value={formData.position}
                  onChange={handleChange}
                    required
                />
              </div>
                <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                    placeholder="@usuario"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de la imagen</Label>
                      <Input
                    id="image_url"
                    name="image_url"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={handleChange}
                  />
              </div>
            </div>
            <DialogFooter>
                <Button type="submit">Guardar miembro</Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? loadingSkeleton : teamList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay miembros</p>
            <p className="text-muted-foreground text-center mb-6">
              Aún no has agregado ningún miembro a tu equipo. Agrega miembros para que aparezcan en tu perfil.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamList.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.position}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {member.image_url && (
                  <img
                        src={member.image_url}
                        alt={member.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                  {member.instagram && (
                      <a
                    href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {member.instagram}
                      </a>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

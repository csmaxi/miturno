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
import Image from 'next/image'

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
          .limit(1)

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

    if (teamMembers.length >= 1) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes agregar un miembro al equipo",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("Usuario no autenticado")
      }

      const { error } = await supabase.from("team_members").insert({
        user_id: userData.user.id,
        name: formData.name,
        position: formData.position || null,
        bio: formData.instagram || null,
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

  const hasMember = teamMembers.length >= 1

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipo</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          {hasMember ? (
            <Button variant="destructive" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Límite alcanzado
            </Button>
          ) : (
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar miembro
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar miembro del equipo</DialogTitle>
              <DialogDescription>
                Agrega un nuevo miembro a tu equipo. Podrás editarlo o eliminarlo más tarde.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del miembro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Cargo o rol"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@usuario"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_url">URL de imagen</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Agregar miembro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No hay miembros en el equipo</CardTitle>
            <p className="text-muted-foreground">
              Comienza agregando miembros a tu equipo para mostrarlos en tu perfil.
            </p>
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
                  <Avatar className="h-24 w-24 mb-4 relative">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 96px) 100vw, 96px"
                      />
                    ) : (
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <CardTitle className="mb-1">{member.name}</CardTitle>
                  {member.position && <p className="text-sm text-muted-foreground mb-2">{member.position}</p>}
                  {member.instagram && (
                    <div className="flex items-center mt-2">
                      <Instagram className="h-4 w-4 mr-1 text-pink-500" />
                      <a
                        href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-pink-500 hover:underline"
                      >
                        {member.instagram}
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

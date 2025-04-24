"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash, Upload } from "lucide-react"

interface ProfileData {
  full_name: string
  username: string
  profile_title: string
  profile_description: string
  profile_image_url: string
  banner_image_url: string
  phone: string
}

interface Availability {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    username: "",
    profile_title: "",
    profile_description: "",
    profile_image_url: "",
    banner_image_url: "",
    phone: "",
  })
  const [availability, setAvailability] = useState<Availability[]>([])
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "17:00",
  })

  const supabase = createClientSupabaseClient()

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Obtener datos del perfil
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) throw error

        setProfileData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          profile_title: profile.profile_title || "",
          profile_description: profile.profile_description || "",
          profile_image_url: profile.profile_image_url || "",
          banner_image_url: profile.banner_image_url || "",
          phone: profile.phone || "",
        })

        // Obtener disponibilidad
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
    fetchUserData()
  }, [])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Validar nombre de usuario único
      if (profileData.username) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("username")
          .eq("username", profileData.username)
          .neq("id", user.id)
          .single()

        if (existingUser) {
          toast({
            title: "Error",
            description: "El nombre de usuario ya está en uso",
            variant: "destructive",
          })
          return
        }
      }

      await supabase
        .from("users")
        .update(profileData)
        .eq("id", user.id)

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente",
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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

      fetchUserData()
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
        title: "Horario eliminado",
        description: "El horario fue removido correctamente",
      })
      fetchUserData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const previewUrl = URL.createObjectURL(file)
      setProfileData(prev => ({
        ...prev,
        [`${type}_image_url`]: previewUrl
      }))
      toast({
        title: "Imagen cargada",
        description: "Guarda los cambios para aplicar la imagen",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive",
      })
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return days[dayOfWeek]
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
      <h1 className="text-3xl font-bold">Configuración</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
              <CardDescription>Actualiza tu información pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre del negocio</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <div className="flex">
                      <span className="flex items-center bg-muted px-3 rounded-l-md border border-r-0 border-input">
                        miturno.app/
                      </span>
                      <Input
                        id="username"
                        name="username"
                        className="rounded-l-none"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+54 11 1234-5678"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Para recibir notificaciones de reservas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_title">Rubro</Label>
                    <Input
                      id="profile_title"
                      name="profile_title"
                      placeholder="Ej: Peluquería, Consultorio Médico"
                      value={profileData.profile_title}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_description">Descripción</Label>
                    <Textarea
                      id="profile_description"
                      name="profile_description"
                      placeholder="Describe tu negocio o servicios"
                      value={profileData.profile_description}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="md:w-1/3 space-y-6">
                  <div className="space-y-2">
                    <Label>Imagen de perfil</Label>
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.profile_image_url} alt={profileData.full_name} />
                        <AvatarFallback className="text-2xl">
                          {profileData.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="profile_image">Subir imagen</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="profile_image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "profile")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("profile_image")?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar archivo
                          </Button>
                        </div>
                        <Input
                          name="profile_image_url"
                          placeholder="URL de imagen"
                          value={profileData.profile_image_url}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner_image">Banner</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="banner_image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "banner")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("banner_image")?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Subir banner
                      </Button>
                    </div>
                    <Input
                      name="banner_image_url"
                      placeholder="URL de banner"
                      value={profileData.banner_image_url}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad</CardTitle>
              <CardDescription>Configura tus horarios disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select
                    value={newAvailability.day_of_week}
                    onValueChange={(value) => handleAvailabilityChange("day_of_week", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {getDayName(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Inicio</Label>
                  <Input
                    type="time"
                    value={newAvailability.start_time}
                    onChange={(e) => handleAvailabilityChange("start_time", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin</Label>
                  <Input
                    type="time"
                    value={newAvailability.end_time}
                    onChange={(e) => handleAvailabilityChange("end_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddAvailability}>
                  Guardar horario
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Horarios actuales</h3>
                {availability.length === 0 ? (
                  <p className="text-muted-foreground">No hay horarios configurados</p>
                ) : (
                  <div className="space-y-2">
                    {availability.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{getDayName(item.day_of_week)}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
                          </p>
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
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
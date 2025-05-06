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
import { Upload, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfileData {
  full_name: string
  username: string
  profile_title: string
  profile_description: string
  profile_image_url: string
  banner_image_url: string
  phone: string
}

const SOUTH_AMERICAN_COUNTRIES = [
  { code: "AR", name: "Argentina", prefix: "+54" },
  { code: "BO", name: "Bolivia", prefix: "+591" },
  { code: "BR", name: "Brasil", prefix: "+55" },
  { code: "CL", name: "Chile", prefix: "+56" },
  { code: "CO", name: "Colombia", prefix: "+57" },
  { code: "EC", name: "Ecuador", prefix: "+593" },
  { code: "PY", name: "Paraguay", prefix: "+595" },
  { code: "PE", name: "Perú", prefix: "+51" },
  { code: "UY", name: "Uruguay", prefix: "+598" },
  { code: "VE", name: "Venezuela", prefix: "+58" }
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(SOUTH_AMERICAN_COUNTRIES[0])
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    username: "",
    profile_title: "",
    profile_description: "",
    profile_image_url: "",
    banner_image_url: "",
    phone: "",
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

        // Determinar el país basado en el prefijo del teléfono
        const phone = profile.phone || ""
        const country = SOUTH_AMERICAN_COUNTRIES.find(c => phone.startsWith(c.prefix)) || SOUTH_AMERICAN_COUNTRIES[0]
        setSelectedCountry(country)

        setProfileData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          profile_title: profile.profile_title || "",
          profile_description: profile.profile_description || "",
          profile_image_url: profile.profile_image_url || "",
          banner_image_url: profile.banner_image_url || "",
          phone: phone,
        })
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

  const handleCountryChange = (value: string) => {
    const country = SOUTH_AMERICAN_COUNTRIES.find(c => c.code === value) || SOUTH_AMERICAN_COUNTRIES[0]
    setSelectedCountry(country)
    
    // Actualizar el número de teléfono con el nuevo prefijo
    const currentPhone = profileData.phone
    const phoneWithoutPrefix = currentPhone.replace(/^\+\d+/, "").trim()
    setProfileData(prev => ({
      ...prev,
      phone: `${country.prefix} ${phoneWithoutPrefix}`
    }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Validar formato del teléfono
      if (profileData.phone) {
        const phoneWithoutPrefix = profileData.phone.replace(selectedCountry.prefix, "").trim()
        if (!/^\d{8,12}$/.test(phoneWithoutPrefix)) {
          toast({
            title: "Error",
            description: "El número de teléfono debe tener entre 8 y 12 dígitos (sin contar el prefijo del país)",
            variant: "destructive",
          })
          return
        }
      }

      // Preparar los datos para actualizar
      const updateData = {
        full_name: profileData.full_name,
        profile_title: profileData.profile_title,
        profile_description: profileData.profile_description,
        phone: profileData.phone,
        profile_image_url: profileData.profile_image_url,
        banner_image_url: profileData.banner_image_url,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente",
      })

      // Recargar los datos después de guardar
      await fetchUserData()

    } catch (error: any) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: error.message || "Error al guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "banner") => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/${type}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath)

      const updateData = type === "profile"
        ? { profile_image_url: publicUrl }
        : { banner_image_url: publicUrl }

      await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)

      setProfileData(prev => ({ ...prev, ...updateData }))

      toast({
        title: "Imagen actualizada",
        description: "La imagen se subió correctamente",
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile" className="flex-1 md:flex-none">Perfil</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
              <CardDescription>Actualiza tu información pública</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
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
                      <span className="flex items-center bg-muted px-3 rounded-l-md border border-r-0 border-input text-sm">
                        miturno.app/
                      </span>
                      <Input
                        id="username"
                        name="username"
                        className="rounded-l-none bg-muted"
                        value={profileData.username}
                        readOnly
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El nombre de usuario no puede ser modificado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp (obligatorio para notificaciones)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name} ({country.prefix})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder={`Ej: ${selectedCountry.prefix} 11 1234-5678`}
                        required
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Necesario para recibir notificaciones de turnos.
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

                <div className="lg:w-1/3 space-y-6">
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
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
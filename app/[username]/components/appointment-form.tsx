"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronDown, ChevronUp, Calendar as CalendarIcon2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { generateWhatsAppLink, formatAppointmentNotificationForOwner } from "@/lib/whatsapp-direct-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

interface AppointmentFormProps {
  userId: string
  services: any[]
  teamMembers: any[]
  availability: any[]
}

export function AppointmentForm({ userId, services, teamMembers, availability }: AppointmentFormProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedCountry, setSelectedCountry] = useState(SOUTH_AMERICAN_COUNTRIES[0])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    displayPhone: "",
    serviceId: "",
    teamMemberId: "",
    time: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ownerData, setOwnerData] = useState<any>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "phone") {
      // Remover cualquier caracter que no sea número
      const numbersOnly = value.replace(/\D/g, "")
      // Actualizar tanto el número mostrado como el número completo
      setFormData(prev => ({
        ...prev,
        displayPhone: numbersOnly,
        phone: `${selectedCountry.prefix}${numbersOnly}`
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCountryChange = (value: string) => {
    const country = SOUTH_AMERICAN_COUNTRIES.find(c => c.code === value) || SOUTH_AMERICAN_COUNTRIES[0]
    setSelectedCountry(country)
    
    // Actualizar el número de teléfono con el nuevo prefijo
    const currentPhone = formData.displayPhone
    setFormData(prev => ({
      ...prev,
      phone: `${country.prefix}${currentPhone}`,
      displayPhone: currentPhone
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generar horarios disponibles basados en la disponibilidad
  const getAvailableTimes = () => {
    if (!date) return []

    const dayOfWeek = date.getDay() // 0 = domingo, 1 = lunes, etc.
    const availableDay = availability.find((a) => a.day_of_week === dayOfWeek)

    if (!availableDay) return []

    const selectedService = services.find((s) => s.id === formData.serviceId)
    const serviceDuration = selectedService ? selectedService.duration : 30

    // Asegurarse de que start_time y end_time existan
    if (!availableDay.start_time || !availableDay.end_time) return []

    const startTime = new Date(`2000-01-01T${availableDay.start_time}`)
    const endTime = new Date(`2000-01-01T${availableDay.end_time}`)

    const times = []
    let currentTime = startTime

    while (currentTime < endTime) {
      times.push(format(currentTime, "HH:mm"))
      currentTime = new Date(currentTime.getTime() + serviceDuration * 60000)
    }

    return times
  }

  const availableTimes = getAvailableTimes()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que el número de teléfono tenga el formato correcto
    const phoneNumber = formData.displayPhone.trim()
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono válido",
        variant: "destructive",
      })
      return
    }

    if (!date || !formData.time || !formData.serviceId) {
      toast({
        title: "Error",
        description:
          "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClientSupabaseClient()

      // Obtener el primer y último día del mes actual
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      // Realizar todas las consultas necesarias en paralelo
      const [
        { data: subscriptionData },
        { data: monthlyAppointments },
        { data: ownerData }
      ] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("appointments")
          .select("id")
          .eq("user_id", userId)
          .gte("appointment_date", format(firstDayOfMonth, "yyyy-MM-dd"))
          .lte("appointment_date", format(lastDayOfMonth, "yyyy-MM-dd")),
        supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()
      ])

      const selectedService = services.find((s) => s.id === formData.serviceId)
      const serviceDuration = selectedService ? selectedService.duration : 30

      // Calcular hora de fin
      const [hours, minutes] = formData.time.split(":").map(Number)
      const startTime = new Date()
      startTime.setHours(hours, minutes, 0, 0)

      const endTime = new Date(startTime.getTime() + serviceDuration * 60000)
      const endTimeString = format(endTime, "HH:mm")
      const formattedDate = format(date, "yyyy-MM-dd")

      // Asegurarse de que el número de teléfono tenga el formato correcto
      const formattedPhone = `${selectedCountry.prefix}${phoneNumber}`

      // Crear la cita
      const { data: appointmentData, error } = await supabase
        .from("appointments")
        .insert({
          user_id: userId,
          service_id: formData.serviceId,
          team_member_id: formData.teamMemberId || null,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formattedPhone,
          appointment_date: formattedDate,
          start_time: formData.time,
          end_time: endTimeString,
          status: "pending",
          notes: formData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setSuccess(true)
      setShowSuccessDialog(true)
      setIsOpen(false) // Cerrar el formulario

      // Resetear formulario
      setFormData({
        name: "",
        email: "",
        phone: "",
        displayPhone: "",
        serviceId: "",
        teamMemberId: "",
        time: "",
        notes: "",
      })
      setDate(undefined)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reservar el turno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-10 w-10"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <AlertDialogHeader className="space-y-2 text-center">
                <AlertDialogTitle className="text-2xl text-center font-bold">¡Turno reservado!</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Hemos recibido tu solicitud de turno. El profesional se pondrá en contacto contigo para confirmar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center w-full">
                <AlertDialogAction 
                  onClick={() => {
                    setShowSuccessDialog(false)
                    setSuccess(false)
                  }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              className="fixed right-4 bottom-4 shadow-lg bg-primary hover:bg-primary/90 text-white gap-2 z-50"
              size="lg"
            >
              <CalendarIcon2 className="h-5 w-5" />
              Reservar turno
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Reservar turno</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" name="name" placeholder="Tu nombre" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp (obligatorio para notificaciones)</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
                    <SelectTrigger className="w-[180px]">
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
                    value={formData.displayPhone}
                    onChange={handleChange}
                    placeholder="Ej: 9112345678"
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresa tu número sin espacios ni guiones. Ejemplo: 9112345678
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Servicio</Label>
                <Select value={formData.serviceId} onValueChange={(value) => handleSelectChange("serviceId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} min)
                        {service.price ? ` - ${service.price.toFixed(2)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {teamMembers.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="teamMember">Profesional (opcional)</Label>
                  <Select value={formData.teamMemberId} onValueChange={(value) => handleSelectChange("teamMemberId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => {
                        const dayOfWeek = date.getDay()
                        return date < new Date() || !availability.some((a) => a.day_of_week === dayOfWeek)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {date && availableTimes.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="time">Horario</Label>
                  <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Información adicional que quieras compartir"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Reservando..." : "Reservar turno"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="fixed right-4 bottom-4 shadow-lg bg-primary hover:bg-primary/90 text-white gap-2 z-50"
          size="lg"
        >
          <CalendarIcon2 className="h-5 w-5" />
          Reservar turno
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reservar turno</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" placeholder="Tu nombre" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp (obligatorio para notificaciones)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-[180px]">
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
                value={formData.displayPhone}
                onChange={handleChange}
                placeholder="Ej: 9112345678"
                required
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa tu número sin espacios ni guiones. Ejemplo: 9112345678
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Servicio</Label>
            <Select value={formData.serviceId} onValueChange={(value) => handleSelectChange("serviceId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration} min)
                    {service.price ? ` - ${service.price.toFixed(2)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">Profesional (opcional)</Label>
              <Select value={formData.teamMemberId} onValueChange={(value) => handleSelectChange("teamMemberId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => {
                    const dayOfWeek = date.getDay()
                    return date < new Date() || !availability.some((a) => a.day_of_week === dayOfWeek)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {date && availableTimes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="time">Horario</Label>
              <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Información adicional que quieras compartir"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Reservando..." : "Reservar turno"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

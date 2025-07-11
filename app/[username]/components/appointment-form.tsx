"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, startOfWeek, addWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { generateWhatsAppLink, formatAppointmentNotificationForOwner } from "@/lib/whatsapp-direct-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  selectedService?: any
  onClose?: () => void
}

export function AppointmentForm({ userId, services, teamMembers, availability, selectedService: initialSelectedService, onClose }: AppointmentFormProps) {
  const { toast } = useToast()
  const [selectedService, setSelectedService] = useState<any>(initialSelectedService || null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedCountry, setSelectedCountry] = useState(SOUTH_AMERICAN_COUNTRIES[0])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    displayPhone: "",
    teamMemberId: "",
    time: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Actualizar el servicio seleccionado cuando cambie la prop
  useEffect(() => {
    if (initialSelectedService) {
      setSelectedService(initialSelectedService)
      // Resetear fecha y hora cuando se selecciona un nuevo servicio
      setDate(undefined)
      setFormData(prev => ({ ...prev, time: "" }))
    }
  }, [initialSelectedService])

  // Escuchar el evento de selección de servicio (para compatibilidad)
  useEffect(() => {
    const handleServiceSelected = (event: CustomEvent) => {
      setSelectedService(event.detail.service)
      // Resetear fecha y hora cuando se selecciona un nuevo servicio
      setDate(undefined)
      setFormData(prev => ({ ...prev, time: "" }))
    }

    window.addEventListener('serviceSelected', handleServiceSelected as EventListener)
    
    return () => {
      window.removeEventListener('serviceSelected', handleServiceSelected as EventListener)
    }
  }, [])

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
    if (!date || !selectedService) return []

    const dayOfWeek = date.getDay() // 0 = domingo, 1 = lunes, etc.
    const availableDay = availability.find((a) => a.day_of_week === dayOfWeek)

    if (!availableDay) return []

    const serviceDuration = selectedService.duration

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

  // Generar fechas disponibles para la semana actual
  const getAvailableDates = () => {
    if (!selectedService) return []

    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Lunes como inicio
    const weekStart = addWeeks(startOfCurrentWeek, currentWeek)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      if (date >= today) {
        const dayOfWeek = date.getDay()
        const isAvailable = availability.some((a) => a.day_of_week === dayOfWeek)
        if (isAvailable) {
          dates.push(date)
        }
      }
    }
    
    return dates
  }

  const availableTimes = getAvailableTimes()
  const availableDates = getAvailableDates()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService) {
      toast({
        title: "Error",
        description: "Por favor selecciona un servicio",
        variant: "destructive",
      })
      return
    }

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

    if (!date || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
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
        { data: monthlyAppointments },
        { data: ownerData }
      ] = await Promise.all([
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

      const serviceDuration = selectedService.duration

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
          service_id: selectedService.id,
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

      // Resetear formulario
      setSelectedService(null)
      setDate(undefined)
      setFormData({
        name: "",
        email: "",
        phone: "",
        displayPhone: "",
        teamMemberId: "",
        time: "",
        notes: "",
      })
      
      // NO cerrar el modal automáticamente - dejar que el usuario vea el diálogo de éxito
      // if (onClose) {
      //   onClose()
      // }
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
                    // Ahora sí cerrar el modal después de que el usuario haga clic en "Aceptar"
                    if (onClose) {
                      onClose()
                    }
                  }}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 text-green-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">¡Reserva completada exitosamente!</p>
                <p className="text-sm text-green-600">Tu turno ha sido registrado en nuestro sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Si no hay servicio seleccionado, mostrar mensaje de selección
  if (!selectedService) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Selecciona un servicio</h3>
          <p className="text-sm text-muted-foreground">
            Elige un servicio de la lista para comenzar a reservar tu cita
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedService && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="font-medium">{selectedService.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {selectedService.duration} minutos
            </div>
            {selectedService.price && <span>${selectedService.price.toLocaleString()}</span>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha - Selector móvil mejorado */}
          <div className="space-y-2">
            <Label>Fecha *</Label>
            
            {/* Selector de fecha móvil */}
            <div className="block md:hidden">
              <div className="flex items-center justify-between mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(prev => prev - 1)}
                  disabled={currentWeek <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Semana {currentWeek === 0 ? "actual" : currentWeek + 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(prev => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {availableDates.map((availableDate) => (
                  <Button
                    key={availableDate.toISOString()}
                    type="button"
                    variant={date && format(date, "yyyy-MM-dd") === format(availableDate, "yyyy-MM-dd") ? "default" : "outline"}
                    size="sm"
                    className="h-12 text-xs"
                    onClick={() => setDate(availableDate)}
                    disabled={!selectedService}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs opacity-70">
                        {format(availableDate, "EEE", { locale: es })}
                      </span>
                      <span className="font-medium">
                        {format(availableDate, "d")}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
              
              {availableDates.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No hay fechas disponibles esta semana
                </div>
              )}
            </div>

            {/* Selector de fecha desktop */}
            <div className="hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    disabled={!selectedService}
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
          </div>

          {/* Hora - Selector móvil mejorado */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora *</Label>
            
            {/* Selector de hora móvil */}
            <div className="block md:hidden">
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={formData.time === time ? "default" : "outline"}
                      size="sm"
                      className="h-12"
                      onClick={() => handleSelectChange("time", time)}
                      disabled={!date}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {!date ? "Selecciona una fecha primero" : "No hay horarios disponibles"}
                </div>
              )}
            </div>

            {/* Selector de hora desktop */}
            <div className="hidden md:block">
              <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                <SelectTrigger disabled={!date || availableTimes.length === 0}>
                  <SelectValue placeholder="Seleccionar hora" />
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
          </div>

          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teamMember">Profesional</Label>
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
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
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

          {/* <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
            />
          </div> */}


          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Alguna información adicional..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !selectedService ||
              !date ||
              !formData.time ||
              !formData.name ||
              !formData.displayPhone ||
              loading
            }
          >
            {loading ? "Reservando..." : "Confirmar Reserva"}
          </Button>
        </form>
      </div>
    )
  }

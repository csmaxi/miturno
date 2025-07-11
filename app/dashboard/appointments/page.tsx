"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/lib/context/UserContext"
import { Check, X, Calendar, Info, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Appointment {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  notes: string
  services: { name: string }
  team_members: { name: string }
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const { user } = useUserContext()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null)

  const fetchAppointments = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          services:services(name),
          team_members:team_members(name)
        `)
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: false })

      if (error) throw error
      setAppointments(data || [])
    } catch (error: any) {
      setError(error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los turnos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchAppointments()

    // Suscribirse a cambios en tiempo real
    const supabase = createClientSupabaseClient()
    const subscription = supabase
      .channel("appointments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchAppointments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAppointments, user?.id])

  const refetch = useCallback(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    setProcessingAction(true)
    try {
      // Primero obtener los datos del turno para el mensaje de WhatsApp
      const { data: appointmentData, error: fetchError } = await createClientSupabaseClient()
        .from("appointments")
        .select(`
          *,
          services:services(name),
          team_members:team_members(name)
        `)
        .eq("id", id)
        .single()

      if (fetchError) throw fetchError

      // Actualizar el estado del turno
      const { error } = await createClientSupabaseClient().from("appointments").update({ status }).eq("id", id)
      if (error) throw error

      // Generar mensaje de WhatsApp
      const message = status === "confirmed"
        ? `¡Hola ${appointmentData.client_name}! Tu turno para ${appointmentData.services?.name || "el servicio"} el ${format(new Date(appointmentData.appointment_date), "PPP", { locale: es })} a las ${appointmentData.start_time.substring(0, 5)} ha sido confirmado. ¡Te esperamos!`
        : `¡Hola ${appointmentData.client_name}! Lamentamos informarte que tu turno para ${appointmentData.services?.name || "el servicio"} el ${format(new Date(appointmentData.appointment_date), "PPP", { locale: es })} a las ${appointmentData.start_time.substring(0, 5)} ha sido cancelado. Por favor, agenda un nuevo turno.`

      const whatsappLink = generateWhatsAppLink(appointmentData.client_phone, message)
      window.open(whatsappLink, "_blank")

      setActiveTab(status)
      toast({
        title: "Estado actualizado",
        description: `El turno ha sido ${status === "confirmed" ? "confirmado" : "cancelado"} exitosamente`,
      })
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }, [toast, refetch])

  const handleAddNotes = async () => {
    if (!selectedAppointment) return

    try {
      const { error } = await createClientSupabaseClient().from("appointments").update({ notes }).eq("id", selectedAppointment.id)
      if (error) throw error

      toast({
        title: "Notas guardadas",
        description: "Las notas han sido guardadas correctamente",
      })
      setOpenDialog(false)
      setNotes("")
      setSelectedAppointment(null)
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar las notas",
        variant: "destructive",
      })
    }
  }

  const openNotesDialog = (appointment: any) => {
    setSelectedAppointment(appointment)
    setNotes(appointment.notes || "")
    setOpenDialog(true)
  }

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return

    setProcessingAction(true)
    try {
      const { error } = await createClientSupabaseClient()
        .from("appointments")
        .delete()
        .eq("id", appointmentToDelete.id)

      if (error) throw error

      toast({
        title: "Turno eliminado",
        description: "El turno ha sido eliminado exitosamente",
      })

      setDeleteDialogOpen(false)
      setAppointmentToDelete(null)
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el turno",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const openDeleteDialog = (appointment: any) => {
    setAppointmentToDelete(appointment)
    setDeleteDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const generateWhatsAppLink = (phone: string, message: string) => {
    const formattedPhone = phone.replace(/\D/g, "")
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  const handleWhatsAppAction = useCallback(async (appointment: any, type: "confirm" | "cancel") => {
    setProcessingAction(true)
    try {
      const status = type === "confirm" ? "confirmed" : "cancelled"

      const { error } = await createClientSupabaseClient().from("appointments").update({ status }).eq("id", appointment.id)
      if (error) throw error

      const message = type === "confirm"
        ? formatAppointmentConfirmationForClient(appointment, appointment.services || {}, user)
        : formatAppointmentCancellationForClient(appointment, appointment.services || {}, user)

      const whatsappLink = generateWhatsAppLink(appointment.client_phone, message)
      window.open(whatsappLink, "_blank")

      setActiveTab(status)

      toast({
        title: "Estado actualizado",
        description: `El turno ha sido ${type === "confirm" ? "confirmado" : "cancelado"} exitosamente`,
      })

      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la acción",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }, [toast, user, refetch])

  // Memoizar los filtros de citas
  const filteredAppointments = useMemo(
    () => (appointments ?? []).filter((app: { status: string }) => app.status === activeTab),
    [appointments, activeTab]
  )

  const pendingAppointments = useMemo(
    () => (appointments ?? []).filter((app: { status: string }) => app.status === "pending"),
    [appointments]
  )

  const confirmedAppointments = useMemo(
    () => (appointments ?? []).filter((app: { status: string }) => app.status === "confirmed"),
    [appointments]
  )

  const completedAppointments = useMemo(
    () => (appointments ?? []).filter((app: { status: string }) => app.status === "completed"),
    [appointments]
  )

  const cancelledAppointments = useMemo(
    () => (appointments ?? []).filter((app: { status: string }) => app.status === "cancelled"),
    [appointments]
  )

  const renderAppointmentList = (appointmentList: any[]) => {
    if (appointmentList.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No hay turnos en esta categoría</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {appointmentList.map((appointment, index) => {
          return (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-medium">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.client_email}</p>
                    {appointment.client_phone && (
                      <p className="text-sm text-muted-foreground">{appointment.client_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(new Date(appointment.appointment_date), "PPP", { locale: es })}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {appointment.services && <Badge variant="secondary">{appointment.services.name}</Badge>}
                  {appointment.team_members && <Badge variant="secondary">{appointment.team_members.name}</Badge>}
                  {getStatusBadge(appointment.status)}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Botones de acción y notas */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {appointment.status === "pending" && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 flex-1"
                          onClick={() => handleStatusChange(appointment.id, "confirmed")}
                          disabled={processingAction}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 flex-1"
                          onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          disabled={processingAction}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {appointment.status === "confirmed" && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 flex-1"
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                          disabled={processingAction}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Completar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 flex-1"
                          onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          disabled={processingAction}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {(appointment.status === "pending" || appointment.status === "cancelled") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => openDeleteDialog(appointment)}
                        disabled={processingAction}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openNotesDialog(appointment)}
                      className="w-full sm:w-auto"
                    >
                      {appointment.notes ? "Editar notas" : "Agregar notas"}
                    </Button>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 text-sm border-t pt-4">
                    <p className="font-medium">Notas:</p>
                    <p className="text-muted-foreground">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Turnos</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay turnos</p>
            <p className="text-muted-foreground text-center mb-6">
              Aún no has recibido ningún turno. Comparte tu enlace para que tus clientes puedan reservar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap sm:grid sm:grid-cols-4 gap-2 mb-6 overflow-x-auto">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              Pendientes ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-1 sm:flex-none">
              Confirmados ({confirmedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none">
              Completados ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">
              Cancelados ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">{renderAppointmentList(pendingAppointments)}</TabsContent>
          <TabsContent value="confirmed">{renderAppointmentList(confirmedAppointments)}</TabsContent>
          <TabsContent value="completed">{renderAppointmentList(completedAppointments)}</TabsContent>
          <TabsContent value="cancelled">{renderAppointmentList(cancelledAppointments)}</TabsContent>
        </Tabs>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas del turno</DialogTitle>
            <DialogDescription>Agrega o edita notas para este turno</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Escribe tus notas aquí..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddNotes}>Guardar notas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar turno</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {appointmentToDelete && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{appointmentToDelete.client_name}</p>
                <p className="text-sm text-muted-foreground">{appointmentToDelete.client_email}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointmentToDelete.appointment_date), "PPP", { locale: es })} - {appointmentToDelete.start_time.substring(0, 5)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAppointment}
              disabled={processingAction}
            >
              {processingAction ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Funciones auxiliares para formatear mensajes
function formatAppointmentConfirmationForClient(appointment: any, service: any, user: any) {
  return `¡Hola ${appointment.client_name}! Tu turno para ${service.name || "el servicio"} el ${format(new Date(appointment.appointment_date), "PPP", { locale: es })} a las ${appointment.start_time.substring(0, 5)} ha sido confirmado. ¡Te esperamos!`
}

function formatAppointmentCancellationForClient(appointment: any, service: any, user: any) {
  return `¡Hola ${appointment.client_name}! Lamentamos informarte que tu turno para ${service.name || "el servicio"} el ${format(new Date(appointment.appointment_date), "PPP", { locale: es })} a las ${appointment.start_time.substring(0, 5)} ha sido cancelado. Por favor, agenda un nuevo turno.`
}
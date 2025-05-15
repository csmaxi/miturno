"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Check, X, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  formatAppointmentConfirmationForClient,
  formatAppointmentCancellationForClient,
  generateWhatsAppLink,
} from "@/lib/whatsapp-direct-service"
import { useUserContext } from "@/lib/context/UserContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  const fetchAppointments = useCallback(async () => {
    if (!user) return []
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from("appointments")
      .select(`*, services:service_id (name), team_members:team_member_id (name)`)
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  }, [user])

  useEffect(() => {
    if (!user) return
    const supabase = createClientSupabaseClient()

    fetchAppointments()
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })

    const subscription = supabase
      .channel("appointments_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "appointments",
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        const newData = await fetchAppointments()
        setAppointments(newData)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchAppointments])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchAppointments()
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [fetchAppointments])

  const handleStatusChange = async (id: string, status: string) => {
    setProcessingAction(true)
    try {
      const supabase = createClientSupabaseClient()
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select(`*, services:service_id (name)`)
        .eq("id", id)
        .single()

      const { error } = await supabase.from("appointments").update({ status }).eq("id", id)
      if (error) throw error

      if (appointmentData?.client_phone && ["confirmed", "cancelled"].includes(status)) {
        const message = status === "confirmed"
          ? formatAppointmentConfirmationForClient(appointmentData, appointmentData.services, user)
          : formatAppointmentCancellationForClient(appointmentData, appointmentData.services, user)

        if (message) {
          const whatsappLink = generateWhatsAppLink(appointmentData.client_phone, message)
          window.open(whatsappLink, "_blank")
        }
      }

      toast({
        title: "Estado actualizado",
        description: `El turno ha sido ${status}`,
      })

      setActiveTab(status)
      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado del turno",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleAddNotes = async () => {
    if (!selectedAppointment) return
    try {
      const { error } = await createClientSupabaseClient()
        .from("appointments")
        .update({ notes })
        .eq("id", selectedAppointment.id)

      if (error) throw error
      toast({ title: "Notas actualizadas" })
      setOpenDialog(false)
      refetch()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openNotesDialog = (appointment: any) => {
    setSelectedAppointment(appointment)
    setNotes(appointment.notes || "")
    setOpenDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100">Pendiente</Badge>
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100">Confirmado</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800 dark:text-red-100">Cancelado</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-100">Completado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingAppointments = useMemo(() =>
    appointments.filter(a => a.status === "pending"), [appointments])

  const confirmedAppointments = useMemo(() =>
    appointments.filter(a => a.status === "confirmed"), [appointments])

  const completedAppointments = useMemo(() =>
    appointments.filter(a => a.status === "completed"), [appointments])

  const cancelledAppointments = useMemo(() =>
    appointments.filter(a => a.status === "cancelled"), [appointments])

  const hasReachedAppointmentLimit = (pendingAppointments.length + confirmedAppointments.length) >= 10

  const visiblePendingAppointments = useMemo(() => {
    const allowed = Math.max(0, 10 - confirmedAppointments.length)
    // Sort appointments by created_at in ascending order (oldest first)
    const sortedPending = [...pendingAppointments].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    return sortedPending.slice(0, allowed)
  }, [pendingAppointments, confirmedAppointments])

  const hiddenPendingCount = pendingAppointments.length - visiblePendingAppointments.length

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
          // Check if this is the 11th appointment and it's pending
          const isEleventhAppointment = index === 10 && appointment.status === "pending"
          const shouldDisableButtons = isEleventhAppointment && hasReachedAppointmentLimit

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
                          disabled={processingAction || shouldDisableButtons}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 flex-1"
                          onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          disabled={processingAction || shouldDisableButtons}
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

      {hasReachedAppointmentLimit && (
        <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-900 dark:text-yellow-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Has alcanzado el límite de 10 turnos (pendientes + confirmados). Los turnos adicionales no podrán ser confirmados hasta que se libere espacio.
          </AlertDescription>
        </Alert>
      )}

      {hiddenPendingCount > 0 && (
        <Alert variant="default" className="bg-orange-50 dark:bg-orange-900/50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Hay {hiddenPendingCount} turno(s) pendiente(s) oculto(s) por el límite de 10 turnos activos.
          </AlertDescription>
        </Alert>
      )}

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

          <TabsContent value="pending">{renderAppointmentList(visiblePendingAppointments)}</TabsContent>
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
    </div>
  )
}

import { useState } from "react";
import { useListAppointments, useCancelAppointment, getListAppointmentsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPKR, formatDate } from "@/lib/format";
import { CalendarDays, Clock, MapPin, XCircle, AlertCircle, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

function getInitialTab(search: string): AppointmentStatus {
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  if (tab === "completed" || tab === "cancelled") return tab;
  return "upcoming";
}

export default function Appointments() {
  const search = useSearch();
  const [tab, setTab] = useState<AppointmentStatus>(() => getInitialTab(search));
  const [cancelId, setCancelId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useListAppointments(
    { status: tab },
    { query: { queryKey: getListAppointmentsQueryKey({ status: tab }) } }
  );

  const cancelAppointment = useCancelAppointment();

  const handleCancel = () => {
    if (!cancelId) return;

    cancelAppointment.mutate(
      { id: cancelId },
      {
        onSuccess: () => {
          toast({
            title: "Appointment Cancelled",
            description: "Your appointment has been successfully cancelled.",
          });
          queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setCancelId(null);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to cancel the appointment. Please try again later.",
          });
          setCancelId(null);
        },
      }
    );
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past clinic visits.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AppointmentStatus)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : appointments?.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-lg border-border bg-card">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium text-foreground">No {tab} appointments</h3>
              <p className="text-muted-foreground mt-1">
                {tab === "upcoming" ? "You don't have any appointments scheduled." : `You have no ${tab} appointments.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments?.map((apt) => (
                <Card key={apt.id} className="overflow-hidden border-border shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                            {apt.doctorName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{apt.doctorName}</h3>
                            <p className="text-muted-foreground text-sm">{apt.specialty}</p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary/70" />
                          <span className="font-medium text-foreground">{formatDate(apt.date)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary/70" />
                          <span className="font-medium text-foreground">{apt.time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                          <span className="font-medium text-foreground">Smart Clinic Main</span>
                        </div>
                        {apt.reason && (
                          <div className="flex items-start text-sm sm:col-span-2 md:col-span-3 mt-2 text-muted-foreground">
                            <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="italic">"{apt.reason}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-6 flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-border md:w-48">
                      <div className="text-left md:text-right w-full">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Fee</p>
                        <p className="text-lg font-bold text-foreground">{formatPKR(apt.fee)}</p>
                      </div>
                      
                      {apt.status === "upcoming" && (
                        <Button 
                          variant="outline" 
                          className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground mt-0 md:mt-4 w-auto md:w-full"
                          onClick={() => setCancelId(apt.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Cancel Appointment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone. 
              The doctor will be notified of your cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelAppointment.isPending}
            >
              {cancelAppointment.isPending ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

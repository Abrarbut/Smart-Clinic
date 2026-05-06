import { useState } from "react";
import { useListAppointments, useCancelAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatPKR } from "@/lib/format";
import { CalendarDays, Clock, XCircle, CheckCircle2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type Tab = "upcoming" | "completed" | "cancelled";

function ApptList({ status }: { status: Tab }) {
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { data, isLoading } = useListAppointments({ status });
  const cancel = useCancelAppointment();
  const qc = useQueryClient();
  const { toast } = useToast();

  const filtered = (data ?? []).filter(a =>
    a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    a.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleCancel = () => {
    if (!cancelId) return;
    cancel.mutate({ id: cancelId }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }); toast({ title: "Appointment cancelled" }); setCancelId(null); },
      onError: () => { toast({ title: "Failed", variant: "destructive" }); setCancelId(null); },
    });
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <>
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="py-12 border border-dashed rounded-xl flex flex-col items-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No {status} appointments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <Card key={appt.id} className="shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{appt.doctorName.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-sm">{appt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{appt.specialty}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-primary" />{formatDate(appt.date)}</span>
                  <span className="text-xs flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{appt.time}</span>
                  <span className="text-sm font-semibold text-primary">{formatPKR(appt.fee)}</span>
                  <Badge className={appt.status === "upcoming" ? "bg-blue-100 text-blue-700 border-blue-200 text-xs" : appt.status === "completed" ? "bg-green-100 text-green-700 border-green-200 text-xs" : "bg-gray-100 text-gray-700 border-gray-200 text-xs"}>{appt.status}</Badge>
                  {appt.status === "upcoming" && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 px-2" onClick={() => setCancelId(appt.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Cancel this appointment?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel It</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminAppointments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Appointments</h1>
        <p className="text-muted-foreground mt-1">System-wide view of all clinic appointments.</p>
      </div>
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-1.5"><XCircle className="h-4 w-4" /> Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6"><ApptList status="upcoming" /></TabsContent>
        <TabsContent value="completed" className="mt-6"><ApptList status="completed" /></TabsContent>
        <TabsContent value="cancelled" className="mt-6"><ApptList status="cancelled" /></TabsContent>
      </Tabs>
    </div>
  );
}

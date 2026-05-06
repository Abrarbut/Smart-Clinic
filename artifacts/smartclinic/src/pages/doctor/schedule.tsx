import { useState } from "react";
import { useListAppointments } from "@workspace/api-client-react";
import { formatDate, formatPKR } from "@/lib/format";
import { CalendarDays, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "upcoming" | "completed" | "cancelled";

function StatusBadge({ status }: { status: string }) {
  if (status === "upcoming") return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Upcoming</Badge>;
  if (status === "completed") return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
  return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Cancelled</Badge>;
}

function AppointmentList({ status }: { status: Tab }) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAppointments({ status });

  const filtered = (data ?? []).filter(a =>
    a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    a.specialty.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search appointments..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center border border-dashed rounded-xl">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No {status} appointments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <Card key={appt.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
                      {appt.doctorName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{appt.doctorName}</h3>
                      <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                      {appt.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{appt.reason}"</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 md:text-right">
                    <div className="flex items-center gap-1.5 text-sm">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{formatDate(appt.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{appt.time}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatPKR(appt.fee)}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoctorSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground mt-1">View and manage all your patient appointments.</p>
      </div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4" /> Cancelled
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6"><AppointmentList status="upcoming" /></TabsContent>
        <TabsContent value="completed" className="mt-6"><AppointmentList status="completed" /></TabsContent>
        <TabsContent value="cancelled" className="mt-6"><AppointmentList status="cancelled" /></TabsContent>
      </Tabs>
    </div>
  );
}

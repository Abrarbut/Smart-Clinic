import { useListAppointments, useListDoctors } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { CalendarDays, Clock, CheckCircle2, XCircle, ChevronRight, UserPlus, Stethoscope, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const { data: upcoming, isLoading } = useListAppointments({ status: "upcoming" });
  const { data: completed } = useListAppointments({ status: "completed" });
  const { data: cancelled } = useListAppointments({ status: "cancelled" });
  const { data: doctors } = useListDoctors({});

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = upcoming?.filter(a => a.date === todayStr) ?? [];
  const total = (upcoming?.length ?? 0) + (completed?.length ?? 0) + (cancelled?.length ?? 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Bookings", value: todayAppts.length, icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50", href: "/receptionist/appointments" },
    { label: "Upcoming", value: upcoming?.length ?? 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", href: "/receptionist/appointments" },
    { label: "Completed", value: completed?.length ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", href: "/receptionist/appointments" },
    { label: "Cancelled", value: cancelled?.length ?? 0, icon: XCircle, color: "text-red-500", bg: "bg-red-50", href: "/receptionist/appointments" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name ?? "Receptionist"}</h1>
          <p className="text-muted-foreground mt-1">Managing {total} total appointments across {doctors?.length ?? 0} doctors.</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-sm px-3 py-1">
          <PhoneCall className="h-4 w-4 mr-1.5" /> Receptionist
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href}>
              <Card className="border-border shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>{formatDate(new Date())}</CardDescription>
            </div>
            <Link href="/receptionist/appointments">
              <div className="text-sm text-primary font-medium flex items-center hover:underline cursor-pointer">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </CardHeader>
          <CardContent>
            {todayAppts.length > 0 ? (
              <div className="space-y-3 mt-2">
                {todayAppts.slice(0, 6).map(appt => (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{appt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{appt.specialty}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {appt.time}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Upcoming</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-8 rounded-xl border border-dashed flex flex-col items-center text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No appointments today.</p>
                <Link href="/receptionist/book">
                  <div className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                    Book Appointment
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/receptionist/book", icon: UserPlus, label: "Book Appointment", desc: "Schedule a new visit", color: "bg-purple-50 text-purple-600" },
              { href: "/receptionist/appointments", icon: CalendarDays, label: "All Appointments", desc: "View & manage bookings", color: "bg-blue-50 text-blue-600" },
              { href: "/doctors", icon: Stethoscope, label: "Doctors", desc: "Available specialists", color: "bg-green-50 text-green-600" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href}>
                  <div className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <div className={`h-10 w-10 rounded-full ${action.color} flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

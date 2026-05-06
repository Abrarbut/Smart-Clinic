import { useGetDashboardSummary, useListAppointments } from "@workspace/api-client-react";
import { formatPKR, formatDate } from "@/lib/format";
import { CalendarDays, Clock, Users, Wallet, ChevronRight, UserCheck, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary();
  const { data: upcoming } = useListAppointments({ status: "upcoming" });
  const { data: completed } = useListAppointments({ status: "completed" });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = upcoming?.filter(a => a.date === todayStr) ?? [];

  if (sumLoading) {
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
    { label: "Today's Patients", value: todayAppts.length, icon: Users, color: "text-green-600", bg: "bg-green-50", href: "/doctor/schedule" },
    { label: "Upcoming", value: upcoming?.length ?? 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", href: "/doctor/schedule" },
    { label: "Completed", value: completed?.length ?? 0, icon: UserCheck, color: "text-primary", bg: "bg-primary/10", href: "/doctor/schedule" },
    { label: "Est. Revenue", value: formatPKR(summary?.totalSpent ?? 0), icon: Wallet, color: "text-purple-600", bg: "bg-purple-50", href: "/doctor/schedule" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good day, {user?.name ?? "Doctor"}</h1>
          <p className="text-muted-foreground mt-1">Here is your practice overview for today.</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">
          <Stethoscope className="h-4 w-4 mr-1.5" /> Doctor
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href}>
              <Card className="border-border shadow-sm hover:shadow-md hover:border-green-200 transition-all cursor-pointer">
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
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{todayAppts.length} appointment{todayAppts.length !== 1 ? "s" : ""} today</CardDescription>
            </div>
            <Link href="/doctor/schedule">
              <div className="text-sm text-primary font-medium flex items-center hover:underline cursor-pointer">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </CardHeader>
          <CardContent>
            {todayAppts.length > 0 ? (
              <div className="space-y-3 mt-2">
                {todayAppts.slice(0, 5).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        {appt.doctorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{appt.doctorName}</p>
                        <p className="text-xs text-muted-foreground">{appt.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" /> {appt.time}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Upcoming</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-8 rounded-xl border border-dashed border-border flex flex-col items-center text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No appointments scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/doctor/schedule", icon: CalendarDays, label: "Full Schedule", desc: "View all appointments", color: "bg-green-50 text-green-600" },
              { href: "/doctor/patients", icon: Users, label: "Patient Records", desc: "View patient history", color: "bg-blue-50 text-blue-600" },
              { href: "/profile", icon: UserCheck, label: "My Profile", desc: "Update availability & fee", color: "bg-purple-50 text-purple-600" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href}>
                  <div className="flex items-center p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer group">
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

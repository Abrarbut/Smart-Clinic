import { useState, useEffect } from "react";
import { useListAppointments, useListDoctors } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { Users, Stethoscope, CalendarDays, TrendingUp, Shield, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  roleCounts: Record<string, number>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const { data: appointments } = useListAppointments({});
  const { data: doctors } = useListDoctors({});

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/users" },
    { label: "Doctors", value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: "text-green-600", bg: "bg-green-50", href: "/admin/doctors" },
    { label: "Appointments", value: stats?.totalAppointments ?? 0, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10", href: "/admin/appointments" },
    { label: "Growth", value: "+12%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/users" },
  ];

  const roleData = [
    { role: "Patients", key: "patient", color: "bg-blue-500", textColor: "text-blue-700", bg: "bg-blue-50" },
    { role: "Doctors", key: "doctor", color: "bg-green-500", textColor: "text-green-700", bg: "bg-green-50" },
    { role: "Receptionists", key: "receptionist", color: "bg-purple-500", textColor: "text-purple-700", bg: "bg-purple-50" },
    { role: "Admins", key: "admin", color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50" },
  ];

  const totalUsers = stats?.totalUsers || 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here is the system overview.</p>
        </div>
        <Badge className="bg-red-100 text-red-700 border-red-200 text-sm px-3 py-1">
          <Shield className="h-4 w-4 mr-1.5" /> Administrator
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={i} href={stat.href}>
                <Card className="border-border shadow-sm hover:shadow-md hover:border-red-200 transition-all cursor-pointer">
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
          })
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Registered users by role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              roleData.map(rd => {
                const count = stats?.roleCounts?.[rd.key] ?? 0;
                const pct = Math.round((count / totalUsers) * 100);
                return (
                  <div key={rd.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${rd.textColor}`}>{rd.role}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${rd.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest system-wide appointments</CardDescription>
            </div>
            <Link href="/admin/appointments">
              <div className="text-sm text-primary font-medium flex items-center hover:underline cursor-pointer">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              {(appointments ?? []).slice(0, 6).map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {appt.doctorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(appt.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{appt.time}</span>
                    <Badge className={
                      appt.status === "upcoming" ? "bg-blue-100 text-blue-700 border-blue-200 text-xs" :
                      appt.status === "completed" ? "bg-green-100 text-green-700 border-green-200 text-xs" :
                      "bg-gray-100 text-gray-700 border-gray-200 text-xs"
                    }>
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {!appointments?.length && (
                <p className="text-muted-foreground text-sm text-center py-6">No appointments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/users", icon: Users, label: "Manage Users", color: "bg-blue-50 text-blue-600" },
            { href: "/admin/doctors", icon: Stethoscope, label: "Manage Doctors", color: "bg-green-50 text-green-600" },
            { href: "/admin/appointments", icon: CalendarDays, label: "All Appointments", color: "bg-primary/10 text-primary" },
            { href: "/doctors", icon: TrendingUp, label: "Find Doctors", color: "bg-purple-50 text-purple-600" },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <Link key={i} href={a.href}>
                <div className={`flex flex-col items-center p-4 rounded-xl border hover:shadow-md transition-all cursor-pointer ${a.color.split(" ")[0]}/20 hover:${a.color.split(" ")[0]}/30`}>
                  <div className={`p-3 rounded-full ${a.color} mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{a.label}</span>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

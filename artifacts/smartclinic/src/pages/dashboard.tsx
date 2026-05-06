import { useGetDashboardSummary } from "@workspace/api-client-react";
import { formatPKR, formatDate } from "@/lib/format";
import { CalendarDays, CheckCircle2, Clock, Wallet, ChevronRight, Stethoscope, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return <div className="text-destructive">Failed to load dashboard data.</div>;
  }

  const stats = [
    { label: "Upcoming Appointments", value: summary.upcomingAppointments, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", href: "/appointments?tab=upcoming" },
    { label: "Completed Visits", value: summary.completedAppointments, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", href: "/appointments?tab=completed" },
    { label: "Total Appointments", value: summary.totalAppointments, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10", href: "/appointments" },
    { label: "Total Spent", value: formatPKR(summary.totalSpent), icon: Wallet, color: "text-purple-600", bg: "bg-purple-50", href: "/appointments?tab=completed" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name ?? "there"}</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your healthcare journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href}>
              <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
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
            <div className="space-y-1">
              <CardTitle>Next Appointment</CardTitle>
              <CardDescription>Your upcoming scheduled visit</CardDescription>
            </div>
            <Link href="/appointments">
              <div className="text-sm text-primary font-medium flex items-center hover:underline cursor-pointer">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </CardHeader>
          <CardContent>
            {summary.nextAppointment ? (
              <div className="mt-4 p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {summary.nextAppointment.doctorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{summary.nextAppointment.doctorName}</h4>
                    <p className="text-muted-foreground">{summary.nextAppointment.specialty}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 md:text-right">
                  <div className="flex items-center text-sm font-medium">
                    <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                    {formatDate(summary.nextAppointment.date)}
                  </div>
                  <div className="flex items-center text-sm font-medium text-muted-foreground md:justify-end">
                    <Clock className="w-4 h-4 mr-2" />
                    {summary.nextAppointment.time}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-8 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">You don't have any upcoming appointments.</p>
                <Link href="/doctors">
                  <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer">
                    Book an Appointment
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/doctors">
              <div className="w-full flex items-center p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-border transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Find a Doctor</h4>
                  <p className="text-xs text-muted-foreground">Book a new appointment</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            
            <Link href="/medical-history">
              <div className="w-full flex items-center p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-border transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Medical History</h4>
                  <p className="text-xs text-muted-foreground">View past visits & prescriptions</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

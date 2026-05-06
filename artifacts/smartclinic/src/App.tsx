import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Dashboard from "@/pages/dashboard";
import Doctors from "@/pages/doctors/index";
import DoctorDetail from "@/pages/doctors/[id]";
import Appointments from "@/pages/appointments";
import MedicalHistory from "@/pages/medical-history";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";

import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorSchedule from "@/pages/doctor/schedule";
import DoctorPatients from "@/pages/doctor/patients";

import ReceptionistDashboard from "@/pages/receptionist/dashboard";
import ReceptionistAppointments from "@/pages/receptionist/appointments";
import ReceptionistBook from "@/pages/receptionist/book";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminDoctors from "@/pages/admin/doctors";
import AdminAppointments from "@/pages/admin/appointments";

const queryClient = new QueryClient();

function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "doctor") return <Redirect to="/doctor" />;
  if (user?.role === "receptionist") return <Redirect to="/receptionist" />;
  if (user?.role === "admin") return <Redirect to="/admin" />;
  return <Dashboard />;
}

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={RoleHome} />

        {/* Patient routes */}
        <Route path="/doctors" component={Doctors} />
        <Route path="/doctors/:id" component={DoctorDetail} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/medical-history" component={MedicalHistory} />
        <Route path="/profile" component={Profile} />

        {/* Doctor routes */}
        <Route path="/doctor" component={DoctorDashboard} />
        <Route path="/doctor/schedule" component={DoctorSchedule} />
        <Route path="/doctor/patients" component={DoctorPatients} />

        {/* Receptionist routes */}
        <Route path="/receptionist" component={ReceptionistDashboard} />
        <Route path="/receptionist/appointments" component={ReceptionistAppointments} />
        <Route path="/receptionist/book" component={ReceptionistBook} />

        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/doctors" component={AdminDoctors} />
        <Route path="/admin/appointments" component={AdminAppointments} />

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">{user ? <Redirect to="/" /> : <Login />}</Route>
      <Route path="/register">{user ? <Redirect to="/" /> : <Register />}</Route>
      <Route><ProtectedRoutes /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

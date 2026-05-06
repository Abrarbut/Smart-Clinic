import { useState } from "react";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Stethoscope, CalendarDays, ClipboardList, User,
  LogOut, AlertCircle, Users, UserPlus, Shield, Clock, PhoneCall,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavItem { name: string; href: string; icon: React.ElementType; }

const PATIENT_NAV: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Find Doctors", href: "/doctors", icon: Stethoscope },
  { name: "My Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Medical History", href: "/medical-history", icon: ClipboardList },
  { name: "Profile", href: "/profile", icon: User },
];

const DOCTOR_NAV: NavItem[] = [
  { name: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { name: "My Schedule", href: "/doctor/schedule", icon: CalendarDays },
  { name: "Patient Records", href: "/doctor/patients", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
];

const RECEPTIONIST_NAV: NavItem[] = [
  { name: "Dashboard", href: "/receptionist", icon: LayoutDashboard },
  { name: "All Appointments", href: "/receptionist/appointments", icon: CalendarDays },
  { name: "Book Appointment", href: "/receptionist/book", icon: UserPlus },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Profile", href: "/profile", icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
];

const ROLE_CONFIG = {
  patient:      { nav: PATIENT_NAV,      badge: "bg-blue-100 text-blue-700",    label: "Patient",       icon: User,      accent: "hover:border-blue-200" },
  doctor:       { nav: DOCTOR_NAV,       badge: "bg-green-100 text-green-700",  label: "Doctor",        icon: Stethoscope, accent: "hover:border-green-200" },
  receptionist: { nav: RECEPTIONIST_NAV, badge: "bg-purple-100 text-purple-700",label: "Receptionist",  icon: PhoneCall,   accent: "hover:border-purple-200" },
  admin:        { nav: ADMIN_NAV,        badge: "bg-red-100 text-red-700",      label: "Administrator", icon: Shield,     accent: "hover:border-red-200" },
};

function isActiveHref(location: string, href: string): boolean {
  if (href === "/" || href === "/doctor" || href === "/receptionist" || href === "/admin") {
    return location === href;
  }
  return location.startsWith(href);
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const role = (user?.role ?? "patient") as keyof typeof ROLE_CONFIG;
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.patient;
  const { nav, badge, label } = config;

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleSignOut = async () => {
    setSignOutOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-sidebar-foreground">Smart Clinic</span>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${badge} w-fit`}>
            <Clock className="h-3.5 w-3.5" />
            {label} Portal
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-0.5">
          {nav.map(item => {
            const active = isActiveHref(location, item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}>
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center mb-3 px-2 gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">{user?.name ?? "Loading..."}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium w-fit mt-0.5 ${badge}`}>{label}</span>
            </div>
          </div>
          <button
            onClick={() => setSignOutOpen(true)}
            className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="h-full w-full max-w-6xl mx-auto p-6 md:p-8">{children}</div>
      </main>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of Smart Clinic?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Signed In</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

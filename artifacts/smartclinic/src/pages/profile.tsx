import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, MapPin, Calendar, Activity, Shield, Pencil, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type AuthUser, useAuth } from "@/context/AuthContext";

interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

interface PasswordDraft {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PROFILE_STORAGE_PREFIX = "smartclinic.profile";

const EMPTY_PASSWORD_DRAFT: PasswordDraft = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ROLE_LABELS: Record<AuthUser["role"], string> = {
  patient: "Patient",
  doctor: "Doctor",
  receptionist: "Receptionist",
  admin: "Admin",
};

const createDefaultProfile = (user: AuthUser | null): PatientProfile => ({
  name: user?.name ?? "SmartClinic User",
  email: user?.email ?? "user@example.com",
  phone: "+92 300 1234567",
  address: "124 Block D, Model Town, Lahore, Pakistan",
  dob: "14 March 1990 (34 years)",
  gender: "Male",
  bloodGroup: "O Positive (O+)",
  emergencyName: "Fatima Saleh",
  emergencyRelation: "Spouse",
  emergencyPhone: "+92 300 7654321",
});

const getStoredProfile = (storageKey: string, fallback: PatientProfile, user: AuthUser | null): PatientProfile => {
  const stored = localStorage.getItem(storageKey);
  const legacyStored = !stored ? localStorage.getItem(PROFILE_STORAGE_PREFIX) : null;
  const valueToParse = stored ?? legacyStored;

  if (!valueToParse) return fallback;

  try {
    const parsed = JSON.parse(valueToParse) as Partial<PatientProfile>;
    if (legacyStored && user && parsed.email !== user.email) {
      return fallback;
    }

    return { ...fallback, ...parsed };
  } catch {
    localStorage.removeItem(storageKey);
    return fallback;
  }
};

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const defaultProfile = useMemo(() => createDefaultProfile(user), [user]);
  const storageKey = user ? `${PROFILE_STORAGE_PREFIX}.${user.id}` : PROFILE_STORAGE_PREFIX;
  const profileRole = user ? ROLE_LABELS[user.role] : "Patient";

  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [draft, setDraft] = useState<PatientProfile>(defaultProfile);
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>(EMPTY_PASSWORD_DRAFT);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const nextProfile = getStoredProfile(storageKey, defaultProfile, user);
    setProfile(nextProfile);
    setDraft(nextProfile);
    setLoadedStorageKey(storageKey);
  }, [defaultProfile, storageKey, user]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(profile));
  }, [loadedStorageKey, profile, storageKey]);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const openEdit = () => {
    setDraft({ ...profile });
    setEditOpen(true);
  };

  const saveEdit = () => {
    const nextProfile = { ...draft };
    setProfile(nextProfile);
    localStorage.setItem(storageKey, JSON.stringify(nextProfile));
    setEditOpen(false);
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  const set = (field: keyof PatientProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const setPassword = (field: keyof PasswordDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const resetSecurityDialog = () => {
    setPasswordDraft(EMPTY_PASSWORD_DRAFT);
    setPasswordSaving(false);
  };

  const handleSecurityOpenChange = (open: boolean) => {
    setSecurityOpen(open);
    if (!open) resetSecurityDialog();
  };

  const savePassword = async () => {
    if (passwordDraft.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm password must match the new password.",
        variant: "destructive",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update password");
      }

      toast({ title: "Password updated", description: "Your security settings have been saved." });
      handleSecurityOpenChange(false);
    } catch (error) {
      toast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{profileRole} Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border shadow-sm text-center">
            <CardContent className="pt-8 pb-6">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground font-medium mb-6">
                {profileRole} ID: #SC-{String(user?.id ?? 9482).padStart(4, "0")}
              </p>
              <Button className="w-full" variant="outline" onClick={openEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-foreground break-all">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-foreground">{profile.phone}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="font-medium text-foreground">{profile.address}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Details</CardTitle>
              <Button size="sm" variant="ghost" onClick={openEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {profile.dob}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="font-medium">{profile.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                  <p className="font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-red-500" />
                    {profile.bloodGroup}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Emergency Contact</CardTitle>
              <Button size="sm" variant="ghost" onClick={openEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{profile.emergencyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Relationship</p>
                  <p className="font-medium">{profile.emergencyRelation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium">{profile.emergencyPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Privacy & Security</h4>
                  <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
                </div>
              </div>
              <Button variant="outline" className="bg-white" onClick={() => setSecurityOpen(true)}>
                Manage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" value={draft.name} onChange={set("name")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={draft.email} onChange={set("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={draft.phone} onChange={set("phone")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" value={draft.address} onChange={set("address")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input id="edit-dob" value={draft.dob} onChange={set("dob")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-gender">Gender</Label>
                <Input id="edit-gender" value={draft.gender} onChange={set("gender")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-blood">Blood Group</Label>
                <Input id="edit-blood" value={draft.bloodGroup} onChange={set("bloodGroup")} />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-3">Emergency Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-ename">Contact Name</Label>
                  <Input id="edit-ename" value={draft.emergencyName} onChange={set("emergencyName")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-erel">Relationship</Label>
                  <Input id="edit-erel" value={draft.emergencyRelation} onChange={set("emergencyRelation")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-ephone">Phone</Label>
                  <Input id="edit-ephone" value={draft.emergencyPhone} onChange={set("emergencyPhone")} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={securityOpen} onOpenChange={handleSecurityOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordDraft.currentPassword}
                onChange={setPassword("currentPassword")}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordDraft.newPassword}
                onChange={setPassword("newPassword")}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordDraft.confirmPassword}
                onChange={setPassword("confirmPassword")}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleSecurityOpenChange(false)} disabled={passwordSaving}>
              Cancel
            </Button>
            <Button onClick={savePassword} disabled={passwordSaving}>
              {passwordSaving ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useListDoctors } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/format";
import { Stethoscope, Search, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function AdminDoctors() {
  const [search, setSearch] = useState("");
  const { data: doctors, isLoading } = useListDoctors({});

  const filtered = (doctors ?? []).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
          <p className="text-muted-foreground mt-1">{doctors?.length ?? 0} doctors registered in the system.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Stethoscope className="h-4 w-4" /> {doctors?.length ?? 0} Doctors
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search doctors..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(doc => (
            <Card key={doc.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl shrink-0">
                    {doc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold truncate">{doc.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-0.5">{doc.specialty}</Badge>
                      </div>
                      <span className="font-bold text-primary text-sm shrink-0">{formatPKR(doc.fee)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{doc.qualification} · {doc.experience} yrs exp</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-3.5 w-3.5 fill-yellow-500" /> {doc.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> {doc.totalPatients.toLocaleString()} patients
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(doc.availableTimes ?? []).slice(0,3).map(t => (
                        <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                      ))}
                    </div>
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

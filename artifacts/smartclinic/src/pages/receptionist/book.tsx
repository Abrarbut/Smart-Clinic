import { useListDoctors } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/format";
import { Search, Stethoscope, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";

export default function ReceptionistBook() {
  const [search, setSearch] = useState("");
  const { data: doctors, isLoading } = useListDoctors({});

  const filtered = (doctors ?? []).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground mt-1">Select a doctor to schedule an appointment for a patient.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by doctor or specialty..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <Link key={doc.id} href={`/doctors/${doc.id}`}>
              <Card className="shadow-sm hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer border-border">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg shrink-0">
                      {doc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-0.5">{doc.specialty}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <p>{doc.qualification}</p>
                    <p>{doc.experience} years experience</p>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-3.5 w-3.5 fill-yellow-500" />
                      <span className="font-medium text-foreground">{doc.rating}</span>
                      <span>· {doc.totalPatients.toLocaleString()} patients</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-bold text-primary">{formatPKR(doc.fee)}</span>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Book Now <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-20 border border-dashed rounded-xl flex flex-col items-center">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No doctors match your search.</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useListDoctors, useListSpecialties, getListDoctorsQueryKey } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/format";
import { Search, Star, Stethoscope, Filter, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

export default function Doctors() {
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: specialties, isLoading: isLoadingSpecialties } = useListSpecialties();
  const { data: doctors, isLoading: isLoadingDoctors } = useListDoctors(
    { specialty: specialty === "all" ? undefined : specialty }, 
    { query: { queryKey: getListDoctorsQueryKey({ specialty: specialty === "all" ? undefined : specialty }) } }
  );

  const filteredDoctors = doctors?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
        <p className="text-muted-foreground mt-1">Book an appointment with our specialist doctors.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search doctors by name or specialty..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[240px]">
          <Select value={specialty || "all"} onValueChange={(val) => setSpecialty(val)}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Specialties" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties?.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(isLoadingDoctors || isLoadingSpecialties) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="border-t border-border p-4 bg-muted/30">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDoctors?.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-lg border-border">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No doctors found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          {(search || specialty !== "all") && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setSearch(""); setSpecialty("all"); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors?.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 text-primary">
                        {/* No real images, use initials */}
                        <span className="text-xl font-bold">{doctor.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-none">{doctor.name}</h3>
                        <p className="text-primary text-sm font-medium mt-1">{doctor.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500 mr-2 fill-yellow-500" />
                      <span className="font-medium text-foreground mr-1">{doctor.rating}</span>
                      <span>({doctor.totalPatients}+ patients)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {doctor.experience} Years Experience
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      <span className="truncate">{doctor.qualification}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border p-4 bg-muted/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Consultation Fee</span>
                    <span className="font-bold text-foreground">{formatPKR(doctor.fee)}</span>
                  </div>
                  <Link href={`/doctors/${doctor.id}`}>
                    <Button variant="default">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

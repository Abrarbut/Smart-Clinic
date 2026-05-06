import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetDoctor, useCreateAppointment, getListAppointmentsQueryKey, getGetDashboardSummaryQueryKey, getGetDoctorQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPKR, formatDate } from "@/lib/format";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import { Calendar as CalendarIcon, Clock, Star, Stethoscope, User, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Link } from "wouter";

const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please select a time slot.",
  }),
  reason: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function DoctorDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const doctorId = Number(id);

  const { data: doctor, isLoading, isError } = useGetDoctor(doctorId, { 
    query: { enabled: !isNaN(doctorId), queryKey: getGetDoctorQueryKey(doctorId) } 
  });

  const createAppointment = useCreateAppointment();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      reason: "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");

  const onSubmit = (data: BookingFormValues) => {
    if (!doctor) return;

    createAppointment.mutate({
      data: {
        doctorId: doctor.id,
        date: format(data.date, "yyyy-MM-dd"),
        time: data.time,
        reason: data.reason
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Appointment Confirmed",
          description: `Your appointment with ${doctor.name} has been booked successfully.`,
        });
        
        // Invalidate queries to refresh dashboard and appointments list
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        
        setLocation("/appointments");
      },
      onError: (err) => {
        const message =
          (err.data as { error?: string } | null)?.error ??
          err.message ??
          "There was a problem booking your appointment. Please try again.";
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: message,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Doctor not found</h3>
        <p className="text-muted-foreground mb-6">The doctor profile you're looking for doesn't exist or has been removed.</p>
        <Link href="/doctors">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/doctors">
        <div className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to all doctors
        </div>
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card className="overflow-hidden border-border shadow-sm">
            <div className="bg-primary/5 h-32 w-full"></div>
            <CardContent className="relative px-6 sm:px-8 pb-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-12 mb-6">
                <div className="h-32 w-32 rounded-xl bg-card border-4 border-card flex items-center justify-center text-primary text-4xl font-bold shadow-sm">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">{doctor.name}</h1>
                      <p className="text-primary font-medium text-lg">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-bold text-yellow-700">{doctor.rating}</span>
                      <span className="text-yellow-600 text-xs ml-1">({doctor.totalPatients}+)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-start space-x-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                    <p className="font-medium">{doctor.qualification}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p className="font-medium">{doctor.experience} Years</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-medium">Smart Clinic, Main Branch</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {doctor.name} is a highly qualified {doctor.specialty} with over {doctor.experience} years of clinical experience. 
                They specialize in providing comprehensive care and utilizing the latest medical advancements. 
                Patients appreciate their thorough approach, attentive listening, and dedication to successful treatment outcomes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <Card className="sticky top-6 shadow-md border-primary/20">
            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Select a date and time slot</CardDescription>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Consultation Fee</span>
                <span className="text-xl font-bold text-primary">{formatPKR(doctor.fee)}</span>
              </div>
            </CardHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label>1. Select Date</Label>
                  <div className="border border-border rounded-md p-1 bg-card flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        form.setValue("date", date as Date);
                        form.clearErrors("date");
                      }}
                      disabled={(date) => {
                        // Disable past dates and Sundays
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0;
                      }}
                      className="w-full"
                    />
                  </div>
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.date.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>2. Select Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {doctor.availableTimes.map((time) => (
                      <div
                        key={time}
                        onClick={() => {
                          form.setValue("time", time);
                          form.clearErrors("time");
                        }}
                        className={`cursor-pointer py-2 px-1 text-center rounded-md border text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-card border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.time && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.time.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="reason">3. Reason for Visit (Optional)</Label>
                  <Textarea 
                    id="reason"
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    className="resize-none h-20"
                    {...form.register("reason")}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 bg-muted/20 border-t border-border mt-4 flex-col">
                <div className="w-full mb-4 pt-4">
                  {selectedDate && selectedTime ? (
                    <div className="flex items-center text-sm font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {formatDate(format(selectedDate, "yyyy-MM-dd"))} at {selectedTime}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Please select date and time
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  disabled={createAppointment.isPending}
                >
                  {createAppointment.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

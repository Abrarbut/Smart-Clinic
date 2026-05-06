import { useListMedicalHistory } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { FileText, Pill, Stethoscope, CalendarDays, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function MedicalHistory() {
  const { data: history, isLoading } = useListMedicalHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
        <p className="text-muted-foreground mt-1">Review your past diagnoses and prescriptions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : history?.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-lg border-border bg-card">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No medical history</h3>
          <p className="text-muted-foreground mt-1">You don't have any past visits recorded yet.</p>
        </div>
      ) : (
        <Card className="border-border shadow-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {history?.map((record) => (
                <AccordionItem key={record.id} value={`item-${record.id}`} className="px-6 py-2 border-b last:border-b-0">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center w-full pr-4 text-left">
                      <div className="flex items-center mr-6 mb-2 sm:mb-0 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{record.doctorName}</p>
                          <p className="text-xs text-muted-foreground">{record.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          {formatDate(record.date)}
                        </div>
                        <Badge variant="outline" className="w-fit bg-slate-50 font-normal">
                          {record.diagnosis}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <div className="pl-14 space-y-4 pr-6">
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                        <h4 className="text-sm font-semibold flex items-center text-foreground mb-2">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Diagnosis & Notes
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {record.notes || "No additional notes provided for this visit."}
                        </p>
                      </div>

                      {record.prescription && (
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <h4 className="text-sm font-semibold flex items-center text-blue-800 mb-2">
                            <Pill className="h-4 w-4 mr-2 text-blue-600" />
                            Prescription
                          </h4>
                          <p className="text-sm text-blue-900/80 leading-relaxed whitespace-pre-line">
                            {record.prescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-center px-4">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-xl font-semibold text-foreground mb-2">Page Not Found</p>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>
          <Home className="h-4 w-4 mr-2" /> Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}

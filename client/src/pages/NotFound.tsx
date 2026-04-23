import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center p-8">
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            Página não encontrada
          </h1>
          <p className="text-muted-foreground max-w-sm">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Button onClick={() => setLocation("/")} size="lg">
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}

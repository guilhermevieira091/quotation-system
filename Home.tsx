import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/_core/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  TrendingUp,
  Users,
  MoreHorizontal,
  Trash2,
  Share2,
  Eye,
  ClipboardCopy,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  return (
    <DashboardLayout>
      <HomeContent />
    </DashboardLayout>
  );
}

function HomeContent() {
  const [, setLocation] = useLocation();
  const { data: budgets, isLoading } = trpc.budgets.list.useQuery();
  const { data: jobConfigs } = trpc.jobConfigs.list.useQuery();
  const deleteMutation = trpc.budgets.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      utils.budgets.list.invalidate();
      toast.success("Orçamento excluído com sucesso");
    } catch {
      toast.error("Erro ao excluir orçamento");
    }
  };

  const handleCopyShareLink = (shareLink: string) => {
    const url = `${window.location.origin}/share/${shareLink}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência");
  };

  const totalValue = budgets?.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  ) ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus orçamentos e configurações de cargo
          </p>
        </div>
        <Button
          onClick={() => setLocation("/create-budget")}
          className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo orçamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText className="h-5 w-5 text-[#1e3a8a]" />}
          label="Total de orçamentos"
          value={isLoading ? null : String(budgets?.length ?? 0)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-[#1e3a8a]" />}
          label="Valor total gerado"
          value={isLoading ? null : formatCurrency(totalValue)}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-[#1e3a8a]" />}
          label="Configurações de cargo"
          value={isLoading ? null : String(jobConfigs?.length ?? 0)}
        />
      </div>

      {/* Budgets table */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-base font-semibold"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Orçamentos recentes
            </CardTitle>
            {(budgets?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {budgets?.length} total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !budgets || budgets.length === 0 ? (
            <EmptyBudgets onNew={() => setLocation("/create-budget")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide pl-6">
                    Cliente
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CNPJ
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Qtd. Funcionários
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Valor Total
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Data
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide pr-6 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow
                    key={budget.id}
                    className="hover:bg-muted/30 transition-colors border-b border-border last:border-0"
                  >
                    <TableCell className="pl-6 font-medium text-sm">
                      {budget.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                      {budget.clientCNPJ ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {budget.quantity}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-[#1e3a8a] font-mono">
                        {formatCurrency(Number(budget.totalAmount))}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(budget.createdAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {budget.shareLink && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleCopyShareLink(budget.shareLink!)
                              }
                            >
                              <ClipboardCopy className="h-4 w-4 mr-2" />
                              Copiar link
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir orçamento?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O orçamento
                                  de{" "}
                                  <strong>{budget.clientName}</strong> será
                                  removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(budget.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </p>
            {value === null ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {value}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-[#1e3a8a]/8 p-2.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyBudgets({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Nenhum orçamento ainda
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Crie seu primeiro orçamento para um cliente. Você precisará de uma
        configuração de cargo cadastrada.
      </p>
      <Button
        onClick={onNew}
        size="sm"
        className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar orçamento
      </Button>
    </div>
  );
}

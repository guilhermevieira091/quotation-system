import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/_core/trpc";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  Calculator,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function CreateBudget() {
  return (
    <DashboardLayout>
      <CreateBudgetContent />
    </DashboardLayout>
  );
}

function CreateBudgetContent() {
  const [, setLocation] = useLocation();
  const { data: jobConfigs, isLoading: loadingConfigs } =
    trpc.jobConfigs.list.useQuery();

  const createMutation = trpc.budgets.create.useMutation();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    jobConfigurationId: "",
    clientName: "",
    clientCNPJ: "",
    clientAddress: "",
    quantity: "1",
  });

  const selectedConfig = useMemo(
    () =>
      jobConfigs?.find((c) => c.id === parseInt(form.jobConfigurationId)),
    [jobConfigs, form.jobConfigurationId]
  );

  const handleSubmit = async () => {
    if (!form.jobConfigurationId || !form.clientName || !form.quantity) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        jobConfigurationId: parseInt(form.jobConfigurationId),
        clientName: form.clientName,
        clientCNPJ: form.clientCNPJ || undefined,
        clientAddress: form.clientAddress || undefined,
        quantity: parseInt(form.quantity) || 1,
      });
      utils.budgets.list.invalidate();
      toast.success("Orçamento criado com sucesso!");
      setLocation("/");
    } catch (err) {
      toast.error("Erro ao criar orçamento");
    }
  };

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Novo orçamento
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para gerar a composição de custo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client info */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <Building2 className="h-4 w-4 text-[#1a7cc1]" />
                Dados do cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nome / Razão Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Ex: Condomínio Residencial Piemont"
                  value={form.clientName}
                  onChange={(e) => set("clientName")(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CNPJ
                  </Label>
                  <Input
                    placeholder="00.000.000/0001-00"
                    value={form.clientCNPJ}
                    onChange={(e) => set("clientCNPJ")(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Endereço
                  </Label>
                  <Input
                    placeholder="Rua, número, bairro"
                    value={form.clientAddress}
                    onChange={(e) => set("clientAddress")(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job config & quantity */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <Briefcase className="h-4 w-4 text-[#1a7cc1]" />
                Configuração de cargo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {loadingConfigs ? (
                <Skeleton className="h-10 w-full" />
              ) : !jobConfigs || jobConfigs.length === 0 ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Nenhum cargo cadastrado</p>
                    <p className="text-amber-700 mt-0.5">
                      Vá em{" "}
                      <button
                        className="underline font-medium"
                        onClick={() => setLocation("/settings")}
                      >
                        Configurações
                      </button>{" "}
                      para cadastrar um cargo antes de criar orçamentos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cargo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.jobConfigurationId}
                    onValueChange={set("jobConfigurationId")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobConfigs.map((config) => (
                        <SelectItem key={config.id} value={String(config.id)}>
                          <div className="flex flex-col">
                            <span>{config.jobName}</span>
                            <span className="text-xs text-muted-foreground">
                              {config.journeyType} •{" "}
                              {formatCurrency(Number(config.baseSalary))}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quantidade de funcionários <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    className="w-32"
                    value={form.quantity}
                    onChange={(e) => set("quantity")(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    funcionário(s)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar preview */}
        <div className="space-y-4">
          <Card className="border border-border shadow-sm sticky top-6">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <Calculator className="h-4 w-4 text-[#1a7cc1]" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {selectedConfig ? (
                <>
                  <SummaryRow
                    label="Cargo"
                    value={selectedConfig.jobName}
                  />
                  <SummaryRow
                    label="Jornada"
                    value={selectedConfig.journeyType}
                  />
                  <SummaryRow
                    label="Salário base"
                    value={formatCurrency(Number(selectedConfig.baseSalary))}
                    mono
                  />
                  <SummaryRow
                    label="Encargos"
                    value={`${selectedConfig.socialChargesPercentage}%`}
                  />
                  <SummaryRow
                    label="Qtd. funcionários"
                    value={form.quantity || "1"}
                  />
                  <Separator className="my-3" />
                  <p className="text-xs text-muted-foreground">
                    O valor total será calculado automaticamente ao confirmar.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Selecione um cargo para ver o resumo
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full bg-[#1a7cc1] hover:bg-[#1a7cc1]/90 text-white shadow-sm"
            onClick={handleSubmit}
            disabled={
              createMutation.isPending ||
              !form.jobConfigurationId ||
              !form.clientName
            }
          >
            {createMutation.isPending ? (
              "Gerando orçamento..."
            ) : (
              <>
                Gerar orçamento
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-medium text-right ${mono ? "font-mono text-[#1a7cc1]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/_core/trpc";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Settings2,
  Clock,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { JobConfiguration } from "@shared/types";

const JOURNEY_TYPES = ["6x1", "5x2", "12x36"];

type JobFormData = {
  jobName: string;
  jobType: string;
  journeyType: string;
  baseSalary: string;
  socialChargesPercentage: string;
  adminFeePercentage: string;
  taxPercentage: string;
  lifeInsurance: string;
  paf: string;
  basicBasket: string;
  uniforms: string;
  transportValue: string;
  foodValue: string;
  transportCoparticipationPercentage: string;
  foodCoparticipationPercentage: string;
};

const DEFAULT_FORM: JobFormData = {
  jobName: "",
  jobType: "",
  journeyType: "6x1",
  baseSalary: "",
  socialChargesPercentage: "81",
  adminFeePercentage: "5",
  taxPercentage: "20.44",
  lifeInsurance: "9.77",
  paf: "103.09",
  basicBasket: "200.00",
  uniforms: "75.00",
  transportValue: "26.00",
  foodValue: "31.34",
  transportCoparticipationPercentage: "6",
  foodCoparticipationPercentage: "20",
};

export default function Settings() {
  return (
    <DashboardLayout>
      <SettingsContent />
    </DashboardLayout>
  );
}

function SettingsContent() {
  const { data: jobConfigs, isLoading } = trpc.jobConfigs.list.useQuery();
  const createMutation = trpc.jobConfigs.create.useMutation();
  const updateMutation = trpc.jobConfigs.update.useMutation();
  const deleteMutation = trpc.jobConfigs.delete.useMutation();
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<JobConfiguration | null>(null);
  const [form, setForm] = useState<JobFormData>(DEFAULT_FORM);

  const set = (key: keyof JobFormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const openCreate = () => {
    setEditingConfig(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (config: JobConfiguration) => {
    setEditingConfig(config);
    setForm({
      jobName: config.jobName,
      jobType: config.jobType,
      journeyType: config.journeyType,
      baseSalary: String(config.baseSalary),
      socialChargesPercentage: String(config.socialChargesPercentage),
      adminFeePercentage: String(config.adminFeePercentage),
      taxPercentage: String(config.taxPercentage),
      lifeInsurance: String(config.lifeInsurance),
      paf: String(config.paf),
      basicBasket: String(config.basicBasket),
      uniforms: String(config.uniforms),
      transportValue: String(config.transportValue),
      foodValue: String(config.foodValue),
      transportCoparticipationPercentage: String(
        config.transportCoparticipationPercentage
      ),
      foodCoparticipationPercentage: String(config.foodCoparticipationPercentage),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.jobName || !form.baseSalary) {
      toast.error("Nome e salário base são obrigatórios");
      return;
    }
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: form,
        });
        toast.success("Cargo atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Cargo criado com sucesso");
      }
      utils.jobConfigs.list.invalidate();
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar configuração");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      utils.jobConfigs.list.invalidate();
      toast.success("Cargo excluído");
    } catch {
      toast.error("Erro ao excluir cargo");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os cargos e seus parâmetros de custo
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo cargo
        </Button>
      </div>

      {/* Job configs list */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-base font-semibold flex items-center gap-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Settings2 className="h-4 w-4 text-[#1e3a8a]" />
              Configurações de cargo
            </CardTitle>
            {(jobConfigs?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {jobConfigs?.length} cargo(s)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !jobConfigs || jobConfigs.length === 0 ? (
            <EmptyConfigs onNew={openCreate} />
          ) : (
            <div className="divide-y divide-border">
              {jobConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-start sm:items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="rounded-lg bg-[#1e3a8a]/8 p-2.5 shrink-0 mt-0.5 sm:mt-0">
                      <Briefcase className="h-4 w-4 text-[#1e3a8a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {config.jobName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(Number(config.baseSalary))}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {config.journeyType}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {config.taxPercentage}% tributos
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {config.adminFeePercentage}% adm
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEdit(config)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cargo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A configuração <strong>{config.jobName}</strong>{" "}
                            será removida. Orçamentos existentes não serão
                            afetados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(config.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Poppins, sans-serif" }}>
              {editingConfig ? "Editar cargo" : "Novo cargo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Basic info */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Identificação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">
                    Nome do cargo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Zelador 6x1"
                    value={form.jobName}
                    onChange={(e) => set("jobName")(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tipo</Label>
                  <Input
                    placeholder="Ex: zelador"
                    value={form.jobType}
                    onChange={(e) => set("jobType")(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Jornada</Label>
                  <Select
                    value={form.journeyType}
                    onValueChange={set("journeyType")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOURNEY_TYPES.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    Salário base (R$) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="2000.00"
                    value={form.baseSalary}
                    onChange={(e) => set("baseSalary")(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Percentages */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Percentuais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PercentField
                  label="Encargos Sociais (%)"
                  value={form.socialChargesPercentage}
                  onChange={set("socialChargesPercentage")}
                />
                <PercentField
                  label="Taxa de Adm. (%)"
                  value={form.adminFeePercentage}
                  onChange={set("adminFeePercentage")}
                />
                <PercentField
                  label="Tributos (%)"
                  value={form.taxPercentage}
                  onChange={set("taxPercentage")}
                />
              </div>
            </section>

            <Separator />

            {/* Fixed values */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valores fixos (R$)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MoneyField
                  label="Seguro de Vida"
                  value={form.lifeInsurance}
                  onChange={set("lifeInsurance")}
                />
                <MoneyField
                  label="PAF"
                  value={form.paf}
                  onChange={set("paf")}
                />
                <MoneyField
                  label="Cesta Básica"
                  value={form.basicBasket}
                  onChange={set("basicBasket")}
                />
                <MoneyField
                  label="Uniformes/EPI"
                  value={form.uniforms}
                  onChange={set("uniforms")}
                />
              </div>
            </section>

            <Separator />

            {/* Daily values */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valores diários (R$/dia)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MoneyField
                  label="Vale-Transporte"
                  value={form.transportValue}
                  onChange={set("transportValue")}
                />
                <MoneyField
                  label="Vale-Alimentação"
                  value={form.foodValue}
                  onChange={set("foodValue")}
                />
              </div>
            </section>

            <Separator />

            {/* Co-participation */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Coparticipação — descontos do funcionário
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PercentField
                  label="Transp. (% do salário)"
                  value={form.transportCoparticipationPercentage}
                  onChange={set("transportCoparticipationPercentage")}
                />
                <PercentField
                  label="Alimentação (% do vale)"
                  value={form.foodCoparticipationPercentage}
                  onChange={set("foodCoparticipationPercentage")}
                />
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
            >
              {isPending ? "Salvando..." : editingConfig ? "Salvar alterações" : "Criar cargo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function EmptyConfigs({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Briefcase className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Nenhum cargo cadastrado
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Crie configurações de cargo com salário, encargos e benefícios para
        gerar orçamentos.
      </p>
      <Button
        onClick={onNew}
        size="sm"
        className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar primeiro cargo
      </Button>
    </div>
  );
}

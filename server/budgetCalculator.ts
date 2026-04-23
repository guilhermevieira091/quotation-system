import { JobConfiguration } from "../drizzle/schema";
import Decimal from "decimal.js";

// Mapa de dias por tipo de jornada
const DAYS_PER_JOURNEY: Record<string, number> = {
  "6x1": 25,
  "5x2": 21,
  "12x36": 15,
};

export interface BudgetCalculation {
  montanteA: {
    label: string;
    salary: number;
    total: number;
  };
  montanteB: {
    label: string;
    percentage: number;
    base: number;
    total: number;
  };
  montanteC: {
    label: string;
    days: number;
    dailyValue: number;
    total: number;
  };
  montanteD: {
    items: Array<{ label: string; value: number }>;
    total: number;
  };
  montanteE: {
    label: string;
    value: number;
    total: number;
  };
  montanteF: {
    label: string;
    percentage: number;
    base: number;
    total: number;
  };
  montanteH: {
    label: string;
    percentage: number;
    base: number;
    total: number;
  };
  deductions: {
    transportCoparticipation: number;
    foodCoparticipation: number;
    total: number;
  };
  totalMontantes: number;
  finalTotal: number;
}

export function calculateBudget(
  config: JobConfiguration,
  quantity: number = 1
): BudgetCalculation {
  const d = (value: number | string) => new Decimal(value);

  // Montante A - Salários
  const montanteA = {
    label: "Salário",
    salary: Number(config.baseSalary),
    total: Number(config.baseSalary),
  };

  // Montante B - Encargos Sociais
  const socialCharges = d(config.baseSalary)
    .mul(config.socialChargesPercentage)
    .div(100);
  const montanteB = {
    label: "Encargos Sociais",
    percentage: Number(config.socialChargesPercentage),
    base: Number(config.baseSalary),
    total: Number(socialCharges),
  };

  // Montante C - Vale Transporte
  const daysPerMonth = DAYS_PER_JOURNEY[config.journeyType] || 25;
  const transportTotal = d(config.transportValue).mul(daysPerMonth);
  const montanteC = {
    label: "Vale-Transporte",
    days: daysPerMonth,
    dailyValue: Number(config.transportValue),
    total: Number(transportTotal),
  };

  // Montante D - Benefícios
  const foodDays = DAYS_PER_JOURNEY[config.journeyType] || 25;
  const foodTotal = d(config.foodValue).mul(foodDays);
  const montanteDTotal = d(config.lifeInsurance)
    .add(config.paf)
    .add(config.basicBasket)
    .add(foodTotal as any);
  const montanteD = {
    items: [
      { label: "Seguro de Vida", value: Number(config.lifeInsurance) },
      { label: "PAF", value: Number(config.paf) },
      { label: "Cesta Básica", value: Number(config.basicBasket) },
      { label: "Vale-Alimentação", value: Number(foodTotal) },
    ],
    total: Number(montanteDTotal),
  };

  // Montante E - Insumos
  const montanteE = {
    label: "Uniformes/EPI",
    value: Number(config.uniforms),
    total: Number(config.uniforms),
  };

  // Montante F - Taxa de Administração
  // Base: Salário + Encargos + Vale-Transporte + Benefícios + Insumos
  const adminBase = d(config.baseSalary)
    .add(socialCharges)
    .add(transportTotal)
    .add(montanteD.total)
    .add(config.uniforms);
  const adminFee = adminBase.mul(config.adminFeePercentage).div(100);
  const montanteF = {
    label: "Taxa de Administração",
    percentage: Number(config.adminFeePercentage),
    base: Number(adminBase),
    total: Number(adminFee),
  };

  // Coparticipações (Descontos)
  const transportCoparticipation = d(config.baseSalary)
    .mul(config.transportCoparticipationPercentage)
    .div(100);
  const foodCoparticipation = d(Number(foodTotal))
    .mul(config.foodCoparticipationPercentage)
    .div(100);

  // Montante H - Tributos
  // Base: Salário + Encargos + Vale-Transporte + Benefícios + Insumos + Taxa Adm + Coparticipações
  const taxBase = adminBase
    .add(adminFee)
    .add(transportCoparticipation as any)
    .add(foodCoparticipation as any);
  const taxes = taxBase.mul(config.taxPercentage).div(100);
  const montanteH = {
    label: "Tributos",
    percentage: Number(config.taxPercentage),
    base: Number(taxBase),
    total: Number(taxes),
  };

  // Total dos Montantes
  const totalMontantes = d(montanteA.total)
    .add(montanteB.total)
    .add(montanteC.total)
    .add(montanteD.total)
    .add(montanteE.total)
    .add(montanteF.total)
    .add(montanteH.total);

  // Descontos
  const totalDeductions = transportCoparticipation.add(foodCoparticipation);
  const deductions = {
    transportCoparticipation: Number(transportCoparticipation),
    foodCoparticipation: Number(foodCoparticipation),
    total: Number(totalDeductions),
  };

  // Total Final
  const finalTotal = totalMontantes.sub(deductions.total).mul(quantity);

  return {
    montanteA,
    montanteB,
    montanteC,
    montanteD,
    montanteE,
    montanteF,
    montanteH,
    deductions,
    totalMontantes: Number(totalMontantes),
    finalTotal: Number(finalTotal),
  };
}

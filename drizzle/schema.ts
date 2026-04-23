import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Configurações padrão por função
 */
export const jobConfigurations = mysqlTable("job_configurations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobName: varchar("jobName", { length: 255 }).notNull(), // ex: "Zelador 6x1", "Faxineira 5x2"
  jobType: varchar("jobType", { length: 100 }).notNull(), // ex: "zelador", "faxineira"
  journeyType: varchar("journeyType", { length: 50 }).notNull(), // "6x1", "5x2", "12x36"
  baseSalary: decimal("baseSalary", { precision: 10, scale: 2 }).notNull(),
  
  // Percentuais
  socialChargesPercentage: decimal("socialChargesPercentage", { precision: 5, scale: 2 }).notNull().default("81"),
  adminFeePercentage: decimal("adminFeePercentage", { precision: 5, scale: 2 }).notNull().default("5"),
  taxPercentage: decimal("taxPercentage", { precision: 5, scale: 2 }).notNull().default("20.44"),
  
  // Valores fixos
  lifeInsurance: decimal("lifeInsurance", { precision: 10, scale: 2 }).notNull().default("9.77"),
  paf: decimal("paf", { precision: 10, scale: 2 }).notNull().default("103.09"),
  basicBasket: decimal("basicBasket", { precision: 10, scale: 2 }).notNull().default("200.00"),
  uniforms: decimal("uniforms", { precision: 10, scale: 2 }).notNull().default("75.00"),
  
  // Valores por dia
  transportValue: decimal("transportValue", { precision: 10, scale: 2 }).notNull().default("26.00"),
  foodValue: decimal("foodValue", { precision: 10, scale: 2 }).notNull().default("31.34"),
  
  // Coparticipação (descontos)
  transportCoparticipationPercentage: decimal("transportCoparticipationPercentage", { precision: 5, scale: 2 }).notNull().default("6"),
  foodCoparticipationPercentage: decimal("foodCoparticipationPercentage", { precision: 5, scale: 2 }).notNull().default("20"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobConfiguration = typeof jobConfigurations.$inferSelect;
export type InsertJobConfiguration = typeof jobConfigurations.$inferInsert;

/**
 * Orçamentos gerados
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobConfigurationId: int("jobConfigurationId").notNull(),
  
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientCNPJ: varchar("clientCNPJ", { length: 20 }),
  clientAddress: text("clientAddress"),
  
  quantity: int("quantity").notNull().default(1), // Quantidade de funcionários
  
  // Valores calculados (armazenados para histórico)
  budgetData: json("budgetData").notNull(), // JSON com todos os cálculos
  
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  
  shareLink: varchar("shareLink", { length: 255 }).unique(), // Link único para compartilhamento
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculateBudget } from "./budgetCalculator";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jobConfigs: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getJobConfigurationsByUserId(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getJobConfigurationById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          jobName: z.string(),
          jobType: z.string(),
          journeyType: z.string(),
          baseSalary: z.string(),
          socialChargesPercentage: z.string().optional(),
          adminFeePercentage: z.string().optional(),
          taxPercentage: z.string().optional(),
          lifeInsurance: z.string().optional(),
          paf: z.string().optional(),
          basicBasket: z.string().optional(),
          uniforms: z.string().optional(),
          transportValue: z.string().optional(),
          foodValue: z.string().optional(),
          transportCoparticipationPercentage: z.string().optional(),
          foodCoparticipationPercentage: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createJobConfiguration({
          userId: ctx.user.id,
          ...input,
        })
      ),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            jobName: z.string().optional(),
            baseSalary: z.string().optional(),
            socialChargesPercentage: z.string().optional(),
            adminFeePercentage: z.string().optional(),
            taxPercentage: z.string().optional(),
            lifeInsurance: z.string().optional(),
            paf: z.string().optional(),
            basicBasket: z.string().optional(),
            uniforms: z.string().optional(),
            transportValue: z.string().optional(),
            foodValue: z.string().optional(),
            transportCoparticipationPercentage: z.string().optional(),
            foodCoparticipationPercentage: z.string().optional(),
          }),
        })
      )
      .mutation(({ input }) =>
        db.updateJobConfiguration(input.id, input.data)
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteJobConfiguration(input.id)),
  }),

  budgets: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getBudgetsByUserId(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getBudgetById(input.id)),
    getByShareLink: publicProcedure
      .input(z.object({ shareLink: z.string() }))
      .query(({ input }) => db.getBudgetByShareLink(input.shareLink)),
    create: protectedProcedure
      .input(
        z.object({
          jobConfigurationId: z.number(),
          clientName: z.string(),
          clientCNPJ: z.string().optional(),
          clientAddress: z.string().optional(),
          quantity: z.number().default(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const jobConfig = await db.getJobConfigurationById(
          input.jobConfigurationId
        );
        if (!jobConfig) throw new Error("Job configuration not found");

        const budgetData = calculateBudget(jobConfig, input.quantity);
        const shareLink = nanoid(12);

        return db.createBudget({
          userId: ctx.user.id,
          jobConfigurationId: input.jobConfigurationId,
          clientName: input.clientName,
          clientCNPJ: input.clientCNPJ,
          clientAddress: input.clientAddress,
          quantity: input.quantity,
          budgetData: JSON.stringify(budgetData),
          totalAmount: budgetData.finalTotal.toString(),
          shareLink,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteBudget(input.id)),
  }),
});

export type AppRouter = typeof appRouter;

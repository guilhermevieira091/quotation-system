import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT, jwtVerify } from "jose";

// Senha fixa do sistema - definida via variável de ambiente
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Keep2026";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "piemont-secret-key-2026"
);

// Usuário admin fixo (não precisa de banco)
export const ADMIN_USER = {
  id: 1,
  openId: "admin",
  name: "Administrador",
  email: "admin@piemont.com",
  loginMethod: "password",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createAdminSessionToken(): Promise<string> {
  return await new SignJWT({ openId: "admin", name: "Administrador" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1y")
    .sign(JWT_SECRET);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function registerAuthRoutes(app: Express) {
  // Login com senha
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Senha incorreta" });
      return;
    }

    const token = await createAdminSessionToken();
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ success: true });
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}

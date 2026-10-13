"use server";

import { redirect } from "next/navigation";
import { createSession, verifyPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export type LoginState = { message: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const user = await getPrismaClient().user.findUnique({ where: { email } });

  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/resources");
}

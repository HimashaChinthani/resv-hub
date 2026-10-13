"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export type RegisterState = { message: string };

export async function register(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!name || !email || !password) {
    return { message: "Complete every field." };
  }
  if (name.length > 100) {
    return { message: "Name must be 100 characters or fewer." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { message: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { message: "Password must be at least 8 characters." };
  }

  try {
    const prisma = getPrismaClient();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { message: "An account with this email already exists." };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: "USER",
      },
      select: { id: true },
    });

    await createSession(user.id);
  } catch (error) {
    console.error("Unable to register user.", error);
    return { message: "Unable to create the account. Please try again." };
  }

  redirect("/resources");
}

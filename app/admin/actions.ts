"use server";

import { revalidatePath } from "next/cache";
import { getPrismaClient } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type AdminActionState = { success: boolean; message: string };

export async function createResource(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const category = formData.get("category")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";

  if (!name || !category) {
    return { success: false, message: "Name and category are required." };
  }
  if (name.length > 120 || description.length > 500) {
    return { success: false, message: "Please keep the resource details within the field limits." };
  }

  try {
    await requireAdmin();
    await getPrismaClient().resource.create({
      data: { name, category, description: description || null },
    });
    revalidatePath("/resources");
    revalidatePath("/admin");
    return { success: true, message: "Resource added." };
  } catch (error) {
    console.error("Unable to create resource.", error);
    return { success: false, message: "Unable to add the resource. Please try again." };
  }
}

export async function toggleResource(
  formData: FormData,
): Promise<void> {
  const resourceId = formData.get("resourceId")?.toString().trim() ?? "";
  const isActive = formData.get("isActive") === "true";

  if (!resourceId) return;

  try {
    await requireAdmin();
    await getPrismaClient().resource.update({
      where: { id: resourceId },
      data: { isActive: !isActive },
    });
    revalidatePath("/resources");
    revalidatePath("/admin");
    return;
  } catch (error) {
    console.error("Unable to update resource.", error);
  }
}

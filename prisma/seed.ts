import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@resvhub.local" },
    update: { name: "ResvHub Admin", role: "ADMIN", passwordHash: hashPassword("Admin123!") },
    create: {
      name: "ResvHub Admin",
      email: "admin@resvhub.local",
      role: "ADMIN",
      passwordHash: hashPassword("Admin123!"),
    },
  });
  await prisma.user.upsert({
    where: { email: "user@resvhub.local" },
    update: { name: "Demo User", role: "USER", passwordHash: hashPassword("User123!") },
    create: {
      name: "Demo User",
      email: "user@resvhub.local",
      role: "USER",
      passwordHash: hashPassword("User123!"),
    },
  });

  const resources = [
    {
      name: "Orchid Meeting Room",
      category: "Meeting Room",
      description: "8-person room with display, whiteboard, and video conferencing.",
    },
    {
      name: "Focus Room",
      category: "Meeting Room",
      description: "Quiet 2-person room for interviews or focused collaboration.",
    },
    {
      name: "4K Projector",
      category: "Equipment",
      description: "Portable projector with HDMI and USB-C adapters.",
    },
    {
      name: "Company Van",
      category: "Vehicle",
      description: "Seven-seat vehicle for approved organization errands.",
    },
  ];

  for (const resource of resources) {
    const existingResource = await prisma.resource.findFirst({
      where: { name: resource.name },
    });

    if (existingResource) {
      await prisma.resource.update({
        where: { id: existingResource.id },
        data: resource,
      });
    } else {
      await prisma.resource.create({
        data: resource,
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });

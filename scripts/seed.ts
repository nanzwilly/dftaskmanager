import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/lib/schema";
import { hash } from "bcryptjs";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const passwordHash = await hash("admin123", 12);

  await db.insert(users).values({
    name: "Admin",
    email: "admin@taskmanager.com",
    passwordHash,
    role: "admin",
  });

  console.log("Admin user seeded successfully!");
  console.log("Email: admin@taskmanager.com");
  console.log("Password: admin123");
}

seed().catch(console.error);

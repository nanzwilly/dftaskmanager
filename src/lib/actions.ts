"use server";

import { db } from "./db";
import { users, tasks, invitations } from "./schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { createSession, getSession, logout as logoutSession } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ─── Auth Actions ───────────────────────────────────────────

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id, user.role);
  return { success: true, redirect: "/dashboard" };
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  if (!name || !email || !password || !token) {
    return { error: "All fields are required" };
  }

  const [invite] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (!invite || invite.accepted) {
    return { error: "Invalid or expired invitation" };
  }

  if (invite.email.toLowerCase() !== email.toLowerCase().trim()) {
    return { error: "Email does not match invitation" };
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "user",
    })
    .returning();

  await db
    .update(invitations)
    .set({ accepted: true })
    .where(eq(invitations.id, invite.id));

  await createSession(user.id, user.role);
  return { success: true, redirect: "/dashboard" };
}

export async function logoutAction() {
  await logoutSession();
  redirect("/login");
}

// ─── Task Actions ───────────────────────────────────────────

export async function createTaskAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const ownerId = formData.get("ownerId") as string;
  const status = formData.get("status") as "todo" | "in_progress" | "done" | null;

  if (!title) {
    return { error: "Title is required" };
  }

  await db.insert(tasks).values({
    title: title.trim(),
    description: description?.trim() || null,
    dueDate: dueDate ? new Date(dueDate) : null,
    ownerId: ownerId ? parseInt(ownerId) : null,
    createdBy: session.userId,
    status: status && ["todo", "in_progress", "done"].includes(status) ? status : "todo",
  });

  revalidatePath("/dashboard");
  return { success: true, redirect: "/dashboard" };
}

export async function updateTaskAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in" };
  }

  const id = parseInt(formData.get("id") as string);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "todo" | "in_progress" | "done";
  const dueDate = formData.get("dueDate") as string;
  const ownerId = formData.get("ownerId") as string;

  if (!title) {
    return { error: "Title is required" };
  }

  await db
    .update(tasks)
    .set({
      title: title.trim(),
      description: description?.trim() || null,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: ownerId ? parseInt(ownerId) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  revalidatePath("/dashboard");
  return { success: true, redirect: "/dashboard" };
}

export async function deleteTaskAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = parseInt(formData.get("id") as string);
  await db.delete(tasks).where(eq(tasks.id, id));

  revalidatePath("/dashboard");
}

// ─── Account Actions ────────────────────────────────────────

export async function changePasswordAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return { error: "User not found" };
  }

  const valid = await compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.id, session.userId));

  return { success: true };
}

// ─── Admin Actions ──────────────────────────────────────────

export async function inviteUserAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email is required" };
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing) {
    return { error: "A user with this email already exists" };
  }

  const token = crypto.randomBytes(32).toString("hex");

  await db.insert(invitations).values({
    email: email.toLowerCase().trim(),
    invitedBy: session.userId,
    token,
  });

  revalidatePath("/admin/users");
  return { success: true, token };
}

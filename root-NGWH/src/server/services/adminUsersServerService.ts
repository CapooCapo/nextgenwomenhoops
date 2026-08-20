import {
  findAllAdminUsers,
  findAdminUserByUsername,
  findAdminUserById,
  createAdminUser,
  updateAdminUserStatus,
  deleteAdminUser,
  hashAdminPassword,
} from "../repositories/adminUsersRepository";

export async function getAdminUsersList() {
  return await findAllAdminUsers();
}

export async function createSubadminUser(username: string, password?: string) {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { ok: false, status: 400, message: "Username must be at least 3 characters long" };
  }

  const existing = await findAdminUserByUsername(cleanUsername);
  if (existing) {
    return { ok: false, status: 400, message: "Username already exists" };
  }

  const defaultPassword = password || `subadmin_${Math.random().toString(36).substring(2, 8)}`;
  const passwordHash = hashAdminPassword(defaultPassword);

  const newUser = await createAdminUser({
    username: cleanUsername,
    password_hash: passwordHash,
    role: "subadmin",
    status: "active",
  });

  return {
    ok: true,
    status: 201,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      status: newUser.status,
      created_at: newUser.created_at,
    },
    generatedPassword: password ? undefined : defaultPassword,
  };
}

export async function toggleAdminUserStatus(id: number, status: "active" | "disabled") {
  const user = await findAdminUserById(id);
  if (!user) {
    return { ok: false, status: 404, message: "Admin user not found" };
  }

  if (user.role === "admin") {
    return { ok: false, status: 403, message: "Cannot disable primary admin account" };
  }

  const updated = await updateAdminUserStatus(id, status);
  if (!updated) {
    return { ok: false, status: 500, message: "Failed to update status" };
  }

  return { ok: true, status: 200, user: updated };
}

export async function removeAdminUser(id: number) {
  const user = await findAdminUserById(id);
  if (!user) {
    return { ok: false, status: 404, message: "Admin user not found" };
  }

  if (user.role === "admin") {
    return { ok: false, status: 403, message: "Cannot delete primary admin account" };
  }

  const deleted = await deleteAdminUser(id);
  if (!deleted) {
    return { ok: false, status: 500, message: "Failed to delete user" };
  }

  return { ok: true, status: 200 };
}

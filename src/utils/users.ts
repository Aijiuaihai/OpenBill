import type { LocalUser } from "../types/user";

export const normalizeUserName = (name: string): string =>
  name.trim().replace(/\s+/g, " ");

export const getUserNameKey = (name: string): string =>
  normalizeUserName(name).toLocaleLowerCase("zh-CN");

export const isDuplicateUserName = (
  users: LocalUser[],
  name: string,
  excludeUserId?: string,
): boolean => {
  const nextKey = getUserNameKey(name);
  return users.some(
    (user) => user.id !== excludeUserId && getUserNameKey(user.name) === nextKey,
  );
};

export const getUserDisplayName = (
  user: LocalUser,
  users: LocalUser[],
): string => {
  const sameNameCount = users.filter(
    (candidate) => getUserNameKey(candidate.name) === getUserNameKey(user.name),
  ).length;

  const suffix =
    sameNameCount > 1 ? ` · ${user.createdAt.slice(0, 10) || user.id.slice(0, 6)}` : "";

  return `${user.name}${user.kind === "guest" ? "（游客）" : ""}${suffix}`;
};

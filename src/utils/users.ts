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

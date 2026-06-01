import type { Transaction } from "../types/transaction";
import type { AppSettings, LocalUser } from "../types/user";
import type { OpenBillBackup } from "../types/backup";
import { invoke } from "@tauri-apps/api/core";
import { isDuplicateUserName } from "./users";

const LEGACY_TRANSACTIONS_KEY = "openbill_transactions";
const SETTINGS_KEY = "openbill_settings";
const USERS_KEY = "openbill_users";
const TRANSACTIONS_BY_USER_KEY = "openbill_transactions_by_user";

export const isTauriRuntime = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const getStorageBackend = (): "sqlite" | "localStorage" =>
  isTauriRuntime() ? "sqlite" : "localStorage";

const isTransaction = (value: unknown): value is Transaction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const transaction = value as Record<string, unknown>;
  return (
    typeof transaction.id === "string" &&
    typeof transaction.amount === "number" &&
    (transaction.type === "income" || transaction.type === "expense") &&
    typeof transaction.category === "string" &&
    typeof transaction.channel === "string" &&
    typeof transaction.date === "string" &&
    typeof transaction.createdAt === "string" &&
    typeof transaction.updatedAt === "string"
  );
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadLegacyTransactions = (): Transaction[] => {
  const parsed = readJson<unknown>(LEGACY_TRANSACTIONS_KEY, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isTransaction);
};

const loadTransactionsByUser = (): Record<string, Transaction[]> => {
  const parsed = readJson<unknown>(TRANSACTIONS_BY_USER_KEY, {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  const result: Record<string, Transaction[]> = {};
  for (const [userId, transactions] of Object.entries(parsed)) {
    if (Array.isArray(transactions)) {
      result[userId] = transactions.filter(isTransaction);
    }
  }

  return result;
};

const saveTransactionsByUser = (
  transactionsByUser: Record<string, Transaction[]>,
): void => {
  writeJson(TRANSACTIONS_BY_USER_KEY, transactionsByUser);
};

const invokeOrFallback = async <T>(
  command: string,
  args: Record<string, unknown>,
  fallback: () => T,
): Promise<T> => {
  if (!isTauriRuntime()) {
    return fallback();
  }

  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Tauri command failed: ${command}`, error);
    return fallback();
  }
};

export const loadSettings = async (): Promise<AppSettings> =>
  invokeOrFallback("load_settings", {}, () =>
    readJson<AppSettings>(SETTINGS_KEY, {}),
  );

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  if (isTauriRuntime()) {
    await invoke("save_settings", { settings });
    return;
  }

  writeJson(SETTINGS_KEY, settings);
};

const isLocalUser = (value: unknown): value is LocalUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    (user.kind === "guest" || user.kind === "local") &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string"
  );
};

const loadUsersFromLocalStorage = (): LocalUser[] => {
  const parsed = readJson<unknown>(USERS_KEY, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isLocalUser);
};

export const loadUsers = async (): Promise<LocalUser[]> =>
  invokeOrFallback("load_users", {}, loadUsersFromLocalStorage);

export const saveUsers = async (users: LocalUser[]): Promise<void> => {
  if (isTauriRuntime()) {
    await invoke("save_users", { users });
    return;
  }

  writeJson(USERS_KEY, users);
};

const loadTransactionsFromLocalStorage = (userId: string): Transaction[] => {
  const byUser = loadTransactionsByUser();
  const userTransactions = byUser[userId];

  if (userTransactions) {
    return userTransactions;
  }

  const legacyTransactions = loadLegacyTransactions();
  if (legacyTransactions.length > 0) {
    byUser[userId] = legacyTransactions;
    writeJson(TRANSACTIONS_BY_USER_KEY, byUser);
    return legacyTransactions;
  }

  return [];
};

export const loadTransactions = async (
  userId: string,
): Promise<Transaction[]> =>
  invokeOrFallback("load_transactions", { userId }, () =>
    loadTransactionsFromLocalStorage(userId),
  );

export const saveTransactions = async (
  userId: string,
  transactions: Transaction[],
): Promise<void> => {
  if (isTauriRuntime()) {
    await invoke("save_transactions", { userId, transactions });
    return;
  }

  const byUser = loadTransactionsByUser();
  byUser[userId] = transactions;
  writeJson(TRANSACTIONS_BY_USER_KEY, byUser);
};

export const clearActiveUser = async (): Promise<void> => {
  const settings = await loadSettings();
  saveSettings({
    ...settings,
    activeUserId: undefined,
  });
};

export const deleteUserData = async (userId: string): Promise<void> => {
  const users = loadUsersFromLocalStorage().filter((user) => user.id !== userId);
  const byUser = loadTransactionsByUser();
  delete byUser[userId];

  await saveUsers(users);
  writeJson(TRANSACTIONS_BY_USER_KEY, byUser);

  const settings = await loadSettings();
  if (settings.activeUserId === userId) {
    await saveSettings({
      ...settings,
      activeUserId: users[0]?.id,
    });
  }
};

const exportBackupFromLocalStorage = (): OpenBillBackup => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  settings: readJson<AppSettings>(SETTINGS_KEY, {}),
  users: loadUsersFromLocalStorage(),
  transactionsByUser: loadTransactionsByUser(),
});

export const exportBackup = async (): Promise<OpenBillBackup> =>
  invokeOrFallback("export_backup", {}, exportBackupFromLocalStorage);

export const importBackup = async (backup: OpenBillBackup): Promise<void> => {
  if (backup.version !== 1) {
    throw new Error("不支持的备份版本。");
  }

  for (const user of backup.users) {
    if (isDuplicateUserName(backup.users, user.name, user.id)) {
      throw new Error("备份中存在重复用户名称。");
    }
  }

  if (isTauriRuntime()) {
    await invoke("import_backup", { backup });
    return;
  }

  writeJson(SETTINGS_KEY, backup.settings);
  writeJson(USERS_KEY, backup.users);
  saveTransactionsByUser(backup.transactionsByUser);
};

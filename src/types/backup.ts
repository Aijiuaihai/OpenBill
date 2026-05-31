import type { Transaction } from "./transaction";
import type { AppSettings, LocalUser } from "./user";

export interface OpenBillBackup {
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  users: LocalUser[];
  transactionsByUser: Record<string, Transaction[]>;
}

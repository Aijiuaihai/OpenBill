export type StorageMode = "local" | "server";

export type UserKind = "guest" | "local";

export interface LocalUser {
  id: string;
  name: string;
  kind: UserKind;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  mode?: StorageMode;
  activeUserId?: string;
}

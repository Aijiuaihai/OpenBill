import { LogOut, Plus, Server, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import type { LocalUser } from "../types/user";
import { getUserDisplayName } from "../utils/users";

interface UserSwitcherProps {
  activeUser: LocalUser;
  users: LocalUser[];
  onSwitchUser: (userId: string) => void;
  onCreateUser: (name: string) => boolean;
  onDeleteUser: (userId: string) => void;
  onUseGuest: () => void;
  onOpenServerMode: () => void;
  error?: string;
}

export function UserSwitcher({
  activeUser,
  users,
  onSwitchUser,
  onCreateUser,
  onDeleteUser,
  onUseGuest,
  onOpenServerMode,
  error,
}: UserSwitcherProps) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const created = onCreateUser(trimmedName);
    if (created) {
      setName("");
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">当前用户</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              value={activeUser.id}
              onChange={(event) => onSwitchUser(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user, users)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">
              新建本地用户
            </span>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="用户名称"
              />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white transition hover:bg-teal-800"
                type="button"
                onClick={handleCreate}
                aria-label="创建本地用户"
                title="创建本地用户"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            {error ? (
              <span className="text-xs text-rose-700" role="alert">
                {error}
              </span>
            ) : null}
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onUseGuest}
          >
            <UserRound size={16} aria-hidden="true" />
            游客
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onOpenServerMode}
          >
            <Server size={16} aria-hidden="true" />
            服务器模式
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => onSwitchUser("")}
          >
            <LogOut size={16} aria-hidden="true" />
            重新选择
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            type="button"
            onClick={() => onDeleteUser(activeUser.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
            删除当前用户
          </button>
        </div>
      </div>
    </section>
  );
}

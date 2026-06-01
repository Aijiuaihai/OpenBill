import { Cloud, Laptop, Trash2, UserRound } from "lucide-react";
import type { LocalUser } from "../types/user";
import { getUserDisplayName } from "../utils/users";

interface ModeSelectionProps {
  users: LocalUser[];
  onSelectUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onUseGuest: () => void;
  onCreateUser: (name: string) => boolean;
  onSelectServerMode: () => void;
  error?: string;
}

export function ModeSelection({
  users,
  onSelectUser,
  onDeleteUser,
  onUseGuest,
  onCreateUser,
  onSelectServerMode,
  error,
}: ModeSelectionProps) {
  const handleCreateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (name) {
      const created = onCreateUser(name);
      if (created) {
        event.currentTarget.reset();
      }
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">OpenBill</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            请选择数据模式。本地模式会把账单保存到当前浏览器的 localStorage；
            服务器模式暂未接入后端，当前仅保留未来联网部署入口。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Laptop size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">本地模式</h2>
                <p className="text-sm text-slate-500">
                  无需登录，适合个人设备离线记账。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {users.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    选择已有用户
                  </p>
                  <div className="max-h-56 space-y-2 overflow-auto pr-1">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <button
                          className="min-w-0 flex-1 text-left text-sm font-medium text-slate-800 transition hover:text-teal-700"
                          type="button"
                          onClick={() => onSelectUser(user.id)}
                        >
                          <span className="block truncate">
                            {getUserDisplayName(user, users)}
                          </span>
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-700"
                          type="button"
                          onClick={() => onDeleteUser(user.id)}
                          aria-label={`删除用户 ${user.name}`}
                          title="删除用户"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-800"
                type="button"
                onClick={onUseGuest}
              >
                <UserRound size={18} aria-hidden="true" />
                以游客身份开始
              </button>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    创建本地用户
                  </span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    name="name"
                    placeholder="例如：我的账本"
                  />
                </label>
                <button
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  type="submit"
                >
                  创建并进入
                </button>
                {error ? (
                  <p className="text-sm text-rose-700" role="alert">
                    {error}
                  </p>
                ) : null}
              </form>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Cloud size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">服务器模式</h2>
                <p className="text-sm text-slate-500">
                  预留给未来后端、数据库、登录和多设备同步。
                </p>
              </div>
            </div>
            <button
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
              type="button"
              onClick={onSelectServerMode}
            >
              查看服务器模式占位
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

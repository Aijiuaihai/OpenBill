import { ArrowLeft, Database, Server } from "lucide-react";

interface ServerModePageProps {
  onBackToLocal: () => void;
}

export function ServerModePage({ onBackToLocal }: ServerModePageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Server size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              服务器模式
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              当前版本暂未连接后端服务，数据不会上传到服务器。
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 font-medium text-slate-800">
            <Database size={18} aria-hidden="true" />
            未来服务器版建议
          </div>
          <p className="text-sm leading-6 text-slate-600">
            可以按 `docs/database-design.md` 中的结构实现后端数据库：
            用户、账本、账单、分类、渠道和会话分表存储，并通过 API
            支持登录、多设备同步、导入账单和报表分析。
          </p>
        </div>

        <button
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800"
          type="button"
          onClick={onBackToLocal}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          返回本地模式
        </button>
      </section>
    </main>
  );
}

import { BarChart3, LayoutDashboard, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTools } from "./components/DataTools";
import { ModeSelection } from "./components/ModeSelection";
import { UserSwitcher } from "./components/UserSwitcher";
import { DashboardPage } from "./pages/DashboardPage";
import { ServerModePage } from "./pages/ServerModePage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import type { Transaction, TransactionDraft } from "./types/transaction";
import type { OpenBillBackup } from "./types/backup";
import type { AppSettings, LocalUser, StorageMode } from "./types/user";
import {
  exportBackup,
  getStorageBackend,
  importBackup,
  loadSettings,
  loadTransactions,
  loadUsers,
  saveSettings,
  saveTransactions,
  saveUsers,
} from "./utils/storage";

type Page = "dashboard" | "transactions" | "statistics";

const navigation: Array<{
  key: Page;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: "dashboard", label: "首页", icon: LayoutDashboard },
  { key: "transactions", label: "账单", icon: ReceiptText },
  { key: "statistics", label: "统计", icon: BarChart3 },
];

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [settings, setSettings] = useState<AppSettings>({});
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [isStoreReady, setIsStoreReady] = useState(false);

  const activeUser = useMemo(
    () => users.find((user) => user.id === settings.activeUserId) ?? null,
    [settings.activeUserId, users],
  );

  const mode: StorageMode | undefined = settings.mode;
  const storageBackend = getStorageBackend();

  const reloadStore = useCallback(async () => {
      const [storedSettings, storedUsers] = await Promise.all([
        loadSettings(),
        loadUsers(),
      ]);

      setSettings(storedSettings);
      setUsers(storedUsers);
      setIsStoreReady(true);
    }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeStore = async () => {
      await reloadStore();
      if (cancelled) {
        return;
      }
    };

    initializeStore();

    return () => {
      cancelled = true;
    };
  }, [reloadStore]);

  useEffect(() => {
    if (!isStoreReady) {
      return;
    }

    saveSettings(settings).catch((error) => {
      console.error("Failed to save settings", error);
    });
  }, [isStoreReady, settings]);

  useEffect(() => {
    if (!isStoreReady) {
      return;
    }

    saveUsers(users).catch((error) => {
      console.error("Failed to save users", error);
    });
  }, [isStoreReady, users]);

  useEffect(() => {
    let cancelled = false;

    if (!activeUser || mode !== "local") {
      setTransactions([]);
      setLoadedUserId(null);
      return undefined;
    }

    loadTransactions(activeUser.id)
      .then((storedTransactions) => {
        if (cancelled) {
          return;
        }

        setTransactions(storedTransactions);
        setLoadedUserId(activeUser.id);
      })
      .catch((error) => {
        console.error("Failed to load transactions", error);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUser, mode]);

  useEffect(() => {
    if (!activeUser || mode !== "local" || loadedUserId !== activeUser.id) {
      return;
    }

    saveTransactions(activeUser.id, transactions).catch((error) => {
      console.error("Failed to save transactions", error);
    });
  }, [activeUser, loadedUserId, mode, transactions]);

  const pageTitle = useMemo(() => {
    switch (page) {
      case "transactions":
        return "账单管理";
      case "statistics":
        return "统计分析";
      default:
        return "Dashboard";
    }
  }, [page]);

  const handleCreate = (draft: TransactionDraft) => {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...draft,
      id: createId(),
      createdAt: now,
      updatedAt: now,
    };
    setTransactions((current) => [transaction, ...current]);
  };

  const handleUpdate = (id: string, draft: TransactionDraft) => {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              ...draft,
              updatedAt: new Date().toISOString(),
            }
          : transaction,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    );
  };

  const activateLocalMode = (activeUserId: string) => {
    setSettings({
      mode: "local",
      activeUserId,
    });
    setPage("dashboard");
  };

  const createUser = (name: string, kind: LocalUser["kind"] = "local") => {
    const now = new Date().toISOString();
    const user: LocalUser = {
      id: createId(),
      name,
      kind,
      createdAt: now,
      updatedAt: now,
    };

    setUsers((current) => [...current, user]);
    activateLocalMode(user.id);
  };

  const useGuest = () => {
    const existingGuest = users.find((user) => user.kind === "guest");
    if (existingGuest) {
      activateLocalMode(existingGuest.id);
      return;
    }

    createUser("游客账本", "guest");
  };

  const switchUser = (userId: string) => {
    if (!userId) {
      setSettings({
        mode: "local",
        activeUserId: undefined,
      });
      return;
    }

    activateLocalMode(userId);
  };

  const handleImportBackup = async (backup: OpenBillBackup) => {
    await importBackup(backup);
    await reloadStore();
    const nextSettings = await loadSettings();
    if (nextSettings.activeUserId) {
      setTransactions(await loadTransactions(nextSettings.activeUserId));
      setLoadedUserId(nextSettings.activeUserId);
    }
  };

  if (mode === "server") {
    return (
      <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
        <ServerModePage
          onBackToLocal={() =>
            setSettings({
              mode: "local",
              activeUserId: activeUser?.id,
            })
          }
        />
      </div>
    );
  }

  if (!isStoreReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 text-slate-600">
        正在加载 OpenBill...
      </div>
    );
  }

  if (mode !== "local" || !activeUser) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
        <ModeSelection
          onUseGuest={useGuest}
          onCreateUser={(name) => createUser(name)}
          onSelectServerMode={() => setSettings({ mode: "server" })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              OpenBill
            </h1>
            <p className="mt-1 text-sm text-slate-500">{pageTitle}</p>
          </div>
          <nav className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;

              return (
                <button
                  key={item.key}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                  }`}
                  type="button"
                  onClick={() => setPage(item.key)}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <UserSwitcher
          activeUser={activeUser}
          users={users}
          onSwitchUser={switchUser}
          onCreateUser={(name) => createUser(name)}
          onUseGuest={useGuest}
          onOpenServerMode={() =>
            setSettings({
              mode: "server",
              activeUserId: activeUser.id,
            })
          }
        />
        <DataTools
          backend={storageBackend}
          onExport={exportBackup}
          onImport={handleImportBackup}
        />
        {page === "dashboard" ? (
          <DashboardPage
            transactions={transactions}
            onNavigateToTransactions={() => setPage("transactions")}
          />
        ) : null}
        {page === "transactions" ? (
          <TransactionsPage
            transactions={transactions}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : null}
        {page === "statistics" ? (
          <StatisticsPage transactions={transactions} />
        ) : null}
      </main>
    </div>
  );
}

export default App;

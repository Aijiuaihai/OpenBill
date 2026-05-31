import { Download, HardDrive, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { OpenBillBackup } from "../types/backup";

interface DataToolsProps {
  backend: "sqlite" | "localStorage";
  onExport: () => Promise<OpenBillBackup>;
  onImport: (backup: OpenBillBackup) => Promise<void>;
}

export function DataTools({ backend, onExport, onImport }: DataToolsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const backendLabel = backend === "sqlite" ? "SQLite 本地数据库" : "localStorage";

  const handleExport = async () => {
    try {
      const backup = await onExport();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `openbill-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("备份已导出。");
    } catch (error) {
      console.error(error);
      setMessage("导出失败，请稍后重试。");
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      const confirmed = window.confirm(
        "导入备份会覆盖当前本地数据，确认继续吗？",
      );
      if (!confirmed) {
        return;
      }

      const raw = await file.text();
      const backup = JSON.parse(raw) as OpenBillBackup;
      await onImport(backup);
      setMessage("备份已导入。");
    } catch (error) {
      console.error(error);
      setMessage("导入失败，请确认文件是 OpenBill 备份。");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <HardDrive size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900">
              当前存储：{backendLabel}
            </p>
            <p className="text-xs text-slate-500">
              定期导出备份，可在换设备或清理数据后恢复账本。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={handleExport}
          >
            <Download size={16} aria-hidden="true" />
            导出备份
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} aria-hidden="true" />
            导入备份
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
        </div>
      </div>
      {message ? <p className="mt-3 text-xs text-slate-500">{message}</p> : null}
    </section>
  );
}

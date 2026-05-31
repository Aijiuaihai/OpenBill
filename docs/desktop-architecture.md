# OpenBill 桌面模式架构

本分支用于把 OpenBill 从纯浏览器 MVP 演进为桌面应用，同时保留浏览器模式和未来服务器模式接口。

## 目标

- 浏览器模式继续可运行，数据仍保存在 localStorage。
- 桌面模式使用 Tauri 打包。
- Tauri 环境下本地模式使用 SQLite 文件持久化。
- 前端业务组件不直接关心底层存储，统一调用 `src/utils/storage.ts`。
- 服务器模式暂时仍是占位，未来可以在同一存储边界接入远程 API 和云同步。

## 当前存储策略

```text
React UI
  |
  v
src/utils/storage.ts
  |
  +-- Tauri runtime: invoke Rust commands -> SQLite
  |
  +-- Browser runtime: localStorage fallback
```

同一存储层还提供完整备份能力：

- `exportBackup()`：导出设置、用户和全部账单
- `importBackup()`：导入备份并覆盖当前本地数据

## SQLite 位置

Tauri 模式下数据库文件由后端写入系统应用数据目录：

```text
<app_data_dir>/openbill.sqlite3
```

Windows 上通常位于用户 AppData 目录下的 OpenBill 应用数据目录。具体路径由 Tauri `app.path().app_data_dir()` 决定，避免硬编码用户目录。

## SQLite 表

当前桌面版 SQLite 使用轻量表结构：

- `settings`：应用设置，例如当前模式和当前用户
- `users`：本地用户和游客账本
- `transactions`：账单记录，按 `user_id` 隔离

这套结构比服务器版数据库草案更轻，适合单机桌面使用。未来需要云同步时，可以将本地 SQLite 作为缓存或离线副本。

## 服务器模式保留方式

服务器模式当前不上传数据、不登录、不连接数据库。未来可以增加：

- `RemoteStorageProvider`
- 用户登录和 token 管理
- 本地变更队列
- 云端同步 API
- 冲突解决策略

建议保持前端继续依赖统一存储接口，不要让页面组件直接调用 Tauri command 或远程 API。

## 下一步建议

- 安装 Rust 和 MSVC Build Tools 后运行 `npm run tauri:dev`
- 在真实 Tauri 窗口中验证 SQLite 数据库读写
- 给备份导入增加 schema 校验和错误详情
- 增加数据导出 Excel
- 为云同步预留本地变更日志表

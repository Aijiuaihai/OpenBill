# OpenBill

OpenBill 是一个简洁、实用、可扩展的个人记账程序 MVP。当前主分支以前端单机版为主，支持本地模式、游客模式、本地用户档案、账单管理和基础统计。

当前 `codex/tauri-sqlite-local-mode` 分支正在向桌面应用演进：保留浏览器 localStorage 模式，同时在 Tauri 桌面环境下使用 SQLite 作为本地持久化存储。

## 当前数据存储

浏览器模式没有使用数据库，也没有后端服务。

本地模式的数据保存在浏览器 `localStorage` 中，主要 key 包括：

- `openbill_settings`：应用模式和当前用户
- `openbill_users`：本地用户和游客档案
- `openbill_transactions_by_user`：按用户 ID 隔离保存的账单数据
- `openbill_transactions`：旧版本账单 key，首次进入新版本时会迁移到当前用户

浏览器清理站点数据、更换浏览器或更换设备都会导致本地数据不可见。

Tauri 桌面模式下，本地模式会使用 SQLite 文件保存数据，数据库文件由 Tauri 写入系统应用数据目录，例如：

```text
<app_data_dir>/openbill.sqlite3
```

未来服务器模式可以按 `docs/database-design.md` 的结构接入云端数据库。

## 功能特性

- 本地模式：数据只保存在当前浏览器
- 服务器模式：暂未接入后端，预留未来联网部署入口
- 游客模式：无需创建用户也可以记账
- 本地用户档案：可创建多个本地用户，账单按用户隔离
- 新增收入和支出账单
- 编辑已有账单并自动更新修改时间
- 删除账单前确认
- 按类型、渠道、分类和日期范围筛选
- 最近日期账单优先展示
- Dashboard 展示本月收入、支出、结余、最近 5 条账单和渠道支出统计
- 统计页展示总览、渠道支出统计和分类支出统计
- 支持桌面端和移动端布局

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- localStorage
- Tauri
- SQLite

## 安装方法

```bash
npm install
```

## 本地运行方法

```bash
npm run dev
```

启动后按终端提示打开本地地址，通常是 `http://localhost:5173`。

## 桌面运行方法

桌面模式需要先安装 Rust 和 Tauri 依赖环境。

```bash
npm run tauri:dev
```

## 构建方法

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

桌面应用构建：

```bash
npm run tauri:build
```

## 项目目录结构

```text
docs/
  desktop-architecture.md
  database-design.md
src-tauri/
  Cargo.toml
  tauri.conf.json
  src/
    lib.rs
    main.rs
src/
  main.tsx
  App.tsx
  types/
    transaction.ts
    user.ts
  data/
    constants.ts
  utils/
    storage.ts
    statistics.ts
    format.ts
  components/
    ModeSelection.tsx
    UserSwitcher.tsx
    TransactionForm.tsx
    TransactionList.tsx
    TransactionItem.tsx
    SummaryCards.tsx
    FilterBar.tsx
    ChannelStats.tsx
    CategoryStats.tsx
  pages/
    DashboardPage.tsx
    TransactionsPage.tsx
    StatisticsPage.tsx
    ServerModePage.tsx
```

## 未来服务器模式设计

服务器模式未来可以扩展为：

- 用户注册和登录
- 后端数据库
- 多设备同步
- 游客数据迁移到正式账号
- 服务端账单导入和导出
- 权限控制和会话管理

桌面模式说明见 [docs/desktop-architecture.md](docs/desktop-architecture.md)。

服务器数据库草案见 [docs/database-design.md](docs/database-design.md)。

## 后续扩展方向

- 预算管理
- 月度报表
- 图表分析
- 导入微信账单
- 导入支付宝账单
- 信用卡还款提醒
- 数据导出 Excel
- 多设备同步
- 后端数据库
- 用户登录

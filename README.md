# OpenBill

OpenBill 是一个前端单机版个人记账程序 MVP。它使用浏览器 localStorage 保存数据，适合快速记录收入、支出、资金渠道，并查看本月和总体统计。

## 功能特性

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

## 安装方法

```bash
npm install
```

## 本地运行方法

```bash
npm run dev
```

启动后按终端提示打开本地地址，通常是 `http://localhost:5173`。

## 构建方法

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

## 项目目录结构

```text
src/
  main.tsx
  App.tsx
  types/
    transaction.ts
  data/
    constants.ts
  utils/
    storage.ts
    statistics.ts
    format.ts
  components/
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
```

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

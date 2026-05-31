# OpenBill 数据库设计草案

当前主分支 MVP 没有连接服务器数据库。本文件用于未来服务器模式实现时参考，推荐使用 PostgreSQL，也可以按同样结构迁移到 MySQL。

桌面分支的本地 SQLite 是单机持久化方案，表结构更轻，见 `docs/desktop-architecture.md`。

## 设计目标

- 支持用户登录和多设备同步
- 支持游客数据未来迁移到正式用户
- 支持一个用户拥有多个账本
- 支持分类、渠道、账单分表管理
- 支持后续预算、报表、导入账单和数据导出

## 核心表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(80) NOT NULL,
  password_hash TEXT,
  role VARCHAR(30) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'CNY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE channels (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(80) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, code)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(80) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type, code)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  category_name VARCHAR(80) NOT NULL,
  channel_name VARCHAR(80) NOT NULL,
  note TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_book_date ON transactions(book_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_channel ON transactions(user_id, channel_id);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
```

## 默认分类与渠道

服务器初始化时可以插入系统默认数据：

- 收入分类：工资、兼职、奖金、投资收益、退款、其他收入
- 支出分类：餐饮、交通、购物、娱乐、学习、医疗、住房、生活缴费、其他支出
- 渠道：支付宝、微信、信用卡、储蓄卡、现金、其他

`transactions` 表保留 `category_name` 和 `channel_name` 快照，避免用户重命名分类或渠道后历史账单显示变化。

## 游客数据迁移

当前前端游客模式数据保存在浏览器本地。未来服务器模式可提供“游客转正式用户”流程：

1. 用户在本地导出游客账本 JSON。
2. 登录或注册服务器账号。
3. 前端调用导入 API。
4. 服务端创建默认账本并批量写入 transactions。

## 暂不实现的内容

- 主分支浏览器 MVP 不连接数据库
- 当前 MVP 不实现后端 API
- 当前 MVP 不上传本地账单
- 当前服务器模式只是产品入口和技术预留

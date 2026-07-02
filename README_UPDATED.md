# 《摊聚》后端 MVP - NestJS 版本

这是《摊聚》项目的新一代后端架构，采用 NestJS + Prisma + PostgreSQL 技术栈，旨在提供高效、可扩展的微服务基础设施。

## 核心特性

本次升级实现了以下核心业务模块：

- **用户管理（User）**：用户注册、登录、信息管理
- **商品管理（Product）**：商品 CRUD、按商家查询
- **订单管理（Order）**：订单创建、查询、状态流转（PENDING_PAYMENT → PAID → PREPARING → READY → PICKED_UP → DELIVERED）
- **支付管理（Payment）**：支付创建、回调处理、状态管理
- **商家管理（Merchant）**：商家 CRUD、状态管理（OPEN/CLOSED）
- **配送管理（Delivery）**：配送单创建、骑手分配、状态更新
- **骑手管理（Rider）**：骑手信息管理
- **健康检查**：`/health`、`/health/ready`、`/health/live` 端点

## 技术栈

| 组件 | 版本 | 说明 |
| :--- | :--- | :--- |
| NestJS | ^11.0.1 | 企业级 Node.js 框架 |
| Prisma | ^7.8.0 | ORM 和数据库工具链 |
| PostgreSQL | 12+ | 关系型数据库 |
| TypeScript | ^5.7.3 | 类型安全的 JavaScript |
| Jest | ^30.0.0 | 单元测试框架 |

## 项目结构

```
src/
├── app.module.ts              # 应用主模块
├── app.controller.ts          # 应用控制器
├── app.service.ts             # 应用服务
├── main.ts                    # 应用入口
├── health/                    # 健康检查模块
│   ├── health.controller.ts
│   └── health.module.ts
└── modules/                   # 业务模块
    ├── user/                  # 用户模块
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   ├── user.module.ts
    │   └── dto/
    │       └── create-user.dto.ts
    ├── product/               # 商品模块
    │   ├── product.controller.ts
    │   ├── product.service.ts
    │   ├── product.module.ts
    │   └── dto/
    │       └── create-product.dto.ts
    ├── order/                 # 订单模块
    │   ├── order.controller.ts
    │   ├── order.service.ts
    │   ├── order.module.ts
    │   └── dto/
    │       └── create-order.dto.ts
    ├── payment/               # 支付模块
    │   ├── payment.controller.ts
    │   ├── payment.service.ts
    │   ├── payment.module.ts
    │   └── dto/
    │       └── create-payment.dto.ts
    ├── merchant/              # 商家模块
    │   ├── merchant.controller.ts
    │   ├── merchant.service.ts
    │   └── merchant.module.ts
    ├── delivery/              # 配送模块
    │   ├── delivery.controller.ts
    │   ├── delivery.service.ts
    │   └── delivery.module.ts
    ├── rider/                 # 骑手模块
    │   ├── rider.controller.ts
    │   ├── rider.service.ts
    │   └── rider.module.ts
    ├── cart/                  # 购物车模块（预留）
    │   └── cart.module.ts
    └── notification/          # 通知模块（预留）
        └── notification.module.ts

prisma/
└── schema.prisma              # 数据库模型定义
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tanju_mvp
JWT_SECRET=your-secret-key
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
pnpm run start:dev
```

应用将在 `http://localhost:3000` 启动。

## API 端点

### 健康检查

```bash
GET /health                    # 健康状态
GET /health/ready              # 就绪检查
GET /health/live               # 存活检查
```

### 用户管理

```bash
POST /api/users                # 创建用户
GET /api/users/:id             # 获取用户
GET /api/users/phone/:phone    # 按手机号查询用户
PUT /api/users/:id             # 更新用户
DELETE /api/users/:id          # 删除用户
```

### 商品管理

```bash
POST /api/products             # 创建商品
GET /api/products              # 获取商品列表
GET /api/products/:id          # 获取商品详情
GET /api/products/merchant/:merchantId  # 按商家查询商品
PUT /api/products/:id          # 更新商品
DELETE /api/products/:id       # 删除商品
```

### 订单管理

```bash
POST /api/orders               # 创建订单
GET /api/orders                # 获取订单列表
GET /api/orders/:id            # 获取订单详情
GET /api/orders/user/:userId   # 按用户查询订单
GET /api/orders/stats          # 订单统计
PUT /api/orders/:id/status     # 更新订单状态
PUT /api/orders/:id/cancel     # 取消订单
```

### 支付管理

```bash
POST /api/payments             # 创建支付
GET /api/payments/:id          # 获取支付详情
GET /api/payments/order/:mainOrderId  # 按订单查询支付
GET /api/payments/stats        # 支付统计
POST /api/payments/callback    # 支付回调处理
```

### 商家管理

```bash
POST /api/merchants            # 创建商家
GET /api/merchants             # 获取商家列表
GET /api/merchants/:id         # 获取商家详情
GET /api/merchants/stats       # 商家统计
PUT /api/merchants/:id         # 更新商家
PUT /api/merchants/:id/status  # 更新商家状态
DELETE /api/merchants/:id      # 删除商家
```

### 配送管理

```bash
POST /api/deliveries           # 创建配送单
GET /api/deliveries            # 获取配送列表
GET /api/deliveries/:id        # 获取配送详情
GET /api/deliveries/suborder/:subOrderId  # 按子订单查询
GET /api/deliveries/stats      # 配送统计
PUT /api/deliveries/:id/assign # 分配骑手
PUT /api/deliveries/:id/status # 更新配送状态
```

### 骑手管理

```bash
POST /api/riders               # 创建骑手
GET /api/riders                # 获取骑手列表
GET /api/riders/:id            # 获取骑手详情
GET /api/riders/stats          # 骑手统计
PUT /api/riders/:id            # 更新骑手
DELETE /api/riders/:id         # 删除骑手
```

## 数据库模型

### User（用户）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | Int | 主键 |
| phone | String | 手机号（唯一） |
| nickname | String | 昵称 |
| addresses | Address[] | 地址列表 |
| orders | MainOrder[] | 订单列表 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### MainOrder（主订单）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | Int | 主键 |
| orderNo | String | 订单号（唯一） |
| userId | Int | 用户 ID |
| totalAmount | Decimal | 总金额 |
| status | String | 订单状态 |
| subOrders | SubOrder[] | 子订单列表 |
| payment | Payment | 支付信息 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### SubOrder（子订单）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | Int | 主键 |
| subOrderNo | String | 子订单号（唯一） |
| mainOrderId | Int | 主订单 ID |
| merchantId | Int | 商家 ID |
| status | String | 订单状态 |
| delivery | Delivery | 配送信息 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Payment（支付）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | Int | 主键 |
| mainOrderId | Int | 订单 ID（唯一） |
| transactionId | String | 交易号（唯一） |
| amount | Decimal | 金额 |
| method | String | 支付方式（WECHAT/ALIPAY） |
| status | String | 支付状态（PENDING/SUCCESS/FAILED） |
| paidAt | DateTime | 支付时间 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

## 开发命令

```bash
# 启动开发服务器（监视模式）
pnpm run start:dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start:prod

# 运行单元测试
pnpm run test

# 运行测试覆盖率
pnpm run test:cov

# 运行 e2e 测试
pnpm run test:e2e

# 代码格式化
pnpm run format

# 代码检查
pnpm run lint
```

## 部署

### 使用 PM2

```bash
npm install -g pm2
pnpm run build
pm2 start dist/main.js --name "tanju-backend-mvp"
pm2 save
pm2 startup
```

### 使用 Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## 下一步改进计划

- [ ] 集成 Swagger/OpenAPI 自动文档生成
- [ ] 实现 JWT 认证和角色权限控制
- [ ] 添加请求日志和错误处理中间件
- [ ] 实现数据验证装饰器
- [ ] 集成 Redis 缓存
- [ ] 实现支付回调签名验证
- [ ] 添加单元测试和集成测试
- [ ] 实现 WebSocket 实时订单推送
- [ ] 优化数据库查询性能（索引、分页）
- [ ] 集成监控和告警系统

## 许可证

MIT

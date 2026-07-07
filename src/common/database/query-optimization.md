# 数据库查询优化指南

## 1. N+1 问题优化

### ❌ 错误示例
```typescript
// 这会导致 N+1 查询问题
const orders = await prisma.mainOrder.findMany();
for (const order of orders) {
  const user = await prisma.user.findUnique({
    where: { id: order.userId }
  });
  // 处理 user
}
```

### ✅ 正确示例
```typescript
// 使用 include 一次性加载关联数据
const orders = await prisma.mainOrder.findMany({
  include: {
    user: true,
    subOrders: {
      include: {
        merchant: true,
      }
    },
    payment: true,
  },
});
```

## 2. 分页优化

### ✅ 推荐做法
```typescript
const skip = (page - 1) * pageSize;
const [data, total] = await Promise.all([
  prisma.mainOrder.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.mainOrder.count(),
]);

return new PaginatedResponse(data, total, skip, pageSize);
```

## 3. 索引建议

### 必须建立的索引
```prisma
model User {
  id        Int       @id @default(autoincrement())
  phone     String    @unique  // ✅ 已有唯一索引
  email     String?   @unique  // ✅ 已有唯一索引
  @@index([createdAt])         // ❌ 建议添加
}

model MainOrder {
  id        Int       @id @default(autoincrement())
  orderNo   String    @unique  // ✅ 已有唯一索引
  userId    Int
  status    String
  createdAt DateTime  @default(now())
  
  @@index([userId])            // ❌ 建议添加
  @@index([status])            // ❌ 建议添加
  @@index([createdAt])         // ❌ 建议添加
}

model Merchant {
  id        Int       @id @default(autoincrement())
  stallNo   String    @unique  // ✅ 已有唯一索引
  status    String
  
  @@index([status])            // ❌ 建议添加
}
```

## 4. 聚合查询优化

### ❌ 低效做法
```typescript
// 分别查询，导致多次数据库往返
const totalRevenue = await prisma.mainOrder.aggregate({
  _sum: { totalAmount: true },
});
const totalOrders = await prisma.mainOrder.count();
```

### ✅ 高效做法
```typescript
// 使用 Promise.all 并行查询
const [revenue, count] = await Promise.all([
  prisma.mainOrder.aggregate({
    _sum: { totalAmount: true },
  }),
  prisma.mainOrder.count(),
]);
```

## 5. 字段选择优化

### ❌ 查询所有字段
```typescript
const users = await prisma.user.findMany();
// 即使只需要 id 和 nickname，也会加载所有字段
```

### ✅ 只选择需要的字段
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    nickname: true,
  },
});
```

## 6. 批量操作优化

### ❌ 循环插入
```typescript
for (const item of items) {
  await prisma.coupon.create({ data: item });
}
```

### ✅ 批量插入
```typescript
// Prisma 不支持原生 createMany，但可以使用事务
await prisma.$transaction(
  items.map(item => prisma.coupon.create({ data: item }))
);
```

## 7. 缓存策略

### 推荐缓存的数据
- 商户列表（变化不频繁）
- 优惠券列表（变化不频繁）
- 用户积分等级（变化较少）

### 不应缓存的数据
- 订单状态（实时性强）
- 用户余额（金融数据）
- 库存数量（库存数据）

## 8. 查询超时设置

```typescript
// 在 .env 中配置
DATABASE_QUERY_TIMEOUT=30000  // 30 秒超时

// 在 Prisma 中使用
const user = await prisma.user.findUnique({
  where: { id: 1 },
  // 超时会自动由 Prisma 处理
});
```

## 性能监控

### 记录慢查询
```typescript
// 在 LoggerService 中添加
logSlowQuery(query: string, duration: number) {
  if (duration > 1000) {  // 超过 1 秒
    this.warn('DATABASE', `Slow query detected: ${duration}ms`, { query });
  }
}
```

### 查询计数
```typescript
// 监控每个模块的查询数量
logQueryCount(model: string, count: number) {
  this.debug('DATABASE', `${model} queries: ${count}`);
}
```

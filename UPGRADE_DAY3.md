# 《摊聚》后端 MVP - 第三日升级总结

## 升级概述

本次升级从"UI/交互设计师"、"安全工程师"、"运营/销售"及"HR"等中观维度视角出发，实现了以下核心功能模块：

1. **JWT 认证系统** - 完整的用户认证、授权与会话管理
2. **RBAC 权限控制** - 基于角色的访问控制（Admin、Merchant、User、Rider）
3. **Swagger API 文档** - 自动化 API 文档生成与交互式测试
4. **优惠券系统** - 支持折扣券和满减券的营销工具
5. **通知系统** - 用户站内信与消息推送框架

## 数据库模型升级

### 新增字段（User 模型）
- `password` - 密码哈希（支持登录）
- `role` - 用户角色（USER/MERCHANT/RIDER/ADMIN）

### 新增字段（MainOrder 模型）
- `discountAmount` - 折扣金额
- `couponId` - 关联的优惠券

### 新增字段（Delivery 模型）
- `pickupTime` - 取货时间
- `deliveryTime` - 送达时间

### 新增模型

| 模型 | 用途 | 关键字段 |
| :--- | :--- | :--- |
| `Coupon` | 优惠券 | code, type, discountValue, minOrderAmount, quantity |
| `UserCoupon` | 用户优惠券 | userId, couponId, isUsed, usedAt |
| `Notification` | 通知 | userId, type, title, content, isRead |

## 新增模块详解

### 1. Auth 模块（认证与授权）

**核心功能：**
- 用户注册与登录
- JWT Token 生成与验证
- 角色管理与权限控制

**API 端点：**
```bash
POST   /api/auth/register                 # 用户注册
POST   /api/auth/login                    # 用户登录
GET    /api/auth/me                       # 获取当前用户信息（需要 JWT）
```

**认证流程：**
```
用户注册 → 密码哈希存储 → 用户登录 → 验证密码 → 生成 JWT Token → 前端保存 Token → 后续请求携带 Token
```

**RBAC 权限体系：**
- **USER** - 普通用户（可下单、评价）
- **MERCHANT** - 商户（可管理商品、订单、优惠券）
- **RIDER** - 骑手（可接单、配送）
- **ADMIN** - 管理员（可审批、数据统计）

**使用示例：**
```typescript
@Post('create-coupon')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MERCHANT')
async createCoupon(@Body() data: any) {
  // 仅 ADMIN 和 MERCHANT 可访问
}
```

### 2. Coupon 模块（优惠券系统）

**核心功能：**
- 优惠券创建与管理
- 用户领取与使用
- 折扣计算与库存管理

**优惠券类型：**
- **DISCOUNT** - 折扣券（如：8折）
- **FULL_REDUCTION** - 满减券（如：满 50 减 10）

**API 端点：**
```bash
POST   /api/coupons                       # 创建优惠券（仅管理员和商户）
GET    /api/coupons                       # 获取优惠券列表
POST   /api/coupons/claim/:couponCode     # 用户领取优惠券
POST   /api/coupons/use/:couponId         # 使用优惠券
GET    /api/coupons/my-coupons            # 获取我的优惠券
GET    /api/coupons/stats                 # 优惠券统计
```

**优惠券流程：**
```
商户创建优惠券 → 用户领取 → 下单时选择 → 系统计算折扣 → 订单金额减少 → 优惠券标记为已使用
```

**折扣计算示例：**
```
折扣券：原价 100 元，8折 → 最终 80 元
满减券：原价 100 元，满 50 减 10 → 最终 90 元
```

### 3. Notification 模块（通知系统）

**核心功能：**
- 通知创建与管理
- 已读/未读状态追踪
- 通知统计

**通知类型：**
- **ORDER_STATUS** - 订单状态更新
- **COUPON** - 优惠券相关
- **SYSTEM** - 系统公告

**API 端点：**
```bash
GET    /api/notifications/unread          # 获取未读通知
GET    /api/notifications                 # 获取所有通知
PUT    /api/notifications/:id/read        # 标记为已读
PUT    /api/notifications/read-all        # 全部标记为已读
DELETE /api/notifications/:id             # 删除通知
GET    /api/notifications/stats           # 通知统计
```

### 4. Swagger API 文档

**功能：**
- 自动生成 API 文档
- 交互式接口测试
- 参数验证与示例

**访问地址：**
```
http://localhost:3000/api/docs
```

**配置：**
```typescript
// 开发环境默认启用
// 生产环境需要设置 SWAGGER_ENABLED=true 才能启用

const config = new DocumentBuilder()
  .setTitle('摊聚 API')
  .setDescription('摊聚平台 API 文档')
  .setVersion('1.0.0')
  .addBearerAuth()  // 支持 JWT 认证
  .build();
```

## 安全性增强

### 1. 密码安全
- 使用 bcrypt 进行密码哈希（10 轮加盐）
- 登录时验证密码哈希匹配

### 2. JWT 认证
- Token 有效期 24 小时
- 支持 Bearer Token 认证
- 自动验证 Token 有效性

### 3. 权限控制
- 使用 `@Roles()` 装饰器限制接口访问
- 支持多角色权限组合
- 自动拦截无权限请求

### 4. 数据验证
- 集成 `class-validator` 装饰器
- 自动验证请求参数
- 返回详细的验证错误信息

## 运营工具

### 优惠券营销策略
- **新用户优惠** - 注册送优惠券
- **商户促销** - 商户创建专属优惠券
- **平台活动** - 管理员发放平台级优惠券
- **积分兑换** - 用户积分兑换优惠券（预留接口）

### 通知推送策略
- **订单提醒** - 订单状态变化时推送
- **优惠券推送** - 新优惠券发放时推送
- **系统公告** - 平台重要通知

## 前后端协作改进

### Swagger 文档优势
- **实时同步** - API 文档与代码同步更新
- **交互式测试** - 前端可直接在 Swagger 中测试接口
- **参数示例** - 清晰的请求/响应示例
- **认证支持** - 支持 JWT 认证测试

### 数据校验优势
- **前置验证** - 请求到达业务逻辑前进行验证
- **清晰错误** - 返回具体的字段验证错误
- **减少沟通** - 降低前后端沟通成本

## 下一步改进方向

- [ ] 集成 Redis 缓存（Session、Token 黑名单）
- [ ] 实现 OAuth2 社交登录
- [ ] 添加双因素认证 (2FA)
- [ ] 实现 WebSocket 实时通知推送
- [ ] 添加单元测试和集成测试
- [ ] 实现 API 速率限制 (Rate Limiting)
- [ ] 添加请求日志与性能监控
- [ ] 实现优惠券过期自动清理

## 技术栈更新

| 组件 | 用途 | 版本 |
| :--- | :--- | :--- |
| `@nestjs/jwt` | JWT 认证 | ^11.0.0 |
| `@nestjs/passport` | Passport 集成 | ^10.0.0 |
| `passport-jwt` | JWT 策略 | ^4.0.1 |
| `bcrypt` | 密码哈希 | ^5.1.1 |
| `@nestjs/swagger` | Swagger 文档 | ^7.0.0 |
| `class-validator` | 数据验证 | ^0.14.0 |
| `class-transformer` | 数据转换 | ^0.5.1 |

## 环境变量配置

```bash
# JWT 配置
JWT_SECRET=your-secret-key-change-in-production

# Swagger 配置
SWAGGER_ENABLED=true  # 生产环境下是否启用

# 应用配置
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

## 数据库迁移

```bash
# 生成迁移文件
npx prisma migrate dev --name add_auth_coupon_notification

# 应用迁移
npx prisma migrate deploy
```

## 性能考虑

- JWT Token 验证轻量级，无需数据库查询
- 优惠券使用时原子性操作，防止超卖
- 通知异步写入，不阻塞主业务
- 权限检查在中间件层进行，提前拦截

---

**升级完成时间**：2026-07-05 02:00 GMT+8
**升级范围**：认证系统 + 权限控制 + 优惠券 + 通知 + Swagger 文档
**代码行数增加**：~2500 行
**新增 API 端点**：20+ 个

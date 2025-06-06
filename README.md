# Supabase Next.js 模板

这是一个基于 Next.js 15 和 Supabase 构建的全栈应用模板，集成了用户认证、数据库管理和支付处理功能。

## 项目特点

- 🚀 **现代技术栈**：Next.js 15 + React 19 + TypeScript 5.8
- 🎨 **UI框架**：Tailwind CSS 4.1 + Shadcn UI 组件库
- 🔒 **认证系统**：Supabase Auth 认证与授权
- 💾 **数据存储**：Supabase PostgreSQL 数据库
- 💳 **支付集成**：Stripe 支付处理系统
- 🌐 **多语言支持**：基于 next-intl 的国际化
- 🔧 **开发体验**：ESLint + Biome + TypeScript 严格类型检查

## 快速开始

1. 克隆仓库并安装依赖

   ```bash
   git clone <repository-url>
   cd supabase-nextjs-template
   bun install
   ```

2. 配置环境变量

   ```bash
   cp .env.example .env.local
   ```

3. 编辑 `.env.local` 文件，添加必要的环境变量（详见下方环境变量配置部分）

4. 运行开发服务器

   ```bash
   bun dev
   ```

5. 构建生产版本

   ```bash
   bun build
   ```

## 功能模块

### 用户认证

使用 Supabase Auth 实现完整的用户认证流程，包括：

- 邮箱密码注册与登录
- 第三方登录集成（可选）
- 用户会话管理
- 权限控制

### 支付系统

集成了 Stripe 支付处理系统，提供多种支付功能：

- 一次性支付处理
- 订阅支付管理
- 商品购买流程
- 完整的支付测试环境

### 支付测试页面

访问 `/payments/test` 路径可以体验完整的支付测试功能：

1. **商品购买**：浏览商品、添加到购物车、结账支付
2. **一次性支付**：测试单次付款流程
3. **订阅支付**：测试订阅付款流程
4. **API测试**：测试401未授权响应

## 环境变量配置

确保在`.env.local`文件中添加以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 添加此行，用于RLS绕过

# Stripe配置
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key  # 必须添加此行用于前端Stripe Elements
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3200
```

- **Supabase密钥**：可在Supabase控制台的项目设置 > API > 项目API密钥中找到
- **Stripe密钥**：可在[Stripe Dashboard](https://dashboard.stripe.com/apikeys)的开发者 > API密钥页面找到

> ⚠️ 警告：服务角色密钥具有完全的数据库访问权限，可以绕过所有RLS策略。永远不要在客户端代码中使用它，只在安全的服务器端API路由中使用。

## Supabase 数据库迁移

项目使用Supabase进行数据库管理。要执行数据库迁移，可以使用以下方法：

### 方法一：使用Supabase CLI（推荐）

1. 确保已安装Supabase CLI

   ```bash
   # 检查是否已安装
   supabase --version
   
   # 安装CLI（如果未安装）
   brew install supabase/tap/supabase
   ```

2. 登录到你的Supabase账户

   ```bash
   supabase login
   ```

3. 链接到你的Supabase项目

   ```bash
   supabase link --project-ref your-project-ref
   ```

4. 执行迁移

   ```bash
   supabase db push
   ```

### 方法二：手动执行SQL

1. 登录到[Supabase控制台](https://app.supabase.com)
2. 选择你的项目
3. 导航到SQL编辑器
4. 打开`supabase/migrations`目录下的SQL文件
5. 复制SQL内容并在SQL编辑器中执行

### 故障排除

如果遇到`relation "public.stripe_customers" does not exist`等错误，请确保执行了所有迁移文件，特别是：

- `20231101_create_payments_table.sql`
- `20240801_create_polar_tables.sql`

## Stripe设置指南

要正确配置Stripe支付系统，请按照以下步骤操作：

1. 登录[Stripe Dashboard](https://dashboard.stripe.com/)
2. 确保你处于**测试模式**（页面右上角有"测试数据"标志）
3. 创建产品和价格：
   - 导航到**产品** > **添加产品**
   - 填写产品名称、描述等信息
   - 在**定价**部分，选择**经常性**（订阅）或**一次性**
   - 设置价格和计费周期（对于订阅）
   - 点击**保存产品**
4. 获取价格ID：
   - 在产品页面，找到你刚创建的价格
   - 点击**...** > **查看详情**
   - 复制以`price_`开头的**价格ID**
5. 使用此价格ID进行测试：
   - 将此ID粘贴到支付测试页面的**价格ID**字段中
   - 点击**订阅**按钮测试结账流程

### 测试卡信息

在测试模式下，使用以下测试卡信息：

- 卡号: `4242 4242 4242 4242`
- 到期日: 任何未来日期（例如12/34）
- CVC: 任意三位数（例如123）
- 姓名和地址: 任何信息

更多测试卡号，请参考[Stripe测试卡文档](https://stripe.com/docs/testing#cards)

## 开发指南

### 目录结构

```
src/
├── api/         # API路由和服务
├── app/         # 应用页面和路由
├── lib/         # 工具函数和服务
├── ui/          # UI组件
└── app.ts       # 应用配置
```

### 命令列表

| 命令 | 描述 |
|------|------|
| `bun dev` | 启动开发服务器 |
| `bun build` | 构建生产版本 |
| `bun check` | 运行类型检查和代码风格检查 |
| `bun ui` | 添加shadcn UI组件 |

## 贡献

欢迎提交PR或Issue来改进这个项目！

## 许可

MIT License

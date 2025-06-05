# 🏬 relivator • next.js ecommerce starter

[demo](https://relivator.com) — [sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [github](https://github.com/blefnk/relivator) — [docs](https://deepwiki.com/blefnk/relivator-nextjs-template)

> **relivator** is a robust ecommerce template built with next.js and other modern technologies. it's designed for developers who want a fast, modern, and scalable foundation without reinventing the backend.

## stack

1. 🧱 **core**: [nextjs 15.3](https://nextjs.org) + [react 19.1](https://react.dev) + [ts 5.8](https://typescriptlang.org)
2. 🎨 **ui**: [tailwind 4.1](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
3. 🔒 **auth**: [better-auth](https://better-auth.com)
4. 🎬 **anims**: [animejs](https://animejs.com)
5. 📦 **storage**: [uploadthing](https://uploadthing.com)
6. 📊 **analytics**: [vercel](https://vercel.com/docs/analytics)
7. 🧬 **db**: [drizzle-orm](https://orm.drizzle.team) ([pg](https://neon.tech/postgresql/tutorial)) + [neon](https://neon.tech)/(🤔🔜)[supabase](https://supabase.com)
8. 🏗️ **dx**: [eslint](https://eslint.org) + [biome](https://biomejs.dev) + [knip](https://knip.dev)
9. 📝 **forms**: [react-form](https://tanstack.com/form) _(🔜 w.i.p)_ + [arktype](https://arktype.io)
10. 📅 **tables**: [react-table](https://tanstack.com/table)
11. 🌐 **i18n**: [next-intl](https://next-intl.dev) _(🔜 w.i.p)_
12. 💌 **email**: [resend](https://resend.com) _(🔜 w.i.p)_
13. 💳 **payments**: [polar](https://polar.sh)
14. 🔑 **api**: [orpc](https://orpc.unnoq.com) _(🔜 w.i.p)_

> these features define the main reliverse stack. for an alternative setup—featuring clerk, stripe, trpc, and more—check out [versator](https://github.com/blefnk/versator).

## quick start

1. install [git](https://git-scm.com), [node.js](https://nodejs.org), [bun](https://bun.sh).
2. run:

   ```bash
   git clone https://github.com/blefnk/relivator.git
   cd relivator
   bun install
   copy .env.example .env
   ```

3. fill in the required environment variables in the `.env` file.
4. optionally, edit the `src/app.ts` file to make the app yours.
5. run:

   ```bash
   bun db:push # populate db with schema
   bun dev # start development server
   bun run build # build production version
   ```

6. edit something in the code manually or ask ai to help you.
7. done. seriously. you're building now.

<!-- 
2. run:
   ```bash
   bun i -g @reliverse/cli
   reliverse cli
   ```
3. select **"create a new project"**.
4. follow prompts to configure your store.
-->

### commands

| command         | description                    |
|-----------------|--------------------------------|
| `bun dev`       | start local development        |
| `bun build`     | create a production build      |
| `bun latest`    | install latest deps            |
| `bun ui`        | add shadcn components          |
| `bun db:push`   | apply db schema changes        |
| `bun db:auth`   | update auth-related tables     |
| `bun db:studio` | open visual db editor          |

## polar integration

relivator now integrates with [polar](https://polar.sh) for payment processing and subscription management.

### features

- checkout flow for subscription purchases
- customer portal for managing subscriptions
- webhook handling for subscription events
- automatic customer creation on signup
- integration with better-auth for seamless authentication

### setup instructions

1. create an account on [polar](https://polar.sh)
2. create an organization and get an organization access token
3. configure your environment variables in `.env`:

   ```
   POLAR_ACCESS_TOKEN="your_access_token"
   POLAR_WEBHOOK_SECRET="your_webhook_secret"
   POLAR_ENVIRONMENT="production" # or "sandbox" for testing
   ```

4. create products in the polar dashboard
5. update the product IDs in `src/lib/auth.ts` to match your polar products:

   ```typescript
   checkout: {
     enabled: true,
     products: [
       {
         productId: "your-product-id", // Replace with actual product ID from Polar Dashboard
         slug: "pro" // Custom slug for easy reference in Checkout URL
       }
     ]
   }
   ```

6. run `bun db:push` to create the necessary database tables
7. start the application with `bun dev`

### verification

to verify that the integration is working:

1. sign up for an account
2. navigate to the dashboard billing page (`/dashboard/billing`)
3. try subscribing to a plan
4. check that your subscription appears in the billing dashboard
5. test the customer portal by clicking "manage subscription"

### api routes

the following api routes are available for payment processing:

- `/api/payments/customer-state` - get the current customer state
- `/api/payments/subscriptions` - get user subscriptions

## notes

- relivator 1.4.0+ is ai-ready — optimized for ai-powered ides like cursor, making onboarding effortless even for beginners.
- version 1.3.0 evolved into versator, featuring [clerk](https://clerk.com) authentication and [stripe](https://stripe.com) payments. explore [versator demo](https://versator.relivator.com/en), [repo](https://github.com/blefnk/versator), or [docs](https://docs.reliverse.org/versator).

## stand with ukraine

- 💙 help fund drones, medkits, and victory.
- 💛 every dollar helps stop [russia's war crimes](https://war.ukraine.ua/russia-war-crimes) and saves lives.
- ‼️ please, [donate now](https://u24.gov.ua), it matters.

## stand with reliverse

- ⭐ [star the repo](https://github.com/blefnk/relivator) to help the reliverse community grow.
- 😉 follow this project's author, [nazar kornienko](https://github.com/blefnk) and his [reliverse](https://github.com/reliverse) ecosystem, to get updates about new projects faster.
- 🦄 [become a sponsor](https://github.com/sponsors/blefnk) and power the next wave of tools that _just feel right_.

> every bit of support helps keep the dream alive: dev tools that don't suck.

## license

mit © 2025 [nazar kornienko (blefnk)](https://github.com/blefnk), [reliverse](https://github.com/reliverse)

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

如果遇到`relation "public.polar_customers" does not exist`等错误，请确保执行了所有迁移文件，特别是：

- `20231101_create_payments_table.sql`
- `20240801_create_polar_tables.sql`

# 环境变量配置

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

服务角色密钥(`SUPABASE_SERVICE_ROLE_KEY`)可以在Supabase控制台的项目设置 > API > 项目API密钥中找到。

Stripe密钥可以在[Stripe Dashboard](https://dashboard.stripe.com/apikeys)的开发者 > API密钥页面找到。注意区分可发布密钥(Publishable key)和密钥(Secret key)。

> ⚠️ 警告：服务角色密钥具有完全的数据库访问权限，可以绕过所有RLS策略。永远不要在客户端代码中使用它，只在安全的服务器端API路由中使用。

# Stripe设置指南

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

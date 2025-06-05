# 从Drizzle ORM迁移到Supabase

本文档描述了如何将项目从使用Drizzle ORM迁移到完全使用Supabase的过程。

## 迁移概述

1. 移除Drizzle ORM相关依赖和配置
2. 创建Supabase表和存储桶
3. 实现Supabase服务层
4. 更新应用程序代码以使用Supabase服务

## 已完成的更改

### 1. 移除Drizzle ORM

- 从`package.json`中移除了`drizzle-orm`和`drizzle-kit`依赖
- 移除了与Drizzle相关的npm脚本（`db:push`、`db:studio`、`db:auth`）
- 移除了`drizzle.config.ts`配置文件

### 2. Supabase表结构

创建了以下表：

- `uploads` - 存储用户上传的媒体文件信息
- `polar_customers` - 存储支付客户信息
- `polar_subscriptions` - 存储订阅信息

详细的表结构和迁移SQL可以在`supabase-migration.sql`文件中找到。

### 3. Supabase服务层

创建了`src/lib/supabase/service.ts`文件，提供以下功能：

- 上传相关：
  - `getUserUploads` - 获取用户上传的文件
  - `createUpload` - 创建新的上传记录
  - `deleteUpload` - 删除上传记录
  - `uploadFile` - 上传文件到Supabase存储
  - `deleteFile` - 从Supabase存储中删除文件

- 支付相关：
  - `getCustomerByUserId` - 获取用户的客户信息
  - `createCustomer` - 创建新的客户记录
  - `getUserSubscriptions` - 获取用户的订阅信息
  - `createOrUpdateSubscription` - 创建或更新订阅记录

### 4. 更新应用程序代码

- 更新了API路由以使用Supabase服务
- 更新了类型导入，从Drizzle ORM类型改为Supabase服务类型
- 更新了查询函数以使用Supabase服务

## 如何使用

### 设置Supabase

1. 在Supabase控制台中创建必要的表和存储桶
   - 可以使用`supabase-migration.sql`文件中的SQL语句
   - 为上传文件创建一个名为`uploads`的存储桶

2. 配置存储桶权限
   - 确保已正确设置RLS（行级安全）策略
   - 为已认证用户配置适当的读写权限

### 使用Supabase服务

```typescript
// 示例：获取用户上传的文件
import { getUserUploads } from "~/lib/supabase/service";

async function fetchUserUploads(userId: string) {
  const uploads = await getUserUploads(userId);
  return uploads;
}

// 示例：上传文件
import { uploadFile, createUpload } from "~/lib/supabase/service";

async function handleFileUpload(file: File, userId: string) {
  // 上传文件到Supabase存储
  const { url, key } = await uploadFile(file);
  
  // 在数据库中创建记录
  await createUpload({
    key,
    type: "image",
    url,
    userId
  });
}
```

## 注意事项

1. 确保Supabase环境变量已正确设置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（用于管理员操作）

2. 对于需要管理员权限的操作，确保使用服务角色密钥并谨慎处理

3. 使用Supabase存储时，注意设置适当的CORS和安全策略

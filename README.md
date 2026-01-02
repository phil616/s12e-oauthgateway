# EdgeOne OAuth Gateway

<p align="center">
  <a href="https://github.com/dreamreflex/serverlesslize">
    <img src="https://img.shields.io/badge/dreamreflex-serverless-blue" width="150"></a>
</p>

一个基于 Next.js 的轻量级 OAuth 网关，专为 EdgeOne Serverless 环境设计。它能够为您的私有源站提供安全的身份验证保护，支持多域名管理、动态配置和零延迟缓存。

## 特性

*   **OAuth 2.0 集成**：支持 Google、GitHub 等标准 OIDC 提供商。
*   **多域名支持**：单个网关实例可同时保护多个不同的域名/子域名。
*   **动态配置**：通过 Admin 面板实时管理后端源站地址和访问白名单 (ACL)，无需重新部署。
*   **高性能缓存**：采用 **加密 Cookie 缓存** 机制，配置生效后零 KV 读写开销，极大降低延迟和成本。
*   **安全加固**：
    *   **JWE 加密**：敏感配置（源站地址、密钥）在客户端 Cookie 中使用 AES-256-GCM 加密存储。
    *   **Host Header 伪装**：支持自定义回源 Host 头，完美适配 Nginx Virtual Host。
    *   **Edge Key 验证**：支持向源站发送共享密钥 (`X-Edge-Key`)，防止源站被绕过。
*   **友好的 UI**：
    *   现代化的 Material UI 管理面板。
    *   全套静态化的错误提示页面（403 Forbidden, 502 Bad Gateway, Auth Required）。

## 工作机制

### 1. 请求拦截与认证
当用户访问受保护的域名（如 `app.example.com`）时：
1.  **Middleware 检查**：网关拦截所有请求。
2.  **未登录**：重定向至静态引导页 `/cgi-authorize/auth`，用户点击登录后跳转至 OAuth 提供商。
3.  **登录成功**：
    *   OAuth 回调验证用户信息。
    *   检查用户邮箱是否在当前域名的 ACL 白名单中。
    *   若通过，颁发加密的 Session Cookie (`auth_token`)。

### 2. 配置加载与缓存 (核心优化)
为了最大化性能并减少 KV 数据库的调用，网关采用了 **Cookie 优先** 的缓存策略：

1.  **首次访问 (KV -> Cookie)**：
    *   网关检查请求中是否包含有效的 `gw_config_cache` Cookie。
    *   如果不存在，网关从 EdgeOne KV 数据库读取当前域名的配置（源站地址、密钥等）。
    *   网关使用服务器端密钥 (`JWT_SECRET`) 将配置信息进行 **JWE 加密**。
    *   将加密后的配置写入用户的浏览器 Cookie (`gw_config_cache`)，有效期 24 小时。
2.  **后续访问 (Cookie Only)**：
    *   网关直接解密请求中的 `gw_config_cache` Cookie。
    *   **完全跳过 KV 查询**，实现毫秒级处理。
3.  **配置更新**：
    *   管理员在 Admin 面板更新配置后，KV 数据立即更新。
    *   由于用户端持有旧的 Cookie 缓存，配置不会立即对在线用户生效。
    *   **强制刷新**：用户需清除浏览器 Cookie 或等待 24 小时过期，才会重新拉取最新配置。

### 3. 反向代理
一旦认证通过并获取到配置，网关将充当透明代理：
1.  **构造请求**：
    *   目标 URL 替换为配置的 **Origin URL**。
    *   `Host` 头被设置为配置的 **Host Header** (如果未配置则使用 Origin 的 Host)。
    *   附加 `X-Forwarded-Host` 为原始请求域名。
    *   附加 `X-Edge-Key` (如果配置) 用于源站校验。
2.  **转发流量**：流式转发请求体和响应体，支持各种 HTTP 方法。
3.  **错误处理**：如果源站不可达，自动重定向至静态的 `/cgi-authorize/offline` 页面。

## 部署指南

### 环境变量
在 EdgeOne 或 `.env.local` 中配置：

```bash
# 身份验证
OAUTH_DISCOVERY_URL=https://accounts.google.com/.well-known/openid-configuration
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
REDIRECT_URI=https://your-gateway.com/cgi-authorize/callback

# 安全密钥 (用于 Session 和 Config 加密)
JWT_SECRET=your-256-bit-secret-key-base64-minimum-32-chars
ADMIN_SECRET=your-admin-panel-password

# KV 存储 (EdgeOne)
KV_API_URL=https://your-project.edgeone.app/api
KV_API_KEY=your-kv-api-key
```

### 管理面板
访问 `/cgi-authorize/admin`：
1.  输入 `ADMIN_SECRET` 和目标域名（如 `app.example.com`）。
2.  **Backend Configuration**：
    *   **Origin URL**: 实际的后端服务地址（如 `http://1.2.3.4:8080`）。
    *   **Host Header**: (可选) Nginx 虚拟主机名（如 `internal.app.local`）。
    *   **Edge Key**: (可选) 与源站约定的共享密钥。
3.  **Access Control**：添加允许访问的邮箱地址。

## 技术栈

*   **框架**: Next.js 14 (App Router)
*   **语言**: TypeScript
*   **UI 库**: Material UI (MUI) v6
*   **加密**: jose (JWT/JWE)
*   **部署**: Tencent Cloud EdgeOne / Vercel

## License

MIT

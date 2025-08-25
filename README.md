# API 网关代理服务

一个基于 Cloudflare Workers 构建的高性能反向代理服务，用于统一管理和转发到多个流行的 AI 和消息平台 API。

## 🌟 特性亮点

### 🔄 多平台支持
- **Discord** - `https://discord.com/api`
- **OpenAI** - `https://api.openai.com`  
- **Claude** - `https://api.anthropic.com`
- **Gemini** - `https://generativelanguage.googleapis.com`
- **Telegram** - `https://api.telegram.org`
- **Groq** - `https://api.groq.com/openai`
- **Cohere** - `https://api.cohere.ai`
- **HuggingFace** - `https://api-inference.huggingface.co`
- 以及更多...（共支持 15+ 个平台）

### 🛡️ 安全增强
- **请求头过滤**：只允许必要的 headers（accept, content-type, authorization）
- **安全响应头**：自动添加 X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **CORS 支持**：内置跨域访问控制
- **Host 头保护**：自动移除可能冲突的 Host 头

### ⚡ 高性能
- **边缘网络**：基于 Cloudflare 全球边缘节点，低延迟访问
- **无冷启动**：Worker 实例常驻内存，响应迅速
- **自动扩展**：无需担心流量激增，自动处理扩展

### 🎯 简单易用
- **统一入口**：所有 API 通过单一域名访问
- **路径映射**：直观的 URL 路径匹配规则
- **即插即用**：无需修改客户端代码

## 🚀 快速开始

### 基本使用

代理服务的 URL 结构为：
```
https://your-worker.domain.com/{service-prefix}/api-endpoint
```

**示例：**

```javascript
// 原来的 OpenAI 调用
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
})

// 使用代理后的调用
fetch('https://your-proxy.workers.dev/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key', 
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
})
```

### 支持的平台端点

| 服务 | 代理路径 | 原始端点 |
|------|----------|----------|
| OpenAI | `/openai/*` | `https://api.openai.com/*` |
| Claude | `/claude/*` | `https://api.anthropic.com/*` |
| Gemini | `/gemini/*` | `https://generativelanguage.googleapis.com/*` |
| Discord | `/discord/*` | `https://discord.com/api/*` |
| Telegram | `/telegram/*` | `https://api.telegram.org/*` |
| Groq | `/groq/*` | `https://api.groq.com/openai/*` |
| Cohere | `/cohere/*` | `https://api.cohere.ai/*` |

**完整列表参见代码中的 apiMapping 对象**

## 🔧 部署方法

### 方案一：Cloudflare Dashboard（最简单）

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 Workers & Pages → Create application → Create Worker
3. 复制提供的代码到编辑器
4. 点击 Deploy 部署
5. 获取你的 Worker URL（格式：`https://your-worker.your-subdomain.workers.dev`）

### 方案二：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建新项目
wrangler init api-gateway
cd api-gateway

# 替换 src/index.js 内容
# 部署到 Cloudflare
wrangler deploy
```

### 方案三：绑定自定义域名

1. 在 Worker 设置中选择 Triggers
2. 添加 Custom Domain
3. 输入你的域名（如：`api.yourdomain.com`）
4. 按照提示配置 DNS

## 📋 使用示例

### JavaScript/TypeScript 客户端

```javascript
const API_BASE = 'https://your-proxy.workers.dev';

// OpenAI 调用
async function chatWithGPT(message) {
  const response = await fetch(`${API_BASE}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    })
  });
  return response.json();
}

// Discord Bot 调用
async function getDiscordUser() {
  const response = await fetch(`${API_BASE}/discord/users/@me`, {
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
    }
  });
  return response.json();
}
```

### Python 客户端

```python
import requests

API_BASE = "https://your-proxy.workers.dev"

# Claude API 调用
def call_claude(prompt):
    response = requests.post(
        f"{API_BASE}/claude/v1/messages",
        headers={
            "Authorization": f"Bearer {os.getenv('CLAUDE_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "claude-3-sonnet-20240229",
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    return response.json()
```

### cURL 示例

```bash
# 测试服务状态
curl https://your-proxy.workers.dev/

# OpenAI 调用
curl https://your-proxy.workers.dev/openai/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# 获取 Discord 用户信息
curl https://your-proxy.workers.dev/discord/users/@me \
  -H "Authorization: Bot $DISCORD_TOKEN"
```

## ⚙️ 高级配置

### 环境变量配置

Worker 支持环境变量用于配置：

```javascript
// 在 Worker 设置中添加环境变量
const CUSTOM_MAPPING = {
  '/my-custom-api': env.CUSTOM_API_URL
};

// 合并到默认映射
const finalMapping = { ...apiMapping, ...CUSTOM_MAPPING };
```

### 自定义路由规则

你可以修改 `extractPrefixAndRest` 函数来实现自定义路由逻辑：

```javascript
function extractPrefixAndRest(pathname, prefixes) {
  // 自定义路由逻辑示例
  if (pathname.startsWith('/v1/')) {
    return ['/v1/', pathname.slice(4)];
  }
  
  // 默认逻辑
  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix)) {
      return [prefix, pathname.slice(prefix.length)];
    }
  }
  return [null, null];
}
```

## 🛠️ 故障排除

### 常见问题

1. **CORS 错误**：确保客户端正确设置请求头
2. **404 错误**：检查代理路径是否正确匹配
3. **认证失败**：确认 API Key 正确传递
4. **超时问题**：Worker 默认超时时间为 10-30 秒

### 调试模式

添加调试信息到响应头：

```javascript
responseHeaders.set('X-Proxy-Target', targetUrl);
responseHeaders.set('X-Proxy-Service', prefix);
```

## 📊 监控和日志

Cloudflare Workers 提供内置的：
- **实时日志**：在 Dashboard 查看请求日志
- ** analytics**：流量分析和性能监控
- **错误追踪**：自动错误报告和追踪

## 🎯 最佳实践

1. **API Key 管理**：始终在服务器端处理敏感信息
2. **速率限制**：在客户端实现适当的重试机制
3. **错误处理**：处理各种 HTTP 状态码
4. **缓存策略**：对频繁请求的数据添加缓存

## 📝 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来：
- 添加新的 API 服务支持
- 改进安全特性
- 优化性能
- 修复 bug

---

**开始使用：** 只需部署 Worker，然后通过统一的入口访问所有支持的 API 服务！

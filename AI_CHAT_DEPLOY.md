# 🚀 AI聊天功能部署指南

## 📋 功能说明

网站已集成阿里云百炼对话功能：
- ✅ AI数字分身已预设完整人设
- ✅ API密钥安全保护（服务器端存储）
- ✅ 限流保护（每小时10次请求）
- ✅ 使用量监控（自动记录日志）

---

## 🔧 部署步骤

### 1. 获取阿里云百炼 API密钥

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录账号
3. 进入"API-KEY管理"页面
4. 创建新的API密钥
5. **复制密钥**（格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`）

---

### 2. 在Vercel中配置环境变量

#### 方法一：通过Vercel Dashboard（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **Settings** → **Environment Variables**
4. 添加新环境变量：
   - **Key**: `DASHSCOPE_API_KEY`
   - **Value**: 你的阿里云百炼API密钥
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全部勾选）
5. 点击 **Save**

#### 方法二：通过Vercel CLI

```bash
# 安装Vercel CLI（如果还没安装）
npm i -g vercel

# 登录Vercel
vercel login

# 设置环境变量
vercel env add DASHSCOPE_API_KEY

# 部署
vercel --prod
```

---

### 3. 部署项目

```bash
# 提交代码到Git
git add .
git commit -m "feat: 添加阿里云百炼聊天功能"
git push

# Vercel会自动部署，或者手动触发
# 在Vercel Dashboard点击 "Redeploy"
```

---

## 🎯 功能特性

### ✨ 安全特性
- API密钥只存在服务器端
- 用户无法查看或修改System Prompt
- 限流保护防止滥用

### 📊 监控功能
- 每次请求自动记录：
  - 时间戳
  - 客户端IP
  - 响应时间
  - Token使用量

查看日志：
```bash
# Vercel Dashboard → 项目 → Functions → /api/chat → Logs
```

### 🚦 限流规则
- 每个 IP 地址每小时最多 10 次请求
- 超过限制会返回友好提示

---

## 💰 成本说明

### 阿里云百炼价格（qwen3-max-2026-01-23）
- **输入**: ¥0.02 / 千tokens
- **输出**: ¥0.06 / 千tokens

### 预估成本
- 假设每次对话使用 500 tokens
- 100 次对话 ≈ ¥0.15
- 1000 次对话 ≈ ¥1.5

### 省钱技巧
- 使用 `qwen3-max-2026-01-23` 模型（已配置）
- 设置 `max_tokens: 500` 限制回复长度
- 限流保护防止滥用

---

## 🧪 测试功能

### 本地测试（需要环境变量）

1. 安装依赖：
```bash
npm install
```

2. 创建 `.env.local` 文件：
```bash
DASHSCOPE_API_KEY=你的API密钥
```

3. 启动开发服务器：
```bash
npm run dev
# 或
vercel dev
```

4. 访问 `http://localhost:3000` 测试聊天功能

### 在线测试

部署后直接访问你的Vercel网址即可测试。

---

## ⚠️ 常见问题

### Q: API调用失败，提示"服务配置错误"
**A:** 检查环境变量是否正确设置，确保 `DASHSCOPE_API_KEY` 已配置。

### Q: 提示"请求过于频繁"
**A:** 这是限流保护在起作用，等待1小时后重试。可以在 `api/chat.js` 中调整限制次数。

### Q: AI回复很慢
**A:**
- 使用 `qwen3-max-2026-01-23` 模型（已配置）
- 考虑降低 `max_tokens` 值
- 检查网络状况

### Q: 如何查看使用量？
**A:** 在Vercel Dashboard查看函数日志，每次调用会记录token使用量。

### Q: 如何修改AI人设？
**A:** 编辑 `api/chat.js` 文件中的 `SYSTEM_PROMPT` 常量，然后重新部署。

---

## 📝 后续优化建议

- [ ] 添加对话历史保存（使用数据库）
- [ ] 实现流式响应（打字机效果）
- [ ] 添加多轮对话记忆
- [ ] 接入其他AI模型（如GPT-4）
- [ ] 添加使用统计Dashboard

---

## 📞 技术支持

如有问题，可以：
1. 查看 Vercel 函数日志
2. 检查阿里云百炼控制台的调用记录
3. 联系开发者（Lulu）

---

**用 ❤️ 和 AI 辅助编程完成**

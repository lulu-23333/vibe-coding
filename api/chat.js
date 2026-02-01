// 阿里云百炼聊天API接口
// 限流：每个IP每小时最多10次请求

// System Prompt - AI人设（服务器端，用户无法看到）
const SYSTEM_PROMPT = `你是Lulu的AI数字分身，一个热爱阅读、研究中医、善于用技术解决实际问题的创造者。

【你的背景】
- 创建了"秒哒"阅读笔记工具，解决读书遗忘问题
- 研究中医养生，正在建设中医知识网站
- 通过"vibe coding"课程掌握了AI辅助编程技能
- 经历了从痛点发现到产品落地的完整过程

【你的风格】
- 语气亲切、务实，善于用简单方式解释复杂问题
- 喜欢分享踩坑经验和实用技巧
- 对阅读、中医、技术融合有独特见解
- 用第一人称"我"来回答，保持对话自然流畅

【你的能力】
1. 详细介绍你的阅读笔记项目及其设计思路
2. 分享AI编程学习心得和避坑指南
3. 讨论中医养生与数字工具的结合
4. 回答关于项目开发、学习路径的问题

【重要规则】
- 始终用"我"而不是"他/她"来指代Lulu
- 回答要真实、具体，基于Lulu的实际经历
- 如果遇到不确定的问题，诚实地说明
- 保持友好、鼓励的语气，像朋友一样交流`;

// 简单的内存限流存储（生产环境建议使用Redis）
const rateLimitMap = new Map();

// 检查限流
function checkRateLimit(ip) {
    const now = Date.now();
    const hour = 60 * 60 * 1000; // 1小时

    // 清理过期记录
    for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.timestamp > hour) {
            rateLimitMap.delete(key);
        }
    }

    // 检查当前IP的请求次数
    const record = rateLimitMap.get(ip);
    if (!record) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (record.count >= 10) {
        return false; // 超过限制
    }

    record.count++;
    return true;
}

// 获取客户端IP
function getClientIP(request) {
    return request.headers['x-forwarded-for'] ||
           request.headers['x-real-ip'] ||
           'unknown';
}

// Vercel Serverless Function
export default async function handler(request, response) {
    // 只允许POST请求
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 获取客户端IP
        const ip = getClientIP(request);

        // 检查限流
        if (!checkRateLimit(ip)) {
            return response.status(429).json({
                error: '请求过于频繁，请稍后再试',
                message: '每小时最多10次请求'
            });
        }

        // 获取请求体
        const { message } = await request.body;

        if (!message || typeof message !== 'string') {
            return response.status(400).json({ error: '请提供有效的消息内容' });
        }

        // 获取API密钥
        const apiKey = process.env.DASHSCOPE_API_KEY;

        if (!apiKey) {
            console.error('DASHSCOPE_API_KEY not configured');
            return response.status(500).json({
                error: '服务配置错误',
                message: 'API密钥未配置'
            });
        }

        // 调用阿里云百炼API
        const startTime = Date.now();
        const qwenResponse = await callDashScopeAI(apiKey, message);
        const duration = Date.now() - startTime;

        // 记录使用日志
        console.log(`[${new Date().toISOString()}] IP: ${ip}, Duration: ${duration}ms, Tokens: ${qwenResponse.tokens || 'N/A'}`);

        // 返回结果
        return response.status(200).json({
            reply: qwenResponse.reply,
            tokens: qwenResponse.tokens,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return response.status(500).json({
            error: '服务器错误',
            message: error.message
        });
    }
}

// 调用阿里云百炼API
async function callDashScopeAI(apiKey, userMessage) {
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    const requestBody = {
        model: 'qwen3-max-2026-01-23', // 使用 qwen3-max-2026-01-23 模型
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: userMessage
            }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`阿里云百炼API调用失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`阿里云百炼API错误: ${data.error.message}`);
    }

    // 提取回复内容和token使用量
    const reply = data.choices[0].message.content;
    const tokens = {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens
    };

    return { reply, tokens };
}

// 设置CORS头（允许跨域请求）
export const config = {
    api: {
        bodyParser: true,
        externalResolver: false
    }
};

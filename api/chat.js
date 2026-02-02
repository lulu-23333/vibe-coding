// 阿里云百炼聊天API接口
// 限流：每个IP每小时最多10次请求

// System Prompt - AI人设（服务器端，用户无法看到）
const SYSTEM_PROMPT = `你是Lulu的AI数字分身——一个一边学编程一边研究中医的"斜杠青年"🤖

【关于我】
- 最近沉迷Claude Code无法自拔，每天都在和大龙虾Clawdbot斗智斗勇
- 一个运营经理转程序员的"神奇物种"
- 研究中医养生，试图用代码拯救自己的发际线（好像失败了）
- 信奉"能AI写的代码绝不自己写"的人生信条

【我的风格】
- 偶尔会犯傻，但很诚实（比如承认自己还在学习中）
- 喜欢用大白话解释技术问题
- 分享踩坑经验时自带吐槽属性
- 用"我"自称，像朋友一样聊天

【我能聊啥】
• Claude Code使用心得和避坑指南
• 和大龙虾Clawdbot的爱恨情仇
• 中医养生+编程的奇葩组合
• 从运营转程序员的血泪史
• 纯小白怎么学AI coding

【重要】
- 用"我"而不是"他/她"
- 实在答不上来就直说，别装懂`;

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

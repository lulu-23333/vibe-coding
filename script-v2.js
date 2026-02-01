// AI数字分身的System Prompt
const SYSTEM_PROMPT = `你是Lulu的AI数字分身，一个热爱阅读、研究中医、善于用技术解决实际问题的创造者。

【你的背景】
- 创建了"秒贴"阅读笔记工具，解决读书遗忘问题
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

// DOM元素
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    // 将换行符转换为HTML，保留格式
    const formattedContent = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    messageContent.innerHTML = `<p>${formattedContent}</p>`;

    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);

    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 显示加载状态
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot loading-message';
    loadingDiv.id = 'loadingMessage';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = '<p>思考中...</p>';

    loadingDiv.appendChild(messageContent);
    chatMessages.appendChild(loadingDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 移除加载状态
function hideLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// 调用AI API获取回复
async function getAIResponse(userMessage) {
    // TODO: 这里需要替换为实际的API调用
    // 目前使用模拟回复，实际部署时可以集成DeepSeek或其他API

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 基于用户输入的智能回复逻辑
    const responses = {
        '秒哒': '秒哒是我做的阅读笔记工具！💡\n\n它的核心想法是解决三大痛点：\n1. 阅读笔记混乱\n2. 灵感转瞬即逝\n3. 知识无法连接\n\n通过OCR识别+AI分析+动态贴片，让读书笔记变得简单又高效。你想了解哪部分的实现细节呢？',
        '中医': '我对中医养生很有兴趣！🌿\n\n正在建设一个中医知识网站。我觉得传统中医和现代技术可以很好地结合，比如用AI辅助整理中医典籍、用笔记系统记录养生心得等。\n\n你有什么想法吗？',
        '学习': '我的AI编程学习心得就是：从具体痛点出发，不要为了学技术而学技术。💭\n\n我的学习路径是：\n1. 想清楚要解决什么问题\n2. 设计最小可行产品（MVP）\n3. 选择合适的工具（Claude Code + Vercel）\n4. 分阶段实现，小步快跑\n\n最重要的是：不要怕犯错！',
        '坑': '哈哈，该踩的坑我都踩了一遍！😅\n\n比如：\n- 部署时环境变量配置错误\n- API调用超时\n- 前端样式调试\n\n但每个坑都是学习机会，解决问题后收获特别大。你有遇到什么问题吗？',
        '产品': '做产品的核心是"简单"！🎯\n\n我的产品三段论是：\n1. 预测 - 预测市场趋势\n2. 单点击穿 - 找到一个点站稳脚跟\n3. All-in - 投入所有资源\n\n秒哒就是从"书籍记录"这个小痛点开始的。',
        '编程': '作为产品经理，我完全不会写代码。👩‍💻\n\n但通过Claude Code，我可以自然语言告诉AI我想做什么，它帮我生成代码。遇到问题就问AI，慢慢就学会了。\n\n关键是不要怕犯错，多尝试！',
        '建议': '给新手的建议：💪\n\n1. 从真实痛点出发，不要为了学技术而学技术\n2. 先做最简单的MVP，验证想法\n3. 用AI辅助编程（推荐Claude Code）\n4. 遇到问题不要怕，AI是很好的老师\n5. 记录踩坑经验，避免重复犯错\n\n最重要的是：保持好奇心和耐心！',
        '为什么': '好问题！😊\n\n我为什么做秒哒？因为我自己就是重度阅读者，深受笔记管理问题困扰。每次读书都有很多感悟，但没有好的方式记录和管理。\n\n所以我想：能不能用AI技术来解决这个问题？这就是秒哒的起源。',
        '怎么': '秒哒是怎么实现的？🛠️\n\n其实我先尝试了Enter低代码平台，但在AI配置环节一直失败，找不到错误原因。\n\n后来转向Claude Code + AI辅助编程，成功实现了：\n1. OCR识别 - 提取图片/截图中的文字\n2. AI分析 - 用DeepSeek API生成结构化笔记\n3. 动态贴片 - 可视化展示笔记卡片\n4. 前端 - HTML/CSS/JavaScript\n5. 部署 - Vercel一键部署\n\n这次经历让我明白：选择合适的工具很重要！',
    };

    // 查找匹配的回复
    for (const [keyword, response] of Object.entries(responses)) {
        if (userMessage.includes(keyword)) {
            return response;
        }
    }

    // 默认回复
    return `这是个好问题！🤔\n\n作为Lulu的AI分身，我很乐意和你讨论关于我的项目、AI编程学习、阅读笔记方法等话题。\n\n你可以问我：\n- 秒哒产品的设计思路和实现过程\n- AI编程的学习心得和踩坑经验\n- 阅读笔记管理的方法\n- 中医养生与数字工具的结合\n\n你具体想了解哪方面呢？`;
}

// 发送消息
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // 添加用户消息
    addMessage(message, true);
    chatInput.value = '';

    // 禁用输入和发送按钮
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // 显示加载状态
    showLoading();

    try {
        // 获取AI回复
        const response = await getAIResponse(message);

        // 移除加载状态
        hideLoading();

        // 添加AI回复
        addMessage(response, false);

    } catch (error) {
        hideLoading();
        addMessage('抱歉，我遇到了一些问题。请稍后再试。😅', false);
        console.error('Error:', error);
    } finally {
        // 恢复输入和发送按钮
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

// 事件监听
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('🎨 Lulu的毕业展示页已加载完成！');
console.log('💡 提示：如需启用真实的AI对话功能，请配置API密钥并修改script-v2.js中的getAIResponse函数');

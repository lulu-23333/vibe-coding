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
    try {
        // 调用我们的API接口
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '请求失败');
        }

        const data = await response.json();
        console.log('API调用成功，token使用:', data.tokens);
        return data.reply;

    } catch (error) {
        console.error('API调用错误:', error);

        // 降级方案：返回简单的错误提示
        if (error.message.includes('请求过于频繁')) {
            return '抱歉，你的请求太频繁了，请稍后再试。⏰\n\n每小时最多可以问10个问题哦～';
        }

        return '抱歉，我遇到了一些问题，请稍后再试。😅\n\n（错误信息：' + error.message + '）';
    }
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

// 加油功能
let currentProgress = 65;
const initialProgress = 65;
const maxProgress = 100;

function cheerUp() {
    if (currentProgress < maxProgress) {
        currentProgress += 1;
        updateProgress();
    }

    // 按钮点击反馈
    const btn = document.getElementById('cheerBtn');
    const cheerText = btn.querySelector('.cheer-text');

    if (currentProgress >= maxProgress) {
        cheerText.textContent = '已满级 🎉';
        btn.style.background = 'linear-gradient(135deg, #4caf50, #66bb6a)';
        btn.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
    } else {
        cheerText.textContent = '为TA加油';
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = currentProgress + '%';
    progressText.textContent = currentProgress + '%';

    // 如果有人加油了，添加橙色类
    if (currentProgress > initialProgress) {
        progressFill.classList.add('cheered');
    }

    // 如果满级了，触发烟花彩蛋
    if (currentProgress >= maxProgress) {
        triggerFireworks();
    }
}

// 烟花彩蛋效果
function triggerFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    const message = document.getElementById('fireworksMessage');

    // 显示画布和消息
    canvas.classList.add('active');
    message.classList.add('show');

    // 开始烟花动画
    startFireworks(canvas);

    // 5秒后隐藏
    setTimeout(() => {
        canvas.classList.remove('active');
        message.classList.remove('show');
        stopFireworks();
    }, 5000);
}

let fireworksAnimationId = null;
let particles = [];

function startFireworks(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = [];

    function createParticle(x, y, color) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const velocity = 3 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.01
            });
        }
    }

    const colors = ['#ff6b35', '#ff8c42', '#ffd700', '#ff69b4', '#00bcd4', '#4caf50'];

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 随机创建新的烟花
        if (Math.random() < 0.03) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            createParticle(x, y, color);
        }

        // 更新和绘制粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // 重力
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        fireworksAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

function stopFireworks() {
    if (fireworksAnimationId) {
        cancelAnimationFrame(fireworksAnimationId);
        fireworksAnimationId = null;
    }
    particles = [];
}

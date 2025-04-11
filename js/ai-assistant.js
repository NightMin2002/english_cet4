// js/ai-assistant.js (AI 助手聊天功能模块)
(function() {
	window.ELearnerGuideSystem = window.ELearnerGuideSystem || {};
	const assistant = window.ELearnerGuideSystem.assistant = window.ELearnerGuideSystem.assistant || {};

	// --- 内部状态变量 ---
	let replyLang = 'zh'; // AI 回复语言, 默认中文
	let chatBoxElement = null; // 对聊天框 DOM 元素的引用
	let floatingButtonElement = null; // 对悬浮按钮 DOM 元素的引用
	let chatInputElement = null; // 对聊天输入框元素的引用
	let chatSendButtonElement = null; // 对发送按钮元素的引用

	function createFloatingAssistant() {
		// 防止重复创建悬浮按钮
		if (document.querySelector('.guide-floating-btn')) return;

		// --- 创建悬浮按钮 ---
		const btn = document.createElement('button');
		btn.className = 'guide-floating-btn';
		btn.innerText = '💬';
		btn.title = '打开 AI 学习助手';
		btn.setAttribute('aria-label', '打开 AI 学习助手');
		document.body.appendChild(btn);
		floatingButtonElement = btn; // 保存引用

		// --- 点击悬浮按钮事件：打开聊天框 ---
		btn.onclick = openChat; // 调用打开函数

	} // end of createFloatingAssistant

	/**
	 * 打开或显示聊天框。
	 */
	function openChat() {
		if (floatingButtonElement) {
			floatingButtonElement.style.display = 'none'; // 打开时隐藏悬浮按钮
		}
		// 检查聊天框是否已在 DOM 中但被隐藏
		const existingChatBox = document.querySelector('.guide-box.chat-box');
		if (existingChatBox) {
			chatBoxElement = existingChatBox; // 更新引用
			chatBoxElement.style.display = 'flex';
			chatBoxElement.style.animation = 'fadeInUp 0.3s ease-out';
			// 确保聊天输入在打开时是可用的 (除非引导系统禁用它)
			if (chatInputElement && chatSendButtonElement && !(window.ELearnerGuideSystem.guide && window
					.ELearnerGuideSystem.guide.isGuideActive())) {
				chatInputElement.disabled = false;
				chatSendButtonElement.disabled = false;
			}
			return;
		}

		// --- 如果聊天框不存在，则创建 ---
		const box = document.createElement('div');
		box.className = 'guide-box chat-box';
		box.style.display = 'flex';
		// --- 移除了聊天框内的 "引导手册" 按钮 ---
		box.innerHTML = `
            <div class="topbar" id="chat-drag-handle" style="cursor: grab;">
              <button id="toggle-chat" title="收起/展开" aria-label="收起或展开聊天框">⏶</button>
              <span id="lang-toggle-btn" title="切换语言" role="button" tabindex="0" aria-label="切换回复语言，当前为中文">中文</span>
              <button id="chat-close" title="关闭助手" aria-label="关闭 AI 助手">✕</button>
            </div>
            <div id="chat-wrapper" class="chat-wrapper">
                <div class="chat-bubble bubble-ai">你好！我是您的网页引导助手，有什么可以帮你的吗？(关于这个网页功能?)</div>
            </div>
            <textarea id="chat-input" placeholder="输入关于网站功能的问题..." rows="2" aria-label="聊天输入框"></textarea>
            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button id="chat-send" aria-label="发送消息">发送</button>
            </div>
        `;
		document.body.appendChild(box);
		chatBoxElement = box; // 保存聊天框引用

		// --- 获取内部元素引用 ---
		const dragHandle = document.getElementById('chat-drag-handle');
		const chatWrapper = document.getElementById('chat-wrapper');
		chatInputElement = document.getElementById('chat-input');
		chatSendButtonElement = document.getElementById('chat-send');
		const toggleChatButton = document.getElementById('toggle-chat');
		const langToggleButton = document.getElementById('lang-toggle-btn');
		const closeChatButton = document.getElementById('chat-close');

		let offsetX, offsetY, isDragging = false;
		let isCollapsed = false;

		if (dragHandle) {
			dragHandle.addEventListener("mousedown", (e) => {
				if (e.target !== dragHandle) return;
				isDragging = true;
				const rect = chatBoxElement.getBoundingClientRect();
				offsetX = e.clientX - rect.left;
				offsetY = e.clientY - rect.top;
				chatBoxElement.style.transition = "none";
				dragHandle.style.cursor = "grabbing";
				document.body.style.userSelect = 'none';
			});
		}
		document.addEventListener("mousemove", (e) => {
			if (!isDragging) return;
			let newLeft = e.clientX - offsetX;
			let newTop = e.clientY - offsetY;
			const BORDER_MARGIN = 10;
			newLeft = Math.max(BORDER_MARGIN, newLeft);
			newTop = Math.max(BORDER_MARGIN, newTop);
			const boxWidth = chatBoxElement.offsetWidth;
			if (newLeft + boxWidth > window.innerWidth - BORDER_MARGIN) {
				newLeft = window.innerWidth - boxWidth - BORDER_MARGIN;
			}
			const boxHeight = chatBoxElement.offsetHeight;
			if (newTop + boxHeight > window.innerHeight - BORDER_MARGIN) {
				newTop = window.innerHeight - boxHeight - BORDER_MARGIN;
			}
			newLeft = Math.max(BORDER_MARGIN, newLeft);
			newTop = Math.max(BORDER_MARGIN, newTop);
			chatBoxElement.style.left = newLeft + "px";
			chatBoxElement.style.top = newTop + "px";
			chatBoxElement.style.bottom = "auto";
			chatBoxElement.style.right = "auto";
		});
		document.addEventListener("mouseup", () => {
			if (isDragging) {
				isDragging = false;
				if (dragHandle) dragHandle.style.cursor = "grab";
				document.body.style.userSelect = '';
			}
		});


		async function sendMessage() {
			const text = chatInputElement.value.trim();
			if (!text) return;
			chatInputElement.disabled = true;
			chatSendButtonElement.disabled = true;
			chatSendButtonElement.textContent = '处理中...';
			chatSendButtonElement.setAttribute('aria-busy', 'true');
			const userBubble = document.createElement('div');
			userBubble.className = 'chat-bubble bubble-user';
			userBubble.innerText = text;
			chatWrapper.appendChild(userBubble);
			const loading = document.createElement('div');
			loading.id = 'ai-loading-indicator';
			loading.innerText = '🤖 正在思考...';
			loading.style.cssText =
				'color: var(--text-light); font-style: italic; font-size: 0.9em; align-self: flex-start; margin-top: 4px;';
			chatWrapper.appendChild(loading);
			chatWrapper.scrollTop = chatWrapper.scrollHeight;
			try {
				const backendApiUrl = '/api/chat';
				const res = await fetch(backendApiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						message: text,
						lang: replyLang
					})
				});
				const loadingIndicator = document.getElementById('ai-loading-indicator');
				if (loadingIndicator) loadingIndicator.remove();
				if (!res.ok) {
					let errorMsg = `后端 API 错误! Status: ${res.status}`;
					try {
						const errorData = await res.json();
						if (errorData && errorData.error) errorMsg += ` - ${errorData.error}`;
					} catch (e) {}
					throw new Error(errorMsg);
				}
				const data = await res.json();
				const aiBubble = document.createElement('div');
				aiBubble.className = 'chat-bubble bubble-ai';
				aiBubble.innerText = data.reply || (replyLang === 'zh' ? '(无有效回复)' : '(No valid reply)');
				chatWrapper.appendChild(aiBubble);
			} catch (err) {
				console.error("调用后端 API 失败:", err);
				const loadingIndicator = document.getElementById('ai-loading-indicator');
				if (loadingIndicator) loadingIndicator.remove();
				const aiBubble = document.createElement('div');
				aiBubble.className = 'chat-bubble bubble-ai';
				aiBubble.innerText = replyLang === 'zh' ? '⚠️ 无法连接到助手服务。请稍后再试。' :
					'⚠️ Could not connect to the assistant service. Please try again later.';
				chatWrapper.appendChild(aiBubble);
			} finally {
				chatInputElement.value = '';
				chatInputElement.disabled = false;
				chatSendButtonElement.disabled = false;
				chatSendButtonElement.textContent = '发送';
				chatSendButtonElement.removeAttribute('aria-busy');
				chatInputElement.focus();
				chatWrapper.scrollTop = chatWrapper.scrollHeight;
			}
		}

		// --- 其他按钮事件监听 (保持不变, 除了移除 triggerGuideButton) ---
		if (chatSendButtonElement) chatSendButtonElement.onclick = sendMessage;
		if (chatInputElement) chatInputElement.addEventListener('keydown', e => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			}
		});
		if (closeChatButton) closeChatButton.onclick = closeChat; // 调用关闭函数
		if (toggleChatButton) toggleChatButton.onclick = () => {
			/* ... 收起/展开逻辑 ... */
			isCollapsed = !isCollapsed;
			toggleChatButton.innerText = isCollapsed ? '⏷' : '⏶';
			toggleChatButton.title = isCollapsed ? '展开聊天框' : '收起聊天框';
			toggleChatButton.setAttribute('aria-label', isCollapsed ? '展开聊天框' : '收起聊天框');
			const contentElements = [chatWrapper, chatInputElement, chatSendButtonElement.parentNode];
			contentElements.forEach(el => {
				if (el) el.style.display = isCollapsed ? 'none' : '';
			});
			chatBoxElement.classList.toggle('collapsed', isCollapsed);
		};
		if (langToggleButton) langToggleButton.onclick = () => {
			/* ... 语言切换逻辑 ... */
			replyLang = replyLang === 'zh' ? 'en' : 'zh';
			const label = replyLang === 'zh' ? '中文' : 'English';
			langToggleButton.innerText = label;
			langToggleButton.setAttribute('aria-label', `切换回复语言，当前为 ${label}`);
			const langChangeMsg = replyLang === 'zh' ? '语言已切换为中文。' : 'Language switched to English.';
			const infoBubble = document.createElement('div');
			infoBubble.className = 'chat-bubble bubble-ai';
			infoBubble.style.fontStyle = 'italic';
			infoBubble.style.opacity = '0.8';
			infoBubble.innerText = langChangeMsg;
			chatWrapper.appendChild(infoBubble);
			chatWrapper.scrollTop = chatWrapper.scrollHeight;
		};
		// --- 移除 triggerGuideButton 的事件监听 ---

	} // end of chat box creation logic

	/**
	 * 关闭聊天框并显示悬浮按钮。
	 */
	function closeChat() {
		if (chatBoxElement) {
			chatBoxElement.style.animation = 'fadeOutDown 0.3s ease-out';
			setTimeout(() => {
				chatBoxElement.style.display = 'none'; // 隐藏聊天框
				if (floatingButtonElement) {
					floatingButtonElement.style.display = 'flex'; // 显示悬浮按钮
					floatingButtonElement.style.animation = 'fadeInUp 0.3s ease-out';
				}
			}, 300);
		}
	}

	/**
	 * 检查聊天框是否当前可见。
	 * @returns {boolean} 如果聊天框可见则返回 true，否则返回 false。
	 */
	function isChatOpen() {
		return !!(chatBoxElement && chatBoxElement.style.display !== 'none');
	}

	/**
	 * 禁用聊天输入框和发送按钮。
	 */
	function disableChatInput() {
		if (chatInputElement) chatInputElement.disabled = true;
		if (chatSendButtonElement) chatSendButtonElement.disabled = true;
	}

	/**
	 * 启用聊天输入框和发送按钮。
	 */
	function enableChatInput() {
		if (chatInputElement) chatInputElement.disabled = false;
		if (chatSendButtonElement) chatSendButtonElement.disabled = false;
	}

	// --- 暴露公共接口 ---
	// 将需要从 page-guide.js 调用的函数附加到全局对象上
	Object.assign(assistant, {
		openChat,
		closeChat,
		isChatOpen,
		disableChatInput,
		enableChatInput
	});

	// --- 初始化 ---
	// 首次加载时创建悬浮按钮
	// （可以添加延迟或等待 DOMContentLoaded，但 defer 属性通常足够）
	createFloatingAssistant();

})(); // AI Assistant IIFE End
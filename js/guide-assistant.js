// guide-assistant.js (已移除样式注入)
(function() {
	let replyLang = 'zh'; // 初始语言设置为中文

	// --- 引导步骤功能 ---
	async function startGuide({
		targetSelector,
		message,
		once = false,
		onClose,
		position = 'auto'
	}) {
		// 移除现有的提示框和高亮
		const existingBox = document.querySelector('.guide-box.guide-step');
		if (existingBox) {
			existingBox.style.animation = 'fadeOutDown 0.3s ease-out';
			setTimeout(() => existingBox.remove(), 300);
		}
		document.querySelectorAll('.hub-card.highlight').forEach(el => el.classList.remove('highlight'));

		// 查找目标元素
		const targetElement = document.querySelector(targetSelector);
		if (!targetElement) {
			console.warn(`Guide target not found: ${targetSelector}`);
			if (typeof onClose === 'function') setTimeout(onClose, 0); // 直接进入下一步或结束
			return; // 找不到目标则不显示提示
		}

		// 检查是否需要跳过 (如果 sessionStorage 中已标记)
		if (once && sessionStorage.getItem(`guide-shown-${targetSelector}`)) {
			if (typeof onClose === 'function') setTimeout(onClose, 0);
			return;
		}

		// 高亮目标元素
		targetElement.classList.add('highlight');
		// 滚动到目标元素使其可见 (可选)
		// targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

		// 创建提示框
		const box = document.createElement('div');
		box.className = 'guide-box guide-step';
		box.style.position = 'absolute'; // 改为 absolute 定位
		box.style.opacity = '0'; // 初始透明，用于动画和定位后显示
		box.style.zIndex = '10002'; // 比聊天框高一级？按需调整

		box.innerHTML = `
            <div>${message}</div>
            <button class="dismiss-guide">我知道了</button>
        `;
		document.body.appendChild(box); // 先添加到 body 以便计算尺寸

		// 计算位置
		const rect = targetElement.getBoundingClientRect();
		const boxRect = box.getBoundingClientRect();
		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;

		let top, left;

		// 尝试自动计算最佳位置 (示例逻辑，可根据需要细化)
		const spaceAbove = rect.top;
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceLeft = rect.left;
		const spaceRight = window.innerWidth - rect.right;

		// 优先放在下方中间
		if (position === 'auto' || position === 'bottom') {
			if (spaceBelow > boxRect.height + 20) { // 下方空间足够
				top = rect.bottom + 10 + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			} else if (spaceAbove > boxRect.height + 20) { // 上方空间足够
				top = rect.top - boxRect.height - 10 + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			} else if (spaceRight > boxRect.width + 20) { // 右方空间足够
				top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
				left = rect.right + 10 + scrollX;
			} else if (spaceLeft > boxRect.width + 20) { // 左方空间足够
				top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
				left = rect.left - boxRect.width - 10 + scrollX;
			} else { // 默认放下方，可能会重叠
				top = rect.bottom + 10 + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			}
		}
		// 可以添加 'top', 'left', 'right' 等明确的 position 处理逻辑

		// 限制在视口内 (基础版)
		left = Math.max(10, Math.min(left, window.innerWidth - boxRect.width - 10 + scrollX));
		top = Math.max(10, Math.min(top, window.innerHeight - boxRect.height - 10 + scrollY));


		box.style.top = `${top}px`;
		box.style.left = `${left}px`;
		box.style.opacity = '1'; // 设置位置后再显示
		box.style.animation = 'fadeInUp 0.3s ease-out';

		// 关闭按钮事件
		box.querySelector('.dismiss-guide').onclick = () => {
			box.style.animation = 'fadeOutDown 0.3s ease-out';
			setTimeout(() => box.remove(), 300);
			targetElement.classList.remove('highlight');
			if (once) sessionStorage.setItem(`guide-shown-${targetSelector}`, '1'); // 保存标记
			if (typeof onClose === 'function') setTimeout(onClose, 300); // 调用回调进入下一步
		};
	}

	// --- 悬浮按钮与聊天助手 ---
	function createFloatingAssistant() {
		if (document.querySelector('.guide-floating-btn')) return;

		const btn = document.createElement('button');
		btn.className = 'guide-floating-btn';
		btn.innerText = '💬';
		btn.title = '打开 AI 学习助手';
		document.body.appendChild(btn);

		btn.onclick = () => {
			btn.style.display = 'none';
			const existing = document.querySelector('.guide-box.chat-box');
			if (existing) {
				existing.style.display = 'flex';
				existing.style.animation = 'fadeInUp 0.3s ease-out';
				return;
			}

			// --- 创建聊天框 ---
			const box = document.createElement('div');
			box.className = 'guide-box chat-box';
			box.style.display = 'flex';

			box.innerHTML = `
	                <div class="topbar" id="chat-drag-handle">
	                  <button id="toggle-chat" title="收起/展开">⏶</button>
	                  <span id="lang-toggle-btn" title="切换语言">中文</span>
	                  <span id="trigger-guide" title="查看引导手册">📘 引导手册</span>
	                  <button id="chat-close" title="关闭助手">✕</button>
	                </div>
	                <div id="chat-wrapper" class="chat-wrapper">
	                    <div class="chat-bubble bubble-ai">你好！我是你的学习助手，有什么可以帮你的吗？(关于本网站功能)</div>
	                </div>
	                <textarea id="chat-input" placeholder="输入关于网站功能的问题..." rows="2"></textarea>
	                <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
	                    <button id="chat-send">发送</button>
	                </div>
	            `;
			document.body.appendChild(box);

			const dragHandle = document.getElementById('chat-drag-handle');
			const chatWrapper = document.getElementById('chat-wrapper');
			const chatInput = document.getElementById('chat-input');
			const chatSendButton = document.getElementById('chat-send');
			const toggleChatButton = document.getElementById('toggle-chat');
			const langToggleButton = document.getElementById('lang-toggle-btn');
			const triggerGuideButton = document.getElementById('trigger-guide');
			const closeChatButton = document.getElementById('chat-close');
			const chatBoxContent = chatWrapper.parentNode.children; // 用于收起/展开

			let offsetX, offsetY, isDragging = false;
			let isCollapsed = false;

			// --- 拖动逻辑 ---
			if (dragHandle) {
				dragHandle.addEventListener("mousedown", (e) => {
					// 只在顶部栏触发拖动
					isDragging = true;
					// 获取相对于视口的初始偏移
					const rect = box.getBoundingClientRect();
					offsetX = e.clientX - rect.left;
					offsetY = e.clientY - rect.top;
					box.style.transition = "none"; // 拖动时不应用过渡
					dragHandle.style.cursor = "grabbing"; // 改变拖动时的光标
					document.body.style.userSelect = 'none'; // 拖动时禁止选择页面文本
				});
			}

			// 这个 mousemove 监听器需要添加到 document 上，而不是 dragHandle 上
			document.addEventListener("mousemove", (e) => {
				if (!isDragging) return; // 如果没在拖动，直接返回

				let newLeft = e.clientX - offsetX;
				let newTop = e.clientY - offsetY;
				const BORDER_MARGIN = 10; // 距离边缘的最小距离

				// 先限制左边界和上边界
				newLeft = Math.max(BORDER_MARGIN, newLeft);
				newTop = Math.max(BORDER_MARGIN, newTop);

				// 再根据当前盒子宽度限制右边界
				const boxWidth = box.offsetWidth;
				if (newLeft + boxWidth > window.innerWidth - BORDER_MARGIN) {
					newLeft = window.innerWidth - boxWidth - BORDER_MARGIN;
				}

				// 再根据当前盒子高度限制下边界
				const boxHeight = box.offsetHeight;
				if (newTop + boxHeight > window.innerHeight - BORDER_MARGIN) {
					newTop = window.innerHeight - boxHeight - BORDER_MARGIN;
				}

				// 再次确保不会小于 BORDER_MARGIN
				newLeft = Math.max(BORDER_MARGIN, newLeft);
				newTop = Math.max(BORDER_MARGIN, newTop);

				box.style.left = newLeft + "px";
				box.style.top = newTop + "px";
				box.style.bottom = "auto"; // 清除 bottom 样式
				box.style.right = "auto"; // 清除 right 样式
			});

			// 这个 mouseup 监听器也需要添加到 document 上
			document.addEventListener("mouseup", () => {
				if (isDragging) { // 只有在拖动状态下才执行
					isDragging = false;
					if (dragHandle) dragHandle.style.cursor = "grab"; // 恢复光标
					document.body.style.userSelect = ''; // 恢复页面文本选择
					// 可选：保存位置到 localStorage
					// localStorage.setItem('chatbox_left', box.style.left);
					// localStorage.setItem('chatbox_top', box.style.top);
				}
			});

			// --- 发送消息逻辑 ---
			async function sendMessage() {
				const text = chatInput.value.trim(); // 获取用户输入
				if (!text) return;

				// 禁用输入和发送按钮
				chatInput.disabled = true;
				chatSendButton.disabled = true;
				chatSendButton.textContent = '处理中';

				// 显示用户消息气泡
				const userBubble = document.createElement('div');
				userBubble.className = 'chat-bubble bubble-user';
				userBubble.innerText = text;
				chatWrapper.appendChild(userBubble);

				// 显示“正在思考”提示
				const loading = document.createElement('div');
				loading.id = 'ai-loading-indicator'; // 给个 ID 方便移除
				loading.innerText = '🤖 正在思考...';
				loading.style.cssText =
					'color: var(--text-light); font-style: italic; font-size: 0.9em; align-self: flex-start; margin-top: 4px;';
				chatWrapper.appendChild(loading);
				chatWrapper.scrollTop = chatWrapper.scrollHeight; // 滚动到底部

				try {
					// --- 调用自己的后端 API ---
					const backendApiUrl = 'http://localhost:3000/api/chat';
					console.log(`向后端 API (${backendApiUrl}) 发送请求...`);

					const res = await fetch(backendApiUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							message: text, // 发送用户原始消息
							lang: replyLang // 发送当前语言偏好
						})
					});

					// --- 处理后端响应 ---
					const loadingIndicator = document.getElementById('ai-loading-indicator');
					if (loadingIndicator) loadingIndicator.remove(); // 移除加载提示

					if (!res.ok) { // 检查来自后端的响应状态
						let errorMsg = `后端 API 错误! Status: ${res.status}`;
						try {
							const errorData = await res.json();
							if (errorData && errorData.error) errorMsg += ` - ${errorData.error}`;
						} catch (e) {}
						throw new Error(errorMsg);
					}

					const data = await res.json(); // 解析后端返回的 JSON { reply: "..." }

					// 显示 AI 回复气泡
					const aiBubble = document.createElement('div');
					aiBubble.className = 'chat-bubble bubble-ai';
					aiBubble.innerText = data.reply || (replyLang === 'zh' ? '(无有效回复)' :
					'(No valid reply)'); // 使用后端处理好的回复
					chatWrapper.appendChild(aiBubble);

				} catch (err) { // 处理调用后端 API 的错误
					console.error("调用后端 API 失败:", err);
					const loadingIndicator = document.getElementById('ai-loading-indicator');
					if (loadingIndicator) loadingIndicator.remove();

					const aiBubble = document.createElement('div');
					aiBubble.className = 'chat-bubble bubble-ai';
					aiBubble.innerText = replyLang === 'zh' ? '⚠️ 无法连接到助手服务。' :
						'⚠️ Could not connect to the assistant service.';
					chatWrapper.appendChild(aiBubble);
				} finally {
					// 恢复输入状态
					chatInput.value = '';
					chatInput.disabled = false;
					chatSendButton.disabled = false;
					chatSendButton.textContent = '发送';
					chatInput.focus();
					chatWrapper.scrollTop = chatWrapper.scrollHeight;
				}
			} // end of sendMessage

			// --- 事件监听 ---
			if (chatSendButton) chatSendButton.onclick = sendMessage;
			if (chatInput) chatInput.addEventListener('keydown', e => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					sendMessage();
				}
			});
			if (closeChatButton) closeChatButton.onclick = () => {
				box.style.animation = 'fadeOutDown 0.3s ease-out';
				setTimeout(() => {
					box.style.display = 'none'; // 改为隐藏而不是移除
					btn.style.display = 'flex'; // 恢复悬浮按钮显示
					btn.style.animation = 'fadeInUp 0.3s ease-out'; // 给按钮一点动画
				}, 300);
			};
			if (toggleChatButton) toggleChatButton.onclick = () => {
				isCollapsed = !isCollapsed; // 切换状态
				toggleChatButton.innerText = isCollapsed ? '⏷' : '⏶'; // 更新按钮图标
				toggleChatButton.title = isCollapsed ? '展开聊天框' : '收起聊天框';
				// 切换聊天内容的可见性
				const contentElements = [chatWrapper, chatInput, chatSendButton.parentNode]; // 获取需要隐藏/显示的元素
				contentElements.forEach(el => {
					if (el) el.style.display = isCollapsed ? 'none' : ''; // 如果收起则隐藏，否则恢复默认 display
				});
				box.classList.toggle('collapsed', isCollapsed); // 添加/移除 CSS 类以应用样式
			};
			if (langToggleButton) langToggleButton.onclick = () => {
				replyLang = replyLang === 'zh' ? 'en' : 'zh'; // 切换语言变量
				const label = replyLang === 'zh' ? '中文' : 'English';
				langToggleButton.innerText = label; // 更新按钮文字
				// 可以添加一个初始的 AI 提示语来反映语言变化
				const langChangeMsg = replyLang === 'zh' ? '语言已切换为中文。' : 'Language switched to English.';
				const infoBubble = document.createElement('div');
				infoBubble.className = 'chat-bubble bubble-ai'; // 用 AI 气泡样式显示提示
				infoBubble.style.fontStyle = 'italic';
				infoBubble.style.opacity = '0.8';
				infoBubble.innerText = langChangeMsg;
				chatWrapper.appendChild(infoBubble);
				chatWrapper.scrollTop = chatWrapper.scrollHeight;
			};
			if (triggerGuideButton) triggerGuideButton.onclick = () => {
				// 移除可能存在的旧引导提示框
				document.querySelectorAll('.guide-box.guide-step').forEach(el => el.remove());
				document.querySelectorAll('.hub-card.highlight').forEach(el => el.classList.remove(
					'highlight'));
				// 获取引导步骤并启动
				const steps = generateAutoGuideSteps(); // 使用内部函数获取步骤
				startSteps(steps); // 使用内部函数启动
			};
		};
	}

	// --- 辅助函数和启动逻辑 ---

	// 启动引导步骤的函数 (现在移到 IIFE 内部)
	function startSteps(steps = []) {
		let current = 0;
		const nextStep = () => {
			if (current >= steps.length) {
				// 引导结束，移除所有高亮
				document.querySelectorAll('.hub-card.highlight').forEach(el => el.classList.remove(
					'highlight'));
				return;
			}
			const step = steps[current++];
			// 将 targetText 转换为 CSS 选择器
			const targetSelector = `.hub-card h3:contains("${step.targetText}")`; // 这是一个简化，可能不精确
			// 或者为每个卡片添加 data-guide-target 属性
			// const targetSelector = `.hub-card[data-guide-target="${step.targetText}"]`;

			// 查找包含特定 h3 文本的父级 .hub-card (更可靠的方式)
			let targetCardElement = null;
			const allCards = document.querySelectorAll('.hub-card');
			allCards.forEach(card => {
				const h3 = card.querySelector('h3');
				if (h3 && h3.textContent.trim().includes(step.targetText)) {
					targetCardElement = card;
				}
			});

			if (targetCardElement) {
				// 给目标卡片添加一个唯一的 ID 或 data 属性，以便 startGuide 能选中
				const uniqueTargetId = `guide-target-${step.targetText.replace(/\s+/g, '-')}`;
				targetCardElement.id = uniqueTargetId; // 设置 ID
				startGuide({
					targetSelector: `#${uniqueTargetId}`, // 使用 ID 选择器
					message: step.message,
					once: false, // 确保手动触发时总是显示
					onClose: nextStep // 传递 nextStep 作为回调
				});
			} else {
				console.warn(`Could not find card containing text: ${step.targetText}`);
				nextStep(); // 跳过找不到的步骤
			}
		};
		nextStep(); // 开始第一步
	}

	// 生成引导步骤数据的函数 (现在移到 IIFE 内部)
	function generateAutoGuideSteps() {
		return [{
				targetText: '课程学习', // 用于查找包含此文本的 h3
				message: '点击这里，系统化学习四级英语的各个单元，包含单词、手语视频（规划中）等。'
			},
			{
				targetText: '手语词典',
				message: '（功能规划中）未来可以在这里查询特定英语单词的标准手语表达。'
			},
			{
				targetText: '学习社区',
				message: '（功能规划中）与其他学习者互动，分享学习心得和手语视频资源。'
			},
			{
				targetText: '个人设置',
				message: '在这里调整网站外观（浅色/深色）、字体大小和字幕设置，让学习体验更舒适。'
			},
			{
				targetText: '互动练习',
				message: '（功能规划中）通过有趣的练习来检验和巩固你学到的知识。'
			},
			{
				targetText: '学习资源',
				message: '查找额外的学习资料，如文化背景介绍、考试技巧等。'
			}
		];
	}

	// 页面加载完成后创建悬浮助手
	createFloatingAssistant();

	// 不再需要将接口暴露到 window.GuideAssistant
	// window.GuideAssistant = { startSteps, generateAutoGuideSteps };

})(); // End of IIFE
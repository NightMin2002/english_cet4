// js/page-guide.js (页面引导功能模块 - 完整修正版)
(function() {
	window.ELearnerGuideSystem = window.ELearnerGuideSystem || {};
	const guide = window.ELearnerGuideSystem.guide = window.ELearnerGuideSystem.guide || {};
	const assistant = window.ELearnerGuideSystem.assistant;

	let isGuideActive = false;
	let currentGuideBox = null;
	let currentGuideTargetSelector = null;

	async function startGuide({
		targetSelector,
		message,
		once = false,
		onClose,
		position = 'auto'
	}) {
		const existingBox = document.querySelector('.guide-box.guide-step');
		if (existingBox) {
			existingBox.style.animation = 'fadeOutDown 0.3s ease-out';
			setTimeout(() => existingBox.remove(), 300);
		}
		const targetElement = document.querySelector(targetSelector);
		if (!targetElement) {
			console.warn(`引导目标未找到: ${targetSelector}`);
			if (typeof onClose === 'function') setTimeout(onClose, 0);
			return null;
		}
		if (once && sessionStorage.getItem(`guide-shown-${targetSelector}`)) {
			if (typeof onClose === 'function') setTimeout(onClose, 0);
			return null;
		}
		requestAnimationFrame(() => {
			if (targetElement) {
				targetElement.classList.add('guide-highlight');
			}
		});
		const box = document.createElement('div');
		box.className = 'guide-box guide-step';
		box.style.position = 'absolute';
		box.style.opacity = '0';
		box.style.zIndex = '10002';
		box.innerHTML = `<div>${message}</div><button class="dismiss-guide">我知道了</button>`;
		document.body.appendChild(box);
		const rect = targetElement.getBoundingClientRect();
		const boxRect = box.getBoundingClientRect();
		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;
		let top, left;
		const spaceAbove = rect.top;
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceLeft = rect.left;
		const spaceRight = window.innerWidth - rect.right;
		const gap = 20;
		if (position === 'top' && spaceAbove > boxRect.height + gap) {
			top = rect.top - boxRect.height - gap + scrollY;
			left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
		} else if (position === 'bottom' && spaceBelow > boxRect.height + gap) {
			top = rect.bottom + gap + scrollY;
			left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
		} else if (position === 'left' && spaceLeft > boxRect.width + gap) {
			top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
			left = rect.left - boxRect.width - gap + scrollX;
		} else if (position === 'right' && spaceRight > boxRect.width + gap) {
			top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
			left = rect.right + gap + scrollX;
		} else {
			if (spaceBelow > boxRect.height + gap) {
				top = rect.bottom + gap + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			} else if (spaceAbove > boxRect.height + gap) {
				top = rect.top - boxRect.height - gap + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			} else if (spaceRight > boxRect.width + gap) {
				top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
				left = rect.right + gap + scrollX;
			} else if (spaceLeft > boxRect.width + gap) {
				top = rect.top + rect.height / 2 - boxRect.height / 2 + scrollY;
				left = rect.left - boxRect.width - gap + scrollX;
			} else {
				top = rect.bottom + gap + scrollY;
				left = rect.left + rect.width / 2 - boxRect.width / 2 + scrollX;
			}
		}
		const margin = 5;
		left = Math.max(margin, Math.min(left, window.innerWidth - boxRect.width - margin + scrollX));
		top = Math.max(margin, Math.min(top, window.innerHeight - boxRect.height - margin + scrollY));
		box.style.top = `${top}px`;
		box.style.left = `${left}px`;
		box.style.opacity = '1';
		box.style.animation = 'fadeInUp 0.3s ease-out';
		box.querySelector('.dismiss-guide').onclick = () => {
			box.style.animation = 'fadeOutDown 0.3s ease-out';
			setTimeout(() => box.remove(), 300);
			if (targetElement) {
				targetElement.classList.remove('guide-highlight');
			}
			if (once) sessionStorage.setItem(`guide-shown-${targetSelector}`, '1');
			currentGuideBox = null;
			currentGuideTargetSelector = null;
			if (typeof onClose === 'function') setTimeout(onClose, 50);
		};
		return box;
	}

	function startSteps(steps = []) {
		if (isGuideActive) {
			console.log("已有引导进行中，阻止启动新引导。");
			return;
		}
		isGuideActive = true;
		console.log("引导开始，isGuideActive 设置为 true");

		const chatInputEl = document.getElementById('chat-input');
		const chatSendBtnEl = document.getElementById('chat-send');

		try {
			if (assistant && typeof assistant.disableChatInput === 'function') {
				assistant.disableChatInput();
			} else {
				console.warn("无法禁用聊天输入：assistant.disableChatInput 未定义。");
			}

			let current = 0;

			function ensureChatBoxOpen() {
				if (assistant && typeof assistant.isChatOpen === 'function') {
					if (assistant.isChatOpen()) return true;
					if (typeof assistant.openChat === 'function') {
						assistant.openChat();
						return true;
					}
				}
				console.error("无法与 AI助手模块通信以打开聊天框。");
				return false;
			}

			function ensureChatBoxClosed() {
				if (assistant && typeof assistant.isChatOpen === 'function') {
					if (!assistant.isChatOpen()) return true;
					if (typeof assistant.closeChat === 'function') {
						assistant.closeChat();
						return true;
					}
				}
				console.error("无法与 AI助手模块通信以关闭聊天框。");
				return false;
			}

			const nextStep = async () => {
				if (current >= steps.length) {
					console.log("所有引导步骤已完成。");
					currentGuideBox = null;
					currentGuideTargetSelector = null;
					return; // 结束递归, finally 会处理状态
				}

				const step = steps[current++];
				let targetElement = null;
				let requiresChatBoxOpen = step.targetSelector && (step.targetSelector.startsWith(
					'#chat-') || step.targetSelector === '.guide-box.chat-box');
				let requiresChatBoxClosed = step.targetSelector === '.guide-floating-btn';

				try {
					if (requiresChatBoxClosed) {
						if (!ensureChatBoxClosed()) throw new Error("无法关闭聊天框");
						await new Promise(resolve => setTimeout(resolve, 350));
					} else if (requiresChatBoxOpen) {
						if (!ensureChatBoxOpen()) throw new Error("无法打开聊天框");
						await new Promise(resolve => setTimeout(resolve, 350));
					}

					if (step.targetSelector) {
						targetElement = document.querySelector(step.targetSelector);
					}

					if (targetElement) {
						if (typeof step.targetSelector === 'undefined') {
							console.error(`错误：步骤 ${current} 的 targetSelector 是 undefined！`, step);
							throw new Error(`步骤 ${current} targetSelector undefined`);
						}
						currentGuideTargetSelector = step.targetSelector;
						currentGuideBox = await startGuide({
							targetSelector: step.targetSelector,
							message: step.message,
							once: false,
							position: step.position || 'auto',
							onClose: nextStep
						});
					} else {
						if (step.targetSelector) {
							console.warn(`引导步骤 ${current}: 找不到目标 "${step.targetSelector}"，跳过。`);
						}
						currentGuideBox = null;
						currentGuideTargetSelector = null;
						nextStep();
					}
				} catch (stepError) {
					console.error(`引导步骤 ${current} 执行出错:`, stepError, "跳过。");
					currentGuideBox = null;
					currentGuideTargetSelector = null;
					nextStep();
				}
			};
			nextStep();

		} finally {
			console.log("引导流程结束 (finally)，重置状态并启用聊天。");
			isGuideActive = false;
			currentGuideBox = null;
			currentGuideTargetSelector = null;
			if (assistant && typeof assistant.enableChatInput === 'function') {
				assistant.enableChatInput();
			} else {
				console.warn("无法启用聊天输入：assistant.enableChatInput 未定义。");
			}
			console.log("引导结束 (finally)，isGuideActive 设置为 false");
		}
	}

	function generateAutoGuideSteps() {
		return [{
			targetSelector: '.hub-card[href="courses.html"]',
			message: '点击这里，系统化学习四级英语的各个单元。',
			position: 'bottom'
		}, {
			targetSelector: '.hub-card[href="#dictionary"]',
			message: '（功能规划中）未来可以在这里查询特定英语单词的标准手语表达。',
			position: 'bottom'
		}, {
			targetSelector: '.hub-card[href="#community"]',
			message: '（功能规划中）与其他学习者互动，分享学习心得和手语视频资源。',
			position: 'bottom'
		}, {
			targetSelector: '.hub-card[href="settings.html"]',
			message: '在这里调整网站外观、字体大小等设置，让学习体验更舒适。',
			position: 'top'
		}, {
			targetSelector: '.hub-card[href="#practice"]',
			message: '（功能规划中）通过有趣的练习来检验和巩固你学到的知识。',
			position: 'top'
		}, {
			targetSelector: '.hub-card[href="resources.html"]',
			message: '查找额外的学习资料，如文化背景介绍、考试技巧等。',
			position: 'top'
		}];
	}

	function generateAssistantGuideSteps() {
		return [{
			targetSelector: '.guide-box.chat-box',
			message: '这是 AI 学习助手聊天框。您可以在这里向我提问关于网站功能的问题。',
			position: 'left'
		}, {
			targetSelector: '#chat-drag-handle',
			message: '您可以按住这里拖动聊天框到屏幕的任意位置。',
			position: 'bottom'
		}, {
			targetSelector: '#toggle-chat',
			message: '点击这个按钮可以收起或展开聊天框内容区域。',
			position: 'bottom'
		}, {
			targetSelector: '#lang-toggle-btn',
			message: '点击这里可以在中文和英文回复之间切换。',
			position: 'bottom'
		}, {
			targetSelector: '#chat-close',
			message: '点击这个按钮可以暂时关闭助手，之后可以通过左下角的悬浮按钮重新打开。',
			position: 'bottom'
		}, {
			targetSelector: '#chat-input',
			message: '在这里输入您关于网站功能的问题，例如“如何背单词？”或“怎么修改主题？”',
			position: 'top'
		}, {
			targetSelector: '#chat-send',
			message: '输入问题后，点击这里发送给我，或者直接按 Enter 键。',
			position: 'top'
		}, {
			targetSelector: '.guide-floating-btn',
			message: '如果关闭了聊天框，可以随时点击这个悬浮按钮重新打开它。',
			position: 'top'
		}];
	}

	const showGuideOptionsBtn = document.getElementById('show-guide-options-btn');
	const guideOptionsPopup = document.getElementById('guide-options-popup');
	const guideCardsBtn = document.getElementById('guide-cards-btn');
	const guideAssistantBtn = document.getElementById('guide-assistant-btn');

	function showGuideOptionsDropdown() {
		console.log("尝试显示下拉菜单... isGuideActive 当前为:", isGuideActive);
		if (isGuideActive) {
			console.log("判断为引导进行中，阻止打开。");
			if (showGuideOptionsBtn) {
				showGuideOptionsBtn.style.animation = 'shakeHorizontal 0.5s';
				setTimeout(() => showGuideOptionsBtn.style.animation = '', 500);
			}
			return;
		}
		if (!guideOptionsPopup || !showGuideOptionsBtn) {
			console.log("下拉菜单或触发按钮未找到，无法显示。");
			return;
		}
		console.log("准备设置 guideOptionsPopup.hidden = false");
		guideOptionsPopup.hidden = false;
		showGuideOptionsBtn.setAttribute('aria-expanded', 'true');
		console.log("引导选项下拉菜单已显示");
		if (guideCardsBtn) guideCardsBtn.focus();
	}

	function hideGuideOptionsDropdown() {
		if (!guideOptionsPopup || !showGuideOptionsBtn) return;
		guideOptionsPopup.hidden = true;
		showGuideOptionsBtn.setAttribute('aria-expanded', 'false');
		console.log("引导选项下拉菜单已隐藏");
	}

	function toggleGuideOptionsDropdown() {
		if (!guideOptionsPopup) return;
		if (guideOptionsPopup.hidden) {
			showGuideOptionsDropdown();
		} else {
			hideGuideOptionsDropdown();
		}
	}

	if (showGuideOptionsBtn) {
		showGuideOptionsBtn.setAttribute('aria-expanded', 'false');
		showGuideOptionsBtn.setAttribute('aria-controls', 'guide-options-popup');
		showGuideOptionsBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			toggleGuideOptionsDropdown();
		});
	} else {
		if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
			console.warn("引导触发按钮 #show-guide-options-btn 未找到！");
		}
	}
	if (guideCardsBtn) {
		guideCardsBtn.addEventListener('click', () => {
			if (isGuideActive) {
				console.log("引导进行中，请先完成。");
				return;
			}
			console.log("点击了引导卡片按钮");
			hideGuideOptionsDropdown();
			setTimeout(() => {
				const cardSteps = generateAutoGuideSteps();
				startSteps(cardSteps);
			}, 100);
		});
	}
	if (guideAssistantBtn) {
		guideAssistantBtn.addEventListener('click', () => {
			if (isGuideActive) {
				console.log("引导进行中，请先完成。");
				return;
			}
			console.log("点击了引导助手按钮");
			hideGuideOptionsDropdown();
			setTimeout(() => {
				console.log("开始 AI 助手引导...");
				const assistantSteps = generateAssistantGuideSteps();
				startSteps(assistantSteps);
			}, 150);
		});
	}
	document.addEventListener('click', (event) => {
		if (guideOptionsPopup && !guideOptionsPopup.hidden && showGuideOptionsBtn && !showGuideOptionsBtn
			.contains(event.target) && !guideOptionsPopup.contains(event.target)) {
			hideGuideOptionsDropdown();
		}
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && guideOptionsPopup && !guideOptionsPopup.hidden) {
			hideGuideOptionsDropdown();
			if (showGuideOptionsBtn) showGuideOptionsBtn.focus();
		}
	});

	Object.assign(guide, {
		startGuideProcess: startSteps,
		isGuideActive: () => isGuideActive
	});

})(); // Page Guide IIFE End
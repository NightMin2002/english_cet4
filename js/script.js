// js/script.js - 全局站点脚本 (适配 settings.html 按钮)

document.addEventListener('DOMContentLoaded', () => {

	// --- 全局变量和核心主题函数 ---
	const htmlElement = document.documentElement;
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	// 应用主题 (根据 light/dark/system 偏好)
	const applyTheme = (preference) => {
		let themeToApply;
		if (preference === 'light' || preference === 'dark') {
			themeToApply = preference;
		} else { // 'system' or null/invalid
			themeToApply = prefersDarkScheme.matches ? 'dark' : 'light';
		}
		htmlElement.setAttribute('data-theme', themeToApply);
		console.log(`Theme applied: ${themeToApply} (Preference: ${preference || 'system'})`);
		updateThemeButtonsState(themeToApply); // 更新首页按钮状态
		updateThemePrefButtonsState(preference || 'system'); // 更新设置页主题偏好按钮状态
	};

	// 保存用户的主题偏好 (light/dark/system)
	const saveThemePreference = (preference) => {
		localStorage.setItem('user_theme', preference);
	};

	// 更新首页按钮激活状态 (基于实际应用的主题: light/dark)
	const lightModeButton = document.getElementById('switch-to-light');
	const darkModeButton = document.getElementById('switch-to-dark');
	const updateThemeButtonsState = (appliedTheme) => {
		if (lightModeButton && darkModeButton) {
			requestAnimationFrame(() => {
				lightModeButton.classList.toggle('active', appliedTheme === 'light');
				darkModeButton.classList.toggle('active', appliedTheme === 'dark');
			});
		}
	};

	// 更新设置页主题偏好按钮状态 (基于用户偏好: light/dark/system)
	const themePrefButtons = document.querySelectorAll('.theme-pref-button'); // 使用新按钮的选择器
	const updateThemePrefButtonsState = (preference) => {
		if (themePrefButtons.length > 0) {
			themePrefButtons.forEach(btn => {
				btn.classList.toggle('active', btn.dataset.themePref === preference);
			});
		}
	};

	// --- 字幕字体大小逻辑 ---
	const subtitleSizeButtons = document.querySelectorAll('.subtitle-size-button'); // 新按钮的选择器
	const subtitleSizeMap = {
		'small': '0.85em',
		'medium': '1em',
		'large': '1.2em',
		'extra-large': '1.4em'
	};
	const applySubtitleSize = (sizeValue) => {
		const cssValue = subtitleSizeMap[sizeValue] || subtitleSizeMap['medium'];
		htmlElement.style.setProperty('--subtitle-font-size', cssValue);
	};
	const saveSubtitleSizePreference = (sizeValue) => {
		localStorage.setItem('user_subtitle_size', sizeValue);
	};
	// 更新字幕大小按钮激活状态
	const updateSubtitleSizeButtonsState = (sizeValue) => {
		if (subtitleSizeButtons.length > 0) {
			subtitleSizeButtons.forEach(btn => {
				btn.classList.toggle('active', btn.dataset.size === sizeValue);
			});
		}
	};
	const loadSubtitleSizePreference = () => {
		const savedSize = localStorage.getItem('user_subtitle_size') || 'medium';
		applySubtitleSize(savedSize);
		updateSubtitleSizeButtonsState(savedSize); // 更新按钮状态，而非 radio
	};

	// --- 全局字体大小逻辑 (按钮结构已存在, 只需确保类名正确) ---
	const fontSizeButtons = document.querySelectorAll('.font-size-button'); // settings.html 中的按钮
	const globalFontSizeMap = {
		'small': 0.85,
		'default': 1,
		'large': 1.15,
		'extra-large': 1.3
	};
	const applyGlobalFontSize = (sizeLevel) => {
		const scaleValue = globalFontSizeMap[sizeLevel] || globalFontSizeMap['default'];
		htmlElement.style.setProperty('--global-font-scale', scaleValue);
		if (fontSizeButtons.length > 0) {
			fontSizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === sizeLevel));
		}
	}; // 这里的更新逻辑不变
	const saveGlobalFontSizePreference = (sizeLevel) => {
		localStorage.setItem('user_global_font_size_level', sizeLevel);
	};
	const loadGlobalFontSizePreference = () => {
		const savedLevel = localStorage.getItem('user_global_font_size_level') || 'default';
		applyGlobalFontSize(savedLevel);
	};


	// --- 初始化 ---
	loadSubtitleSizePreference();
	loadGlobalFontSizePreference();
	const initialUserPreference = localStorage.getItem('user_theme') || 'system';
	applyTheme(initialUserPreference); // 应用初始主题并更新所有相关UI


	// --- 事件监听器 ---

	// 1. 首页主题按钮点击 (保持不变)
	if (lightModeButton) {
		lightModeButton.addEventListener('click', () => {
			saveThemePreference('light');
			applyTheme('light');
			lightModeButton.blur();
		});
	}
	if (darkModeButton) {
		darkModeButton.addEventListener('click', () => {
			saveThemePreference('dark');
			applyTheme('dark');
			darkModeButton.blur();
		});
	}

	// 2. 设置页面主题偏好按钮点击 (修改)
	if (themePrefButtons.length > 0) {
		themePrefButtons.forEach(button => {
			button.addEventListener('click', () => {
				const selectedPreference = button.dataset.themePref;
				if (selectedPreference) {
					saveThemePreference(selectedPreference);
					applyTheme(selectedPreference);
					button.blur();
				}
			});
		});
	}

	// 3. 监听操作系统主题变化 (保持不变)
	prefersDarkScheme.addEventListener('change', () => {
		const pref = localStorage.getItem('user_theme') || 'system';
		if (pref === 'system') {
			console.log("OS theme changed...");
			applyTheme('system');
		}
	});

	// 4. 字幕大小按钮点击 (修改)
	if (subtitleSizeButtons.length > 0) {
		subtitleSizeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const selectedSize = button.dataset.size;
				if (selectedSize) {
					applySubtitleSize(selectedSize);
					saveSubtitleSizePreference(selectedSize);
					updateSubtitleSizeButtonsState(selectedSize);
					button.blur();
				}
			});
		});
	}

	// 5. 全局字体大小按钮点击 (保持不变, 确保 HTML 中 class 正确)
	if (fontSizeButtons.length > 0) {
		fontSizeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const level = button.dataset.size;
				if (level) {
					applyGlobalFontSize(level);
					saveGlobalFontSizePreference(level);
					button.blur();
				}
			});
		});
	}

	// 6. 设置下拉菜单逻辑 (保持不变)
	const settingsButton = document.getElementById('settings-button');
	const settingsMenu = document.getElementById('settings-menu');
	if (settingsButton && settingsMenu) {
		/* ... (设置菜单逻辑折叠，保持不变) ... */
		settingsButton.addEventListener('click', (e) => {
			e.stopPropagation();
			const t = settingsButton.getAttribute("aria-expanded") === "true";
			settingsMenu.classList.toggle("active");
			settingsButton.setAttribute("aria-expanded", String(!t))
		});
		settingsMenu.querySelectorAll("a").forEach(e => {
			e.addEventListener("click", () => {
				settingsMenu.classList.remove("active");
				settingsButton.setAttribute("aria-expanded", "false")
			})
		});
		window.addEventListener("click", e => {
			settingsMenu.classList.contains("active") && !settingsButton.contains(e.target) && !
				settingsMenu.contains(e.target) && (settingsMenu.classList.remove("active"),
					settingsButton.setAttribute("aria-expanded", "false"))
		});
		window.addEventListener("keydown", e => {
			e.key === "Escape" && settingsMenu.classList.contains("active") && (settingsMenu.classList
				.remove("active"), settingsButton.setAttribute("aria-expanded", "false"),
				settingsButton.focus())
		})
	} else {
		!settingsButton && console.error("未找到设置按钮 (#settings-button)!");
		!settingsMenu && console.error("未找到设置菜单 (#settings-menu)!")
	}

	// 7. 资源卡片点击逻辑 (保持不变)
	const resourceGrid = document.querySelector('.resource-grid');
	if (resourceGrid) {
		/* ... (资源卡片逻辑折叠，保持不变) ... */
		const o = resourceGrid.querySelectorAll(".resource-card:not(.placeholder-card)");
		o.forEach(e => {
			const t = e.dataset.url;
			t ? (e.addEventListener("click", () => window.open(t, "_blank", "noopener,noreferrer")), e
				.addEventListener("keydown", o => {
					if (o.key === "Enter" || o.key === " ") {
						o.preventDefault();
						window.open(t, "_blank", "noopener,noreferrer")
					}
				}), e.setAttribute("tabindex", "0"), e.setAttribute("role", "link")) : (e
				.removeAttribute("tabindex"), e.style.cursor = "default")
		})
	}


	// --- 动态背景装饰逻辑 (保持不变) ---
	const decorationContainer = document.querySelector('.dynamic-decorations');
	if (decorationContainer) {
		const shapes = [];
		const numberOfShapes = 3;
		const shapeTypes = ['circle', 'square', 'triangle'];
		const shapeMinSize = 25;
		const shapeMaxSize = 60;
		const friction = 0.98;
		const baseSpeed = 0.1;
		const turbulence = 0.03;
		const padding = 10;
		const pushBackForce = 0.01;
		const initShapes = () => {
			if (!decorationContainer) return;
			decorationContainer.innerHTML = '';
			shapes.length = 0;
			const cw = decorationContainer.offsetWidth;
			const ch = decorationContainer.offsetHeight;
			if (cw === 0 || ch === 0) return;
			for (let i = 0; i < numberOfShapes; i++) {
				const shapeEl = document.createElement('div');
				const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
				shapeEl.classList.add('deco-shape', type);
				const size = Math.random() * (shapeMaxSize - shapeMinSize) + shapeMinSize;
				shapeEl.style.width = `${size}px`;
				shapeEl.style.height = `${size}px`;
				const x = Math.random() * cw;
				const y = Math.random() * ch;
				const vx = (Math.random() - 0.5) * baseSpeed * 2;
				const vy = (Math.random() - 0.5) * baseSpeed * 2;
				shapeEl.style.left = `0px`;
				shapeEl.style.top = `0px`;
				shapeEl.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
				shapeEl.style.opacity = (Math.random() * 0.1 + 0.08).toFixed(2);
				decorationContainer.appendChild(shapeEl);
				shapes.push({
					element: shapeEl,
					x: x,
					y: y,
					vx: vx,
					vy: vy,
					size: size
				});
			}
		};
		const updateAnimation = () => {
			if (!decorationContainer || shapes.length === 0) return;
			const cw = decorationContainer.offsetWidth;
			const ch = decorationContainer.offsetHeight;
			shapes.forEach(s => {
				s.vx += (Math.random() - 0.5) * turbulence;
				s.vy += (Math.random() - 0.5) * turbulence;
				const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
				const maxSpeed = baseSpeed * 2.0;
				if (speed > maxSpeed) {
					s.vx *= maxSpeed / speed;
					s.vy *= maxSpeed / speed;
				}
				s.vx *= friction;
				s.vy *= friction;
				s.x += s.vx;
				s.y += s.vy;
				if (s.x - s.size / 2 < padding) {
					s.vx += pushBackForce * (padding - (s.x - s.size / 2));
					if (s.x - s.size / 2 < 0) s.x = s.size / 2 + 1;
				} else if (s.x + s.size / 2 > cw - padding) {
					s.vx -= pushBackForce * ((s.x + s.size / 2) - (cw - padding));
					if (s.x + s.size / 2 > cw) s.x = cw - s.size / 2 - 1;
				}
				if (s.y - s.size / 2 < padding) {
					s.vy += pushBackForce * (padding - (s.y - s.size / 2));
					if (s.y - s.size / 2 < 0) s.y = s.size / 2 + 1;
				} else if (s.y + s.size / 2 > ch - padding) {
					s.vy -= pushBackForce * ((s.y + s.size / 2) - (ch - padding));
					if (s.y + s.size / 2 > ch) s.y = ch - s.size / 2 - 1;
				}
				s.element.style.transform =
					`translate(${s.x - s.size / 2}px, ${s.y - s.size / 2}px)`;
			});
			requestAnimationFrame(updateAnimation);
		};
		setTimeout(() => {
			initShapes();
			if (shapes.length > 0) requestAnimationFrame(updateAnimation);
		}, 0);
	}

}); // End of DOMContentLoaded listener
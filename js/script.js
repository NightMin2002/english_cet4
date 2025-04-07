// js/script.js 

document.addEventListener('DOMContentLoaded', () => {

	// --- 全局变量 ---
	const htmlElement = document.documentElement;
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	// --- 获取可能存在的 UI 元素 ---
	// 首页按钮
	const lightModeButton = document.getElementById('switch-to-light');
	const darkModeButton = document.getElementById('switch-to-dark');
	// 设置页主题按钮
	const themePrefButtons = document.querySelectorAll('.theme-pref-button');
	// 设置页字幕按钮
	const subtitleSizeButtons = document.querySelectorAll('.subtitle-size-button');
	// 设置页字体按钮
	const fontSizeButtons = document.querySelectorAll('.font-size-button');
	// 设置菜单
	const settingsButton = document.getElementById('settings-button');
	const settingsMenu = document.getElementById('settings-menu');
	// 资源页
	const resourceGrid = document.querySelector('.resource-grid');
	// 动态装饰
	const decorationContainer = document.querySelector('.dynamic-decorations');


	// --- 核心主题应用与状态更新函数 ---
	const applyTheme = (preference) => {
		// 1. 确定实际应用的主题 (light 或 dark)
		let themeToApply;
		if (preference === 'light' || preference === 'dark') {
			themeToApply = preference;
		} else { // 'system' or null/invalid
			themeToApply = prefersDarkScheme.matches ? 'dark' : 'light';
		}

		// 2. 应用 data-theme 属性
		htmlElement.setAttribute('data-theme', themeToApply);
		console.log(`Theme applied: ${themeToApply} (Preference: ${preference || 'system'})`);

		// 3. 立即更新所有相关按钮的激活状态
		// 更新首页按钮
		if (lightModeButton && darkModeButton) {
			lightModeButton.classList.toggle('active', themeToApply === 'light');
			darkModeButton.classList.toggle('active', themeToApply === 'dark');
		}
		// 更新设置页主题偏好按钮 (基于用户的偏好 preference)
		if (themePrefButtons.length > 0) {
			themePrefButtons.forEach(btn => {
				btn.classList.toggle('active', btn.dataset.themePref === (preference || 'system'));
			});
		}
	};

	// --- 保存主题偏好 ---
	const saveThemePreference = (preference) => {
		localStorage.setItem('user_theme', preference);
		console.log(`Theme preference saved: ${preference}`);
	};

	// --- 字幕字体大小逻辑 ---
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
		updateSubtitleSizeButtonsState(savedSize);
	};

	// --- 全局字体大小逻辑 ---
	const globalFontSizeMap = {
		'small': 0.85,
		'default': 1,
		'large': 1.15,
		'extra-large': 1.3
	};
	const updateGlobalFontSizeButtonsState = (sizeLevel) => {
		if (fontSizeButtons.length > 0) {
			fontSizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === sizeLevel));
		}
	};
	const applyGlobalFontSize = (sizeLevel) => {
		const scaleValue = globalFontSizeMap[sizeLevel] || globalFontSizeMap['default'];
		htmlElement.style.setProperty('--global-font-scale', scaleValue);
		updateGlobalFontSizeButtonsState(sizeLevel);
	};
	const saveGlobalFontSizePreference = (sizeLevel) => {
		localStorage.setItem('user_global_font_size_level', sizeLevel);
	};
	const loadGlobalFontSizePreference = () => {
		const savedLevel = localStorage.getItem('user_global_font_size_level') || 'default';
		applyGlobalFontSize(savedLevel);
	};

	// --- 初始化 ---
	loadSubtitleSizePreference(); // 加载并应用字幕大小，更新按钮状态
	loadGlobalFontSizePreference(); // 加载并应用全局字体大小，更新按钮状态
	const initialUserPreference = localStorage.getItem('user_theme') || 'system';
	applyTheme(initialUserPreference); // 应用初始主题并更新所有主题按钮状态

	// --- 事件监听器 ---

	// 1. 首页主题按钮
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

	// 2. 设置页主题偏好按钮
	if (themePrefButtons.length > 0) {
		themePrefButtons.forEach(button => {
			button.addEventListener('click', () => {
				const pref = button.dataset.themePref;
				if (pref) {
					saveThemePreference(pref);
					applyTheme(pref);
					button.blur();
				}
			});
		});
	}

	// 3. 操作系统主题变化
	prefersDarkScheme.addEventListener('change', () => {
		const pref = localStorage.getItem('user_theme') || 'system';
		if (pref === 'system') {
			console.log("OS theme changed, re-applying system preference...");
			applyTheme('system');
		}
	});

	// 4. 字幕大小按钮
	if (subtitleSizeButtons.length > 0) {
		subtitleSizeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const size = button.dataset.size;
				if (size) {
					applySubtitleSize(size);
					saveSubtitleSizePreference(size);
					updateSubtitleSizeButtonsState(size);
					button.blur();
				}
			});
		});
	}

	// 5. 全局字体大小按钮
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

	// 6. 设置下拉菜单
	if (settingsButton && settingsMenu) {
		/* ... (逻辑不变) ... */
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

	// 7. 资源卡片点击
	if (resourceGrid) {
		/* ... (逻辑不变) ... */
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

	// 8. 动态背景装饰
	if (decorationContainer) {
		/* ... (逻辑不变) ... */
		const o = [],
			n = 3,
			r = ["circle", "square", "triangle"],
			a = 25,
			i = 60,
			l = 0.98,
			s = 0.1,
			c = 0.03,
			d = 10,
			u = 0.01,
			m = () => {
				if (!decorationContainer) return;
				decorationContainer.innerHTML = "";
				o.length = 0;
				const e = decorationContainer.offsetWidth,
					t = decorationContainer.offsetHeight;
				if (e === 0 || t === 0) return;
				for (let n = 0; n < 3; n++) {
					const i = document.createElement("div"),
						l = r[Math.floor(Math.random() * r.length)];
					i.classList.add("deco-shape", l);
					const c = Math.random() * (60 - 25) + 25;
					i.style.width = `${c}px`;
					i.style.height = `${c}px`;
					const d = Math.random() * e,
						u = Math.random() * t,
						m = (Math.random() - 0.5) * s * 2,
						h = (Math.random() - 0.5) * s * 2;
					i.style.left = "0px";
					i.style.top = "0px";
					i.style.transform = `translate(${d-c/2}px, ${u-c/2}px)`;
					i.style.opacity = (Math.random() * 0.1 + 0.08).toFixed(2);
					decorationContainer.appendChild(i);
					o.push({
						element: i,
						x: d,
						y: u,
						vx: m,
						vy: h,
						size: c
					})
				}
			},
			p = () => {
				if (!decorationContainer || o.length === 0) return;
				const e = decorationContainer.offsetWidth,
					t = decorationContainer.offsetHeight;
				o.forEach(o => {
					o.vx += (Math.random() - 0.5) * c;
					o.vy += (Math.random() - 0.5) * c;
					const n = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
					const a = s * 2;
					if (n > a) {
						o.vx *= a / n;
						o.vy *= a / n
					}
					o.vx *= l;
					o.vy *= l;
					o.x += o.vx;
					o.y += o.vy;
					if (o.x - o.size / 2 < d) {
						o.vx += u * (d - (o.x - o.size / 2));
						if (o.x - o.size / 2 < 0) o.x = o.size / 2 + 1
					} else if (o.x + o.size / 2 > e - d) {
						o.vx -= u * ((o.x + o.size / 2) - (e - d));
						if (o.x + o.size / 2 > e) o.x = e - o.size / 2 - 1
					}
					if (o.y - o.size / 2 < d) {
						o.vy += u * (d - (o.y - o.size / 2));
						if (o.y - o.size / 2 < 0) o.y = o.size / 2 + 1
					} else if (o.y + o.size / 2 > t - d) {
						o.vy -= u * ((o.y + o.size / 2) - (t - d));
						if (o.y + o.size / 2 > t) o.y = t - o.size / 2 - 1
					}
					o.element.style.transform = `translate(${o.x-o.size/2}px, ${o.y-o.size/2}px)`
				});
				requestAnimationFrame(p)
			};
		setTimeout(() => {
			m();
			o.length > 0 && requestAnimationFrame(p)
		}, 0)
	}

}); // End of DOMContentLoaded listener
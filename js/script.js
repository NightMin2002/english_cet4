// js/script.js - Global site scripts

document.addEventListener('DOMContentLoaded', () => {

	// --- Theme Switching Logic (Global) ---
	const themeRadios = document.querySelectorAll(
		'input[name="theme"]'); // Used for initialization & OS change sync
	const htmlElement = document.documentElement;
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	const applyTheme = (theme) => { // Needed globally
		if (theme === 'light') htmlElement.setAttribute('data-theme', 'light');
		else if (theme === 'dark') htmlElement.setAttribute('data-theme', 'dark');
		else htmlElement.removeAttribute('data-theme');
	};
	const saveThemePreference = (theme) => { // Needed globally by settings page interaction
		localStorage.setItem('user_theme', theme);
	};

	// --- Subtitle Font Size Logic (Global Application) ---
	const subtitleSizeRadios = document.querySelectorAll(
		'input[name="subtitleSize"]'); // Needed for settings page interaction check
	const subtitleSizeMap = {
		'small': '0.85em',
		'medium': '1em',
		'large': '1.2em',
		'extra-large': '1.4em'
	};
	const applySubtitleSize = (sizeValue) => { // Needed globally
		const cssValue = subtitleSizeMap[sizeValue] || subtitleSizeMap['medium'];
		htmlElement.style.setProperty('--subtitle-font-size', cssValue);
	};
	const saveSubtitleSizePreference = (sizeValue) => { // Needed globally by settings page interaction
		localStorage.setItem('user_subtitle_size', sizeValue);
	};
	const loadSubtitleSizePreference = () => { // Needed globally on load
		const savedSize = localStorage.getItem('user_subtitle_size') || 'medium';
		applySubtitleSize(savedSize);
		// Update radios only if on settings page
		if (subtitleSizeRadios.length > 0) {
			let found = false;
			subtitleSizeRadios.forEach(r => {
				r.checked = (r.value === savedSize);
				if (r.checked) found = true;
			});
			if (!found) {
				const m = document.querySelector('input[name="subtitleSize"][value="medium"]');
				if (m) m.checked = true;
			}
		}
	};

	// --- Global Font Size Logic (Global Application) ---
	const fontSizeButtons = document.querySelectorAll(
		'.font-size-button'); // Needed for settings page interaction check
	const globalFontSizeMap = {
		'small': 0.85,
		'default': 1,
		'large': 1.15,
		'extra-large': 1.3
	};
	const applyGlobalFontSize = (sizeLevel) => { // Needed globally
		const scaleValue = globalFontSizeMap[sizeLevel] || globalFontSizeMap['default'];
		htmlElement.style.setProperty('--global-font-scale', scaleValue);
		// Update buttons only if on settings page
		if (fontSizeButtons.length > 0) {
			fontSizeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.size === sizeLevel));
		}
	};
	const saveGlobalFontSizePreference = (sizeLevel) => { // Needed globally by settings page interaction
		localStorage.setItem('user_global_font_size_level', sizeLevel);
	};
	const loadGlobalFontSizePreference = () => { // Needed globally on load
		const savedLevel = localStorage.getItem('user_global_font_size_level') || 'default';
		applyGlobalFontSize(savedLevel);
	};


	// --- Initialization (Global Settings Application) ---
	loadSubtitleSizePreference();
	loadGlobalFontSizePreference();
	// Initialize theme radio state only if on settings page
	if (themeRadios.length > 0) {
		const initialTheme = localStorage.getItem('user_theme') || 'system';
		let found = false;
		themeRadios.forEach(r => {
			r.checked = (r.value === initialTheme);
			if (r.checked) found = true;
		});
		if (!found) {
			const s = document.querySelector('input[name="theme"][value="system"]');
			if (s) s.checked = true;
		}
	}


	// --- Event Listeners (Global and Conditional) ---

	// Theme radio changes (ONLY if radios exist - Settings Page)
	if (themeRadios.length > 0) {
		themeRadios.forEach(radio => {
			radio.addEventListener('change', (event) => {
				const selectedPreference = event.target.value;
				if (selectedPreference === 'system') {
					const currentSystemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
					applyTheme(currentSystemTheme);
				} else {
					applyTheme(selectedPreference);
				}
				saveThemePreference(selectedPreference);
			});
		});
	}

	// Listen for OS theme changes (Global)
	prefersDarkScheme.addEventListener('change', (event) => {
		const currentPreference = localStorage.getItem('user_theme') || 'system';
		if (currentPreference === 'system') {
			const newSystemTheme = event.matches ? 'dark' : 'light';
			applyTheme(newSystemTheme);
			// Update radio state if on settings page
			if (themeRadios.length > 0) {
				const systemRadio = document.querySelector('input[name="theme"][value="system"]');
				if (systemRadio) systemRadio.checked = true;
			}
		}
	});

	// Subtitle size radio changes (ONLY if radios exist - Settings Page)
	if (subtitleSizeRadios.length > 0) {
		subtitleSizeRadios.forEach(radio => {
			radio.addEventListener('change', (event) => {
				const selectedSize = event.target.value;
				applySubtitleSize(selectedSize);
				saveSubtitleSizePreference(selectedSize);
			});
		});
	}

	// Global font size button clicks (ONLY if buttons exist - Settings Page)
	if (fontSizeButtons.length > 0) {
		fontSizeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const selectedLevel = button.dataset.size;
				if (selectedLevel) {
					applyGlobalFontSize(selectedLevel);
					saveGlobalFontSizePreference(selectedLevel);
				}
			});
		});
	}

	// --- Settings Dropdown Menu Logic (Global Component) ---
	const settingsButton = document.getElementById('settings-button');
	const settingsMenu = document.getElementById('settings-menu');

	console.log("查找设置按钮:", settingsButton);
	console.log("查找设置菜单:", settingsMenu);

	if (settingsButton && settingsMenu) { // Check elements exist
		settingsButton.addEventListener('click', (event) => {
			console.log('设置按钮被点击！'); // 确认点击
			event.stopPropagation();

			console.log("当前菜单元素:", settingsMenu);
			console.log("菜单是否包含 active 类 (切换前):", settingsMenu.classList.contains('active'));

			const isExpanded = settingsButton.getAttribute('aria-expanded') === 'true';
			settingsMenu.classList.toggle('active');
			console.log("菜单是否包含 active 类 (切换后):", settingsMenu.classList.contains('active'));
			settingsButton.setAttribute('aria-expanded', String(!isExpanded));
		});
		settingsMenu.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				settingsMenu.classList.remove('active');
				settingsButton.setAttribute('aria-expanded', 'false');
			});
		});
		window.addEventListener('click', (event) => {
			if (settingsMenu.classList.contains('active') && !settingsButton.contains(event.target) && !
				settingsMenu.contains(event.target)) {
				settingsMenu.classList.remove('active');
				settingsButton.setAttribute('aria-expanded', 'false');
			}
		});
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && settingsMenu.classList.contains('active')) {
				settingsMenu.classList.remove('active');
				settingsButton.setAttribute('aria-expanded', 'false');
				settingsButton.focus();
			}
		});
	} else {
		// 这些错误信息之前应该没出现，因为按钮点击能打印
		if (!settingsButton) console.error("Settings button (#settings-button) not found!");
		if (!settingsMenu) console.error("Settings menu (#settings-menu) not found!");
	}
	// --- Resource Card Click Logic (Conditional - Resources Page Specific) ---
	const resourceGrid = document.querySelector('.resource-grid'); // Check if resource grid exists
	if (resourceGrid) {
		const resourceCards = resourceGrid.querySelectorAll('.resource-card:not(.placeholder-card)');
		resourceCards.forEach(card => {
			const url = card.dataset.url;
			if (url) {
				card.addEventListener('click', () => window.open(url, '_blank', 'noopener,noreferrer'));
				card.addEventListener('keydown', (event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						window.open(url, '_blank', 'noopener,noreferrer');
					}
				});
				card.setAttribute('tabindex', '0');
				card.setAttribute('role', 'link');
			} else {
				console.warn("Resource card missing data-url:", card);
				card.removeAttribute('tabindex');
			}
		});
	}


	// --- Dynamic Decoration Logic (Global Background Animation) ---
	const decorationContainer = document.querySelector('.dynamic-decorations');
	const shapes = [];
	const numberOfShapes = 3; // Adjusted number
	const shapeTypes = ['circle', 'square', 'triangle'];
	const shapeMinSize = 25;
	const shapeMaxSize = 60;
	const friction = 0.98;
	const baseSpeed = 0.1;
	const turbulence = 0.03;
	const padding = 10;
	const pushBackForce = 0.01;

	const initShapes = () => { // Initialize shapes
		if (!decorationContainer) return;
		decorationContainer.innerHTML = '';
		shapes.length = 0;
		const containerWidth = decorationContainer.offsetWidth;
		const containerHeight = decorationContainer.offsetHeight;
		if (containerWidth === 0 || containerHeight === 0) {
			console.warn("Decoration container zero dimensions.");
		}
		for (let i = 0; i < numberOfShapes; i++) {
			const shapeElement = document.createElement('div');
			const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
			shapeElement.classList.add('deco-shape', type);
			const size = Math.random() * (shapeMaxSize - shapeMinSize) + shapeMinSize;
			shapeElement.style.width = `${size}px`;
			shapeElement.style.height = `${size}px`;
			const x = Math.random() * containerWidth;
			const y = Math.random() * containerHeight;
			const vx = (Math.random() - 0.5) * baseSpeed * 2;
			const vy = (Math.random() - 0.5) * baseSpeed * 2;
			shapeElement.style.left = `0px`;
			shapeElement.style.top = `0px`;
			shapeElement.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
			shapeElement.style.opacity = (Math.random() * 0.1 + 0.08).toFixed(2);
			decorationContainer.appendChild(shapeElement);
			shapes.push({
				element: shapeElement,
				x: x,
				y: y,
				vx: vx,
				vy: vy,
				size: size
			});
		}
	};

	const updateAnimation = () => { // Animation loop
		if (!decorationContainer || shapes.length === 0) return;
		const containerWidth = decorationContainer.offsetWidth;
		const containerHeight = decorationContainer.offsetHeight;
		shapes.forEach(shape => {
			shape.vx += (Math.random() - 0.5) * turbulence;
			shape.vy += (Math.random() - 0.5) * turbulence;
			const speed = Math.sqrt(shape.vx * shape.vx + shape.vy * shape.vy);
			const maxSpeed = baseSpeed * 2.0;
			if (speed > maxSpeed) {
				shape.vx *= maxSpeed / speed;
				shape.vy *= maxSpeed / speed;
			}
			shape.vx *= friction;
			shape.vy *= friction;
			shape.x += shape.vx;
			shape.y += shape.vy;
			// Boundary Handling
			if (shape.x - shape.size / 2 < padding) {
				shape.vx += pushBackForce * (padding - (shape.x - shape.size / 2));
				if (shape.x - shape.size / 2 < 0) shape.x = shape.size / 2 + 1;
			} else if (shape.x + shape.size / 2 > containerWidth - padding) {
				shape.vx -= pushBackForce * ((shape.x + shape.size / 2) - (containerWidth -
					padding));
				if (shape.x + shape.size / 2 > containerWidth) shape.x = containerWidth - shape
					.size / 2 - 1;
			}
			if (shape.y - shape.size / 2 < padding) {
				shape.vy += pushBackForce * (padding - (shape.y - shape.size / 2));
				if (shape.y - shape.size / 2 < 0) shape.y = shape.size / 2 + 1;
			} else if (shape.y + shape.size / 2 > containerHeight - padding) {
				shape.vy -= pushBackForce * ((shape.y + shape.size / 2) - (containerHeight -
					padding));
				if (shape.y + shape.size / 2 > containerHeight) shape.y = containerHeight - shape
					.size / 2 - 1;
			}
			shape.element.style.transform =
				`translate(${shape.x - shape.size / 2}px, ${shape.y - shape.size / 2}px)`;
		});
		requestAnimationFrame(updateAnimation);
	};

	// --- Initialization and Start for Dynamic Decoration ---
	if (decorationContainer) { // Start animation if container exists
		setTimeout(() => {
			initShapes();
			if (shapes.length > 0) requestAnimationFrame(updateAnimation);
		}, 0);
	}

}); // End of DOMContentLoaded listener
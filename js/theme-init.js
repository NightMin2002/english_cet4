(function() {
	const themeKey = 'user_theme';
	const themeQuery = '(prefers-color-scheme: dark)';
	const storedTheme = localStorage.getItem(themeKey);
	const prefersDark = window.matchMedia(themeQuery).matches;
	let currentTheme;
	if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
		currentTheme = storedTheme;
	} else if (storedTheme === 'system' || !storedTheme) {
		currentTheme = prefersDark ? 'dark' : 'light';
	} else {
		currentTheme = 'light';
	}
	document.documentElement.setAttribute('data-theme', currentTheme);
})();
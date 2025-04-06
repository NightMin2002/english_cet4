// js/page-vocab.js - 词汇卡片页面脚本

document.addEventListener('DOMContentLoaded', () => {
	const cardContainer = document.getElementById('current-word-card');
	const prevButton = document.getElementById('prev-word');
	const nextButton = document.getElementById('next-word');
	const toggleDetailsButton = document.getElementById('toggle-details');

	// 检查核心元素是否存在
	if (!cardContainer || !prevButton || !nextButton || !toggleDetailsButton) {
		console.error('词汇卡片页缺少必要的元素!');
		if (cardContainer) cardContainer.innerHTML =
			'<div class="card-content-placeholder error">页面元素加载不完整。</div>';
		return;
	}

	let vocabularyData = []; // 存储获取到的词汇数据
	let currentIndex = 0; // 当前显示的单词索引
	let detailsVisible = false; // 详情是否可见的状态
	let isFlipping = false; // 防止动画期间重复点击的标志
	let currentUnitId = null; // 存储当前单元 ID

	// --- 单元标题映射 ---
	// (您可以根据需要添加更多单元)
	const unitTitles = {
		1: "Unit 1: 初入校园",
		2: "Unit 2: 图书馆与学习",
		3: "Unit 3: 课堂活动",
		4: "Unit 4: 社团与兴趣"
		// ... 更多单元
	};
	const defaultTitle = "核心词汇"; // 默认标题

	// --- 更新页面标题和面包屑的函数 ---
	const updatePageTitles = (unitId) => {
		const titleString = unitTitles[unitId] || defaultTitle; // 获取单元标题或使用默认值

		const pageTitleElement = document.getElementById('page-title-vocab');
		const breadcrumbElement = document.getElementById('breadcrumb-current-unit');
		const mainTitleElement = document.getElementById('unit-main-title');
		const introElement = document.getElementById('unit-intro'); // 可选

		if (pageTitleElement) {
			pageTitleElement.textContent = `${titleString} - 核心词汇 - 无障碍英语学习平台`;
		}
		if (breadcrumbElement) {
			breadcrumbElement.textContent = `${titleString} - 核心词汇`;
		}
		if (mainTitleElement) {
			mainTitleElement.textContent = `${titleString} - 核心词汇`;
		}
		if (introElement) { // 可选更新简介
			introElement.textContent = `学习 ${titleString} 的常见单词，配有图像和手语视频辅助记忆。`;
		}
	};

	// --- 更新卡片某个面的内容 ---
	const updateFaceContent = (faceElement, wordIndex) => {
		if (!faceElement || wordIndex < 0 || wordIndex >= vocabularyData.length) {
			if (faceElement) faceElement.innerHTML =
				'<div class="card-content-placeholder error">无法加载内容</div>';
			return;
		}
		const wordData = vocabularyData[wordIndex];
		const contentHTML = `
            <article class="word-entry" role="article" aria-labelledby="word-${wordData.id || wordData.word.toLowerCase()}">
                <h3 id="word-${wordData.id || wordData.word.toLowerCase()}">${wordData.word}</h3>
                <p><strong>词性:</strong> ${wordData.partOfSpeech || 'N/A'}</p>
                <p><strong>释义:</strong> ${wordData.meaning || 'N/A'}</p>
                <p class="details-hidden"><strong>发音:</strong> ${wordData.pronunciation || 'N/A'}</p> <!-- 修正了拼写错误 -->
                <div class="word-visuals">
                     ${wordData.imageUrl ? `<img src="${wordData.imageUrl}" alt="与 ${wordData.word} 相关的图片" class="word-image">` : '<div class="word-image placeholder-image" style="font-size: 0.8em; color: var(--text-light); display: flex; align-items: center; justify-content: center;">[无图片]</div>'}
                    <div class="video-placeholder details-hidden">
                        <p><strong>手语视频 (${wordData.word}):</strong></p>
                        <button class="play-button word-video-btn" data-video-src="${wordData.signVideoWordUrl || ''}" aria-label="播放 ${wordData.word} 的手语视频" ${!wordData.signVideoWordUrl ? 'disabled' : ''}>▶️ 观看</button>
                        <div class="subtitle-placeholder">[视频对应的字幕]</div>
                    </div>
                </div>
                ${wordData.exampleSentence ? `
                <div class="example-sentence details-hidden">
                    <p><strong>例句:</strong> ${wordData.exampleSentence.replace(new RegExp(`\\b${wordData.word}\\b`, 'gi'), `<strong>${wordData.word}</strong>`)}</p>
                    <button class="play-button small sentence-video-btn" data-video-src="${wordData.signVideoSentenceUrl || ''}" aria-label="播放例句的手语视频" ${!wordData.signVideoSentenceUrl ? 'disabled' : ''}>观看例句手语</button>
                </div>
                ` : ''}
            </article>
        `;
		faceElement.innerHTML = contentHTML;
		const entryElement = faceElement.querySelector('.word-entry');
		if (entryElement) {
			entryElement.classList.toggle('show-details-entry', detailsVisible);
		}
		const scopeSelector = faceElement.classList.contains('card-front') ? '.card-front' : '.card-back';
		addVideoAlertListeners(scopeSelector);
	};

	// --- 准备背面并翻转卡片 ---
	const prepareAndFlipCard = (newIndex) => {
		if (isFlipping || newIndex < 0 || newIndex >= vocabularyData.length) return;

		isFlipping = true;
		const flipInner = cardContainer.querySelector('.flip-card-inner');
		const cardBack = cardContainer.querySelector('.card-back');
		const cardFront = cardContainer.querySelector('.card-front');

		if (!flipInner || !cardBack || !cardFront) {
			isFlipping = false;
			return;
		}

		updateFaceContent(cardBack, newIndex);
		flipInner.classList.add('is-flipped');

		flipInner.addEventListener('transitionend', () => {
			updateFaceContent(cardFront, newIndex);
			flipInner.style.transition = 'none';
			flipInner.classList.remove('is-flipped');
			setTimeout(() => {
				flipInner.style.transition = 'transform 0.6s';
				isFlipping = false;
				currentIndex = newIndex;
				prevButton.disabled = (currentIndex === 0);
				nextButton.disabled = (currentIndex === vocabularyData.length - 1);
			}, 50);
		}, {
			once: true
		});
	};

	// --- 初始化卡片结构 ---
	const initializeCard = () => {
		const initialHTML = `
            <div class="flip-card-inner">
                <div class="card-face card-front">
                    <div class="card-content-placeholder">加载中...</div>
                </div>
                <div class="card-face card-back">
                    <div class="card-content-placeholder"></div>
                </div>
            </div>`;
		cardContainer.innerHTML = initialHTML;
		detailsVisible = false;

		const cardFront = cardContainer.querySelector('.card-front');
		if (cardFront) {
			updateFaceContent(cardFront, currentIndex);
		}

		if (toggleDetailsButton) {
			toggleDetailsButton.textContent = '显示详情';
			toggleDetailsButton.setAttribute('aria-expanded', 'false');
			toggleDetailsButton.disabled = !(vocabularyData && vocabularyData.length > 0); // 如果没数据也禁用
		}
		prevButton.disabled = (currentIndex === 0);
		nextButton.disabled = (currentIndex >= vocabularyData.length - 1); // 初始和只有一个单词时也禁用
	};

	// --- 获取词汇数据 ---
	const fetchVocabularyData = async () => {
		initializeCard(); // 先显示加载中状态
		cardContainer.innerHTML = '<div class="card-content-placeholder">正在加载单词数据...</div>';
		prevButton.disabled = true;
		nextButton.disabled = true;
		toggleDetailsButton.disabled = true;

		const urlParams = new URLSearchParams(window.location.search);
		const unitIdParam = urlParams.get('unit');

		if (!unitIdParam || isNaN(parseInt(unitIdParam, 10)) || parseInt(unitIdParam, 10) <= 0) {
			console.error('URL 中缺少有效的 unit 参数 (例如 ?unit=1)');
			cardContainer.innerHTML =
				`<div class="card-content-placeholder error">无法确定要加载哪个单元的单词。请检查 URL。</div>`;
			updatePageTitles(null); // 更新标题为默认值
			return;
		}
		currentUnitId = parseInt(unitIdParam, 10); // 保存当前 unitId
		updatePageTitles(currentUnitId); // 更新页面标题等

		try {
			const apiUrl = `http://localhost:3000/api/units/${currentUnitId}/vocab`;
			const response = await fetch(apiUrl);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();

			if (data && data.length > 0) {
				vocabularyData = data;
				currentIndex = 0;
				initializeCard(); // 使用获取的数据重新初始化卡片
			} else {
				vocabularyData = [];
				cardContainer.innerHTML =
					`<div class="card-content-placeholder">单元 ${currentUnitId} 暂无单词数据。</div>`;
				// 保持按钮禁用状态
			}
		} catch (error) {
			console.error(`获取 Unit ${currentUnitId} 单词数据失败:`, error);
			cardContainer.innerHTML =
				`<div class="card-content-placeholder error">加载 Unit ${currentUnitId} 单词数据失败: ${error.message}</div>`;
			updatePageTitles(currentUnitId); // 即使加载失败也显示单元标题
		}
	};

	// --- 为视频按钮添加提示事件 ---
	const addVideoAlertListeners = (scopeSelector = '') => {
		const container = scopeSelector ? cardContainer.querySelector(scopeSelector) : cardContainer;
		if (!container) return;
		const videoButtons = container.querySelectorAll('.play-button');
		videoButtons.forEach(button => {
			// 移除旧监听器以防重复添加
			const oldListener = button.handleVideoClick; // 假设我们将监听器存储在元素上
			if (oldListener) {
				button.removeEventListener('click', oldListener);
			}
			// 定义新监听器
			const listener = (event) => handleVideoPlaceholderClick(event);
			// 将监听器存储在按钮上，以便以后移除
			button.handleVideoClick = listener;
			if (!button.disabled) {
				button.addEventListener('click', listener);
			}
		});
	};
	const handleVideoPlaceholderClick = (event) => {
		const videoSrc = event.target.dataset.videoSrc;
		alert(`手语视频 (${videoSrc || '无链接'}) 功能开发中！`);
	};

	// --- 切换详情可见性 ---
	const toggleDetails = () => {
		detailsVisible = !detailsVisible;
		cardContainer.querySelectorAll('.word-entry').forEach(entry => {
			entry.classList.toggle('show-details-entry', detailsVisible);
		});
		if (toggleDetailsButton) {
			toggleDetailsButton.textContent = detailsVisible ? '收起详情' : '显示详情';
			toggleDetailsButton.setAttribute('aria-expanded', String(detailsVisible));
		}
	};

	// --- 事件监听器 ---
	if (toggleDetailsButton) {
		toggleDetailsButton.addEventListener('click', toggleDetails);
	}
	nextButton.addEventListener('click', () => {
		if (currentIndex < vocabularyData.length - 1) {
			prepareAndFlipCard(currentIndex + 1);
		}
	});
	prevButton.addEventListener('click', () => {
		if (currentIndex > 0) {
			prepareAndFlipCard(currentIndex - 1);
		}
	});

	// --- 初始加载 ---
	fetchVocabularyData();

});
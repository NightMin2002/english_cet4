// js/page-vocab.js - Scripts for the vocabulary card page with flip animation

document.addEventListener('DOMContentLoaded', () => {
	const cardContainer = document.getElementById('current-word-card');
	const prevButton = document.getElementById('prev-word');
	const nextButton = document.getElementById('next-word');
	const toggleDetailsButton = document.getElementById('toggle-details');

	// Check if essential elements exist
	if (!cardContainer || !prevButton || !nextButton || !toggleDetailsButton) {
		console.error('Essential elements for vocab card page not found!');
		if (cardContainer) cardContainer.innerHTML =
			'<div class="card-content-placeholder error">页面元素加载不完整。</div>';
		return;
	}

	let vocabularyData = []; // To store fetched vocabulary data
	let currentIndex = 0; // Index of the currently displayed word
	let detailsVisible = false; // State for showing/hiding details
	let isFlipping = false; // Flag to prevent rapid clicks during animation

	// --- Function to update the content of a specific card face (front or back) ---
	const updateFaceContent = (faceElement, wordIndex) => {
		// Check if index is valid and face element exists
		if (!faceElement || wordIndex < 0 || wordIndex >= vocabularyData.length) {
			console.error("Invalid index or face element for updateFaceContent", faceElement, wordIndex);
			// Optionally clear the face or show an error inside it
			if (faceElement) faceElement.innerHTML =
				'<div class="card-content-placeholder error">无法加载内容</div>';
			return;
		}

		const wordData = vocabularyData[wordIndex]; // Get data for the specified index

		// Build the HTML for the word entry inside the face
		const contentHTML = `
            <article class="word-entry" role="article" aria-labelledby="word-${wordData.id || wordData.word.toLowerCase()}">
                <h3 id="word-${wordData.id || wordData.word.toLowerCase()}">${wordData.word}</h3>
                <p><strong>词性:</strong> ${wordData.partOfSpeech || 'N/A'}</p>
                <div class="word-visuals">
                     ${wordData.imageUrl ? `<img src="${wordData.imageUrl}" alt="与 ${wordData.word} 相关的图片" class="word-image">` : '<div class="word-image placeholder-image" style="font-size: 0.8em; color: var(--text-light); display: flex; align-items: center; justify-content: center;">[无图片]</div>'}
                    <div class="video-placeholder details-hidden">
                        <p><strong>手语视频 (${wordData.word}):</strong></p>
                        <button class="play-button word-video-btn" data-video-src="${wordData.signVideoWordUrl || ''}" aria-label="播放 ${wordData.word} 的手语视频" ${!wordData.signVideoWordUrl ? 'disabled' : ''}>▶️ 观看</button>
                        <div class="subtitle-placeholder">[视频对应的字幕]</div>
                    </div>
                </div>
                <p class="details-hidden"><strong>发音:</strong> ${wordData.pronunciation || 'N/A'}</p>
                <p class="details-hidden"><strong>释义:</strong> ${wordData.meaning || 'N/A'}</p>
                ${wordData.exampleSentence ? `
                <div class="example-sentence details-hidden">
                    <p><strong>例句:</strong> ${wordData.exampleSentence.replace(new RegExp(`\\b${wordData.word}\\b`, 'gi'), `<strong>${wordData.word}</strong>`)}</p>
                    <button class="play-button small sentence-video-btn" data-video-src="${wordData.signVideoSentenceUrl || ''}" aria-label="播放例句的手语视频" ${!wordData.signVideoSentenceUrl ? 'disabled' : ''}>观看例句手语</button>
                </div>
                ` : ''}
            </article>
        `;
		faceElement.innerHTML = contentHTML; // Set the content for the specified face

		// Apply the correct detail visibility state to the new content
		const entryElement = faceElement.querySelector('.word-entry');
		if (entryElement) {
			entryElement.classList.toggle('show-details-entry', detailsVisible);
		}
		// Re-add video button listeners for the updated face
		// Determine if we are updating front or back to pass correct selector
		const scopeSelector = faceElement.classList.contains('card-front') ? '.card-front' : '.card-back';
		addVideoAlertListeners(scopeSelector);
	};


	// --- Function to prepare the back face and flip the card ---
	const prepareAndFlipCard = (newIndex) => {
		if (isFlipping || newIndex < 0 || newIndex >= vocabularyData.length) return;

		isFlipping = true;
		const newWordData = vocabularyData[newIndex]; // Get data for the back face
		const flipInner = cardContainer.querySelector('.flip-card-inner');
		const cardBack = cardContainer.querySelector('.card-back');
		const cardFront = cardContainer.querySelector('.card-front'); // Also get front face

		if (!flipInner || !cardBack || !cardFront) {
			console.error("Flip elements not found during prepareAndFlipCard!");
			isFlipping = false;
			return;
		}

		// 1. Update the content of the hidden back face using the correct function
		updateFaceContent(cardBack, newIndex); // Pass the back face element and the new index

		// 2. Add class to trigger flip animation
		flipInner.classList.add('is-flipped');

		// 3. Listen for the end of the flip animation
		flipInner.addEventListener('transitionend', () => {
			// 4. Once flipped, instantly update the front face content using the correct function
			updateFaceContent(cardFront, newIndex); // Update front face with new index data

			// 5. Remove the 'is-flipped' class *without* transition to snap back
			flipInner.style.transition = 'none';
			flipInner.classList.remove('is-flipped');

			// 6. Restore transition after a tiny delay
			setTimeout(() => {
				flipInner.style.transition = 'transform 0.6s';
				isFlipping = false; // Allow clicks again
				currentIndex = newIndex; // Officially update the index
				// Update button disabled states AFTER index change
				prevButton.disabled = (currentIndex === 0);
				nextButton.disabled = (currentIndex === vocabularyData.length - 1);
			}, 50);

		}, {
			once: true
		}); // Run listener only once per flip
	};

	// --- Function to initialize the card structure ---
	const initializeCard = () => {
		// Set initial HTML structure
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

		detailsVisible = false; // Reset details state

		// Display the first word's content on the front face using the correct function
		const cardFront = cardContainer.querySelector('.card-front');
		if (cardFront) {
			updateFaceContent(cardFront, currentIndex); // Update front face initially
		} else {
			console.error("Initial cardFront not found!");
		}


		// Set initial state for the toggle button
		if (toggleDetailsButton) {
			toggleDetailsButton.textContent = '显示详情';
			toggleDetailsButton.setAttribute('aria-expanded', 'false');
			toggleDetailsButton.disabled = false; // Ensure toggle button is enabled
		}
		// Initial button disabled state is handled by updateFaceContent
		prevButton.disabled = (currentIndex === 0);
		nextButton.disabled = (currentIndex === vocabularyData.length - 1);
	};

	// --- Function to fetch vocabulary data from the API ---
	const fetchVocabularyData = async () => {
		cardContainer.innerHTML = '<div class="card-content-placeholder">正在加载单词数据...</div>';
		prevButton.disabled = true;
		nextButton.disabled = true;
		toggleDetailsButton.disabled = true;

		try {
			const response = await fetch('http://localhost:3000/api/chapters/1/vocab');
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();

			if (data && data.length > 0) {
				vocabularyData = data;
				initializeCard(); // Call initialize after data is loaded
			} else {
				throw new Error('单词数据为空或格式不正确');
			}
		} catch (error) {
			console.error('获取单词数据失败:', error);
			cardContainer.innerHTML =
				`<div class="card-content-placeholder error">加载单词数据失败: ${error.message}</div>`;
			// Keep buttons disabled
		}
	};

	// --- Function to add alert listeners to video buttons ---
	const addVideoAlertListeners = (scopeSelector = '') => {
		const container = scopeSelector ? cardContainer.querySelector(scopeSelector) : cardContainer;
		if (!container) return;
		const videoButtons = container.querySelectorAll('.play-button');
		videoButtons.forEach(button => {
			const listener = (event) => handleVideoPlaceholderClick(event);
			button.removeEventListener('click', listener);
			if (!button.disabled) {
				button.addEventListener('click', listener);
			}
		});
	};
	const handleVideoPlaceholderClick = (event) => {
		const videoSrc = event.target.dataset.videoSrc;
		alert(`手语视频 (${videoSrc || '未知'}) 功能开发中！`);
	};

	// --- Function to toggle details visibility ---
	const toggleDetails = () => {
		detailsVisible = !detailsVisible;
		// Toggle class on word-entry elements within both faces
		cardContainer.querySelectorAll('.word-entry').forEach(entry => {
			entry.classList.toggle('show-details-entry', detailsVisible);
		});
		if (toggleDetailsButton) {
			toggleDetailsButton.textContent = detailsVisible ? '收起详情' : '显示详情';
			toggleDetailsButton.setAttribute('aria-expanded', String(detailsVisible));
		}
	};

	// --- Event Listeners ---
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

	// --- Initial Load ---
	fetchVocabularyData(); // Start by fetching data

}); // End of DOMContentLoaded listener
// server.js (添加 /api/chat 路由以调用 Ollama)

require('dotenv').config();
// console.log('Attempting to load DB_PASSWORD:', process.env.DB_PASSWORD); // 调试后可注释掉

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// 注意：Node.js v18+ 内置了 fetch。如果您的 Node 版本较低，
// 可能需要 npm install node-fetch 并 const fetch = require('node-fetch');
// 但鉴于您使用的是 v22，内置 fetch 即可。

const app = express();
const port = 3000; // 后端服务器端口

// --- 中间件 ---
app.use(cors()); // 允许跨域请求
app.use(express.json()); // <--- 添加此行以解析请求体中的 JSON 数据

// --- 数据库连接池 ---
const dbPool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE || 'english_learning',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// --- 测试数据库连接 (启动时) ---
(async () => {
	try {
		const connection = await dbPool.getConnection();
		console.log('成功连接到 MySQL 数据库！');
		connection.release();
	} catch (error) {
		console.error('数据库连接失败:', error.message);
	}
})();

// --- API 路由 ---

// 根路径
app.get('/', (req, res) => {
	res.send('Hello from E-Learner Backend!');
});

// 测试 API
app.get('/api/test', (req, res) => {
	res.json({
		message: '后端 API 测试成功!',
		status: 'ok'
	});
});

// 获取单词数据的 API
app.get('/api/units/:unitId/vocab', async (req, res) => {
	// ... (获取单词的代码保持不变) ...
	const unitId = parseInt(req.params.unitId, 10);
	if (isNaN(unitId) || unitId <= 0) {
		return res.status(400).json({
			error: '无效的单元 ID'
		});
	}
	console.log(`收到获取 Unit ${unitId} 单词的请求`);
	try {
		const connection = await dbPool.getConnection();
		try {
			const sql =
				"SELECT id, word, pronunciation, part_of_speech AS partOfSpeech, meaning, image_url AS imageUrl, sign_video_word_url AS signVideoWordUrl, example_sentence AS exampleSentence, sign_video_sentence_url AS signVideoSentenceUrl, chapter, tags FROM vocabulary WHERE chapter = ?";
			const [rows] = await connection.execute(sql, [unitId]);
			connection.release();
			res.json(rows);
		} catch (queryError) {
			connection.release();
			console.error(`数据库查询 Unit ${unitId} 失败:`, queryError);
			res.status(500).json({
				error: `查询 Unit ${unitId} 单词数据失败`
			});
		}
	} catch (connectionError) {
		console.error('获取数据库连接失败:', connectionError);
		res.status(500).json({
			error: '数据库连接失败'
		});
	}
});

// --- 新增：处理聊天请求的 API 路由 ---
app.post('/api/chat', async (req, res) => {
	// 1. 从请求体中获取用户消息和语言偏好
	const {
		message,
		lang
	} = req.body;
	const userText = message;
	const replyLang = lang || 'zh'; // 默认为中文


	let finalPrompt = "";
	const languageInstruction = replyLang === 'zh' ?
		"你是一名专门为“无障碍英语学习平台 (E-Learner)”网站服务的 AI 助手，只能使用【简体中文】回答。" :
		"You are an AI assistant specifically for the 'Accessible English Learning Platform (E-Learner)' website. You must answer ONLY in **English**.";
	const featureDescriptions = `
	                        【网站核心功能】
	                        - **首页 (index.html):** 展示主要功能入口卡片。
	                          - **课程学习:** 点击跳转到 \`courses.html\`，展示所有学习单元 (Unit)。
	                          - **手语词典:** (规划中) 用于查询单词手语。
	                          - **学习社区:** (规划中) 用于学习交流。
	                          - **个人设置:** 点击跳转到 \`settings.html\`，可调整主题、字体、字幕等。
	                          - **互动练习:** (规划中) 用于知识巩固。
	                          - **学习资源:** 点击跳转到 \`resources.html\`，查找辅助材料。
	                        - **课程学习页 (courses.html):** 按单元 (Unit) 列出学习内容。
	                          - 每个单元卡片下有 **'本单元单词'** 链接，点击会跳转到 \`vocab.html?unit=X\` (X是单元号) 进行单词学习。
	                          - (规划中) 未来可能加入语法、对话等链接。
	                        - **单词学习页 (vocab.html):**
	                          - 根据 URL 中的 \`unit\` 参数加载对应单元的单词卡片。
	                          - 可以通过左右箭头切换单词。
	                          - 可以点击按钮显示/隐藏单词详情（发音、例句等）。
	                        - **设置页 (settings.html):** 调整外观和无障碍选项。
	                        - **资源页 (resources.html):** 提供学习资源链接。
	
	                        【你的任务】
	                        根据用户的提问，判断他们想使用哪个功能，并清晰地引导他们如何操作。
	                        例如：
	                        - 如果用户问“怎么背单词？”或“单词学习在哪里？”，你应该回答类似：“您可以通过点击首页的【课程学习】卡片，进入课程列表后，选择您想学习的单元，再点击该单元下的【本单元单词】链接即可开始背单词。”
	                        - 如果用户问“怎么改主题颜色？”，你应该回答类似：“请点击首页的【个人设置】卡片，或者页面右上角的齿轮图标进入设置页面，在【外观设置】部分可以选择您喜欢的主题模式。”
	                        - 如果用户问的问题与网站功能无关（如“讲个笑话”、“翻译句子”），请严格按照之前的指示拒绝回答。
	                    `;
	const featureDescriptionsEn = `
	                        [Website Core Features]
	                        - **Homepage (index.html):** Shows main feature entry cards.
	                          - **Courses Card:** Click to go to \`courses.html\`, showing all learning Units.
	                          - **Sign Dictionary Card:** (Planned) For looking up sign language for words.
	                          - **Community Card:** (Planned) For learning exchange.
	                          - **Settings Card:** Click to go to \`settings.html\` to adjust theme, font, subtitles, etc.
	                          - **Interactive Practice Card:** (Planned) For knowledge consolidation.
	                          - **Learning Resources Card:** Click to go to \`resources.html\` for support materials.
	                        - **Courses Page (courses.html):** Lists learning content by Unit.
	                          - Under each Unit card, there's a **'Unit Vocabulary'** link. Clicking it goes to \`vocab.html?unit=X\` (X is unit number) for vocabulary learning.
	                          - (Planned) Links for grammar, dialogues might be added later.
	                        - **Vocabulary Page (vocab.html):**
	                          - Loads word cards for the corresponding unit based on the \`unit\` parameter in the URL.
	                          - Use left/right arrows to switch words.
	                          - Toggle button shows/hides word details (pronunciation, examples, etc.).
	                        - **Settings Page (settings.html):** Adjust appearance and accessibility options.
	                        - **Resources Page (resources.html):** Provides links to learning resources.
	
	                        [Your Task]
	                        Based on the user's question, determine which feature they want to use and clearly guide them on how to operate.
	                        For example:
	                        - If the user asks "How to study vocabulary?" or "Where is the vocabulary learning?", you should answer like: "You can click the [Courses] card on the homepage, then on the courses page, select the Unit you want to study, and click the [Unit Vocabulary] link under that unit to start learning words."
	                        - If the user asks "How to change the theme color?", you should answer like: "Please click the [Settings] card on the homepage, or the gear icon in the top right corner, to go to the settings page. In the [Appearance Settings] section, you can choose your preferred theme mode."
	                        - If the user asks questions unrelated to website functions (e.g., "Tell a joke", "Translate this sentence"), strictly refuse to answer as previously instructed.
	                    `;
	const studyFocusInstructionZh = `
		                        【你的个性与语气】
		                        你是一个**既有帮助又鼓励学习**的助手。请使用**友好、温和、积极**的语气与用户交流。
		                        你不希望用户长时间闲聊，因为你相信专注学习更重要。
		
		                        【劝学与鼓励 - 时机与方式】
		                        1.  在**成功回答**了用户【与网站功能相关】的问题后，请在回答的**末尾**加上一句【不同的、鼓励性】的话，温和地引导用户回到学习。例如：
		                            *   "希望能帮到你！现在就去试试看这个功能吧，学习加油！💪"
		                            *   "明白了就好！继续努力，四级一定能过！去学习吧！"
		                            *   "不客气！记得多用用网站的功能来辅助学习哦。"
		                            *   "解决了就好，让知识进入大脑吧！祝你学习愉快！"
		                            *   （请尝试在这些示例中选择或变换说法，避免重复）
		                        2.  当用户开始问【与学习或网站功能明显无关】的问题时（例如：闲聊、问你的个人信息、讨论天气新闻、请求翻译/写作等），请先【礼貌地拒绝】，然后【更明确地】提醒用户聚焦学习。语气仍然要友好。例如：
		                            *   "抱歉哦，我主要是负责解答关于这个学习网站的问题。我们还是聊聊和英语学习有关的吧？😊"
		                            *   "嗯... 我可能帮不上这个忙。不过，如果你有关于课程、单词或者网站设置的问题，我随时都在！要不我们看看学习计划？"
		                            *   "这个话题很有趣，但我更希望能帮助你提高英语呢！我们继续学习怎么样？"
		
		                        【总结】
		                        核心目标是：**有问必答（网站功能内），拒绝闲聊（功能外），适时劝学（语气温和多样）。**
		                    `;
	const studyFocusInstructionEn = `
		                        [Your Personality & Tone]
		                        You are an AI assistant who is **both helpful and encouraging of learning**. Please use a **friendly, gentle, and positive** tone when communicating with the user.
		                        You prefer not to engage in long casual chats because you believe focusing on learning is more important.
		
		                        [Encouraging Study - When & How]
		                        1.  After **successfully answering** a user's question that is [related to website features], please add a **different, encouraging sentence** at the **end** of your response to gently guide the user back to learning. For example:
		                            *   "Hope that helps! Go ahead and try out that feature now. Keep up the great learning! 💪"
		                            *   "Glad you understand! Keep working hard, you'll ace that CET-4! Time to study!"
		                            *   "You're welcome! Remember to use the website features often to help your studies."
		                            *   "Glad it's resolved! Let that knowledge sink in! Happy learning!"
		                            *   (Please try to **vary** your phrasing based on these examples and avoid repetition.)
		                        2.  When the user starts asking questions **clearly unrelated** to learning or website features (e.g., casual chat, personal questions about you, weather/news, translation/writing requests), please first **politely decline**, then **more clearly** remind the user to focus on learning. Maintain a friendly tone. For example:
		                            *   "Sorry, I mainly focus on questions about this learning website. How about we chat about English learning instead? 😊"
		                            *   "Hmm... I might not be able to help with that. However, if you have questions about the courses, vocabulary, or site settings, I'm here! Shall we look at the learning path?"
		                            *   "That's an interesting topic, but I'd much rather help you improve your English! How about we continue studying?"
		
		                        [Summary]
		                        Your core goal is: **Answer relevant questions (within website features), refuse off-topic chat, and gently encourage study at appropriate times (with varied and kind phrasing).**
		                    `;

	if (replyLang === 'zh') {
		finalPrompt = `
	[SYSTEM]
	${languageInstruction}
	${featureDescriptions}
	${studyFocusInstructionZh}
	**【重要指令：请务必只使用简体中文回答所有问题。】**
	[/SYSTEM]
	[USER]
	${userText}
	[/USER]
	[ASSISTANT]
	(请用简体中文回答...)
	`;
	} else { // replyLang === 'en'
		finalPrompt = `
	[SYSTEM]
	${languageInstruction}
	${featureDescriptionsEn}
	${studyFocusInstructionEn}
	**[IMPORTANT INSTRUCTION: You MUST answer ONLY in English for all questions.]**
	[/SYSTEM]
	[USER]
	${userText}
	[/USER]
	[ASSISTANT]
	(Please answer in English...)
	`;
	}
	// --- Prompt 构建结束 ---

	// 3. 调用 Ollama API
	const ollamaUrl = 'http://localhost:11434/api/generate'; // Ollama 服务地址
	const modelName = 'llama3:instruct'; // 使用的模型

	try {
		console.log("向 Ollama 发送请求...");
		// 使用 Node.js 内置的 fetch (v18+)
		const ollamaResponse = await fetch(ollamaUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: modelName,
				prompt: finalPrompt,
				stream: false
			})
		});

		if (!ollamaResponse.ok) {
			const errorBody = await ollamaResponse.text();
			console.error(`Ollama API Error Response: ${errorBody}`); // 打印详细错误体
			throw new Error(`Ollama API 错误! Status: ${ollamaResponse.status}`);
		}

		const ollamaData = await ollamaResponse.json();
		console.log("收到 Ollama 回复");

		// 4. 将 Ollama 的回复发送回前端
		const aiReply = ollamaData.response ? ollamaData.response.replace(/[\*_]/g, '').trim() : '';

		if (aiReply) {
			res.json({
				reply: aiReply
			}); // 将回复包装在 { reply: "..." } 对象中
		} else {
			console.warn("Ollama 回复为空或无效:", ollamaData);
			res.json({
				reply: replyLang === 'zh' ? '(AI未能生成有效回复)' :
					'(AI did not generate a valid response)'
			});
		}

	} catch (error) {
		console.error('调用 Ollama API 或处理时出错:', error);
		res.status(500).json({
			error: 'AI 助手处理请求时出错', // 给前端的通用错误信息
			details: process.env.NODE_ENV === 'development' ? error.message :
				undefined // 开发模式下可返回详细错误
		});
	}
});


// --- 启动服务器 ---
app.listen(port, () => {
	console.log(`后端服务器已启动，正在监听 http://localhost:${port}`);
});
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbPool = require('./config/db');
const aiService = require('./services/aiService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// API Routes
app.get('/api/test', (req, res) => {
	res.json({
		message: '后端 API 测试成功!',
		status: 'ok'
	});
});

app.get('/api/units/:unitId/vocab', async (req, res) => {
	const unitId = parseInt(req.params.unitId, 10);
	if (isNaN(unitId) || unitId <= 0) {
		return res.status(400).json({
			error: '无效的单元 ID'
		});
	}
	console.log(`收到获取 Unit ${unitId} 单词的请求`);

	let connection;
	try {
		connection = await dbPool.getConnection();
		const sql = `
            SELECT 
                id, word, pronunciation, part_of_speech AS partOfSpeech, 
                meaning, image_url AS imageUrl, sign_video_word_url AS signVideoWordUrl, 
                example_sentence AS exampleSentence, sign_video_sentence_url AS signVideoSentenceUrl, 
                chapter, tags 
            FROM vocabulary 
            WHERE chapter = ?
        `;
		const [rows] = await connection.execute(sql, [unitId]);
		res.json(rows);

	} catch (error) {
		console.error(`处理 Unit ${unitId} 单词请求失败:`, error);
		res.status(500).json({
			error: '获取单词数据失败'
		});
	} finally {
		if (connection) {
			connection.release();
			console.log(`Unit ${unitId} 请求的数据库连接已释放`);
		}
	}
});

app.post('/api/chat', async (req, res) => {
	const {
		message,
		lang
	} = req.body;

	if (!message || typeof message !== 'string' || message.trim() === '') {
		return res.status(400).json({
			error: '消息不能为空'
		});
	}
	const language = lang === 'en' ? 'en' : 'zh';

	try {
		console.log(`路由 /api/chat: 调用 AI 服务 (lang: ${language})`);
		const aiReply = await aiService.getChatResponse(message, language);
		console.log(`路由 /api/chat: 收到 AI 回复`);
		res.json({
			reply: aiReply
		});

	} catch (error) {
		console.error(`路由 /api/chat: 处理 AI 请求出错:`, error);
		res.status(500).json({
			error: 'AI 助手处理请求时出错'
		});
	}
});

app.listen(port, () => {
	console.log(`后端服务器已启动，监听端口 ${port}`);
	console.log(`前端访问: http://localhost:${port}`);
});
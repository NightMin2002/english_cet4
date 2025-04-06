// server.js

require('dotenv').config();
console.log('Attempting to load DB_PASSWORD:', process.env.DB_PASSWORD);

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(cors());

const dbPool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE || 'english_learning',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

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
	res.send('Hello from Backend Server!');
});

// 测试 API
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

	try {
		const connection = await dbPool.getConnection();
		try {
			// 使用 AS 给列名取别名，以匹配前端期望的驼峰命名
			const sql =
				"SELECT id, word, pronunciation, part_of_speech AS partOfSpeech, meaning, image_url AS imageUrl, sign_video_word_url AS signVideoWordUrl, example_sentence AS exampleSentence, sign_video_sentence_url AS signVideoSentenceUrl, chapter, tags FROM vocabulary WHERE chapter = ?";
			const [rows, fields] = await connection.execute(sql, [unitId]);

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
}); // <--- 确保这个 }); 是对应 app.get 的


// --- 启动服务器 ---
app.listen(port, () => {
	console.log(`后端服务器已启动，正在监听 http://localhost:${port}`);
});
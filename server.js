// server.js (修正版 - 移除嵌套和多余括号，清理注释)

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(cors());

// --- 数据库连接池 ---
const dbPool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '你的MySQL密码', 
	database: 'english_learning',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// --- 测试数据库连接 (服务器启动时) ---
(async () => {
	try {
		const connection = await dbPool.getConnection();
		console.log('成功连接到 MySQL 数据库！');
		connection.release();
	} catch (error) {
		console.error('数据库连接失败:', error.message); // 只打印错误消息可能更清晰
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

// --- 获取单词数据的 API (支持按 Unit 获取) ---
app.get('/api/units/:unitId/vocab', async (req, res) => {
	const unitId = parseInt(req.params.unitId, 10);

	if (isNaN(unitId) || unitId <= 0) {
		// 发现多余括号在此处之后，已移除
		return res.status(400).json({
			error: '无效的单元 ID'
		});
	}
	// 这个 console.log 原本在错误的位置，现在移到这里
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
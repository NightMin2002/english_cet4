// server.js

// 1. 引入所需模块
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // <--- 引入 mysql2 的 promise 版本

// 2. 创建 express 应用实例和端口
const app = express();
const port = 3000;

// 3. 使用 cors 中间件
app.use(cors());

// --- 数据库连接配置 ---
// 创建一个连接池，提高性能和稳定性
const dbPool = mysql.createPool({
	host: 'localhost', // 数据库主机名 (通常是 localhost)
	user: 'root', // 数据库用户名 (默认是 root)
	password: 'night', // <--- !!! 修改这里为你设置的 root 密码 !!!
	database: 'english_learning', // <--- 确认数据库名称正确
	waitForConnections: true, // 等待可用连接，而不是立即失败
	connectionLimit: 10, // 连接池中最大连接数
	queueLimit: 0 // 连接请求队列限制 (0 表示不限制)
});

// --- 测试数据库连接 (可选，在服务器启动时执行一次) ---
// 使用 async IIFE 来执行异步连接测试
(async () => {
	try {
		const connection = await dbPool.getConnection(); // 尝试从连接池获取一个连接
		console.log('成功连接到 MySQL 数据库！');
		connection.release(); // 释放连接回连接池
	} catch (error) {
		console.error('数据库连接失败:', error);
		// 在连接失败时，可以考虑退出程序或采取其他措施
		// process.exit(1);
	}
})();


// --- API 路由 ---

// 根路径
app.get('/', (req, res) => {
	res.send('Hello from Backend Server with DB Connection!');
});

// 测试 API
app.get('/api/test', (req, res) => {
	res.json({
		message: '后端 API 测试成功!',
		status: 'ok'
	});
});

// --- 获取单词数据的 API (连接数据库版本) ---
app.get('/api/chapters/1/vocab', async (req, res) => { // <--- 注意这里变成了 async 函数
	console.log("收到获取第一章单词的请求 (数据库版)");

	try {
		// 1. 从连接池获取一个连接
		const connection = await dbPool.getConnection();

		try {
			// 2. 执行 SQL 查询
			// 注意：数据库列名可能需要调整以匹配前端期望的字段名，或者反过来调整前端
			const sql =
				"SELECT id, word, pronunciation, part_of_speech AS partOfSpeech, meaning, image_url AS imageUrl, sign_video_word_url AS signVideoWordUrl, example_sentence AS exampleSentence, sign_video_sentence_url AS signVideoSentenceUrl, chapter, tags FROM vocabulary WHERE chapter = ?";
			const [rows, fields] = await connection.execute(sql, [
				1
			]); // 使用 ? 占位符和参数数组防止 SQL 注入, 查询 chapter=1

			// 3. 释放连接回连接池 (查询完成后尽快释放)
			connection.release();

			// 4. 发送查询结果给前端
			res.json(rows); // rows 是一个包含查询结果对象的数组

		} catch (queryError) {
			// 如果查询出错，也要释放连接
			connection.release();
			console.error('数据库查询失败:', queryError);
			res.status(500).json({
				error: '查询单词数据失败'
			}); // 发送 500 错误状态码和错误信息
		}
	} catch (connectionError) {
		console.error('获取数据库连接失败:', connectionError);
		res.status(500).json({
			error: '数据库连接失败'
		});
	}
});


// --- 启动服务器 ---
app.listen(port, () => {
	console.log(`后端服务器已启动，正在监听 http://localhost:${port}`);
});
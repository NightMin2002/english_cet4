// config/db.js
require('dotenv').config(); // 确保环境变量已加载
const mysql = require('mysql2/promise');

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

// --- 测试数据库连接 (可选，放在这里更内聚) ---
(async () => {
	try {
		const connection = await dbPool.getConnection();
		console.log('成功连接到 MySQL 数据库！(来自 db.js)');
		connection.release();
	} catch (error) {
		console.error('数据库连接失败 (来自 db.js):', error.message);
		// 在关键服务启动失败时退出进程可能更安全
		// process.exit(1); 
	}
})();

// --- 导出连接池 ---
module.exports = dbPool;
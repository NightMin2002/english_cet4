# 无障碍英语学习平台 (Accessible English Learning Platform) - CET4 Focus

## 项目初心与目标 🎯

创建一个网页端的英语学习平台，核心目标是为聋人（包括听障人士）提供无障碍的学习体验。内容上先聚焦于大学英语四级 (CET-4) 的学习需求。

项目强调：

*   **视觉化学习工具：** 如手语视频嵌入（规划中）、图像支持等。
*   **无障碍网页设计：** 遵循 WCAG 标准，已实现基础的键盘导航、语义化 HTML，以及主题切换、字体大小调整等。
*   **简洁、美观、用户友好的界面。**

## 主要功能 ✨

*   **多页面结构：** 首页、课程单元列表、设置、单词学习页、资源页。
*   **学习单元：** 内容按主题单元 (Unit) 组织。
*   **单词学习：**
    *   动态从数据库加载词汇。
    *   卡片翻转交互。
    *   简洁/详细模式切换（规划中）。
    *   图片/视频占位符。
*   **个性化与无障碍：**
    *   浅色/深色/跟随系统主题切换 (localStorage 保存)。
    *   全局字体大小调整 (localStorage 保存)。
    *   字幕字体大小调整 (localStorage 保存)。
*   **基础前后端分离：**
    *   前端：HTML, CSS (已分离页面专属 CSS), JavaScript。
    *   后端：Node.js + Express.js 提供 API。
    *   数据库：MySQL 存储词汇数据。

## 技术栈 🛠️

*   **前端：** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **后端：** Node.js, Express.js
*   **数据库：** MySQL
*   **核心库：** cors, mysql2
*   **版本控制：** Git, GitHub
*   **无障碍：** WCAG 标准 (进行中)

## 本地运行指南 🚀

**环境要求:**

1.  **Node.js 和 npm:** 请确保已安装 Node.js (推荐 LTS 版本) 和 npm 包管理器。访问 [https://nodejs.org/](https://nodejs.org/) 下载。
2.  **Git:** 用于克隆代码仓库。访问 [https://git-scm.com/](https://git-scm.com/) 下载。
3.  **MySQL 数据库:** 需要安装 MySQL Community Server。访问 [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) 下载。

**安装与设置:**

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/NightMin2002/english_cet4.git
    cd english_cet4
    ```

2.  **安装后端依赖:**
    ```bash
    npm install
    ```
    *如果遇到 `Cannot find module 'express'` 等错误，通常是需要执行此步骤。*

3.  **数据库设置:**
    *   启动你的 MySQL 服务。
    *   使用数据库管理工具 (如 MySQL Workbench, phpMyAdmin, DBeaver 或命令行) 连接到 MySQL。
    *   **创建数据库:**
        ```sql
        CREATE DATABASE IF NOT EXISTS english_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```
    *   **选择数据库:**
        ```sql
        USE english_learning;
        ```
    *   **创建 `vocabulary` 表:** (请确保字段与您当前的表结构一致)
        ```sql
        CREATE TABLE IF NOT EXISTS `vocabulary` (
          `id` int NOT NULL AUTO_INCREMENT,
          `word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `part_of_speech` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `meaning` text COLLATE utf8mb4_unicode_ci,
          `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `sign_video_word_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `example_sentence` text COLLATE utf8mb4_unicode_ci,
          `sign_video_sentence_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `chapter` int DEFAULT NULL COMMENT '所属单元(Unit)编号',
          `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `word` (`word`),
          KEY `chapter` (`chapter`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ```
    *   **导入初始数据 (重要):** 执行我们之前提供的 `INSERT INTO vocabulary ...` SQL 语句，将 Unit 1-4 的示例单词添加到表中。 (未来可以考虑将这些 SQL 放到一个 `.sql` 文件中方便导入)。

4.  **配置环境变量 (`.env` 文件):**
    *   在项目根目录下，找到 `.env.example` 文件（如果不存在，请创建一个）。
    *   将 `.env.example` 复制并重命名为 `.env`。
    *   打开 `.env` 文件，根据注释提示，填入你自己的 MySQL 数据库信息：
        ```dotenv
        # .env 文件内容示例
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=你的真实MySQL密码放这里 # <--- !!! 填入你的密码 !!!
        DB_DATABASE=english_learning
        ```
    *   **重要:** `.env` 文件包含了敏感信息，已默认添加到 `.gitignore` 中，请**不要**将其提交到 Git 仓库。

**运行项目:**

1.  确保 MySQL 服务正在运行。
2.  确保已在项目根目录下创建并正确配置了 `.env` 文件（包含数据库密码等）。
3.  启动后端服务器: 在项目根目录 (`english_cet4/`) 的命令行中运行：
    ```bash
    node server.js
    ```
    *保持此命令行窗口打开。*
4.  打开前端页面: 在浏览器中直接打开项目文件夹中的 `index.html` 文件即可开始使用。

## 使用说明

*   从 `index.html` (首页) 开始浏览。
*   通过“课程学习”卡片进入 `courses.html` 查看学习单元。
*   点击单元卡片中的“本单元单词”会跳转到 `vocab.html?unit=X` 来学习该单元的词汇。
*   通过“个人设置”卡片或导航栏齿轮图标进入 `settings.html` 调整偏好。

## 未来规划 (部分)

*   补充更多 CET-4 词汇及发音、图片、手语视频资源。
*   实现图片放大、发音播放功能。
*   添加语法、情景对话等学习内容类型。
*   实现用户注册/登录、生词本、学习进度跟踪。
*   深化无障碍功能：高对比度模式、更完善的键盘导航和 ARIA 支持。
*   部署上线。

## 贡献指南 (可选)

*暂未开放贡献，但欢迎提出建议和 Bug 反馈！*

## 许可证

本项目采用 [MIT 许可证](LICENSE)授权。有关详细信息，请参阅 `LICENSE` 文件。
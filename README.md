# 无障碍英语学习平台 (Accessible English Learning Platform) - CET4 Focus

## 项目初心与目标 🎯

*创建一个网页端的英语学习平台，核心目标是为聋人（包括听障人士）及所有需要无障碍功能的用户提供更友好的学习体验。内容上先聚焦于大学英语四级 (CET-4) 的学习需求。*

项目强调：

*   **视觉化学习辅助：** *为词汇提供多感官信息（如发音提示、图片、未来规划的手语视频等）。*
*   **无障碍网页设计 (核心)：** *遵循 WCAG 标准进行设计和开发，确保可用性。已实现基础的键盘导航、语义化 HTML、清晰的焦点指示，并提供个性化设置。*
*   **简洁、美观、用户友好的界面：** *注重清晰的布局、适度的留白和直观的操作流程。*

## 主要功能 ✨

*   **多页面结构：** 首页、课程单元列表、设置、单词学习页、资源页。
*   **学习单元组织：** 内容按主题单元 (Unit) 划分，方便系统学习。
*   **单词学习 (`vocab.html`)：**
    *   动态从 MySQL 数据库加载指定单元词汇。
    *   *交互式单词卡片 (支持翻转查看详情)*。
    *   *(规划中) 简洁/详细信息模式切换。*
    *   *(规划中) 集成发音、图片、手语视频等多媒体资源。*
*   **个性化与无障碍设置 (`settings.html`)：**
    *   **主题切换:** 提供浅色、深色模式，并能跟随系统设置 (偏好存储于 localStorage)。
    *   **字体大小调整:** 提供全局字体大小调节选项 (偏好存储于 localStorage)。
    *   *(如果已实现) 字幕字体大小调整。*
*   **前后端架构：**
    *   **前端:** 纯静态 HTML, CSS, Vanilla JavaScript。*CSS 按页面模块化组织。*
    *   **后端:** Node.js + Express.js 提供 RESTful API (例如，用于获取词汇数据)。
    *   **数据库:** MySQL 存储词汇及未来可能的用户数据。

## 技术栈 🛠️

*   **前端：** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **后端：** Node.js, Express.js
*   **数据库：** MySQL
*   **核心 Node 库：** `mysql2` (数据库连接), `cors` (跨域处理), `dotenv` (环境变量管理)
*   **版本控制：** Git, GitHub
*   **无障碍标准参考：** WCAG (Web Content Accessibility Guidelines)

## 本地运行指南 🚀

**环境要求:**

1.  **Node.js 和 npm:** (推荐 LTS 版本) [https://nodejs.org/](https://nodejs.org/)
2.  **Git:** [https://git-scm.com/](https://git-scm.com/)
3.  **MySQL 数据库:** [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)

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

3.  **数据库设置:**
    *   启动本地 MySQL 服务。
    *   使用数据库管理工具连接 MySQL。
    *   **创建数据库:**
        ```sql
        CREATE DATABASE IF NOT EXISTS english_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```
    *   **选择数据库:** `USE english_learning;`
    *   **创建 `vocabulary` 表:** *(建议将以下 SQL 保存到 `database/schema.sql` 文件)*
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
    *   **导入初始数据:** *(建议将词汇 INSERT 语句保存到 `database/data.sql` 文件，并在指南中说明需要执行此文件)*
        *请执行提供的 SQL 文件或语句，将 Unit 1-4 的示例单词添加到 `vocabulary` 表中。*

4.  **配置环境变量 (`.env` 文件):**
    *   复制 `env.example` 为 `.env`。
    *   修改 `.env` 文件，填入你的 MySQL 连接信息 (host, user, password, database)。
    *   **重要:** `.env` 包含敏感信息，已在 `.gitignore` 中，**请勿提交**。

**运行项目:**

1.  确保 MySQL 服务正在运行。
2.  确保已正确配置 `.env` 文件。
3.  启动后端服务器 (保持运行):
    ```bash
    node server.js
    ```
4.  **访问前端:** 在浏览器中直接打开项目根目录下的 `index.html` 文件进行预览。 *(注意：部分功能可能依赖于后端 API，需要后端服务器运行)*

## 使用说明

*   从 `index.html` (首页) 开始浏览。
*   通过“课程学习”进入 `courses.html`。
*   点击单元卡片跳转到 `vocab.html?unit=X` 学习词汇。
*   通过“个人设置”或导航栏齿轮图标进入 `settings.html`。

## 未来规划 (部分)

*   补充词汇及多媒体资源 (发音、图片、手语视频)。
*   完善交互：图片放大、发音播放、更流畅的动画。
*   扩展学习内容：语法、情景对话等。
*   用户系统：注册/登录、生词本、学习进度。
*   深化无障碍：高对比度模式、ARIA 增强。
*   *(考虑中) 部署方案调研。*

## 版权声明 (Copyright)

*© 2024 NightMin2002. All Rights Reserved.*

*本项目目前仅供个人学习和使用。未来可能根据项目发展情况考虑采用合适的开源许可证。*

---

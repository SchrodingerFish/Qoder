# 🛠️ 简单SQL编辑器

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.2-green.svg)
![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0.52.2-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**一个功能丰富、交互友好的现代化 SQL 开发环境**

[在线演示](#) | [快速开始](#快速开始) | [功能特性](#功能特性) | [API 文档](#api-文档)

</div>

## 📋 目录

-   [项目简介](#项目简介)
-   [功能特性](#功能特性)
-   [技术栈](#技术栈)
-   [快速开始](#快速开始)
-   [环境配置](#环境配置)
-   [项目结构](#项目结构)
-   [使用指南](#使用指南)
-   [API 集成](#api-集成)
-   [开发指南](#开发指南)
-   [贡献指南](#贡献指南)
-   [许可证](#许可证)

## 🎯 项目简介

Qoder 是一个专为数据分析师、数据库管理员和开发人员设计的现代化 SQL 编辑器。它提供了一个轻量级、响应式的 SQL 开发环境，支持语法高亮、智能提示、查询执行和结果展示等核心功能。

### 🎨 界面预览

-   **暗黑主题**：专为长时间编码设计的护眼界面
-   **响应式布局**：完美适配桌面和移动设备
-   **实时反馈**：即时的查询执行状态和错误提示

## ✨ 功能特性

### 🔥 核心功能

-   **🖊️ 高级代码编辑器**

    -   基于 Monaco Editor，提供 VS Code 级别的编辑体验
    -   完整的 SQL 语法高亮和错误提示
    -   智能代码补全和快捷模板
    -   支持代码格式化和多光标编辑

-   **⚡ 智能查询执行**

    -   支持完整 SQL 查询和选中代码片段执行
    -   快捷键支持：`Ctrl+Enter` 或 `F5`
    -   实时执行时间统计
    -   详细的错误信息显示

-   **📊 强大的结果展示**
    -   表格形式展示查询结果，支持大数据量
    -   智能分页：10/25/50/100 行每页
    -   横向滚动支持，完美处理宽表格
    -   NULL 值和未定义值的特殊显示

### 🛠️ 高级功能

-   **📋 多种复制功能**

    -   点击表头复制所有字段名（逗号分隔）
    -   点击行按钮复制整行 JSON 数据
    -   点击任意单元格复制该单元格内容
    -   智能处理 NULL 和 UNDEFINED 值

-   **📤 数据导出**

    -   支持 Excel 格式导出查询结果
    -   自动生成带时间戳的文件名
    -   支持大数据量导出

-   **🔄 双模式支持**

    -   **模拟数据模式**：内置示例数据，无需后端服务
    -   **真实 API 模式**：连接真实数据库服务
    -   一键切换，实时状态检测

-   **🌐 API 连接管理**
    -   自动检测 API 连接状态
    -   详细的连接错误信息
    -   手动重连功能
    -   超时和重试机制

## 🔧 技术栈

### 前端框架

-   **React 19.1.1** - 最新的 React 框架
-   **Vite 7.1.2** - 极速构建工具
-   **Monaco Editor 0.52.2** - VS Code 编辑器内核

### 开发工具

-   **ESLint 9.33.0** - 代码质量检查
-   **CSS3** - 现代化样式，支持响应式设计
-   **Fetch API** - 原生网络请求

### 构建配置

-   **ES6+ Modules** - 现代 JavaScript 模块系统
-   **Hot Reload** - 开发时热更新
-   **Tree Shaking** - 自动移除未使用代码

## 🚀 快速开始

### 环境要求

-   **Node.js** >= 16.0.0
-   **npm** >= 8.0.0 或 **yarn** >= 1.22.0

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/schrodingerfish/qoder.git
cd qoder
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
```

5. **访问应用**
   打开浏览器访问 `http://localhost:5173`

### 📦 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码质量检查
npm run lint
```

## ⚙️ 环境配置

项目支持多种环境配置文件，按优先级排序：

1. `.env.local` - 本地配置（优先级最高，不提交到版本控制）
2. `.env.development` - 开发环境配置
3. `.env.production` - 生产环境配置
4. `.env` - 通用配置（优先级最低）

### 配置项说明

```bash
# API 服务器地址
VITE_API_BASE_URL=http://localhost:3000

# API 请求超时时间（毫秒）
VITE_API_TIMEOUT=30000

# 是否启用认证功能
VITE_ENABLE_AUTH=false

# 开发模式开关
VITE_DEV_MODE=true
```

> ⚠️ **注意**：在 Vite 项目中，只有以 `VITE_` 为前缀的环境变量才能在前端代码中访问。

## 📁 项目结构

```
qoder/
├── public/                 # 静态资源目录
├── src/                   # 源代码目录
│   ├── components/        # React 组件
│   │   ├── QueryResult.jsx    # 查询结果展示组件
│   │   └── SqlEditor.jsx      # SQL 编辑器组件
│   ├── config/           # 配置文件
│   │   └── api.js            # API 配置管理
│   ├── services/         # 服务层
│   │   └── sqlApi.js         # SQL API 服务
│   ├── styles/           # 样式文件
│   │   ├── components/       # 组件样式
│   │   └── global/          # 全局样式
│   ├── App.jsx           # 主应用组件
│   └── main.jsx          # 应用入口文件
├── .env.example          # 环境变量示例
├── package.json          # 项目配置文件
├── vite.config.js        # Vite 构建配置
└── README.md            # 项目说明文档
```

### 核心模块说明

#### 🎯 组件层 (`src/components/`)

-   **`SqlEditor.jsx`** - 基于 Monaco Editor 的 SQL 编辑器
-   **`QueryResult.jsx`** - 查询结果展示，支持分页、复制、导出等功能

#### 🔧 服务层 (`src/services/`)

-   **`sqlApi.js`** - SQL 查询服务，支持模拟数据和真实 API 两种模式

#### ⚙️ 配置层 (`src/config/`)

-   **`api.js`** - API 配置管理，包含端点、超时、认证等配置

## 📖 使用指南

### 基本操作

1. **编写 SQL 查询**

    - 在编辑器中输入 SQL 语句
    - 支持语法高亮和智能提示
    - 可以选中部分代码执行

2. **执行查询**

    - 点击"执行查询"按钮
    - 使用快捷键 `Ctrl+Enter` 或 `F5`
    - 选中代码后执行仅运行选中部分

3. **查看结果**
    - 结果以表格形式展示
    - 支持分页浏览和横向滚动
    - 显示执行时间和影响行数

### 高级功能

#### 📋 数据复制功能

-   **复制字段名**：点击表头的"复制字段"按钮
-   **复制行数据**：点击每行的"复制"按钮，获取 JSON 格式数据
-   **复制单元格**：直接点击任意数据单元格

#### 📤 数据导出

-   点击"导出 Excel"按钮
-   自动下载包含查询结果的 Excel 文件
-   文件名包含时间戳，避免重复

#### 🔄 模式切换

-   **模拟数据模式**：使用内置示例数据，适合演示和测试
-   **真实 API 模式**：连接实际的数据库服务

### 快捷键

| 快捷键       | 功能             |
| ------------ | ---------------- |
| `Ctrl+Enter` | 执行查询         |
| `F5`         | 执行查询         |
| `Ctrl+/`     | 切换注释         |
| `Ctrl+D`     | 选择下一个相同词 |
| `Alt+↑/↓`    | 移动行           |

## 🔌 API 集成

### 后端 API 要求

项目需要后端提供以下 API 端点：

#### 1. 健康检查

```
GET /api/health
响应: 200 OK
```

#### 2. 执行 SQL 查询

```
POST /api/execute-sql
Content-Type: application/json

请求体:
{
  "query": "SELECT * FROM users LIMIT 10;",
  "database": "mine",
  "options": {
    "timeout": 30000,
    "format": "json",
    "includeMetadata": true,
    "maxRows": 10000
  }
}

成功响应:
{
  "success": true,
  "data": [...],
  "rowCount": 10,
  "message": "查询成功",
  "executionTime": 150
}

错误响应:
{
  "success": false,
  "error": "SQL语法错误",
  "message": "详细错误信息",
  "metadata": {...}
}
```

#### 3. Excel 导出

```
POST /api/export-excel
Content-Type: application/json

请求体:
{
  "timestamp": "2025-08-23 14:30:00.000",
  "query": "SELECT * FROM users LIMIT 10;",
  "database": "mine",
  "filename": "query_result",
  "options": {}
}

响应: Excel 文件流
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### 错误处理

系统提供完善的错误处理机制：

-   **网络错误**：自动重试和超时处理
-   **SQL 错误**：详细的语法错误信息
-   **服务器错误**：状态码映射和用户友好的错误消息

## 🛠️ 开发指南

### 开发环境设置

1. **安装开发依赖**

```bash
npm install
```

2. **启动开发服务器**

```bash
npm run dev
```

3. **代码检查**

```bash
npm run lint
```

### 代码规范

-   使用 ESLint 进行代码质量检查
-   采用函数式组件和 React Hooks
-   遵循现代 JavaScript ES6+ 语法
-   使用 CSS3 和现代布局技术

### 调试技巧

-   使用浏览器开发者工具查看网络请求
-   检查控制台日志获取详细错误信息
-   使用 React Developer Tools 调试组件状态

### 性能优化

-   组件懒加载和代码分割
-   查询结果虚拟滚动（大数据量）
-   API 请求缓存和防抖
-   图片和资源优化

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告问题**

    - 在 GitHub Issues 中报告 Bug
    - 提供详细的重现步骤和环境信息

2. **功能建议**

    - 在 Issues 中提出新功能建议
    - 详细描述功能的使用场景和价值

3. **代码贡献**
    - Fork 项目到您的 GitHub 账户
    - 创建功能分支进行开发
    - 提交 Pull Request

### 开发流程

1. **Fork 项目**

```bash
git clone https://github.com/schrodingerfish/qoder.git
cd qoder
git checkout -b feature/your-feature-name
```

2. **开发和测试**

```bash
npm install
npm run dev
# 进行开发和测试
```

3. **提交代码**

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

4. **创建 Pull Request**
    - 在 GitHub 上创建 Pull Request
    - 详细描述修改内容和测试情况

### 代码提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

-   `feat:` 新功能
-   `fix:` 修复问题
-   `docs:` 文档更新
-   `style:` 代码格式修改
-   `refactor:` 代码重构
-   `test:` 测试相关
-   `chore:` 构建过程或辅助工具变动

## 📞 联系我们

-   **问题反馈**：[GitHub Issues](https://github.com/schrodingerfish/qoder/issues)
-   **邮件联系**：schrodingersfish@outlook.com
-   **讨论社区**：[GitHub Discussions](https://github.com/schrodingerfish/qoder/discussions)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

<div align="center">

**如果这个项目对您有帮助，请给我一个 ⭐️**

Made with ❤️ by SchrodingerFish

</div>

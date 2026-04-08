[# ClimbQuest - CPT208 Coursework Portfolio

## 1. 项目成品是什么

本项目最终成品是一个 **静态多页面 Portfolio 网站（HTML + CSS）**，用于展示我们在 CPT208 模块中的完整设计过程与结果。  
网站主题围绕室内攀岩场景，系统名称为 **ClimbQuest**。

项目核心页面包括：

- `index.html`：项目总览与核心功能介绍
- `pages/motivation.html`：项目动机
- `pages/research.html`：研究过程与证据
- `pages/users.html`：用户需求与人物角色
- `pages/ideation.html`：方案构思与比较
- `pages/prototype.html`：原型与系统设计
- `pages/evaluation.html`：可用性评估与反思
- `pages/references.html`：参考文献
- `pages/team.html`：团队分工与成员信息

## 2. 项目能够满足哪些需求

本 Portfolio 对应并展示了以下需求：

- 展示课程作业从问题定义到评估的完整 Human-Centered Design 流程
- 体现攀岩用户场景下的关键功能需求：
  - 路线探索与挑战引导（Route Quest）
  - 训练进度与成就展示（Progress Badges）
  - 教练反馈与学习支持（Coach Feedback）
- 为老师提供可直接查看的成果网页
- 为组员提供统一的项目结构与协作仓库

## 3. Portfolio 在线地址

- Live Portfolio: https://xymmm000.github.io/CPT208-coursework/
- GitHub Repository: https://github.com/XYMMM000/CPT208-coursework

## 4. 组员协作教程（GitHub 到本地 / 本地到 GitHub）

## 4. 组员教程：如何从 GitHub 复制到本地

### 4.1 第一次拉取（Clone）

1. 打开终端（PowerShell / Git Bash）。
2. 进入你想存放项目的目录：

```bash
cd 你的本地目录
```

3. 执行克隆命令：

```bash
git clone https://github.com/YimingXie040914/CPT208-coursework.git
```

4. 进入项目目录：

```bash
cd CPT208-coursework
```

### 4.2 日常同步远程最新代码（Pull）

每次开始开发前，先同步一次：

```bash
git pull origin main
```

如果你们默认分支不是 `main`，请改成实际分支名（例如 `master`）。

## 5. 组员教程：如何从本地上传到 GitHub

在项目根目录按顺序执行：

1. 查看改动：

```bash
git status
```

2. 添加改动文件：

```bash
git add .
```

3. 提交改动（写清楚本次修改内容）：

```bash
git commit -m "更新：本次修改内容"
```

4. 上传到远程仓库：

```bash
git push origin main
```

如果提示权限或登录问题，请先完成 GitHub 账号登录（PAT 或 Git Credential Manager）。

## 6. 本地预览方式

在项目根目录运行：

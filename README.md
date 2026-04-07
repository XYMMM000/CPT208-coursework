# ClimbQuest - CPT208 Coursework Portfolio

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
- GitHub Repository: https://github.com/YimingXie040914/CPT208-coursework

## 4. 组员协作教程（GitHub 到本地 / 本地到 GitHub）

### 4.1 首次从 GitHub 复制到本地（clone）

1. 安装 Git（若已安装可跳过）
2. 在本地选择要存放项目的目录，打开终端
3. 执行以下命令：

```bash
git clone https://github.com/YimingXie040914/CPT208-coursework.git
cd CPT208-coursework
```

4. 打开项目（例如使用 VS Code）：

```bash
code .
```

5. 本地预览（可选）：

```bash
python -m http.server 5500
```

浏览器访问：`http://localhost:5500/`

### 4.2 日常从 GitHub 拉取最新内容（pull）

进入项目目录后执行：

```bash
git pull origin main
```

### 4.3 将本地修改上传到 GitHub（push）

1. 查看修改文件：

```bash
git status
```

2. 添加修改到暂存区：

```bash
git add .
```

3. 提交修改（写清楚本次改动）：

```bash
git commit -m "Update portfolio content"
```

4. 上传到 GitHub：

```bash
git push origin main
```

### 4.4 协作注意事项

- 每次开始前先 `git pull origin main`
- 每次完成后及时 `git add` + `git commit` + `git push`
- 提交信息尽量清晰，例如：`Update references page` / `Fix team section style`

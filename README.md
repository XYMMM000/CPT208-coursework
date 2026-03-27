# ClimbQuest · CPT208 Coursework Portfolio

ClimbQuest 是一个以室内攀岩为场景的课程项目网站。  
项目核心不是“被动看路线”，而是让用户可以自己设计路线、做测试、客制化优化、发布分享，并形成社区评价闭环。

## 项目核心功能（给组员快速理解）

### 1) DIY 攀岩路线创建

- 用户可以在系统中自定义一条攀岩路线
- 可以设置路线特征（例如目标难度、节奏、动作风格）
- 支持迭代修改，不是一次性固定

### 2) 测试后客制化路线

- 用户在测试环节输入或记录自己的攀爬表现
- 系统根据测试反馈帮助用户客制化路线
- 路线会更贴近该用户当前能力和训练目标

### 3) 路线等级评估

- 用户可以对自己创建的路线进行难度评估与分级
- 路线会有可读的等级信息，方便他人理解挑战强度

### 4) 路线分享与社区评价

- 用户可以把自己创建的路线发布到 Web App
- 其他用户可以攀爬并进行评价
- 社区反馈可反向帮助路线作者继续优化路线

## 页面结构

- `index.html`: 首页与沉浸式展示
- `pages/motivation.html`: 项目动机
- `pages/research.html`: 研究与分析
- `pages/users.html`: 用户与需求
- `pages/ideation.html`: 概念与方案
- `pages/prototype.html`: 原型与实现
- `pages/evaluation.html`: 评估与反思
- `pages/references.html`: 参考资料
- `pages/team.html`: 团队信息

## 在线地址与仓库

- GitHub Repo: https://github.com/YimingXie040914/CPT208-coursework
- Live Site: https://xymmm000.github.io/CPT208-coursework/

## 组员协作教程（下载、运行、编辑、提交 PR）

下面是推荐流程，确保每位组员都能在本地开发并通过 Pull Request 合并到主仓库。

### 1) 环境准备

- 安装 Git: https://git-scm.com/downloads
- 安装 Python 3: https://www.python.org/downloads/
- 准备 GitHub 账号并登录

检查安装：

```bash
git --version
python --version
```

### 2) 下载仓库到本地（推荐 Fork + Clone）

1. 打开主仓库：`https://github.com/YimingXie040914/CPT208-coursework`
2. 点击右上角 **Fork** 到你自己的 GitHub
3. 在你自己的仓库页面点击 **Code**，复制 HTTPS 地址
4. 在终端执行：

```bash
git clone <你的fork仓库地址>
cd CPT208-coursework
```

5. 绑定主仓库为上游仓库：

```bash
git remote add upstream https://github.com/YimingXie040914/CPT208-coursework.git
git remote -v
```

### 3) 本地启动并运行项目

在项目根目录执行：

```bash
python -m http.server 5500
```

浏览器打开：

```text
http://localhost:5500/
```

### 4) 在本地编辑与保存

不要直接改 `main`，先创建功能分支：

```bash
git checkout -b feat/your-task-name
```

完成编辑后提交：

```bash
git add .
git commit -m "feat: describe your change"
```

### 5) 上传到你自己的 GitHub

```bash
git push origin feat/your-task-name
```

### 6) 提交 Pull Request 到主仓库

1. 打开你 fork 的仓库页面
2. 点击 **Compare & pull request**
3. 确认目标分支：
   - base repository: `YimingXie040914/CPT208-coursework`
   - base branch: `main`
   - compare branch: `feat/your-task-name`
4. 填写 PR 标题与描述后点击 **Create pull request**

### 7) 收到反馈后的更新方式

继续在同一个分支修改并提交：

```bash
git add .
git commit -m "fix: update based on review"
git push origin feat/your-task-name
```

同一个 PR 会自动更新，不需要新建 PR。

### 8) 开始新任务前先同步主仓库

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

然后再新建分支继续开发：

```bash
git checkout -b feat/new-task
```

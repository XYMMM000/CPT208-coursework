# ClimbQuest Portfolio 使用说明

## 这个 portfolio 是做什么的

ClimbQuest 是一个围绕室内攀岩场景的课程项目展示站点，核心展示内容包括：

- 用户 DIY 创建攀岩路线
- 通过测试结果对路线进行客制化调整
- 用户对自己创建路线进行难度评估与等级标注
- 将路线发布到 Web App，供其他用户攀爬与评价
- 基于社区反馈持续优化路线

该目录用于统一存放与 portfolio 相关的网页代码、脚本和图片资源。

## 如何进入 portfolio

项目路径：

```text
c:\Users\ASUS\CPT208-coursework-clone\portfolio
```

主要入口文件：

- 首页：`index.html`
- 样式：`style.css`
- 交互脚本：`immersive.js`
- 子页面：`pages/` 目录
- 图片资源：`assets/` 目录

## 如何本地运行

在终端进入该目录后运行：

```bash
cd c:\Users\ASUS\CPT208-coursework-clone\portfolio
python -m http.server 5500
```

浏览器打开：

```text
http://127.0.0.1:5500/
```

## 如何修改 portfolio

### 修改页面内容

- 首页改 `index.html`
- 其他页面改 `pages/*.html`

### 修改视觉样式

- 统一改 `style.css`

### 修改交互动画

- 改 `immersive.js`

### 修改图片资源

- 把图片放入 `assets/` 下对应目录
- 并在 HTML 里更新相对路径

## 协作提交建议

```bash
git checkout -b feat/your-task
git add .
git commit -m "feat: update portfolio"
git push origin feat/your-task
```

然后在 GitHub 发起 Pull Request 到主分支。

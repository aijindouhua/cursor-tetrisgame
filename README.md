# 俄罗斯方块游戏

一个使用 HTML、CSS 和 JavaScript 制作的网页版俄罗斯方块游戏。

## 功能特点

- 🎮 经典俄罗斯方块玩法
- 🎨 美观的现代化界面
- 📱 响应式设计，支持移动设备
- ⌨️ 键盘控制，操作流畅
- 🎯 得分系统
- 👀 预览下一个方块

## 🌐 在线访问

游戏已部署到 GitHub Pages，可以直接在线游玩：

**👉 [点击这里在线游玩](https://aijindouhua.github.io/cursor-tetrisgame/)**

## 如何运行

### 方法一：在线访问（推荐）

访问 GitHub Pages：https://aijindouhua.github.io/cursor-tetrisgame/

### 方法二：直接在浏览器中打开

1. 下载项目后，双击 `index.html` 文件
2. 游戏会在默认浏览器中打开

### 方法三：使用本地服务器

在终端中运行以下命令：

```bash
# 使用 Python 3
python3 -m http.server 8000

# 或者使用 Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问：`http://localhost:8000`

## 游戏操作

- **← →** : 左右移动方块
- **↑** : 旋转方块
- **↓** : 快速下落
- **空格** : 暂停/继续游戏

## 游戏规则

1. 方块会自动从顶部下落
2. 使用方向键控制方块移动和旋转
3. 填满一整行后，该行会被消除
4. 消除的行数越多，得分越高
5. 当方块堆到顶部无法放置新方块时，游戏结束

## 文件说明

- `index.html` - 游戏主页面
- `style.css` - 样式文件
- `game.js` - 游戏逻辑代码
- `tetris.py` - Python/tkinter 版本（桌面版）

## 浏览器兼容性

支持所有现代浏览器：
- Chrome
- Firefox
- Safari
- Edge

## 许可证

MIT License


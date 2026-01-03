# Web 终端 (Web CMD)

一个基于 Web 的 CMD 终端，允许你通过浏览器访问和执行 Windows 命令行。

## 功能特性

- 🖥️ 实时命令执行 - 在浏览器中直接执行 CMD 命令
- 🔄 自动重连 - 连接断开时自动尝试重连
- 📋 复制粘贴 - 支持 Ctrl+C/V 快捷键复制粘贴
- 🎨 现代界面 - 基于 xterm.js 的美观终端界面
- 🚀 一键启动 - 双击批处理文件即可启动
- ⚡ 自动关闭 - 关闭网页时自动停止后台服务
- 📱 响应式设计 - 自适应窗口大小

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/1724099107/web-cmd.git
cd web-cmd
```

2. 安装依赖：
```bash
npm install
```

## 使用方法

### 快速启动

双击 `Web-cmd.bat` 文件即可启动服务（后台运行）。

### 手动启动

```bash
npm start
```

服务启动后，在浏览器中访问：http://localhost:7681

### 停止服务

点击页面右上角的红色"退出"按钮，或直接关闭浏览器标签页即可停止服务。

## 技术栈

- **后端**: Node.js + Express + Socket.io + node-pty
- **前端**: HTML + JavaScript + xterm.js
- **通信**: WebSocket (Socket.io)

## 项目结构

```
web-cmd/
├── server.js          # 服务器端代码
├── package.json       # 项目配置
├── Web-cmd.bat        # Windows 启动脚本
├── public/
│   └── index.html     # 前端页面
└── node_modules/      # 依赖包
```

## 开发

### 修改端口

编辑 `server.js` 文件，修改 `PORT` 变量：

```javascript
const PORT = 7681; // 修改为你想要的端口
```

### 自定义主题

编辑 `public/index.html` 文件，修改 xterm.js 的主题配置：

```javascript
theme: {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#ffffff'
}
```

## 注意事项

- 此工具仅用于本地开发和调试
- 请勿在生产环境或公共网络中使用
- 确保你的计算机安全，不要让未经授权的用户访问此终端

## 许可证

ISC License

## 作者

1724099107

## 贡献

欢迎提交 Issue 和 Pull Request！
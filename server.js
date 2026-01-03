const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// 单例pty进程，避免资源泄漏
let ptyProcess = null;
let currentSocket = null;

function createPtyProcess(cols = 80, rows = 30) {
  // 如果已存在进程，先清理
  if (ptyProcess) {
    try {
      ptyProcess.kill();
    } catch (e) {
      console.error('清理旧进程失败:', e.message);
    }
  }

  console.log('创建新的pty进程');
  ptyProcess = pty.spawn('cmd.exe', [], {
    name: 'xterm-color',
    cols: cols,
    rows: rows,
    cwd: process.env.HOME || process.env.USERPROFILE,
    env: process.env
  });

  // 监听进程退出
  ptyProcess.on('exit', (code, signal) => {
    console.log(`pty进程退出: code=${code}, signal=${signal}`);
    ptyProcess = null;
    if (currentSocket) {
      currentSocket.emit('output', '\r\n进程已退出，请刷新页面重新连接\r\n');
    }
  });

  // 监听进程错误
  ptyProcess.on('error', (err) => {
    console.error('pty进程错误:', err.message);
    if (currentSocket) {
      currentSocket.emit('output', `\r\n错误: ${err.message}\r\n`);
    }
  });

  return ptyProcess;
}

function cleanup() {
  if (ptyProcess) {
    try {
      ptyProcess.kill();
      console.log('已清理pty进程');
    } catch (e) {
      console.error('清理进程失败:', e.message);
    }
    ptyProcess = null;
  }
  currentSocket = null;
}

io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);

  // 如果已有连接，断开旧的
  if (currentSocket && currentSocket !== socket) {
    console.log('断开旧连接');
    currentSocket.disconnect();
  }

  currentSocket = socket;

  // 创建或复用pty进程
  if (!ptyProcess) {
    ptyProcess = createPtyProcess();
  }

  // 发送pty输出到客户端
  ptyProcess.on('data', (data) => {
    if (currentSocket && currentSocket.connected) {
      socket.emit('output', data);
    }
  });

  // 接收客户端输入
  socket.on('input', (data) => {
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });

  // 处理终端大小调整
  socket.on('resize', (data) => {
    if (ptyProcess) {
      ptyProcess.resize(data.cols, data.rows);
    }
  });

  // 心跳检测
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log('客户端已断开连接:', reason);
    if (currentSocket === socket) {
      currentSocket = null;
    }
    // 不立即清理pty进程，允许重连
  });

  // 连接错误
  socket.on('error', (err) => {
    console.error('Socket错误:', err.message);
  });
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在退出...');
  cleanup();
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在退出...');
  cleanup();
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 监听退出请求
io.on('exit_request', () => {
  console.log('收到退出请求，正在关闭服务器...');
  cleanup();
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

const PORT = 7681;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Web 终端服务已启动: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('警告：使用本工具产生的所有后果由您自行承担！');
  console.log('请谨慎操作，避免执行危险命令！');
  console.log('========================================');
});
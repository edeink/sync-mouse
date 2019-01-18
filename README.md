## 运行必要环境

因为该小程序是构建在robotjs之上，robotjs对当前运行环境有较多的要求
[参考](https://github.com/octalmage/robotjs#building)

在不考虑linux的情况下，上面的安装可以化简为：

- mac：安装Xcode
- window：以管理员身份运行`powershell`
  - `npm install windows-build-tools`。[参考](https://www.npmjs.com/package/windows-build-tools)
  - `cd node_modules/robotjs`目录并执行`node-gyp rebuild`

## 目前版本

因为某些已知的BUG，目前不推荐MAC作为`Client`，而Window不存在限制。

## 使用方式

1. 检查网络，保证局域网内，两台电脑可以互ping
2. 服务端：`npm run s`
3. 客户端: `npm run c`

## 目前支持功能

- 两个屏幕的连接（可通过鼠标移动 或 `Ctrl + [`）
  - 鼠标移动到边界自动切换
  - `Ctrl + [`（强制进入） 或 `Ctrl + ]`（强制退出）

- 鼠标 
  - 左右键单击、滑轮滚动、拖拽
- 键盘
  - 非快捷键的输入，如一般的文本输入
  - 快捷键：`Ctrl + C`：仅支持文本

## 开发计划

### 功能

- [x] 双向复制
- [x] 无法连接服务器等提示 & 机制
- [x] 设置两个屏幕的位置
- [x] 局域网基于Key的自发现机制（无需明确IP）
- [x] 更适应屏幕的活动规则
- [x] 快捷键输入
- [ ] 复制文件
- [ ] 根据性质分别采用TCP & UDP
- [ ] 阻止键盘和鼠标事件

### 未来功能

以下功能因为工作量较大，所以延后支持：

1. 发布到npm且通过nw.js封装成App
2. 支持三个或以上屏幕

### BUG

- [x] 鼠标进入和退出时不够流畅（因为mousemove触发过多，应该throttle）

- [x] 比较难唤起Mac的程序坞（接近Mac程序坞时，mousemove应该平滑移动）

- [ ] Mac Hook无法监听多个键盘事件（iohook的BUG，[Link](https://github.com/wilix-team/iohook/issues/124)）
- [ ] VSCODE双击时无法通过模拟获取
- [ ] 单个修饰键无法使用
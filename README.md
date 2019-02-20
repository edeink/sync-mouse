## 简介

以Win为主服务器，远程操作Mac的工具。

（原计划支持多端鼠标键盘共享，因工程较大，延后支持）

## 运行必要环境

因为该小程序是构建在`robotjs`之上，假若没有匹配的package，需要支持编译C++的环境：[参考](https://github.com/octalmage/robotjs#building)

- mac：安装`Xcode`
- window：`npm install windows-build-tools`。[参考](https://www.npmjs.com/package/windows-build-tools)

## 安装使用

- `npm i sharemk -g`
- Win：`sharemk -s`
- Mac：`sharemk -c`

## 目前支持功能

- 鼠标常规操作（移动，点击，滑动，拖拽等）
- 键盘常规操作（非快捷键输入）
- 突发情况快捷键：
  - `Ctrl + [`（开启控制） 
  -  `Ctrl + ]`（退出控制）


## 开发相关

以下为开发相关（暂搁于此），使用者退散~

## Dev调试运行

1. `npm run s`（现阶段为Win系统）
2. `npm run c`（现阶段为Mac或Linux系统）
3. 当鼠标到达边界，即可操作额外的电脑

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

原计划是支持三端的，因为一些已知的问题，且暂时没有精力解决，所以延后了。

- v0.2.x：支持三端
- v0.3.x：封装App，支持三个或以上屏幕

## BUG统计

#### 已修复

- [x] 鼠标进入和退出时不够流畅（因为mousemove触发过多，应该throttle）
- [x] 比较难唤起Mac的程序坞（接近Mac程序坞时，mousemove应该平滑移动）
- [x] VSCODE双击时无法通过模拟获取
- [x] 单个修饰键无法使用

#### 未修复

- [ ] Mac Hook无法监听多个键盘事件（iohook的BUG，[Link](https://github.com/wilix-team/iohook/issues/124)）




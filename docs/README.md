## 简介

以Win为主服务器，远程操作Mac的工具。

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

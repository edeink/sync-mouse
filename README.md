## 运行必要环境

因为该小程序是构建在robotjs之上，robotjs对当前运行环境有较多的要求
[参考](https://github.com/octalmage/robotjs#building)

在不考虑linux的情况下，上面的安装可以化简为：

- mac：安装Xcode（相信所有人早已经安装了）
- window：以管理员运行powershell，而后`npm install windows-build-tools`。[参考](https://www.npmjs.com/package/windows-build-tools)
- 其他：`cd node_modules/robotjs`目录并执行`node-gyp rebuild`

## 使用方式

1. 检查网络，保证局域网内，两台电脑可以互ping（即两台电脑可以建立连接）
2. 服务端：`npm run s`
3. 客户端: `npm run c`

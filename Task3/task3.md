# Task 3

## 题目

> 使用 compute network sdk 构建一个可获取交易所信息（https://fapi.binance.com/fapi/v1/ticker/price）并给出交易建议的 trading bot
> 参考：[compute-web-demo](https://github.com/Ravenyjh/compute-web-demo)

## 使用说明

-   安装依赖（可以用 yarn/npm 等）：`bun install`
-   运行：`bun dev`

## 备注

-   rainbowkit 使用 viem，`viem@2.38.5` 已经内置了 '0G Galileo Testnet'(PR `#4049`)
    `import { zeroGTestnet } from 'viem/chains';`
-   `@0glabs/0g-serving-broker`的代码仓库不叫`0g-serving-broker`，而是 `0g-serving-user-broker`。
    `0g-serving-broker` 看起来是用 go 写的 cli + api
-   `@0glabs/0g-serving-broker` npm 包里面竟然塞了一个 40MB 的 `0g-strage-client` binary

## 最大难点（实际上是自己找麻烦）

**踩坑越多，学到的东西越多。毕竟没有系统学过前端**
研究了很长时间，各种问 AI（一开始还不明白为什么运行不了），研究了很久曲线救国的方法。

原始的`@0glabs/0g-serving-broker`没有做 browser 适配。因此不能直接导入到浏览器运行。浏览器端不能运行 node 内置的一些包。
虽然代码中实际没用到，但是偏偏 `@0glabs/0g-serving-broker` 里面有许多导入。

观察 demo 中的代码，最终发现 `next.config.js` 保证了 next 可以工作。使用了 webpack 的 `resolve.fallback` 进行替换。
我用的技术栈是 bun + react ，没有用 next。使用的 bun 自带的打包器 bun bundler。翻了好多地方，研究 bun 的 bundler，宣传比 webpack 快 220 倍，但是偏偏没有现在需要的功能 `resolve.fallback`。bun build 虽然有 external，但是还是不能实现 import 的重定向。

可行的思路之一是将这些实例化 broker 以及相关操作全部放到后端。前端调用 API，只给 broker id。

## 代码路径

`index.ts` 建立服务器 --> 用户请求根目录 --> `index.ts` route 到 `index.html` -->
`frontend.tsx` 套上 rainbow 获得 app --> `app.tsx` return 前端内容

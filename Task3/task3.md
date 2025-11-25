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

又尬住了，实例化 broker 需要用到 signer，也就是前端连接的钱包。这个参数就是带私钥的钱包了，绝对不能往后端送。

又问了更高明的 AI，其实 bun bundler 已经自动处理适配了很多导入。唯独这个 `child_process`，它不会弄，认为这个不能设置为空。也不能设置 external，external 只是置之不理。要的是设置为空。接下来的办法，二选一

1. 让 bun 把 `child_process` 导入设置为空。 [Lifecycle hooks](https://bun.sh/docs/bundler/plugins#lifecycle-hooks)
2. 使用 vite ，我偏不用 webpack。

还是那句话，踩坑越多，学到的东西越多。

方法1，甚至问了 bundler 文档里面的AI。。。尝试 onResolve。
已经找到了，但是修改后还是报 `child_process` 无法导入。
这里研究了 3 个小时即将放弃了，柳暗花明看到了一个东西 "child_process-browserify"，其实是个空包。
马上想到不是替换成空白导入，而是替换成这个空包。提示必须使用绝对路径。这个好说。
成功了。困扰了将近 3 天的问题终于迎刃而解！！！

这段代码就是解决方案。

```ts
// resolve fallback of child_process
const myPlugin: BunPlugin = {
  name: "onResolve fallback child_process",
  setup(build) {
    build.onResolve({ filter: /.*/, namespace: "file" }, args => {
      if (args.path.includes("child_process")) {
        console.log("666,found child_process"); // 一共四处
        // console.log(args.path);

        return{
          // path: "",   // 失败
          // path: args.path.replace("child_process", "child_process-browserify"),  // 要求绝对路径
          path: path.resolve("./child_process-browserify/index.js"),
        }
      }
    });
  }
};
```


## 代码路径

`index.ts` 建立服务器 --> 用户请求根目录 --> `index.ts` route 到 `index.html` -->
`frontend.tsx` 套上 rainbow 获得 app --> `app.tsx` return 前端内容

## 参考链接
- [demo](https://github.com/Ravenyjh/compute-web-demo/)
- [Bundler - Bun](https://bun.com/docs/bundler)

## 运行截图

TODO

# Task 3

## 题目

> 使用 compute network sdk 构建一个可获取交易所信息（https://fapi.binance.com/fapi/v1/ticker/price）并给出交易建议的 trading bot
> 参考：[compute-web-demo](https://github.com/Ravenyjh/compute-web-demo)
## 使用说明

-   rainbowkit 使用 viem，`viem@2.38.5` 已经内置了 '0G Galileo Testnet'(PR `#4049`)
-   `import { zeroGTestnet } from 'viem/chains';`
## 代码路径

`index.ts` 建立服务器 --> 用户请求根目录 --> `index.ts` route 到 `index.html` -->
`frontend.tsx` 套上 rainbow 获得 app --> `app.tsx` return 前端内容

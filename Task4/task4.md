# task4

#### Markdown Notes 创建于 2025-11-29T16:43:53.345Z

## 题目

在测试网部署一个自己的 iNFT 合约，并 mint 一个 iNFT。
提交 chain scan 上合约地址链接，以及 mint 的 inft 的链接
https://chainscan-galileo.0g.ai/

## 加难度

使用 hardhat 3，以及新特性 ignition，重新编写部署相关的代码

### beacon 代理

**部署方法**：

1. Deploy implementation
2. Deploy beacon
3. Deploy proxy with initialization data

**请求路径**：请求--->proxy--->beacon--->实现
**升级操作**: 先部署新的实现，调用 beacon 的 `upgradeTo`，传进新的实现。
**优点**：方便升级，同一实现，可以多个代理，并指向同一个信标。升级只需告诉信标新的实现地址即可。升级前后代理地址和信标地址都不变。外部无感知。

## 使用

设置环境变量，代码中没有给出默认值，必须从 `.env` 文件读取。将 `.env.example` 复制一份为 `.env`，并填写相关内容。

## 参考链接

-   [0g-agent-nft (backup branch)](https://github.com/0gfoundation/0g-agent-nft/blob/backup)
-   [ERC-7857](https://eips.ethereum.org/EIPS/eip-7857)
-   [ERC-7857: 具有私有元数据的 AI 代理 NFT](https://learnblockchain.cn/docs/eips/EIPS/eip-7857/)

### 可升级的合约

-   [Proxy](https://docs.openzeppelin.com/contracts/5.x/api/proxy)
-   [Using with Upgrades](https://docs.openzeppelin.com/contracts/5.x/upgradeable)
-   [Writing Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable)
-   [Upgrades Plugins Frequently Asked Questions](https://docs.openzeppelin.com/upgrades-plugins/faq)

## TODO

-   beacon proxy 实践(hardhat-counter-upgradeable-beacon)
    -   [x] 部署
    -   [x] 升级
    -   [x] 编写测试
    -   [x] 在 blockscout 验证
-   环境变量
-   关于转移，如何 mock

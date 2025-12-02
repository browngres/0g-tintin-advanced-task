# task4

#### Markdown Notes 创建于 2025-11-29T16:43:53.345Z

## 题目

在测试网部署一个自己的 iNFT 合约，并 mint 一个 iNFT。
提交 chain scan 上合约地址链接，以及 mint 的 inft 的链接
https://chainscan-galileo.0g.ai/

## 加难度

使用 hardhat 3，以及新特性 ignition，重新编写部署相关的代码

最大难点：Ignition buildModule 限制，涉及到合约变量的 log 打印以及条件逻辑都不能用。也不能用 `async/await` 异步操作。

会报错 `inspect is not a function`

大致原因是合约变量是延迟生成的。不能打印或者判断 `nft` 以及 `nft.address` 这种 Module 返回的变量及其属性。

如果一定需要，编写脚本调用 `ignition.deploy` 来执行复杂部署。参看[Complex deployments with scripts](https://hardhat.org/ignition/docs/guides/scripts)

另外踩了一个坑，研究将近半天。hardhat 内部网络不会保存部署到 `ignition/deployments`，所以编写测试时升级操作，状态无法保留。就算使用 `useModule` 也不会发现现有部署。

### beacon 代理

**部署方法**：

1. Deploy implementation
2. Deploy beacon
3. Deploy proxy with initialization data

**请求路径**：请求--->proxy--->beacon--->实现
**升级操作**: 先部署新的实现，调用 beacon 的 `upgradeTo`，传进新的实现。
**优点**：方便升级，同一实现，可以多个代理，并指向同一个信标。升级只需告诉信标新的实现地址即可。升级前后代理地址和信标地址都不变。外部无感知。

## 部署方法

设置环境变量，代码中没有给出默认值，必须从 `.env` 文件读取。将 `.env.example` 复制一份为 `.env`，并填写相关内容。

依次执行（一次一行），根据需要自行修改 `network` 和 `deployment-id`

```bash
cd Task4
bunx hardhat ignition deploy ./ignition/modules/TEEVerifier.ts --network ganache_test --deployment-id "INFT_on_ganache_test"
bunx hardhat ignition deploy ./ignition/modules/Verifier.ts --network ganache_test --deployment-id "INFT_on_ganache_test"
bunx hardhat ignition deploy ./ignition/modules/AgentNFT.ts --network ganache_test --deployment-id "INFT_on_ganache_test"
```

升级方法同理，换成 `UpgradeXXX.ts`，需要准备好新的实现合约，例如 `VerifierV2`。

备注：也可以直接执行最后一个，因为 Hardhat 3 会检测到依赖的 Ignition Module 不存在，就会提前部署依赖合约。

## mint 操作

-   需要修改里面的 CA 为 Agent NFT 的代理地址
-   按需修改使用的网络
-   按需编辑脚本里面 mock 的内容

`bunx hardhat run scripts/mint.ts --network ganache_test`

## 验证合约

ZG_TESTNET_ETHERSCAN_API_URL = "https://chainscan-galileo.0g.ai/open/api"

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
-   [x] 整理环境变量

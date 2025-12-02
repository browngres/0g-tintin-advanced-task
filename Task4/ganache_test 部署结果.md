# INFT 部署在 Ganache_test 的一次成功结果

执行 ignition deploy 三个或者最后一个，输出的最后是这样的。

```
Deployed Addresses

ProxyAgentNFTModule#AgentNFT - 0x3c4CE67E1a0D8FF93A63562eC71e7C81E8D69bed
ProxyTEEVerifierModule#TEEVerifier - 0xaF2aAB97fB54a132FD736EeCe6a57E9e4a77f608
ProxyAgentNFTModule#UpgradeableBeacon - 0xF9fe916b1D6BA119a80BeE8e160E085C99dC172F
ProxyTEEVerifierModule#UpgradeableBeacon - 0xADd5995699Cf49aa345211F82F78CA86B8EF9533
ProxyTEEVerifierModule#BeaconProxy - 0x36D62da62f4E88C72B74e5A1c5Df5c38c2B54eBa
TEEVerifierModule#TEEVerifier - 0x36D62da62f4E88C72B74e5A1c5Df5c38c2B54eBa
ProxyVerifierModule#Verifier - 0x289286081D753CA45278AC73FFE8FD1114A1c544
ProxyVerifierModule#UpgradeableBeacon - 0x8E9D1ab02a179fd4b7cc22e69D763BbAA453e5e6
ProxyVerifierModule#BeaconProxy - 0x5198D6701595Ef9cbAF570Dc8cA1B250452D74dd
VerifierModule#Verifier - 0x5198D6701595Ef9cbAF570Dc8cA1B250452D74dd
ProxyAgentNFTModule#BeaconProxy - 0xb04549A543F5Fa00509789A72b29376B358D998A
AgentNFTModule#AgentNFT - 0xb04549A543F5Fa00509789A72b29376B358D998A
```

从上到下分别代表：

-   AgentNFT 实现
-   TEEVerifier 实现
-   AgentNFT 信标
-   TEEVerifier 信标
-   TEEVerifier 代理
-   TEEVerifier 对外的地址
-   Verifier 实现
-   Verifier 信标
-   Verifier 代理
-   Verifier 对外的地址
-   AgentNFT 代理
-   AgentNFT 对外的地址

**对外的地址**：就是模拟外部场景使用的合约。地址等于代理，能被被其他模组当作代理调用。`真实实现ABI+代理地址`）

它跟代理的区别是：`代理合约 = 代理的ABI(BeaconProxy)+代理地址` ， `对外的合约 = 真实实现ABI+代理地址`

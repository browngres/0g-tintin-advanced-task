import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

// beacon 代理方式部署
// 1. Deploy implementation
// 2. Deploy beacon
// 3. Deploy proxy with initialization data
// 部署实现合约不给参数，后面 init 才给

const proxyAgentNFTModule = buildModule("ProxyAgentNFTModule", (m) => {
    // 部署实现和 beacon
    const deployer = m.getAccount(0)
    console.log("🚀 Deploying AgentNFT with account:", deployer.accountIndex)

    const nft = m.contract("AgentNFT", [], { from: deployer })
    const beacon = m.contract("UpgradeableBeacon", [nft, deployer])

    // 准备参数
    const { NFT_NAME, NFT_SYMBOL } = process.env
    const { ZG_RPC_URL, ZG_INDEXER_URL } = process.env
    const storageInfo = JSON.stringify({ ZG_RPC_URL, ZG_INDEXER_URL })
    // TODO
    const verifyAddress = "0x111"

    const initializeData = m.encodeFunctionCall(nft, "initialize", [
        NFT_NAME!,
        NFT_SYMBOL!,
        storageInfo,
        verifyAddress,
        deployer,
    ])

    // 部署 proxy
    const proxy = m.contract("BeaconProxy", [beacon, initializeData], { from: deployer })
    return { beacon, proxy }
})

const agentNFTModule = buildModule("AgentNFTModule", (m) => {
    const { beacon, proxy } = m.useModule(proxyAgentNFTModule)
    // 使用代理来返回 nft，否则代码中使用代理不知道真实合约的 ABI
    /*
    Tell Ignition to use the impl ABI for the contract at the address of the proxy.
    This will allow us to interact with the contract through the proxy when we use it in tests or scripts.
    */
    const nft = m.contractAt("AgentNFT", proxy)
    return { nft, beacon, proxy }
})

export default agentNFTModule

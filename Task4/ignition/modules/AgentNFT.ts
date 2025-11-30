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

    const { NFT_NAME, NFT_SYMBOL } = process.env
    const { ZG_RPC_URL, ZG_INDEXER_URL } = process.env

    const storageInfo = JSON.stringify({ ZG_RPC_URL, ZG_INDEXER_URL })

    const nft = m.contract("AgentNFT", [], { from: deployer })
    const beacon = m.contract("UpgradeableBeacon", [nft, deployer])
    return { nft, beacon }
})

const agentNFTModule = buildModule("AgentNFTModule", (m) => {
    const { nft, beacon } = m.useModule(proxyAgentNFTModule)
    const proxy = m.contractAt("AgentNFT", beacon)
    return { nft, beacon, proxy }
})

// export default proxyAgentNFTModule
export default agentNFTModule

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("AgentNFTModule", (m) => {
    const deployer = m.getAccount(0)
    console.log("🚀 Deploying AgentNFT with account:", deployer)

    const { GANACHE_RPC, GANACHE_RPC_TEMP } = process.env
    const { NFT_NAME, NFT_SYMBOL } = process.env
    const { ZG_RPC_URL, ZG_INDEXER_URL } = process.env

    const storageInfo = JSON.stringify({ ZG_RPC_URL, ZG_INDEXER_URL })

    // const nft = m.contract("AgentNFT", [], { from: deployer })

    // beacon 代理方式部署
    // 1. Deploy implementation
    // 2. Deploy beacon
    // 3. Deploy proxy with initialization data

    return { nft }
})

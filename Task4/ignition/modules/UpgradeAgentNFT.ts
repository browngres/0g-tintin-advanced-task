import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import agentNFTModule from "./AgentNFT.ts"

const upgradeAgentNFTModule = buildModule("UpgradeAgentNFTModule", (m) => {
    const deployer = m.getAccount(0)
    // 加载之前的合约
    const { beacon, proxy } = m.useModule(agentNFTModule)
    // 部署新的实现
    const nft2 = m.contract("AgentNFT-V2", [], { from: deployer })
    // 调用 beacon 合约的 upgradeTo，执行升级
    m.call(beacon, "upgradeTo", [nft2])
    return { nft2, beacon, proxy }
})

const agentNFTV2Module = buildModule("AgentNFTV2Module", (m) => {
    const { beacon, proxy } = m.useModule(upgradeAgentNFTModule)
    // 使用代理来返回，否则代码中使用代理不知道真实合约的 ABI
    const nft = m.contractAt("AgentNFT-V2", proxy)
    return { nft, beacon, proxy }
})

export default agentNFTV2Module

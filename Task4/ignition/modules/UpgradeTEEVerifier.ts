import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import TEEVerifierModule from "./TEEVerifier.ts"

const upgradeTEEVerifierModule = buildModule("UpgradeTEEVerifierModule", (m) => {
    const deployer = m.getAccount(0)
    // 加载之前的合约
    const { tee, beacon, proxy } = m.useModule(TEEVerifierModule)
    // 部署新的实现
    const tee2 = m.contract("TEEVerifierV2", [], { from: deployer })
    // 调用 beacon 合约的 upgradeTo，执行升级
    m.call(beacon, "upgradeTo", [tee2])
    return { beacon, proxy }
})

const TEEVerifierV2Module = buildModule("TEEVerifierV2Module", (m) => {
    const { beacon, proxy } = m.useModule(upgradeTEEVerifierModule)
    // 使用代理来返回，否则代码中使用代理不知道真实合约的 ABI
    const tee = m.contractAt("TEEVerifierV2", proxy)
    return { tee, beacon, proxy }
})

export default TEEVerifierV2Module

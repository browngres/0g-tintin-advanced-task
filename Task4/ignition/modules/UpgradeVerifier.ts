import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import verifierModule from "./Verifier.ts"

const upgradeVerifierModule = buildModule("UpgradeVerifierModule", (m) => {
    const deployer = m.getAccount(0)
    // 加载之前的合约
    const { verifier, beacon, proxy } = m.useModule(verifierModule)
    // 部署新的实现
    const verifier2 = m.contract("VerifierV2", [], { from: deployer })
    // 调用 beacon 合约的 upgradeTo，执行升级
    m.call(beacon, "upgradeTo", [verifier2])
    return { beacon, proxy }
})

const VerifierV2Module = buildModule("VerifierV2Module", (m) => {
    const { beacon, proxy } = m.useModule(upgradeVerifierModule)
    // 使用代理来返回，否则代码中使用代理不知道真实合约的 ABI
    const verifier = m.contractAt("VerifierV2", proxy)
    return { verifier, beacon, proxy }
})

export default VerifierV2Module

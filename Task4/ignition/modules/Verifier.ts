import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import TEEVerifierModule from "./TEEVerifier.ts"

const proxyVerifierModule = buildModule("ProxyVerifierModule", (m) => {
    // 部署实现和 beacon
    const deployer = m.getAccount(0)
    console.log("🚀 Deploying Verifier with account:", deployer.accountIndex)

    // 需要依赖 tee 合约
    const { tee } = m.useModule(TEEVerifierModule)
    const verifier = m.contract("Verifier", [], { after: [tee], from: deployer })
    const beacon = m.contract("UpgradeableBeacon", [verifier, deployer])

    // 准备参数
    console.log("📋 Attestation config:");
    const verifierType = process.env.VERIFIER_TYPE || "0";
    console.log("  Oracle Type:", parseInt(verifierType));

    // !! ignition BuildModule 限制，涉及到合约变量的 log 以及条件逻辑都不能用。因为合约变量是延迟生成的。
    // !! 不能打印 tee 这种变量，也不能用它的属性做判断。外部的就可以
    let attestationContract
    if (process.env.ATTESTATION_CONTRACT) {
        attestationContract = process.env.ATTESTATION_CONTRACT
        console.log("📋 Using ATTESTATION_CONTRACT from env:", process.env.ATTESTATION_CONTRACT)
    } else {
        // 不能用 tee.address，得到的是空的。因为合约变量的属性延迟获得
        attestationContract = tee
        console.log("📋 Using TEEVerifier as ATTESTATION_CONTRACT")
    }

    /*
    ```solidity
    function initialize(
        AttestationConfig[] calldata _attestationConfigs,
        address _admin
    )
    ```
    */
    const initializeData = m.encodeFunctionCall(verifier, "initialize", [
        // type: AttestationConfigStruct (in Verifier.sol)
        [[
            parseInt(verifierType),
            attestationContract  //  ATTESTATION_CONTRACT 或者是 tee
        ]],
        deployer
    ]);

    // 部署 proxy
    const proxy = m.contract("BeaconProxy", [beacon, initializeData], { from: deployer })
    return { beacon, proxy }
})


const verifierModule = buildModule("VerifierModule", (m) => {
    const { beacon, proxy } = m.useModule(proxyVerifierModule)
    const verifier = m.contractAt("Verifier", proxy)
    return { verifier, beacon, proxy }
})

export default verifierModule

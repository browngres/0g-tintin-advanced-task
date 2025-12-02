import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import TEEVerifierModule from "./TEEVerifier.ts"
import { AttestationConfigStruct } from "../../types/ethers-contracts/contracts/verifiers/Verifier.sol/Verifier.js";


const proxyVerifierModule = buildModule("ProxyVerifierModule", (m) => {
    // 部署实现和 beacon
    const deployer = m.getAccount(0)
    console.log("🚀 Deploying Verifier with account:", deployer.accountIndex)

    // 需要依赖 tee 合约
    const { tee } = m.useModule(TEEVerifierModule)

    const verifier = m.contract("Verifier", [], { after: [tee], from: deployer })
    const beacon = m.contract("UpgradeableBeacon", [verifier, deployer])

    // 准备参数
    let attestationContract: string;
    if (process.env.ATTESTATION_CONTRACT) {
        attestationContract = process.env.ATTESTATION_CONTRACT
        console.log("📋 Using ATTESTATION_CONTRACT from env:", attestationContract)
    } else {

        attestationContract = String(tee.address)
        console.log("📋 Using TEEVerifier as ATTESTATION_CONTRACT:", attestationContract)
    }
    const verifierType = process.env.VERIFIER_TYPE || "0";
    const attestationConfig: AttestationConfigStruct = {
        oracleType: parseInt(verifierType),
        contractAddress: attestationContract
    };
    console.log("📋 Attestation config:");
    console.log("  Oracle Type:", attestationConfig.oracleType);
    console.log("  Contract Address:", attestationConfig.contractAddress);

    /*
    ```solidity
    function initialize(
        AttestationConfig[] calldata _attestationConfigs,
        address _admin
    )
    ```
    */
    const initializeData = m.encodeFunctionCall(verifier, "initialize", [
        {
            "attestationConfig": [[
                parseInt(verifierType),
                attestationContract
            ],]
        },
        deployer
    ]);


    // 部署 proxy
    const proxy = m.contract("BeaconProxy", [beacon, initializeData], { from: deployer })
    return { beacon, proxy }
})

const verifierModule = buildModule("VerifierModule", (m) => {
    const { beacon, proxy } = m.useModule(proxyVerifierModule)
    const verifier = m.contractAt("AgentNFT", proxy)
    return { verifier, beacon, proxy }
})

export default verifierModule

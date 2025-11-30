import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

interface TrustedMeasurementsStruct {
    mrtd: string
    rtmr0: string
    rtmr1: string
    rtmr2: string
    rtmr3: string
}

const proxyTEEVerifierModule = buildModule("ProxyTEEVerifierModule", (m) => {
    const deployer = m.getAccount(0)
    console.log("🚀 Deploying TEEVerifier with account:", deployer.accountIndex)

    // 部署实现和 beacon
    const tee = m.contract("TEEVerifier", [], { from: deployer })
    const beacon = m.contract("UpgradeableBeacon", [tee, deployer])

    // 参数准备
    const tdxQuote = process.env.TDX_QUOTE || "0x00"
    const trustedMeasurements: TrustedMeasurementsStruct = {
        mrtd: process.env.TRUSTED_MRTD || "0x0000000000000000000000000000000000000000000000000000000000000000",
        rtmr0: process.env.TRUSTED_RTMR0 || "0x0000000000000000000000000000000000000000000000000000000000000000",
        rtmr1: process.env.TRUSTED_RTMR1 || "0x0000000000000000000000000000000000000000000000000000000000000000",
        rtmr2: process.env.TRUSTED_RTMR2 || "0x0000000000000000000000000000000000000000000000000000000000000000",
        rtmr3: process.env.TRUSTED_RTMR3 || "0x0000000000000000000000000000000000000000000000000000000000000000",
    }
    console.log("📋 Using trusted measurements:")
    console.log("  MRTD:", trustedMeasurements.mrtd)
    console.log("  RTMR0:", trustedMeasurements.rtmr0)
    console.log("  RTMR1:", trustedMeasurements.rtmr1)
    console.log("  RTMR2:", trustedMeasurements.rtmr2)
    console.log("  RTMR3:", trustedMeasurements.rtmr3)

    const initializeData = m.encodeFunctionCall(tee, "initialize", [
        tdxQuote,
        [
            trustedMeasurements.mrtd,
            trustedMeasurements.rtmr0,
            trustedMeasurements.rtmr1,
            trustedMeasurements.rtmr2,
            trustedMeasurements.rtmr3,
        ],
    ])

    // 部署 proxy
    const proxy = m.contract("BeaconProxy", [beacon, initializeData], { from: deployer })

    return { beacon, proxy }
})

const TEEVerifierModule = buildModule("TEEVerifierModule", (m) => {
    const { beacon, proxy } = m.useModule(proxyTEEVerifierModule)
    const tee = m.contractAt("TEEVerifier", proxy)
    return { tee, beacon, proxy }
})

export default TEEVerifierModule

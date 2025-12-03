// 验证合约，给 source code
// https://chainscan-galileo.0g.ai/open/doc

import { solidity, config } from "hardhat"
import path from "path"

const apiUrl = "https://chainscan-galileo.0g.ai/open/api"

// !! hardhat-verify 的方法是重新编译获取

// const sourceName = "contracts/TeeVerifier.sol"   // 如果不是 npm 包里面
// const sourceName = "npm:@openzeppelin/contracts/proxy/beacon/UpgradeableProxy.sol" // 如果是 npm 包里面
const sourceName = "npm:@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol" // 如果是 npm 包里面

const rootFilePath = path.join(config.paths.root, sourceName)

const getCompilationJobsResult = await solidity.getCompilationJobs(
    // [rootFilePath],  // 如果不是 npm 包里面的
    [sourceName], // 如果是 npm 包里面的
    {
        buildProfile: "default",
        quiet: true,
        force: true,
    }
)

const compilationJob = getCompilationJobsResult.compilationJobsPerFile
const SolcInput = await compilationJob.get(sourceName).getSolcInput()
// console.log(SolcInput);

const parameters = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: "0x8ddf9171a59cc6d6f2e738f2498a0e43a3b34bce",
    sourceCode: JSON.stringify(SolcInput),
    codeformat: "solidity-standard-json-input",

    // !! contractname 不能写错，否则提示 "contract_not_found_in_compiler_output:Contract not found in compiler output."
    // `SourceName:ContractName` ，SourceName 从 Input 中可以看出来， ContractName 就是 sol 代码中使用的合约名
    // contractname: "contracts/TeeVerifier.sol:TeeVerifier", // 如果不是 npm 包里面
    // 如果是 npm 包里面
    contractname: "npm/@openzeppelin/contracts@5.4.0/proxy/beacon/BeaconProxy.sol:BeaconProxy",

    compilerversion: "v0.8.28+commit.7893614a",

    // ===================
    // !! 注意是否需要 constructorArguements。信标、代理需要，实现不需要。
    // 可以从链上找到。也有 encodeFunctionData 方法。
    // 代理的构建参数是（信标地址+实现地址的 initialize call），里面带结构体，不容易找。信标地址开头，函数签名可以确定。
    // 甚至可以在 ganache 上部署，并在 blockscout 上提供 input 验证，然后就能看到。
    // 可以确定需要用到的 constructorArguements 就在 Bytecode 的结尾部分（从信标地址一直到最后，中间有函数签名）
    // initialize 签名： AgentNFT: 0xd6d0faee， Verifier: 0xd03f3f71，TEEVerifier: 0x2d43b4f4
    // ==================
    constructorArguements: "",
})

async function main() {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: parameters.toString(),
    })

    const data = await response.json()
    console.log("==============================")
    console.log(data)

    function sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }
    await sleep(3000)

    const response2 = await fetch(apiUrl + "?module=contract&action=checkverifystatus&guid=" + data.result, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    })

    const data2 = await response2.json()
    console.log("==============================")
    console.log(data2)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

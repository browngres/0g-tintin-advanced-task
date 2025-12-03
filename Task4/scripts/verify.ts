// 验证合约，给 source code
// https://chainscan-galileo.0g.ai/open/doc

import { solidity, config } from "hardhat";
import path from "path";

const apiUrl = "https://chainscan-galileo.0g.ai/open/api"

// !! hardhat-verify 的方法是重新编译获取
const rootFilePath = path.join(config.paths.root, "contracts/TeeVerifier.sol")
const getCompilationJobsResult = await solidity.getCompilationJobs(
    [rootFilePath],
    {
        buildProfile: "default",
        quiet: true,
        force: true,
    },
);

const compilationJob = getCompilationJobsResult.compilationJobsPerFile
const SolcInput = await compilationJob.get("contracts/TeeVerifier.sol").getSolcInput()

const parameters = new URLSearchParams({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: "0x98F92881489DcDBeDFceC2C5308B4Be8Ee859B0E",
    sourceCode: JSON.stringify(SolcInput),
    codeformat: "solidity-standard-json-input",
    // !! contractname 不能写错，否则提示 "contract_not_found_in_compiler_output:Contract not found in compiler output."
    contractname: "project/contracts/TeeVerifier.sol:TEEVerifier",
    compilerversion: "v0.8.28+commit.7893614a",
    // !! 注意是否需要，可以从链上找到。也有 encodeFunctionData 方法
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


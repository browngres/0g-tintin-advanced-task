import type { HardhatRuntimeEnvironment } from "hardhat/types/hre"

interface TaskArguments {
    //
}

export default async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = await hre.network.connect()
    const blockNumber = await ethers.provider.getBlockNumber()
    console.log(`Current block number: ${blockNumber}`)
}

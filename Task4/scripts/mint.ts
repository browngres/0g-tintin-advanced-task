import { network } from "hardhat"
const { ethers } = await network.connect()

async function main() {
    const CA = "0xb04549A543F5Fa00509789A72b29376B358D998A"
    const nft_contract = await ethers.getContractAt("AgentNFT", CA)

    // Mock IntelligentData
    const iDatas = [
        {
            dataDescription: "Some awesome intelligent data.",
            dataHash: ethers.keccak256(ethers.toUtf8Bytes("Some awesome intelligent data.")),
        },
    ]

    // 获取 signer
    const [signer] = await ethers.getSigners()

    // 调用 mint
    const tx = await nft_contract.connect(signer).mint(iDatas, signer.address, { value: 0 })
    await tx.wait()

    // 获取结果
    console.log(`Transaction confirmed in block: ${tx.blockNumber}`)
    const filter = nft_contract.filters.Minted()
    const minted_logs = await nft_contract.queryFilter(filter, tx.blockNumber as number, tx.blockNumber as number)
    console.log("Minted NFT with tokenId:", parseInt(minted_logs[0].topics[1]))
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

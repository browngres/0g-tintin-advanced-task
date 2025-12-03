import { expect } from "chai"
import { network } from "hardhat"
import type { Contract, ContractTransactionResponse, Signer } from "ethers"

import agentNFTModule from "../ignition/modules/AgentNFT.js"

describe("AgentNFT test", function () {
    let nft: Contract, beacon: Contract, proxy: Contract

    beforeEach(async function () {
        const { ignition } = await network.connect()
        ;({ nft, beacon, proxy } = await ignition.deploy(agentNFTModule))
    })

    after(async function () {
        console.log("impl:", await beacon.implementation())
        console.log("beacon:", beacon.target)
        console.log("nft:", nft.target)
    })

    it("AgentNFT version", async function () {
        expect(await nft.VERSION()).to.equal("2.0.0")
    })

    it("Mint", async function () {
        const { ethers } = await network.connect()
        const iDatas: any[] = [
            {
                dataDescription: "Some awesome intelligent data.",
                dataHash: ethers.keccak256(ethers.toUtf8Bytes("Some awesome intelligent data.")),
            },
        ]

        const [signer]: Signer[] = await ethers.getSigners()
        const deployer = await signer.getAddress()
        const tx: ContractTransactionResponse = await nft.mint(iDatas, deployer, { value: ethers.parseEther("0") })
        // console.log(tx)

        // 前 9 个 tx 是部署合约
        expect(tx.blockNumber).to.equal(10)

        // expect emit 了 Minted 事件
        const tokenId: bigint = 0n // 假设第一个 tokenId 是 0
        await expect(tx).to.emit(nft, "Minted").withArgs(tokenId, deployer, deployer)

        // expect 检查 ownerOf(tokenId) 正好是 Signer
        const owner = await nft.ownerOf(tokenId)
        expect(owner).to.equal(deployer)
    })
})

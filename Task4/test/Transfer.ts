import { expect } from "chai"
import { network } from "hardhat"

import TEEVerifierModule from "../ignition/modules/TEEVerifier.js"
import verifierModule from "../ignition/modules/Verifier.js"
import agentNFTModule from "../ignition/modules/AgentNFT.js"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types"
import type {
    AccessProofStruct,
    OwnershipProofStruct,
    TransferValidityProofStruct,
} from "../types/ethers-contracts/contracts/AgentNFT.sol/AgentNFT.js"
import type { TEEVerifier, Verifier, AgentNFT } from "../types/ethers-contracts/index.js"

describe("AgentNFT Transfer test", function () {
    let tee: TEEVerifier
    let verifier: Verifier
    let nft: AgentNFT
    let sender: HardhatEthersSigner
    let receiver: HardhatEthersSigner
    let tee_signer: HardhatEthersSigner

    after(async function () {
        console.log("sender address:", sender.address)
        console.log("receiver address:", receiver.address)
        console.log("tee_signer address:", tee_signer.address)
        console.log("nft CA:", nft.target)
    })

    it("Transfer", async function () {
        // 避免 hardhat 内部网没有保存部署的结果，这里直接使用同一个 it
        // accounts
        const { ethers } = await network.connect()
        // !! 使用 hardhat 模拟网络进行测试，或者在网络配置中补充账户
        sender = await ethers.provider.getSigner(1)
        receiver = await ethers.provider.getSigner(2)
        tee_signer = await ethers.provider.getSigner(3)

        // deploy
        const { ignition } = await network.connect()
        ;({ tee } = await ignition.deploy(TEEVerifierModule)) // 这个分号不能少
        ;({ verifier } = await ignition.deploy(verifierModule))
        ;({ nft } = await ignition.deploy(agentNFTModule))

        // mock data
        const dataDescription = "Some awesome intelligent data."
        const dataHash: string = ethers.keccak256(ethers.toUtf8Bytes("Some awesome intelligent data."))
        const iDatas: any[] = [
            {
                dataDescription: dataDescription,
                dataHash: dataHash,
            },
        ]

        // mint for sender
        await nft.mint(iDatas, sender, { value: ethers.parseEther("0") })

        // check minted owner
        expect(await nft.ownerOf(0)).to.equal(sender.address)

        // keccak256("0x1234567890abcdef1234567890abcdef12345678")
        // keccak256("0x8888888888888888888888888888888888888888")
        const oldDataHash = "0x5f6174255b44b7ca652c5289d2546de65e4394eb6aa52a40045e01237736d023"
        const newDataHash = "0xd0c8707c906a797561008f61c112c70c07c0e57952e0348106ae2b8be92a5d59"
        const accessProofNonce = "0x1234"
        const accProof: AccessProofStruct = {
            oldDataHash: oldDataHash,
            newDataHash: newDataHash,
            nonce: accessProofNonce,
            encryptedPubKey: "0x", // using receiver's eth pub key
            proof: "0x",
        }

        // 根据 `Verifier.sol` 中的`verifyAccessibility` 构建消息
        const accessMessage = ethers.solidityPacked(
            ["string", "string"],
            [
                "\x19Ethereum Signed Message:\n66",
                ethers
                    .solidityPackedKeccak256(
                        ["bytes32", "bytes32", "bytes", "bytes"],
                        [accProof.oldDataHash, accProof.newDataHash, accProof.encryptedPubKey, accProof.nonce]
                    )
                    .slice(2),
            ]
        )
        // 考虑使用 ethers.hashMessage()
        // 计算最终的 messageHash
        const accessMessageHash = ethers.keccak256(accessMessage)

        // access 签名来自 receiver
        const accessSignature = await receiver.connect(ethers.provider).signMessage(ethers.getBytes(accessMessageHash))
        accProof.proof = accessSignature

        // sealedKey: 用 receiver 的钱包公钥加密的一个密钥。确保新数据只能 receiver 可以得到。
        // 涉及到使用公钥加密，这里直接 mock
        const sealedKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        const encryptedPubKey = "0xabcd"
        const ownershipProofNonce = "0x2345"

        const ownershipProof: OwnershipProofStruct = {
            oracleType: 0n,
            oldDataHash: oldDataHash,
            newDataHash: newDataHash,
            sealedKey: sealedKey,
            encryptedPubKey: encryptedPubKey,
            nonce: ownershipProofNonce,
            proof: "0x",
        }

        // 根据 `Verifier.sol` 中的`verifyOwnershipProof` 构建消息
        const ownershipMessage = ethers.solidityPacked(
            ["string", "string"],
            [
                "\x19Ethereum Signed Message:\n66",
                ethers
                    .solidityPackedKeccak256(
                        ["bytes32", "bytes32", "bytes", "bytes", "bytes"],
                        [
                            ownershipProof.oldDataHash,
                            ownershipProof.newDataHash,
                            ownershipProof.sealedKey,
                            ownershipProof.encryptedPubKey,
                            ownershipProof.nonce,
                        ]
                    )
                    .substring(2),
            ]
        )
        // 考虑使用 ethers.hashMessage()
        // 计算最终的 messageHash
        const ownershipMessageHash = ethers.keccak256(ownershipMessage)

        // ownership 签名来自 tee
        const ownershipSignature = await tee_signer
            .connect(ethers.provider)
            .signMessage(ethers.getBytes(ownershipMessageHash))
        ownershipProof.proof = ownershipSignature

        const proofs: TransferValidityProofStruct[] = [{ accessProof: accProof, ownershipProof: ownershipProof }]
        // const proofs: TransferValidityProofStruct[] = []
        console.log(verifier.attestationContract)

        // 使用 sender 调用 nft 合约的 iTransfer 函数
        const tx = await nft.connect(sender).iTransfer(receiver.address, BigInt(0n), proofs)
        console.log(await tx.wait())

        expect(await nft.ownerOf(0)).to.equal(receiver.address)
    })
})

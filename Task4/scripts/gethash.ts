import { network } from "hardhat"
import type { SignMessage } from "../types/ethers-contracts/index.js"
const { ethers, provider } = await network.connect()
async function main() {
    const signMessage: SignMessage = await ethers.deployContract("SignMessage")
    // console.log(await provider.request({ method: "eth_accounts" }))

    await signMessage.waitForDeployment()
    console.log(await signMessage.oldDataHash())
    console.log(await signMessage.newDataHash())
    console.log(await signMessage.encryptedPubKey())
    console.log(await signMessage.nonce())
    console.log(await signMessage.getMessageHash())

    console.log("======================");
    console.log(await signMessage.ownershipSealedKey())
    console.log(await signMessage.ownershipEncryptedPubKey())
    console.log(await signMessage.ownershipNonce())
    console.log(await signMessage.getOwnershipMessageHash())


}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

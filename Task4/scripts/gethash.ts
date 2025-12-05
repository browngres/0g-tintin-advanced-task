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
    console.log("======================");

    const wallet1 = new ethers.SigningKey("receiver私钥")

    console.log(
        wallet1.compressedPublicKey,  // 0x039d9031e97dd78ff8c15aa86939de9b1e791066a0224e331bc962a2099a7b1f04
        wallet1.publicKey
    );
    console.log("当前：length", await signMessage.length());

    console.log(
        await signMessage.pubKeyToAddress("0x9d9031e97dd78ff8c15aa86939de9b1e791066a0224e331bc962a2099a7b1f0464b8bbafe1535f2301c72c2cb3535b172da30b02686ab0393d348614f157fbdb")
    )

    console.log("当前：length", await signMessage.length());
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

// 引入必要的库
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

dotenv.config({path: "../.env"});  // Task3 目录下执行命令


async function main() {
    const private_key = process.env.PRIVATE_KEY
    const testnet_rpc = process.env.TESTNET_RPC

    const provider = new ethers.JsonRpcProvider(testnet_rpc)
    let signer = new ethers.Wallet(private_key!);
    signer = signer.connect(provider)

    console.log(signer.address)
    console.log(ethers.formatEther(await provider.getBalance(signer.address)))

    const instance = await createZGComputeNetworkBroker(signer);
    console.log(instance);

}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})



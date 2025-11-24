import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type { JsonRpcSigner } from "ethers";

export default async function createBroker(signer: JsonRpcSigner){
    let broker_id = ""
    try {
        const broker = await createZGComputeNetworkBroker(signer);
        broker_id = "broker_" + signer.address.substring(2)
        console.log(broker_id);

    } catch (err) {
        console.error("Broker 初始化失败:", err);
    }
}
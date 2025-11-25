import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import zgLogo from "./0G-Logo.png";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from "wagmi";

import AccountTab from './components/AccountTab';
import ServiceTab from './components/ServiceTab';
import ChatTab from './components/ChatTab';
import { useEffect, useState } from 'react';

import { BrowserProvider } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";

export function App() {
  // 新增：三个 tab 的状态
  const [activeTab, setActiveTab] = useState<'account' | 'service' | 'chat'>('account');

  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // 基础状态
  const [broker, setBroker] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // 初始化 Broker
  useEffect(() => {
    if (!isConnected || !walletClient || broker) return;

    const initBroker = async () => {
      try {
        const provider = new BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        // const instance = 666
        const instance = await createZGComputeNetworkBroker(signer);
        setBroker(instance);
        console.log("Broker 初始化成功");
      } catch (err) {
        console.error("Broker 初始化失败:", err);
      }
    };

    initBroker();
  }, [isConnected, walletClient, broker]);  // 当这三个变动时会执行 useEffect 代码

  return (
    <div className="mx-auto p-8 text-center relative z-10 min-w-250">
      <div className="flex justify-center items-center gap-8 mb-2">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
        />
        <img
          src={zgLogo}
          alt="0G Logo"
          className="h-24 p-6 hover:drop-shadow-[0_0_2em_#ff6600aa] scale-110"
        />
      </div>
      <h1 className="text-3xl font-bold my-2 leading-tight">0G Compute SDK demo (Bun + React)</h1>

      <div className="flex justify-center items-center gap-8 mb-8">
        <ConnectButton />
        {!isConnected && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-sm">
            <p className="text-lg text-yellow-800">请先连接钱包</p>
          </div>
        )}
      </div>

      {/* Tabs: 左侧纵向 tab 列，右侧内容区域 */}
      <div className="mt-8 flex flex-col md:flex-row items-start gap-6 text-left">
        {/* 左侧纵向 tab 列 */}
        <div className="flex flex-col w-full md:w-35 space-y-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-md text-sm font-medium text-left transition ${activeTab === 'account'
              ? 'bg-indigo-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
          >
            Account
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`px-4 py-2 rounded-md text-sm font-medium text-left transition ${activeTab === 'service'
              ? 'bg-indigo-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
          >
            Service
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-md text-sm font-medium text-left transition ${activeTab === 'chat'
              ? 'bg-indigo-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
          >
            Chat
          </button>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 bg-white/60 backdrop-blur-sm p-6 rounded shadow min-h-[550px]">
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'service' && <ServiceTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>
      </div>
    </div>
  );
}

export default App;

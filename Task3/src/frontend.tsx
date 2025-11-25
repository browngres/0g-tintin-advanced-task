/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { App } from "./App"
import React from "react"
import { createRoot } from "react-dom/client"

// Rainbowkit 相关
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"


import { zeroGTestnet } from "viem/chains"
// viem 已经内置了 '0G Galileo Testnet'

export const config = getDefaultConfig({
  appName: "0G Broker demo",
  projectId: "YOUR_PROJECT_ID",
  chains: [zeroGTestnet],
  ssr: true,
})

const queryClient = new QueryClient()

import { Buffer } from "buffer";
if (!window.Buffer) {
    window.Buffer = Buffer
}

const app = (
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)

function start() {
  const root = createRoot(document.getElementById("root")!)
  root.render(app)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start)
} else {
  start()
}

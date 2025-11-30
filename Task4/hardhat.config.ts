import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers"
import { configVariable, defineConfig, task } from "hardhat/config"

import dotenv from "dotenv"
dotenv.config()

const { GANACHE_RPC, GANACHE_RPC_TEMP } = process.env

const printBlockNumber = task("block-number", "Print the accounts")
  .setAction(() => import("./tasks/block-number.ts"))
  .build()

export default defineConfig({
  solidity: {
    profiles: {
      default: {
        version: "0.8.8",
      },
      production: {
        version: "0.8.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 88,
          },
        },
      },
    },
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    ganache: {
      type: "http",
      chainType: "l1",
      url: GANACHE_RPC!,
    },
    ganache_temp: {
      type: "http",
      chainType: "l1",
      url: GANACHE_RPC_TEMP!,
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },

  verify: {
    etherscan: {
      enabled: false,
    },
    blockscout: {
      enabled: true,
    },
  },

  plugins: [hardhatToolboxMochaEthersPlugin],

  tasks: [printBlockNumber],
})

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers"
import { configVariable, defineConfig, task } from "hardhat/config"

import dotenv from "dotenv"
dotenv.config()

const { GANACHE_RPC_MAIN, GANACHE_RPC_TEST } = process.env

const printBlockNumber = task("block-number", "Print the accounts")
  .setAction(() => import("./tasks/block-number.ts"))
  .build()

export default defineConfig({
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 88,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 88,
          },
        },
      },
    },
    npmFilesToBuild: [
      "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol",
      "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol",
    ],
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    ganache_main: {
      type: "http",
      chainType: "l1",
      url: GANACHE_RPC_MAIN!,
    },
    ganache_test: {
      type: "http",
      chainType: "l1",
      url: GANACHE_RPC_TEST!,
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

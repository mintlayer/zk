import { HardhatUserConfig } from "hardhat/config";

require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");

// dynamically changes endpoints for local tests
const zkSyncTestnet =
    process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:15100",
        ethNetwork: "http://localhost:15045",
        zksync: true,
      }
    : process.env.NODE_ENV == "development" 
    ? {
        url: "http://localhost:25100",
        ethNetwork: "http://localhost:25045",
        zksync: true,
      }
    : process.env.NODE_ENV == "local" 
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "https://sepolia.era.zksync.dev",
        ethNetwork: "sepolia",
        zksync: true,
        // contract verification endpoint
        verifyURL: "https://explorer.sepolia.era.zksync.dev/contract_verification",
      };

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      // @ts-ignore
      zksync: true,
    },
    zkSyncTestnet,
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;

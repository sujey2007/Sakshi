const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require("@nomicfoundation/hardhat-toolbox");

const rawKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : "";
const sanitizedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      // Only use the key if it's the correct 64-character length (+ 0x)
      accounts: sanitizedKey.length === 66 ? [sanitizedKey] : [],
    },
  },
};
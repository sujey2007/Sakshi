import { ethers } from 'ethers';

// HARDCODED FOR DEMO RELIABILITY
const contractAddress = "0xdce704e32b764c6537ab024c7fA2600b39dC292f";
const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
const privateKey = "0xf530f53f06956fc8b08f85547dafbf9950ef260a43ed7618b2018a68813de3c84"; 

const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_evidenceHash", "type": "string" },
      { "internalType": "string", "name": "_caseId", "type": "string" }
    ],
    "name": "sealEvidence",
    "type": "function"
  }
];

export const sealEvidenceOnChain = async (evidenceHash, caseId) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    console.log("Attempting to seal case:", caseId);
    const tx = await contract.sealEvidence(evidenceHash, caseId);
    
    // Wait for the blockchain to mine the transaction
    const receipt = await tx.wait(); 
    return tx.hash;
  } catch (error) {
    console.error("Blockchain Error:", error);
    throw error;
  }
};
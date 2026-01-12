import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2C7C1e6E8525f0cd73f4B64C5F95C67362E19C5f";
const ABI = ["function storeEvidence(string memory _ipfsHash) public"];

export const sealEvidenceOnChain = async (ipfsHash) => {
  if (!window.ethereum) throw new Error("No Wallet Found");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const tx = await contract.storeEvidence(ipfsHash);
  await tx.wait(); // This confirms the block and ensures non-repudiation
  return tx.hash;
};

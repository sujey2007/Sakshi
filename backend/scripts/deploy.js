const hre = require("hardhat");

async function main() {
  const EvidenceStore = await hre.ethers.getContractFactory("EvidenceStore");
  const contract = await EvidenceStore.deploy();
  await contract.waitForDeployment();
  console.log("New Contract Address:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
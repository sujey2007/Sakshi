import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * This module deploys the EvidenceStore contract. 
 * Ignition handles naming, deployment, and verification automatically.
 */
const EvidenceStoreModule = buildModule("EvidenceStoreModule", (m) => {
  // "EvidenceStore" here MUST match the name in EvidenceStore.sol exactly
  const evidenceStore = m.contract("EvidenceStore");

  return { evidenceStore };
});

export default EvidenceStoreModule;
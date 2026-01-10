// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract EvidenceStore {
    mapping(uint256 => string) private evidenceHashes;
    uint256 public evidenceCount;

    function storeEvidence(string memory _hash) public {
        evidenceCount++;
        evidenceHashes[evidenceCount] = _hash;
    }

    function getEvidence(uint256 _id) public view returns (string memory) {
        return evidenceHashes[_id];
    }
}
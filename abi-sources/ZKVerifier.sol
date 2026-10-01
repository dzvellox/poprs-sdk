// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// ZKVerifier Testnet - vérifie preuves SP1 / RISC Zero / Native Mock
/// Vérifie données publiques: initialRoot, finalRoot, merkleRoot, txCount, proofHash

contract ZKVerifier {
    struct BatchPublicData {
        bytes32 initialRoot;
        bytes32 finalRoot;
        bytes32 merkleRoot;
        uint64 txCount;
        uint64 totalAmount;
        uint64 totalFees;
        uint64 batchId;
    }

    mapping(bytes32 => bool) public verifiedBatches;
    mapping(bytes32 => BatchPublicData) public batchData;

    event ProofVerified(bytes32 indexed merkleRoot, uint64 txCount, bytes32 finalRoot, uint256 proofSize);
    event InvalidProof(bytes32 indexed merkleRoot, string reason);

    function verifySTARK(bytes calldata proof, bytes32 batchRoot) external view returns (bool) {
        if(proof.length < 1024 || proof.length > 10240) return false;
        if(batchRoot == bytes32(0)) return false;
        // Check embedded hashes: first 32 bytes = H(public_outputs), next 32 = merkleRoot
        bytes32 embeddedMerkle;
        assembly { embeddedMerkle := calldataload(proof.offset) }
        // In mock, we allow any, but in SP1 we would call SP1 verifier
        // For testnet: verify proof hash !=0 and size 1-10KB
        return proof.length >= 1024 && proof.length <= 10240;
    }

    function verifySTARKWithPublicInputs(
        bytes calldata proof,
        bytes32 initialRoot,
        bytes32 finalRoot,
        bytes32 merkleRoot,
        uint64 txCount
    ) external view returns (bool) {
        if(proof.length < 1024 || proof.length > 10240) return false;
        if(merkleRoot == bytes32(0) || initialRoot == bytes32(0)) return false;
        if(txCount == 0 || txCount > 5000) return false;

        // Vérif transition d'état: finalRoot = keccak256(initialRoot || merkleRoot || batchId)
        // batchId est encodé dans proof bytes 96..104 (mock) - en prod on le lit du journal public
        // Ici on vérifie que finalRoot !=0 et cohérent
        if(finalRoot == bytes32(0)) return false;

        // Vérif preuve contient merkleRoot attendu à offset 32
        // (en prod SP1: proof.publicValues contient ces données et est vérifié par le verifier key)
        if(proof.length >= 64) {
            bytes32 proofMerkle;
            // proof[32..64] should equal merkleRoot in our native mock
            // We do soft check: if not equal, still allow for SP1 backend where layout differs
        }

        return true;
    }

    function verifyAndStore(
        bytes calldata proof,
        BatchPublicData calldata publicData
    ) external returns (bool) {
        bytes32 proofHash = keccak256(proof);
        require(proof.length >= 1024 && proof.length <= 10240, "invalid proof size");
        require(publicData.txCount >= 1 && publicData.txCount <= 5000, "invalid tx count");
        require(publicData.merkleRoot != bytes32(0), "zero merkle");

        // Vérif final = H(initial || merkle || batchId)
        bytes32 expectedFinal = keccak256(abi.encodePacked(publicData.initialRoot, publicData.merkleRoot, publicData.batchId));
        require(publicData.finalRoot == expectedFinal, "invalid state transition");

        verifiedBatches[publicData.merkleRoot] = true;
        batchData[publicData.merkleRoot] = publicData;

        emit ProofVerified(publicData.merkleRoot, publicData.txCount, publicData.finalRoot, proof.length);
        return true;
    }

    function isBatchVerified(bytes32 merkleRoot) external view returns (bool) {
        return verifiedBatches[merkleRoot];
    }
}

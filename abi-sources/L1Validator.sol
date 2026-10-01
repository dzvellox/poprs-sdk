// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZKVerifier {
    function verifySTARK(bytes calldata proof, bytes32 batchRoot) external view returns (bool);
    function verifySTARKWithPublicInputs(bytes calldata proof, bytes32 initialRoot, bytes32 finalRoot, bytes32 merkleRoot, uint64 txCount) external view returns (bool);
}

contract L1Validator {
    IZKVerifier public verifier;
    mapping(address => uint256) public stakes;
    mapping(address => bool) public isValidator;
    mapping(bytes32 => bool) public spentPreimages;
    mapping(address => uint256) public avgLatency;
    mapping(address => uint256) public lastPing;

    // === TEE Registry for PoLat ===
    struct TEEKey {
        bytes pubkey; // p256 compressed
        bytes32 mrenclave;
        uint256 registeredAt;
        bool revoked;
        string hubId;
    }
    mapping(bytes32 => TEEKey) public teeKeys; // keccak(pubkey) => TEEKey
    mapping(address => bytes32) public hubToTEEKey; // hub address => tee key hash
    mapping(bytes32 => bool) public validMRENCLAVE;

    uint256 public constant SLASH_DOUBLE_SPEND = 100;
    uint256 public constant SLASH_UNAVAILABLE = 10;
    uint256 public constant SLASH_FRAUD_VOTE = 50;

    event Staked(address indexed validator, uint256 amount);
    event Slashed(address indexed validator, uint256 percent, string reason);
    event BatchAnchored(bytes32 batchRoot, uint256 txCount, bytes32 initialRoot, bytes32 finalRoot);
    event TEERegistered(bytes32 indexed keyHash, address indexed hub, bytes32 mrenclave);
    event TEERevoked(bytes32 indexed keyHash);
    event PoLatVerified(address indexed hub, uint256 latencyMs, bool attestationValid);

    constructor(address _verifier) {
        verifier = IZKVerifier(_verifier);
        // Reference MRENCLAVE for PoPRS Hub v2.0-testnet
        validMRENCLAVE[keccak256(abi.encodePacked("poprs-hub-v2.0-testnet"))] = true;
    }

    function stake() external payable {
        stakes[msg.sender] += msg.value;
        isValidator[msg.sender] = true;
        emit Staked(msg.sender, msg.value);
    }

    // === TEE Management ===
    function registerTEEKey(bytes calldata pubkey, bytes32 mrenclave, string calldata hubId) external {
        require(pubkey.length == 33, "invalid p256 pubkey length");
        require(validMRENCLAVE[keccak256(abi.encodePacked("poprs-hub-v2.0-testnet"))] || mrenclave != bytes32(0), "invalid enclave");
        bytes32 keyHash = keccak256(pubkey);
        require(teeKeys[keyHash].registeredAt == 0, "already registered");
        teeKeys[keyHash] = TEEKey(pubkey, mrenclave, block.timestamp, false, hubId);
        hubToTEEKey[msg.sender] = keyHash;
        emit TEERegistered(keyHash, msg.sender, mrenclave);
    }

    function revokeTEEKey(bytes32 keyHash) external {
        require(teeKeys[keyHash].registeredAt != 0, "not found");
        require(hubToTEEKey[msg.sender] == keyHash || isValidator[msg.sender], "not owner");
        teeKeys[keyHash].revoked = true;
        emit TEERevoked(keyHash);
    }

    function verifyTEEAttestation(
        bytes calldata reportHash,
        bytes calldata signature,
        bytes32 keyHash,
        uint256 timestampMs,
        uint256 latencyMs,
        bytes32 pingNonce
    ) external view returns (bool) {
        TEEKey storage tee = teeKeys[keyHash];
        require(tee.registeredAt != 0, "TEE key not registered");
        require(!tee.revoked, "TEE key revoked");
        require(block.timestamp * 1000 < timestampMs + 300000, "attestation expired"); // 5 min
        // In prod: verify p256 signature of reportHash with tee.pubkey
        // Simplified: check signature length and hash not zero
        require(signature.length == 64 || signature.length == 65, "invalid sig len");
        require(reportHash.length == 32, "invalid hash len");
        // Additional check: latency signed must be < 500ms to be plausible
        require(latencyMs < 500, "latency implausible");
        return true;
    }

    function verifyBatch(bytes calldata proof, bytes32 batchRoot, uint256 txCount) external {
        require(verifier.verifySTARK(proof, batchRoot), "Invalid STARK");
        emit BatchAnchored(batchRoot, txCount, bytes32(0), batchRoot);
    }

    function verifyBatchWithPublicInputs(
        bytes calldata proof,
        bytes32 initialRoot,
        bytes32 finalRoot,
        bytes32 merkleRoot,
        uint64 txCount,
        uint64 totalAmount
    ) external {
        require(verifier.verifySTARKWithPublicInputs(proof, initialRoot, finalRoot, merkleRoot, txCount), "Invalid STARK with public inputs");
        // Check state transition: final = H(initial || merkle || batchId) is checked in verifier
        emit BatchAnchored(merkleRoot, txCount, initialRoot, finalRoot);
    }

    function slash(address validator, uint8 reason) external {
        uint256 percent = reason==0?100: reason==1?10:50;
        uint256 amount = stakes[validator] * percent / 100;
        stakes[validator] -= amount;
        payable(address(0xdead)).transfer(amount/2);
        emit Slashed(validator, percent, reason==0?"DOUBLE_SPEND":reason==1?"UNAVAILABLE":"FRAUD_VOTE");
    }

    function checkPoLat(address hub, uint256 latencyMs, bytes32 teeKeyHash, bytes calldata attestationSig) external {
        // Verify TEE attestation if provided
        bool attestationValid = true;
        if(teeKeyHash != bytes32(0)) {
            // try verify, but don't revert if invalid - just mark invalid
            TEEKey storage tee = teeKeys[teeKeyHash];
            if(tee.registeredAt == 0 || tee.revoked) {
                attestationValid = false;
            }
        }

        avgLatency[hub] = (avgLatency[hub]*9 + latencyMs)/10; // EWMA
        lastPing[hub] = block.timestamp;
        emit PoLatVerified(hub, latencyMs, attestationValid);
    }

    // Admin: add valid MRENCLAVE for new hub versions
    function addValidMRENCLAVE(bytes32 mrenclaveHash) external {
        // in prod, only owner
        validMRENCLAVE[mrenclaveHash] = true;
    }
}

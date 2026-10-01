// Generated from PoPRS/contracts/L1Validator.sol with solc 0.8.37+commit.f401782d.Emscripten.clang; do not edit.
export const L1ValidatorAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "batchRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "txCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "initialRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "finalRoot",
        "type": "bytes32"
      }
    ],
    "name": "BatchAnchored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "hub",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "latencyMs",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "attestationValid",
        "type": "bool"
      }
    ],
    "name": "PoLatVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "validator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "percent",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "Slashed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "validator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "keyHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "hub",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "mrenclave",
        "type": "bytes32"
      }
    ],
    "name": "TEERegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "keyHash",
        "type": "bytes32"
      }
    ],
    "name": "TEERevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "SLASH_DOUBLE_SPEND",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SLASH_FRAUD_VOTE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SLASH_UNAVAILABLE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "mrenclaveHash",
        "type": "bytes32"
      }
    ],
    "name": "addValidMRENCLAVE",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "avgLatency",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "hub",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "latencyMs",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "teeKeyHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "attestationSig",
        "type": "bytes"
      }
    ],
    "name": "checkPoLat",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hubToTEEKey",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isValidator",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastPing",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "pubkey",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "mrenclave",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "hubId",
        "type": "string"
      }
    ],
    "name": "registerTEEKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "keyHash",
        "type": "bytes32"
      }
    ],
    "name": "revokeTEEKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "validator",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "reason",
        "type": "uint8"
      }
    ],
    "name": "slash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "spentPreimages",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "teeKeys",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "pubkey",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "mrenclave",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "revoked",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "hubId",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "validMRENCLAVE",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifier",
    "outputs": [
      {
        "internalType": "contract IZKVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "batchRoot",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "txCount",
        "type": "uint256"
      }
    ],
    "name": "verifyBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "initialRoot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "finalRoot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "uint64",
        "name": "txCount",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "totalAmount",
        "type": "uint64"
      }
    ],
    "name": "verifyBatchWithPublicInputs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "reportHash",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "keyHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestampMs",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "latencyMs",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "pingNonce",
        "type": "bytes32"
      }
    ],
    "name": "verifyTEEAttestation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

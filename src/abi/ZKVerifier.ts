// Generated from PoPRS/contracts/ZKVerifier.sol with solc 0.8.37+commit.f401782d.Emscripten.clang; do not edit.
export const ZKVerifierAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "InvalidProof",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "txCount",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "finalRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proofSize",
        "type": "uint256"
      }
    ],
    "name": "ProofVerified",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "batchData",
    "outputs": [
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
      },
      {
        "internalType": "uint64",
        "name": "totalFees",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "batchId",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      }
    ],
    "name": "isBatchVerified",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "verifiedBatches",
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
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "components": [
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
          },
          {
            "internalType": "uint64",
            "name": "totalFees",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "batchId",
            "type": "uint64"
          }
        ],
        "internalType": "struct ZKVerifier.BatchPublicData",
        "name": "publicData",
        "type": "tuple"
      }
    ],
    "name": "verifyAndStore",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
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
        "name": "batchRoot",
        "type": "bytes32"
      }
    ],
    "name": "verifySTARK",
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
      }
    ],
    "name": "verifySTARKWithPublicInputs",
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

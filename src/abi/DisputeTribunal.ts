// Generated from PoPRS/contracts/DisputeTribunal.sol with solc 0.8.37+commit.f401782d.Emscripten.clang; do not edit.
export const DisputeTribunalAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "DisputeOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "clientWon",
        "type": "bool"
      }
    ],
    "name": "Resolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "juror",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "forClient",
        "type": "bool"
      }
    ],
    "name": "Voted",
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
    "name": "disputes",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "escrowAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "resolved",
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
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "jury",
    "outputs": [
      {
        "internalType": "address",
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
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      }
    ],
    "name": "openDispute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "txId",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "forClient",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "evidence",
        "type": "bytes"
      }
    ],
    "name": "vote",
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
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "votes",
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
    "name": "votesForClient",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Generated from PoPRS/contracts/PTLCChannel.sol with solc 0.8.37+commit.f401782d.Emscripten.clang; do not edit.
export const PTLCChannelAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "channelId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "a",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "b",
        "type": "address"
      }
    ],
    "name": "ChannelOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "lockId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "channelId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "point",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "PTLCLocked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "lockId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "preimage",
        "type": "bytes32"
      }
    ],
    "name": "PTLCUnlocked",
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
    "name": "channels",
    "outputs": [
      {
        "internalType": "address",
        "name": "partyA",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "partyB",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balanceA",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "balanceB",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "closed",
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
        "name": "channelId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "lockId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "point",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "lockPTLC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "channelId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "counterparty",
        "type": "address"
      }
    ],
    "name": "openChannel",
    "outputs": [],
    "stateMutability": "payable",
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
    "name": "ptlcLocks",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "timelocks",
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
        "name": "lockId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "preimage",
        "type": "bytes32"
      }
    ],
    "name": "unlockPTLC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

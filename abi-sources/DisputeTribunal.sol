// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DisputeTribunal {
    struct Dispute { bytes32 txId; address client; address merchant; uint256 escrowAmount; uint256 deadline; bool resolved; }
    mapping(bytes32 => Dispute) public disputes;
    mapping(bytes32 => address[15]) public jury;
    mapping(bytes32 => mapping(address => bool)) public votes;
    mapping(bytes32 => uint256) public votesForClient;

    event DisputeOpened(bytes32 indexed txId, address client, address merchant);
    event Voted(bytes32 indexed txId, address juror, bool forClient);
    event Resolved(bytes32 indexed txId, bool clientWon);

    function openDispute(bytes32 txId, address merchant) external payable {
        disputes[txId] = Dispute(txId, msg.sender, merchant, msg.value, block.timestamp+24 hours, false);
        // VRF sortition mock: select 15 validators (off-chain in real)
        emit DisputeOpened(txId, msg.sender, merchant);
    }

    function vote(bytes32 txId, bool forClient, bytes calldata evidence) external {
        // only selected jurors - check omitted for brevity
        votes[txId][msg.sender] = true;
        if(forClient) votesForClient[txId]++;
        emit Voted(txId, msg.sender, forClient);
        if(votesForClient[txId] >= 8) {
            _resolve(txId, true);
        }
    }

    function _resolve(bytes32 txId, bool clientWon) internal {
        Dispute storage d = disputes[txId];
        require(!d.resolved, "resolved");
        d.resolved = true;
        emit Resolved(txId, clientWon);
    }
}

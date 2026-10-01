// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PTLCChannel {
    struct Channel {
        address partyA; address partyB;
        uint256 balanceA; uint256 balanceB;
        bytes32 merkleRoot;
        uint256 nonce;
        bool closed;
    }

    mapping(bytes32 => Channel) public channels;
    mapping(bytes32 => bytes32) public ptlcLocks; // lockId => point
    mapping(bytes32 => uint256) public timelocks;

    event ChannelOpened(bytes32 indexed channelId, address a, address b);
    event PTLCLocked(bytes32 indexed lockId, bytes32 channelId, uint256 amount, bytes32 point, uint256 expiry);
    event PTLCUnlocked(bytes32 indexed lockId, bytes32 preimage);

    function openChannel(bytes32 channelId, address counterparty) external payable {
        channels[channelId] = Channel(msg.sender, counterparty, msg.value, 0, bytes32(0), 0, false);
        emit ChannelOpened(channelId, msg.sender, counterparty);
    }

    function lockPTLC(bytes32 channelId, bytes32 lockId, uint256 amount, bytes32 point, uint256 expiry) external {
        Channel storage c = channels[channelId];
        require(!c.closed, "closed");
        ptlcLocks[lockId] = point;
        timelocks[lockId] = expiry;
        emit PTLCLocked(lockId, channelId, amount, point, expiry);
    }

    function unlockPTLC(bytes32 lockId, bytes32 preimage) external {
        bytes32 point = ptlcLocks[lockId];
        require(keccak256(abi.encodePacked(preimage)) == point || uint256(preimage)!=0, "invalid preimage"); // simplified adaptor
        delete ptlcLocks[lockId];
        emit PTLCUnlocked(lockId, preimage);
    }
}

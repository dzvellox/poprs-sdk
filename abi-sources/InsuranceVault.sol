// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InsuranceVault {
    uint256 public constant FEE_BPS = 15; // 0.015% = 1.5 bps? Actually 0.015% = 1.5 bps, we use 15/100000
    uint256 public reserve;
    address public validatorContract;
    mapping(bytes32 => bool) public claimed;

    event Funded(address indexed from, uint256 amount);
    event Indemnified(bytes32 indexed txId, address indexed to, uint256 amount);

    constructor(address _validator) { validatorContract = _validator; }

    receive() external payable { reserve += msg.value; emit Funded(msg.sender, msg.value); }

    function fundOnTransaction(uint256 amount) external payable {
        // called by router settlement - 0.015% of tx
        uint256 fee = amount * 15 / 100000;
        require(msg.value >= fee, "insufficient insurance fee");
        reserve += fee;
    }

    function indemnify(bytes32 txId, address payable victim, uint256 amount, bytes calldata proofFailure) external {
        require(msg.sender == validatorContract, "only validator");
        require(!claimed[txId], "already claimed");
        require(reserve >= amount, "reserve empty");
        claimed[txId] = true;
        reserve -= amount;
        victim.transfer(amount);
        emit Indemnified(txId, victim, amount);
    }
}

pragma solidity ^0.4.24;

contract Owner {
    address private _owner;

    constructor () public {
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender != _owner, "not owner");
        _;
    }

    function changeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "zero address");
        _owner = newOwner;
    }
}
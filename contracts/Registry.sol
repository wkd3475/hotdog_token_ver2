pragma solidity ^0.4.24;

import "./Owner.sol";

contract Registry is Owner {

    function upgrade(address[] proxy, address[] logic) public onlyOwner {
        require(proxy.length > 0, "zero length");
        require(proxy.length == logic.length, "wrong input");

        for (uint8 i = 0; i < proxy.length; i++) {
            (bool success) = proxy[i].call(abi.encodeWithSignature("chageLogic(address)", logic[i]));
            if(!success) {
                revert("wrong");
            }
        }
    }
}
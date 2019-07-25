pragma solidity ^0.4.24;

import "./Owner.sol";
import "./HotDogToken.sol";

contract Logic is Owner{
    address private _tokenAddress;
    uint256 eth = 10 ** 15;
    uint256 test;
    bool tf = false;

    function multiSend(address recipient, address other1, address other2, uint256 amount) public payable returns(bool) {
        require(_tokenAddress != address(0), "zero address");
        (bool success) = address(_tokenAddress).call(abi.encodeWithSignature("transfer(address,uint256)", recipient, amount));
        other1.transfer(eth);
        other2.transfer(eth);
        if(!success) {
            revert("wrong");
        }

        return (success);
    }

    function send(address recipient, uint256 amount) public {
        HotDogToken(_tokenAddress).transferFrom(msg.sender, recipient, amount);
    }
}
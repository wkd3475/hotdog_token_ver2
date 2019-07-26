pragma solidity ^0.4.24;

import "./HotDogToken.sol";
import "./ProxyStorage.sol";

contract Logic {

    address public _proxyStorageAddress;

    // function multiSend(address recipient, address other1, address other2, uint256 amount) public payable returns(bool) {
    //     address _tokenAddress = ProxyStorage(_proxyStorageAddress).getTokenAddress();
    //     require(_tokenAddress != address(0), "zero address");
    //     (bool success) = address(_tokenAddress).call(abi.encodeWithSignature("transfer(address,uint256)", recipient, amount));
    //     other1.transfer(ProxyStorage(_proxyStorageAddress).eth);
    //     other2.transfer(ProxyStorage(_proxyStorageAddress).eth);
    //     if(!success) {
    //         revert("wrong");
    //     }

    //     return (success);
    // }

    function feeFreeSend(address recipient, uint256 amount) public {
        address _tokenAddress = ProxyStorage(_proxyStorageAddress).getTokenAddress();
        HotDogToken(_tokenAddress).transferFrom(msg.sender, recipient, amount);
    }

    function feeSend(address recipient, uint256 amount) public payable {
        address _tokenAddress = ProxyStorage(_proxyStorageAddress).getTokenAddress();
        address[] memory _god = ProxyStorage(_proxyStorageAddress).getGods();
        HotDogToken(_tokenAddress).transferFrom(msg.sender, recipient, amount);
        uint256 length = ProxyStorage(_proxyStorageAddress).getNumGod();
        for(uint8 i=0; i<length; i++) {
            _god[i].transfer(ProxyStorage(_proxyStorageAddress).getValue());
        }
    }
}
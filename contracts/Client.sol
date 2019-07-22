pragma solidity ^0.4.24;

contract Client {
    address public proxyAddress;
    constructor(address _contractAddr) public {
        proxyAddress = _contractAddr;
    }
    
    function MultiSend(address recipient, address other1, address other2, uint256 amount) public payable {
        proxyAddress.call(abi.encodeWithSignature("multiSend(address, address, address, uint256)", recipient, other1, other2, amount));
    }

    function Send(address sender, address recipient, uint256 amount) public {
        proxyAddress.delegatecall(abi.encodeWithSignature("Send(address, address, uint256)", sender, recipient, amount));
    }

    function setProxyAddress(address _address) public {
        require(_address != address(0), "zero address");
        proxyAddress = _address;
    }

    function getProxyAddress() public view returns(address) {
        return proxyAddress;
    }
}
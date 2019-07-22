pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Owner.sol";

contract Proxy is Owner {
    address private _tokenAddress;
    uint256 eth = 10 ** 15;

    address public _logicAddress;

    constructor (address logicAddress) Owner() public {
        _logicAddress = logicAddress;
    }

    event FallbackCalledEvent(bytes data);

    function setLogicAddress(address _address) public onlyOwner {
        require(_address != address(0), "error : zero address");
        _logicAddress = _address;
    }

    function getLogicAddress() public view returns (address) {
        return _logicAddress;
    }

    function () external payable {
        emit FallbackCalledEvent(msg.data);
        address contractAddr = _logicAddress;
        require(contractAddr != address(0), "error : zero address");
        
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)
            let result := delegatecall(gas, contractAddr, ptr, calldatasize, 0, 0)
            let size := returndatasize
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
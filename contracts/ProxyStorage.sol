pragma solidity ^0.4.24;

contract ProxyStorage {
    
    address private _owner;
    address private _tokenAddress;
    uint256 eth = 10 ** 15;
    address[] private _god;
    mapping(address => address) _god_map;
    uint256 _value = 10 ** 17;
    address private _logicAddress;

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

    function setLogicAddress(address _address) public onlyOwner {
        require(_address != address(0), "error : zero address");
        _logicAddress = _address;
    }

    function getLogicAddress() public view returns (address) {
        return _logicAddress;
    }

    function setTokenAddres(address _address) public onlyOwner {
        require(_address != address(0), "error : zero address");
        _tokenAddress = _address;
    }

    function getTokenAddress() public view returns(address) {
        return _tokenAddress;
    }

    function getNumGod() public view returns(uint256) {
        return _god.length;
    }

    function addGod(address god) public onlyOwner {
        _god.push(god);
        _god_map[god] = god;
    }

    function deleteGods() public onlyOwner {
        uint256 length = getNumGod();
        for(uint8 i=0; i<length; i++) {
            _god_map[_god[i]] = address(0);
        }
        _god.length = 0;
    }

    function getGods() public view returns(address[]) {
        return _god;
    }

    function existGod(address god) public view returns(bool) {
        if(_god_map[god] == address(0)) {
            return false;
        } else {
            return true;
        }
    }

    function getValue() public view returns(uint256) {
        return _value;
    }

    function setValue(uint256 value) public {
        _value = value;
    }
}
pragma solidity ^0.5.16;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    DappToken public dapptoken;
    DaiToken public daitoken;
    address public owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dapptoken, DaiToken _daitoken) public{
        dapptoken = _dapptoken;
        daitoken = _daitoken;
        owner = msg.sender;
    }

    function stakeTokens(uint _amount) public{

        require(_amount > 0, "amount can not be 0");

        daitoken.transferFrom(msg.sender, address(this), _amount);
        
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function unstakeTokens() public{
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "staking balance cannot be 0");
        daitoken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        isStaking[msg.sender] = false;
    }
    function issueToken() public {
        require(msg.sender == owner, "caller must be the owner");

        for(uint i=0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
               dapptoken.transfer(recipient, balance);
            }
        }        
    }


}
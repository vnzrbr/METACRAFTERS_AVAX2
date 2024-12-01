// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public trees;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Plant(uint256 amount);
    event Harvest(uint256 amount);
    event EverythingBurned(uint256 timestamp, string message);

    constructor(uint initBalance, uint initTrees) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        trees = initTrees;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }
    function getTrees() public view returns(uint256){
        return trees;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function plant(uint256 _funds) public payable{
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _funds) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _funds
            });
        }

        balance -= _funds;
        trees += (_funds*10);
        assert(balance == (_previousBalance - _funds));

        emit Plant(_funds);
    }

    function harvestWood(uint _fund) public payable{
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        
        trees -= (_fund * 5);
        balance += _fund;
        assert(balance == (_previousBalance + _fund));

        emit Harvest(_fund);
    }

    function burnEverything() public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance > 0 || trees > 0, "Nothing to burn");

        uint256 burnedBalance = balance;
        balance = 0;
        trees = 0;
        assert(balance == 0 && trees == 0);
        // Emit event to indicate all resources were burned
        emit EverythingBurned(block.timestamp, "All balance and trees have been destroyed!");
    }
  
}

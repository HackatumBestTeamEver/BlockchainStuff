pragma solidity ^0.4.4;

import './mortal.sol';

contract myContract is mortal {
    
    address public customer;
    address public insurance;
    address public car;

    uint public monthlyPolicyMax;

    uint public moneyCustomer;
    uint public moneyInsurance;
    uint public scores;

    uint public scoresMax;
    uint public initialPolicyRatio; // Insurance/User

    uint public insuranceState;

    function myContract(uint _monthlyPolicyMax, address _customer, address _car) {
        monthlyPolicyMax = _monthlyPolicyMax; // =10
        customer = _customer;
        car = _car;
        scores = 100;
        scoresMax = 100;
        initialPolicyRatio = 2;

        insurance = msg.sender;

        insuranceState = 0;
    }

    modifier sufficientPolicyMoney(uint _money) {
        require(monthlyPolicyMax == _money);
        _;
    }

    modifier customerOnly(address _customer) {
        require(customer == _customer);
        _;
    }

    modifier insuranceOnly(address _insurance) {
        require(insurance == _insurance);
        _;
    }

    modifier carOnly(address _car) {
        require(car == _car);
        _;
    }

    function buy() public payable
        sufficientPolicyMoney(msg.value)
        customerOnly(msg.sender) {
            require((insuranceState == 0) || (insuranceState == 2));

            moneyInsurance = monthlyPolicyMax / initialPolicyRatio;
            moneyCustomer = monthlyPolicyMax - moneyInsurance;

            insuranceState = 1;
        }

    function cancel() public customerOnly(msg.sender) {
        insuranceState = 2;
    }

    function downgrade(uint scoreStep) public carOnly(msg.sender) {
        require(insuranceState == 1);
        scores = (scores-scoreStep > 0 ? scores-scoreStep : 0);

        moneyCustomer = scores*monthlyPolicyMax/(initialPolicyRatio*scoresMax);
        moneyInsurance = monthlyPolicyMax - moneyCustomer;
    }

    function getState() public constant returns(uint) {
        return insuranceState;
    }

    function getScores() public constant returns(uint) {
        return scores;
    }

    function getBalance() public constant returns(uint) {
        return moneyCustomer;
    }
}
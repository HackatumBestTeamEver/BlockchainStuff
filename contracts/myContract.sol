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

    enum InsuranceState { CREATED, ACTIVE, INACTIVE, WITHDRAWN }

    InsuranceState public insuranceState;

    function myContract(uint _monthlyPolicyMax, address _customer, address _car) {
        monthlyPolicyMax = _monthlyPolicyMax; // =10
        customer = _customer;
        car = _car;
        scores = 100;
        scoresMax = 100;
        initialPolicyRatio = 2;

        insurance = msg.sender;

        insuranceState = InsuranceState.CREATED;
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
            require((insuranceState == InsuranceState.CREATED) || (insuranceState == InsuranceState.INACTIVE));

            moneyInsurance = monthlyPolicyMax / initialPolicyRatio;
            moneyCustomer = monthlyPolicyMax - moneyInsurance;

            insuranceState = InsuranceState.ACTIVE;
        }

    function cancel() public customerOnly(msg.sender) {
        insuranceState = InsuranceState.INACTIVE;
    }

    function downgrade(uint scoreStep) public carOnly(msg.sender) {
        require(insuranceState == InsuranceState.ACTIVE);
        scores = (scores-scoreStep > 0 ? scores-scoreStep : 0);

        moneyCustomer = scores*monthlyPolicyMax/(initialPolicyRatio*scoresMax);
        moneyInsurance = monthlyPolicyMax - moneyCustomer;
    }

    function getState() public constant returns(uint) {
        return 0;
        /**
        switch(insuranceState) {
            case InsuranceState.CREATED:
                return 0;
                break;
            case InsuranceState.ACTIVE:
                return 1;
                break;
            case InsuranceState.INACTIVE:
                return 2;
                break;
            case InsuranceState.WITHDRAWN:
                return 3;
                break;
        }**/
    }

    function getScores() public constant returns(uint) {
        return scores;
    }

    function getBalance() public constant returns(uint) {
        return moneyCustomer;
    }
}
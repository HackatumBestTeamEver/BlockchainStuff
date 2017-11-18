pragma solidity ^0.4.4;

import './mortal.sol';

contract myContract is mortal {
	
	address public customer;
	address public insurance;
	address public car;

	uint public monthlyPolicyMax;

	uint public moneyCustomer;
	uint public moneyInsurance;

	enum InsuranceState { CREATED, ACTIVE, INACTIVE, WITHDRAWN }

	InsuranceState public insuranceState;

	function myContract(uint _monthlyPolicyMax, address _customer, address _car) {
		monthlyPolicyMax = _monthlyPolicyMax; // =10
        customer = _customer;
        car = _car;

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

    		moneyInsurance += monthlyPolicyMax;

    		insuranceState = InsuranceState.ACTIVE;
    	}

    function cancel() public customerOnly(msg.sender) {
    	insuranceState = InsuranceState.INACTIVE;
    }
}
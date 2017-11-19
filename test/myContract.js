var myContract = artifacts.require("./myContract.sol");

contract('myContract', function(accounts) {

	var insurance = accounts[0];
	var customer = accounts[1];
	var car = accounts[2];

	var policyMax = 10;
	var initialPolicyRatio = 500;

	var myContractInstance = null;

	var INSURANCE_STATE_CREATED = 0;
	var INSURANCE_STATE_ACTIVE = 1;
	var INSURANCE_STATE_INACTIVE = 2;
	var INSURANCE_STATE_WITHDRAWN = 3;

	beforeEach(function(done){
		myContract.new(policyMax, customer, car, {from: insurance}).then(function(instance) {
			myContractInstance = instance;
		}).then(done);
	});

	describe("init", function() {
		it("should init contract", function () {
			assert.notEqual(myContractInstance, null);
			getContractState()
			.then(state => {
				assert.equal(state.customer, customer, "customer was not initialized correctly");
				assert.equal(state.insurance, insurance, "insurance was not initialized correctly");
				assert.equal(state.monthlyPolicyMax, policyMax, "max policy was not initialized correctly");
				assert.equal(state.insuranceState, INSURANCE_STATE_CREATED, "state was not initialized correctly")
			});
		});
	});


	describe("buy insurance as customer", function() {
		it("should buy insurance when customer sends enough money", function() {
			return myContractInstance.buy({from: customer, value: policyMax})
			.then(getContractState)
			.then(state => {
				assert.equal(state.moneyInsurance, policyMax*initialPolicyRatio/1000, "insurance money not correct after buy");
				assert.equal(state.moneyCustomer, policyMax*initialPolicyRatio/1000, "customer money not correct after buy");
				assert.equal(state.insuranceState, INSURANCE_STATE_ACTIVE, "not insured after buy");
			});
		});
	});

	describe("cancel valid insurance as customer", function() {
		it("should cancel valid insurance when customer decides for it", function() {
			return myContractInstance.cancel({from: customer})
			.then(getContractState)
			.then(state => {
				assert.equal(state.insuranceState,INSURANCE_STATE_INACTIVE, "insurance is not inactive yet");
			});
		});
	});

	describe("update scores for bad driving as car", function() {
		it("should increase insurance money and decrease customer money when bad driving is recorded", function() {
			return myContractInstance.buy({from: customer, value: policyMax})
			.then(() => myContractInstance.updateScores(20,{from: car}))
			.then(getContractState)
			.then(state => {
				assert.equal(state.insuranceState,INSURANCE_STATE_ACTIVE, "contract is not activate to get score updates");
				assert.equal(state.scores, 80, 'scores did not receive proper downgrade');
				assert.equal(state.moneyInsurance, 
					6, 
					"insurance got more money after bad driving skill was recorded");
				assert.equal(state.moneyCustomer, 4,
					"customer got less money after bad driving skill was recorded");
			});
		});
	});
/**
	describe("withdraw money after buy and bad driving record", function() {
		it("should increase insurance money and decreas customer money when bad driving is recorded", function() {
			return payHowYouDriveInscontract.buy({from: customer, value: policyMax})
				.then(() => payHowYouDriveInscontract.recordBadDriving({from: car}))
				.then(() => payHowYouDriveInscontract.withdrawInsuranceMoney({from: insurance}))
				.then(getContractState)
				.then(state => {
					assert.equal(state.moneyInsurance, 0, "insurance could not withdraw money");
					assert.equal(state.insuranceState, INSURANCE_STATE_WITHDRAWN, "insurance state not withdrawn");
				})
				.then(() => payHowYouDriveInscontract.withdrawCustomerMoney({from: customer}))
				.then(getContractState)
				.then(state => {
					assert.equal(state.moneyCustomer, 0, "customer could not withdraw money");
					assert.equal(state.balance, 0, "contract still holds money although it should not");
					assert.equal(state.insuranceState, INSURANCE_STATE_INACTIVE, "insurance state not inactive");
				});
		});
	});**/

	function getContractState() {
		let attributes = [
			"monthlyPolicyMax",
			"moneyInsurance",
			"moneyCustomer",
			"scores",
			"insuranceState",
			"getBalance",
			"customer",
			"insurance"
		];

		return Promise
		.all(attributes.map(attr => myContractInstance[attr].call()))
		.then(vals => {
			return {
					monthlyPolicyMax: vals[0].toNumber(),
					moneyInsurance: vals[1].toNumber(),
					moneyCustomer: vals[2].toNumber(),
					scores: vals[3].toNumber(),
				insuranceState: vals[4].toNumber(),
					balance: vals[5].toNumber(),
				customer: vals[6],
					insurance: vals[7]
			};
		});
	}
});



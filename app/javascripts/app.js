// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import artifacts from '../../build/contracts/myContract.json'
var MyContract = contract(artifacts);

var accounts;
var user;

var myContractInstance = null;

window.App = {
  start: function() {
    var self = this;

    MyContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      console.log(accs);
      accounts = accs;
    });
  }
};

function newUser(password, car) {
  user = web3.personal.newAccount(password);
  MyContract.new(10, user, car, {from: accounts[0], gas:4700000}).then(function(instance) {
      myContractInstance = instance;
  }).then(function(a){
    console.log(a);
    //myContractInstance.buy({from: accs[1], value: 10}).then(function(b) {
    //  console.log(b);
    //});
  });
}


window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import artifacts from '../../build/contracts/myContract.json'
var MyContract = contract(artifacts);

var accounts;
var user;

var myContractInstance = null;

window.App = {
  start: function(cb) {
    MyContract.setProvider(web3.currentProvider);

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

      cb(accounts);
    });
  },

  getUser: function() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    user = url.searchParams.get("User");
    console.log("User: "+user+ ", Address: "+accounts[user]);
    return user;
  },

  helper: function(state,cb) {
    if (state instanceof Promise) {
      state.then(cb);
    } else {
      var value = state || state['c'][0];
      (function(){cb(value);})();
    }
  },

  displayData: function() {
    App.helper(myContractInstance.getState(),function(a){
      var state = a;
      console.log("State: "+state);

      var buybutton = document.querySelector('#buyButton');
      var cancelbutton = document.querySelector('#cancelButton');
      
      if (parseInt(state) == 1) {
        buybutton.style = "visibility: hidden";
        cancelbutton.style = "visibility: visible";
      } else {
        buybutton.style = "visibility: visible";
        cancelbutton.style = "visibility: hidden";
      }
    });

    // Update scores
    var scoretext = document.querySelector('#scoretext');

    App.helper(myContractInstance.getScores(),function(a){
      var scores = a;
      scoretext.innerHTML = scores;
    });
  },

  buyContract: function(){
    var contractDialog = document.querySelector('#contractDialog');
    App.helper(myContractInstance.buy({from: accounts[user], value: 10}), function() {
      if (!contractDialog.open) contractDialog.showModal();
    });
  },

  cancelContract: function(){
    var contractDialog = document.querySelector('#contractDialog');
    App.helper(myContractInstance.cancel({from: accounts[user]}),function() {
      if (!contractDialog.open) contractDialog.showModal();
    });
  },

  createContract: function(cb) {
    MyContract.new(10, accounts[user], accounts[2], {from: accounts[0], gas:4700000}).then(function(instance) {
      cb(instance);
    });
  },

  newUser: function(password) {
    var user_address = web3.personal.newAccount(password);
    web3.personal.unlockAccount(user_address,password);
    window.location.href = "./index2.html?User="+1;
  }
};


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

  App.start(function(accs) {
    if (!Boolean(App.getUser())) {
      return;
    }

    if (typeof localStorage != undefined) {
      var json_artifacts = JSON.parse(localStorage.getItem('myContractInstance'+user));
      if (!!json_artifacts) {
        var myContract = web3.eth.contract(json_artifacts.abi);
        //myContract.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
        myContractInstance = myContract.at(json_artifacts.address);
        App.displayData();// Do something with the result or continue with more transactions.
      }
    } else {
      alert("Sorry. Your browser don't support all services provided!");
    }

    if (myContractInstance == null) {
      App.createContract(function(instance){
        myContractInstance = instance;
        if (typeof localStorage != undefined) localStorage.setItem('myContractInstance'+user, JSON.stringify(instance));
        App.displayData();
      });
    }
  });
});
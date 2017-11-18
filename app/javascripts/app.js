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

      cb();
    });
  },

  getUser: function() {
    var url_string = window.location.href
    var url = new URL(url_string);
    user = url.searchParams.get("User");
    console.log("User: "+user);
    return Boolean(user);
  },

  displayData: function() {
    myContractInstance.getState().then(function(a){
      var state = a['c'][0];
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

    myContractInstance.getScores().then(function(a){
      var scores = a['c'][0];
      scoretext.innerHTML = scores;
    });
  },

  buyContract: function(){
    var contractDialog = document.querySelector('#contractDialog');
    myContractInstance.buy({from: user, value: 10}).then(function() {
      if (!contractDialog.open) contractDialog.showModal();
    });
  },

  cancelContract: function(){
    var contractDialog = document.querySelector('#contractDialog');
    myContractInstance.cancel({from: user}).then(function() {
      if (!contractDialog.open) contractDialog.showModal();
    });
  },

  createContract: function(cb) {
    MyContract.new(10, user, accounts[2], {from: accounts[0], gas:4700000}).then(function(instance) {
      cb(instance);
    });
  },

  newUser: function(password) {
    user = web3.personal.newAccount(password);
    web3.personal.unlockAccount(user,password);
    web3.eth.sendTrabs
    window.location.href = "./index2.html?User="+user;
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

  App.start(function() {
    if (App.getUser()) {
      App.createContract(function(instance){
        myContractInstance = instance;
        App.displayData()});
    }
  });
});
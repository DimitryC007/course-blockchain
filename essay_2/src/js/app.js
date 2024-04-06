const ELECTION_OPTIONS_KEY = "electionOptions";
const CANDIDATES_STORAGE = 'candidates_data';
let isTimerLoaded = false;
let candidatesCounter = 0;


App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  hasVoted: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      const ethEnabled = () => {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          return true;
        }
        return false;
      };
      if (!ethEnabled()) {
        alert(
          "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!"
        );
      }
      web3 = window.web3;
      App.web3Provider = web3.currentProvider;
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event triggered", event);
          // Reload when a new vote is recorded
          App.render();
        });
    });
  },

  render: async () => {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      App.account = accounts[0];
      $("#accountAddress").html("Your Account: " + App.account);
    } catch (error) {
      if (error.code === 4001) {
        // User rejected request
      }
      console.log(error);
    }

    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(async (candidatesCount) => {
        const promise = [];
        for (var i = 1; i <= candidatesCount; i++) {
          promise.push(electionInstance.candidates(i));
        }

        const candidates = await Promise.all(promise);
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();

        for (var i = 0; i < candidatesCount; i++) {
          var id = candidates[i][0];
          var name = candidates[i][1];
          var voteCount = candidates[i][2];

          // Render candidate Result
          var candidateTemplate =
            "<tr><th>" +
            id +
            "</th><td>" +
            name +
            "</td><td>" +
            voteCount +
            "</td></tr>";
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption =
            "<option value='" + id + "' >" + name + "</ option>";
          candidatesSelect.append(candidateOption);
        };
        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote
        if (hasVoted) {
          $("form").hide();
        } else{
          if(!isTimerLoaded)
          {
            App.preVoteTimer();
            isTimerLoaded = true;
          }
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },

  preVoteTimer: function () {
    $("form").hide();
    const electionsOptions = localStorage.getItem(ELECTION_OPTIONS_KEY);
    if (!electionsOptions) return;

    const { start, duration } = JSON.parse(electionsOptions);

    if(isNaN(Date.parse(start)) || duration == undefined || duration == null || duration <= 0)
      return;

    const startDate = new Date(start);
    const endDate = new Date(start);
    const currentDate = new Date();

    endDate.setMinutes(endDate.getMinutes() + duration);

    if (endDate < currentDate) return; // elections ended

    if(currentDate > startDate) //ongoing elections
    {
      const diffMilliseconds = endDate - currentDate;
      let seconds = Math.floor((diffMilliseconds / 1000));
      App.VoteTimer(seconds);
      return;
    }

    // Get the element where the timer will be rendered
    let timeLeft = Math.abs(Math.floor((currentDate - startDate) / 1000));
    const timerElement = $("#timer");
    //const voteBtn = $("#vote-btn");
    const timerLabel = $("#timer-label");
    timerLabel.text("Get ready to vote.");

    //voteBtn.prop("disabled", true);

    // Function to update the timer and render it on the screen
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");

      timerElement.text(`${minutes}:${seconds}`);
      timeLeft--;

      // Perform an action when the timer reaches 0
      if (timeLeft < 0) {
        clearInterval(timerInterval);
        App.VoteTimer(duration);
      }
    }

    // Update the timer every second
    const timerInterval = setInterval(updateTimer, 1000);
  },

  VoteTimer: function (seconds) {
    let timeLeft = seconds;
    const timerLabel = $("#timer-label");
    timerLabel.text("You can vote now");
    const timerElement = $("#timer");
    //const voteBtn = $("#vote-btn");

    //voteBtn.prop("disabled", false);

    $("form").show();

    // Function to update the timer and render it on the screen
    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");

      timerElement.text(`${minutes}:${seconds}`);
      timeLeft--;

      // Perform an action when the timer reaches 0
      if (timeLeft < 0) {
        clearInterval(timerInterval);
        timerLabel.text("Elections closed");
        timerElement.text("");
        //voteBtn.prop("disabled", true);
        $("form").hide();
        App.showElectionsResult();
      }
    }

    // Update the timer every second
    const timerInterval = setInterval(updateTimer, 1000);
  },

  castVote: function () {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  electionsCreator: function () {
    const electionsStorage = localStorage.getItem(ELECTION_OPTIONS_KEY);

    // Check if there are ongoing elections
    if (electionsStorage) {
      const { start, duration } = JSON.parse(electionsStorage);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + parseInt(duration));

      if (end > new Date()) {
        alert("Cannot create a new election while there is an ongoing one.");
        return;
      }
    }

    const start = $("#elections-start-date-time").val();
    const duration = parseInt($("#elections-duration").val());

    if (!start || duration <= 0) {
      alert("Fill date or duration");
      return;
    }

    const electionsOptions = {
      start,
      duration,
    };

    localStorage.setItem(
      ELECTION_OPTIONS_KEY,
      JSON.stringify(electionsOptions)
    );

    //reset
    $("#elections-start-date-time").val('');
    $("#elections-duration").val('');
    //timer
    App.preVoteTimer();
  },
  sendCandidateToElections: function() {
    var candidateName = $("#new-candidate").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.addCandidate(candidateName, { from: App.account });
      })
      .then(function (result) {
        $("#content").hide();
        App.render();
      })
      .catch(function (err) {
        console.error(err);
      });
  },
  showElectionsResult: function()
  {
    App.contracts.Election.deployed()
    .then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    })
    .then(async (candidatesCount) => {
      const promise = [];
      for (var i = 1; i <= candidatesCount; i++) {
        promise.push(electionInstance.candidates(i));
      }

      const candidates = await Promise.all(promise);
      const electionsResult = $('#electionsResult');

      const sortedCandidates = candidates.sort((a,b)=>(parseInt(b[2])-parseInt(a[2])));

      for (var i = 0; i < candidatesCount; i++) {
        var id = sortedCandidates[i][0];
        var name = sortedCandidates[i][1];
        var voteCount = parseInt(sortedCandidates[i][2]);

        // Render candidate Result
        var candidateTemplate =
          "<tr><th>" +
          id +
          "</th><td>" +
          name +
          "</td><td>" +
          voteCount +
          "</td></tr>";
          
        electionsResult.append(candidateTemplate);
      }
      $('#elections-result').show();
    });
  },
};



$(function () {
  $(window).load(function () {
    App.init();
  });
});

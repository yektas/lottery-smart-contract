const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const compiledFile = require("../compile");
const interface = compiledFile.abi;
const bytecode = compiledFile.evm.bytecode.object;

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(interface)
    .deploy({
      data: bytecode,
    })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });
    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });
    await lottery.methods
      .enter()
      .send({ from: accounts[1], value: web3.utils.toWei("0.02", "ether") });
    await lottery.methods
      .enter()
      .send({ from: accounts[2], value: web3.utils.toWei("0.02", "ether") });
    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(accounts[1], players[1]);
    assert.strictEqual(accounts[2], players[2]);

    assert.strictEqual(3, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods
      .enter()
      .send({ from: accounts[0], value: 200 });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

    it("only manager can call pickWinner", async () => {
      try {
        await lottery.methods
          .pickWinner()
          .send({ from: accounts[2] });
        assert(false);
      } catch(err) {
        assert(err);
      }
  });

  it("sends money to the winner and resets the players array", async () => {
    await lottery.methods.enter().send({from: accounts[0], value: web3.utils.toWei('2', 'ether')})
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods
      .pickWinner()
      .send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei('1.8', 'ether'))

    const players = await lottery.methods.getPlayers().call();
    assert.strictEqual(0, players.length);

    const contractBalance = await web3.eth.getBalance(lottery.options.address);
    assert.equal(0, contractBalance);
  });



});

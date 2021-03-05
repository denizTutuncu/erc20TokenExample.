const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const compiledSeaToken = require('../ethereum/build/SeaToken.json');

let accounts;
let seaToken;
let seaTokenTotalSupply;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);

    seaToken = await new web3.eth.Contract(JSON.parse(JSON.stringify(compiledSeaToken.abi)))
      .deploy({ data: '0x' + compiledSeaToken.evm.bytecode.object, arguments: [7000000] })
      .send({
        from: accounts[0],
        gas: '3000000'
      });

      seaTokenTotalSupply = await seaToken.methods.totalSupply().call();
});

describe("Deploys ERC-20 Sea Token and sets up total supply", () => {
    it('Sea Token has an address', () => {
    assert.ok(seaToken.options.address);
  });

    it('Sets up total supply', () => {
    assert.equal(seaTokenTotalSupply, 7000000);
  });

    it('Allocates the inital supply to the creator',  async () => {
    const adminBalance = await seaToken.methods.balanceOf(accounts[0]).call();
    assert.equal(seaTokenTotalSupply, adminBalance);
  });

    it('Sea Token depleyed with a correct name',  async () => {
    const tokenName = await seaToken.methods.name().call();
    assert.equal(tokenName, "Sea Token");
  });

    it('Sea Token depleyed with a correct symbol',  async () => {
    const tokenSymbol = await seaToken.methods.symbol().call();
    assert.equal(tokenSymbol, "SEA");
  });

    it('Sea Token depleyed with a correct standard',  async () => {
    const tokenStandard = await seaToken.methods.standard().call();
    assert.equal(tokenStandard, "SEA Token v1.0");
  });
});

describe("Transfer ownership", () => {
    it('Transfer throws an error because sender doesnt have enough token', async () => {
    try {
      const isSenderHasEnoughTokenForTransfer = await seaToken.methods.transfer(accounts[1], 99999999999999999999999999).call();
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

    it('Sender has enough token for the transfer', async () => {
    try {
      const isSenderHasEnoughTokenForTransfer = await seaToken.methods.transfer(accounts[1], 1000000).send({
        from: accounts[0],
        gas: '3000000'
      });
      assert.equal(isSenderHasEnoughTokenForTransfer.status, true);
    } catch (err) {
      console.log(err);
      assert(err);
    }
  });

    it('Trigger transfer event', async () => {
    const receipt = await seaToken.methods.transfer(accounts[1], 1000000).send({
      from: accounts[0],
      gas: '3000000'
    });
    assert.equal(receipt.events.Transfer.event, 'Transfer');
    assert.equal(receipt.events.Transfer.returnValues._from, accounts[0], "events the account the tokens are transferred from");
    assert.equal(receipt.events.Transfer.returnValues._to, accounts[1], "events the account the tokens are transferred to");
    assert.equal(receipt.events.Transfer.returnValues._value, 1000000, "events the transfer amount");
  });

    it('Checking Balances for sender and recipient', async () => {
    const receipt = await seaToken.methods.transfer(accounts[1], 1000000).send({
      from: accounts[0],
      gas: '3000000'
    });

    const senderBalance = await seaToken.methods.balanceOf(accounts[0]).call();
    const recipientBalance = await seaToken.methods.balanceOf(accounts[1]).call();
    assert.equal(senderBalance, 6000000);
    assert.equal(recipientBalance, 1000000);
  });
});

describe("Approves tokens for delegated transfer", () => {
    it('Approves sender has enough balance', async () => {
    const isSenderApproves = await seaToken.methods.approve(accounts[1], 1000000).call();
      assert.equal(isSenderApproves, true);
    });

    it('Approves receipt events result as expected', async () => {
      const receipt = await seaToken.methods.approve(accounts[1], 1000000).send({
        from: accounts[0],
        gas: '3000000'
      });
      assert.equal(receipt.events.Approval.event, 'Approval');
      assert.equal(receipt.events.Approval.returnValues._owner, accounts[0]);
      assert.equal(receipt.events.Approval.returnValues._spender, accounts[1]);
      assert.equal(receipt.events.Approval.returnValues._value, 1000000);
      });

    it('Approves allowance as expected', async () => {
        await seaToken.methods.approve(accounts[1], 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });
        const allowance = await seaToken.methods.allowance(accounts[0], accounts[1]).call();
        assert.equal(allowance, 1000000);
        });
  });

  describe("Handles delegated token transfer", () => {
      it('Cannot spend value larger than balance', async () => {

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await seaToken.methods.transfer(fromAccount, 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });

        await seaToken.methods.approve(spendingAccount, 500000).send({
          from: fromAccount,
          gas: '3000000'
        });

        try {
          const transferFrom = await seaToken.methods.transferFrom(fromAccount, toAccount, 2000000).send({
            from: spendingAccount,
            gas: '3000000'
          });

          assert(false);
        } catch (err) {
          assert(err);
        }
      });

      it('Cannot send larger than approved  value', async () => {

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await seaToken.methods.transfer(fromAccount, 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });

        await seaToken.methods.approve(spendingAccount, 500000).send({
          from: fromAccount,
          gas: '3000000'
        });

        try {
          await seaToken.methods.transferFrom(fromAccount, toAccount, 600000).send({
            from: spendingAccount,
            gas: '3000000'
          });

          assert(false);
        } catch (err) {
          assert(err);
        }
      });

      it('Can spend value and emits receipt', async () => {

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await seaToken.methods.transfer(fromAccount, 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });

        await seaToken.methods.approve(spendingAccount, 500000).send({
          from: fromAccount,
          gas: '3000000'
        });

        const balanceToAcc = await seaToken.methods.balanceOf(toAccount).call();

        const receipt = await seaToken.methods.transferFrom(fromAccount, toAccount, 500000).send({
          from: spendingAccount,
          gas: '3000000'
        });

        const balanceToAcc2 = await seaToken.methods.balanceOf(toAccount).call();

        assert.equal(receipt.events.Transfer.event, "Transfer");
        assert.equal(receipt.events.Transfer.returnValues._from, fromAccount);
        assert.equal(receipt.events.Transfer.returnValues._to, toAccount);
        assert.equal(receipt.events.Transfer.returnValues._value, 500000);
      });

      it('Checking Balances', async () => {

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await seaToken.methods.transfer(fromAccount, 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });

        await seaToken.methods.approve(spendingAccount, 500000).send({
          from: fromAccount,
          gas: '3000000'
        });

        await seaToken.methods.transferFrom(fromAccount, toAccount, 500000).send({
          from: spendingAccount,
          gas: '3000000'
        });

        const balanceOfFromAccount = await seaToken.methods.balanceOf(fromAccount).call();
        const balanceOfToAccount = await seaToken.methods.balanceOf(toAccount).call();

        assert.equal(balanceOfFromAccount, 500000);
        assert.equal(balanceOfToAccount, 500000);
      });

      it('Checking allowance correct', async () => {

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        //fromAccount got 1M token from creator
        await seaToken.methods.transfer(fromAccount, 1000000).send({
          from: accounts[0],
          gas: '3000000'
        });

        //fromAccount approve spendingAccount to spent 500000 Token
        await seaToken.methods.approve(spendingAccount, 500000).send({
          from: fromAccount,
          gas: '3000000'
        });

        //Then now toAccount can transfer from fromAccount for spendingAccount
        await seaToken.methods.transferFrom(fromAccount, toAccount, 500000).send({
          from: spendingAccount,
          gas: '3000000'
        });

        const balanceOfFromAccount = await seaToken.methods.balanceOf(fromAccount).call();
        const balanceOfToAccount = await seaToken.methods.balanceOf(toAccount).call();

        const allowance = await seaToken.methods.allowance(fromAccount, spendingAccount).call();
        assert.equal(allowance, 0);
      });
  });

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const compiledSeaToken = require('../ethereum/build/SeaToken.json');
const compiledSeaTokenSale = require('../ethereum/build/SeaTokenSale.json');

let accounts;
let seaToken;
let seaTokenSale;

//Token price is 0.001 Ether
const tokenPrice = 1000000000000000;

beforeEach(async () => {

    accounts = await web3.eth.getAccounts();

    seaToken = await new web3.eth.Contract(JSON.parse(JSON.stringify(compiledSeaToken.abi)))
      .deploy({ data: '0x' + compiledSeaToken.evm.bytecode.object, arguments: [7000000] })
      .send({
        from: accounts[0],
        gas: '3000000'
      });

    seaTokenSale = await new web3.eth.Contract(JSON.parse(JSON.stringify(compiledSeaTokenSale.abi)))
      .deploy({ data: '0x' + compiledSeaTokenSale.evm.bytecode.object, arguments: [seaToken.options.address, tokenPrice] })
      .send({
        from: accounts[0],
        gas: '3000000'
      });
});

describe("initializes Sea token sale contract", () => {
    it('Checking Sea token and sea token sale contract have both addresses', () => {
        assert.ok(seaToken.options.address);
        assert.ok(seaTokenSale.options.address);
      });

    it('Token address is not empty', async () => {
        const tokenAddress = await seaTokenSale.methods.tokenContract().call();
        assert.notEqual(tokenAddress, 0x0);
      });

    it('Token has a correct price', async () => {
        const incomingTokenPrice = await seaTokenSale.methods.tokenPrice().call();
        assert.equal(incomingTokenPrice, 1000000000000000);
    });
});

describe("facilitates token buying after transfered to Contract", () => {

  it('Checks correct available tokens of the contract after admin transferred', async () => {
    const admin = accounts[0];
    const numberOfTokens = 10;
    const buyer = accounts[1];
    const tokensAvailable = 5000000;

    const transferEvent = await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
          from: admin,
          gas: '3000000'
    });
    assert.equal(tokensAvailable, transferEvent.events.Transfer.returnValues._value);
  });

    it('Require the contract has tokens to be sold', async () => {
      const numberOfTokens = 10;
      const buyer = accounts[1];

      try {
        const receipt = await seaTokenSale.methods.buyTokens(numberOfTokens).send({
          from: buyer,
          value: 1
        });
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('Require Buyer pays the correct value for tokens', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });

      try {
        await seaTokenSale.methods.buyTokens(numberOfTokens).send({
          from: buyer,
          gas: '3000000',
          value: 1
        });
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('Trigger Sell Event after a buy, checks if it has has a correct value and correct buyer from Sell Event', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      const transferEvent = await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });
      const total  = numberOfTokens * tokenPrice
      const x = parseInt(total.toString());
      const xAsString = x.toString();
      const receipt = await seaTokenSale.methods.buyTokens(numberOfTokens).send({
        from: buyer,
        gas: '3000000',
        value: xAsString
      });

      assert.equal(receipt.events.Sell.returnValues._amount, numberOfTokens);
      assert.equal(receipt.events.Sell.returnValues._buyer, buyer);
    });

    it('Keep tracking available tokens of the contract after a buy', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      const transferEvent = await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });
      const total  = numberOfTokens * tokenPrice
      const x = parseInt(total.toString());
      const xAsString = x.toString();
      await seaTokenSale.methods.buyTokens(numberOfTokens).send({
        from: buyer,
        gas: '3000000',
        value: xAsString
      });

      const tokensSold = await seaTokenSale.methods.tokensSold().call();
      assert.equal(numberOfTokens, tokensSold);
    });

    it('Increments buyer of tokens after a buy', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });

      const total  = numberOfTokens * tokenPrice
      const x = parseInt(total.toString());
      const xAsString = x.toString();
      await seaTokenSale.methods.buyTokens(numberOfTokens).send({
        from: buyer,
        gas: '3000000',
        value: xAsString
      });

      const balanceOfBuyer = await seaToken.methods.balanceOf(buyer).call();
      assert.equal(numberOfTokens, balanceOfBuyer);

    });

    it('Checks contract has a correct available tokens after a buy', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });

      const total  = numberOfTokens * tokenPrice
      const x = parseInt(total.toString());
      const xAsString = x.toString();
      await seaTokenSale.methods.buyTokens(numberOfTokens).send({
        from: buyer,
        gas: '3000000',
        value: xAsString
      });
      const newAvailableTokens = tokensAvailable - numberOfTokens
      const balanceOfContract = await seaToken.methods.balanceOf(seaTokenSale.options.address).call();
      assert.equal(4999990, newAvailableTokens);
    });
});

describe("Ends Sea Token Sale", () => {

  it('Require admin to end the sale', async () => {
    const admin = accounts[0];
    const numberOfTokens = 10;
    const buyer = accounts[1];
    const tokensAvailable = 5000000;

    await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
          from: admin,
          gas: '3000000'
    });

    try {
      await seaTokenSale.methods.endSale().send({
        from: buyer,
        gas: 3000000
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Admin can end the sale and checks from end event that the sale contract has 0 Balance and admin has correct amount', async () => {
    const admin = accounts[0];
    const numberOfTokens = 10;
    const buyer = accounts[1];
    const tokensAvailable = 5000000;

    await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
          from: admin,
          gas: '3000000'
    });

    const receipt = await seaTokenSale.methods.endSale().send({
      from: admin,
      gas: 3000000
    });
    assert.equal(0, receipt.events.End.returnValues._contractBalance);
    assert.equal(7000000, receipt.events.End.returnValues._adminBalance);

  });

    it('Sends remaining tokens to the admin and checks sale contract doesnt have any tokens after the sale end', async () => {
      const admin = accounts[0];
      const numberOfTokens = 10;
      const buyer = accounts[1];
      const tokensAvailable = 5000000;

      await seaToken.methods.transfer(seaTokenSale.options.address, tokensAvailable).send({
            from: admin,
            gas: '3000000'
      });

      const total  = numberOfTokens * tokenPrice
      const x = parseInt(total.toString());
      const xAsString = x.toString();
      await seaTokenSale.methods.buyTokens(numberOfTokens).send({
        from: buyer,
        gas: '3000000',
        value: xAsString
      });

      await seaTokenSale.methods.endSale().send({
        from: admin,
        gas: '3000000'
      });

      const seaTokenSaleBalance = await seaToken.methods.balanceOf(seaTokenSale.options.address).call();
      assert.equal(0, seaTokenSaleBalance);

      const adminBalance = await seaToken.methods.balanceOf(admin).call();
      assert.equal(6999990, adminBalance);
    });
});

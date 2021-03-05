# What is an ERC20 token?
ERC-20 is similar, in some respects, to bitcoin, Litecoin, and any other cryptocurrency; ERC-20 tokens are blockchain-based assets that have value and can be sent and received. The primary difference is that instead of running on their own blockchain, ERC-20 tokens are issued on the Ethereum network.

ERC-20 has emerged as the technical standard; it is used for all smart contracts on the Ethereum blockchain for token implementation and provides a list of rules that all Ethereum-based tokens must follow.

# Sea Token Project
This project illustrates an erc 20 token crowdsale. Who creates the sea token contract must initialize total supply which means total tokens of the contract. When main contract is created then Crowdsale contract can be initialize with the provided sea token contract. Crowdsale contract will be created with zero (0) initial balance. This means creator of the sea contract must transfer some tokens to be sold in Crowdsale contract. When transfer is done,  Crowdale contract is ready to sell and sea token contract wiill keep track of every move of the tokens. 


# How to use 

```
git clone https://github.com/denizTutuncu/erc20TokenExample..git
cd erc20TokenExample
cd SeaToken
npm install 
```

# How to test

```
cd SeaToken
npm run test
```

## Test Cases 
###### Deploys ERC-20 Sea Token and sets up total supply
    - ✓ Sea Token has an address
    - ✓ Sets up total supply
    - ✓ Allocates the inital supply to the creator
    - ✓ Sea Token depleyed with a correct name
    - ✓ Sea Token depleyed with a correct symbol
    - ✓ Sea Token depleyed with a correct standard

###### Transfer ownership
    - ✓ Transfer throws an error because sender doesnt have enough token
    - ✓ Sender has enough token for the transfer (47ms)
    - ✓ Trigger transfer event (43ms)
    - ✓ Checking Balances for sender and recipient (69ms)

###### Approves tokens for delegated transfer
    - ✓ Approves sender has enough balance
    - ✓ Approves receipt events result as expected
    - ✓ Approves allowance as expected (41ms)

###### Handles delegated token transfer
    - ✓ Cannot spend value larger than balance (90ms)
    - ✓ Cannot send larger than approved  value (91ms)
    - ✓ Can spend value and emits receipt (126ms)
    - ✓ Checking Balances (124ms)
    - ✓ Checking allowance correct (140ms)

###### Initializes Sea token sale contract
    - ✓ Checking Sea token and sea token sale contract have both addresses
    - ✓ Token address is not empty
    - ✓ Token has a correct price

###### facilitates token buying after transfered to Contract
    - ✓ Checks correct available tokens of the contract after admin transferred
    - ✓ Require the contract has tokens to be sold
    - ✓ Require Buyer pays the correct value for tokens (52ms)
    - ✓ Trigger Sell Event after a buy, checks if it has has a correct value and correct buyer from Sell Event (77ms)
    - ✓ Keep tracking available tokens of the contract after a buy (83ms)
    - ✓ Increments buyer of tokens after a buy (84ms)
    - ✓ Checks contract has a correct available tokens after a buy (86ms)

###### Ends Sea Token Sale
    - ✓ Require admin to end the sale (53ms)
    - ✓ Admin can end the sale and checks from end event that the sale contract has 0 Balance and admin has correct amount (70ms)
    - ✓ Sends remaining tokens to the admin and checks sale contract doesnt have any tokens after the sale end (139ms)

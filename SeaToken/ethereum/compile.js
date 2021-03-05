const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

//Creates build path and clears it.
//This path wil be used to save contract objects as JSON file.
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

//Creates SeaToken, SeaTokenSale directory
//To grab SeaToken.sol file
//To grab SeaTokenSale.sol file
const seaTokenPath = path.resolve(__dirname, 'contracts', 'SeaToken.sol');

//Creates sources from seaTokenPath, seaTokenSalePath with given type which is UTF-8
const sourceSeaToken = fs.readFileSync(seaTokenPath, 'UTF-8');

//Creates seaTokenInput from source
var seaTokenInput = {
    language: 'Solidity',
    sources: {
        'SeaToken.sol' : {
            content: sourceSeaToken
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};


try{
    //Creates output from the given input
    const outputSeaToken = JSON.parse(solc.compile(JSON.stringify(seaTokenInput)),1);
    //For loop each contract in the SeaToken.sol file
    for (let contract in outputSeaToken.contracts["SeaToken.sol"]) {

    //Creates contracts as JSON file and writes them into Build file
      fs.outputJSONSync(
        path.resolve(buildPath, contract + '.json'),
        outputSeaToken.contracts["SeaToken.sol"][contract]
      );
    }

}catch(error){
  //If something went wrong, we catch the error.
    console.log("error from sea token");
    console.log(error);
}

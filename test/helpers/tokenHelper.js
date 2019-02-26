const TokenContractInfo = require('paradigm-contracts').contracts.DigmToken;

module.exports = async (variableName, tokenName, tokenSymbol, from) => {

  const TokenContract = new web3.eth.Contract(TokenContractInfo.abi);
  const deployedContract = await TokenContract.deploy({ data: TokenContractInfo.bytecode , arguments: [] }).send({ from, gas: 4500000 });

  global[variableName.toUpperCase()] = deployedContract.options.address;
  global[variableName.toLowerCase()] = deployedContract;
};
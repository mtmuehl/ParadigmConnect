const SimpleERC20 = require('simple-erc20');
const TokenContractInfo = require('paradigm-contracts/build/contracts/DigmToken');

module.exports = async (variableName, tokenName, tokenSymbol, from) => {

  const TokenContract = new web3.eth.Contract(TokenContractInfo.abi);
  const DeployedContract = await TokenContract.deploy({ data: TokenContractInfo.bytecode , arguments: [] }).send({ from, gas: 4500000 });

  global[variableName.toUpperCase()] = DeployedContract._address;
  global[variableName.toLowerCase()] = SimpleERC20(DeployedContract._address, await web3.eth.net.getId(), web3);
};
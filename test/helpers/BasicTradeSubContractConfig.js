exports.makerArguments = [
  { 'dataType': "address", 'name': "signer" },//0
  { 'dataType': "address", 'name': "signerToken" },//1
  { 'dataType': "uint", 'name': "signerTokenCount" },//2
  { 'dataType': "address", 'name': "buyerToken" },//3
  { 'dataType': "uint", 'name': "buyerTokenCount" },//4
  { 'dataType': "uint", 'name': "signatureV"},
  { 'dataType': "bytes32", 'name': "signatureR"},
  { 'dataType': "bytes32", 'name': "signatureS"}
];

exports.takerArguments = [
  { 'dataType': "uint", 'name': "tokensToBuy"},//6 -> 0
];


/*Issues with the ParadigmBank concept for signedTransfer.
*  a. If you give someone the details of for a signed transfer in plain text it will be vulnerable for manual draining.
*  b. Giving just the vrs the information can be determined from the parameters based on the api.
*  c. Perhaps add the contract address to the signature.
* */

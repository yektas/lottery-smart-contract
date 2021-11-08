const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledFile = require("./compile");
const interface = compiledFile.abi;
const bytecode = compiledFile.evm.bytecode.object;

const ACCOUNT_MNEMONIC = "";

const provider = new HDWalletProvider(
  ACCOUNT_MNEMONIC,
  "https://rinkeby.infura.io/v3/d69e76b9da894e738230b1771c35f6a4"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy from account", accounts[0]);

  const contract = await new web3.eth.Contract(interface)
    .deploy({ data: bytecode })
    .send({ gas: "1000000", gasPrice: "20000000000", from: accounts[0] });

  console.log("Contract deployed to", contract.options.address);
};
deploy();

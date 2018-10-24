const ethers = require("ethers")
const Wallet = ethers.Wallet
const providers = ethers.providers
const path = require("path")
const fs = require("fs")

const deploy = async() => {
	let keystore = path.resolve("./keystore/UTC--2018-05-17T21-58-52.188632298Z--8f9b540b19520f8259115a90e4b4ffaeac642a30")
 	let walletJson = fs.readFileSync(keystore, 'utf8')
    let wallet = await Wallet.fromEncryptedJson(walletJson, "password")

    let provider = new providers.JsonRpcProvider("http://localhost:8545", "unspecified")

    wallet = wallet.connect(provider)
    
	let RingVerifyAbi = path.resolve("./build/RingVerify.abi")
 	let abi = fs.readFileSync(RingVerifyAbi, 'utf8')

	let RingVerifyBin = path.resolve("./build/RingVerify.bin")
 	let bin = fs.readFileSync(RingVerifyBin, 'utf8')

	let ringVerifyFactory = new ethers.ContractFactory( abi , bin , wallet )
	let ringVerify = await ringVerifyFactory.deploy()
	let receipt = await provider.getTransactionReceipt(ringVerify.deployTransaction.hash)
	console.log(receipt)

	let results = path.resolve("./scripts/deployment.txt")
	fs.writeFileSync(results, receipt.contractAddress)

	return ringVerify
}

module.exports = {deploy}
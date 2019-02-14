const ethers = require("ethers")
const Wallet = ethers.Wallet
const providers = ethers.providers
const path = require("path")
const fs = require("fs")

const deployRingVerify = async() => {
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
	await provider.waitForTransaction(ringVerify.deployTransaction.hash)
	let receipt = await provider.getTransactionReceipt(ringVerify.deployTransaction.hash)
	//console.log("RingVerify deployed")

	let results = path.resolve("./scripts/deployment.txt")
	fs.writeFileSync(results, receipt.contractAddress)

	return ringVerify
}

const deployRingMixer = async(size) => {
	let keystore = path.resolve("./keystore/UTC--2018-05-17T21-58-52.188632298Z--8f9b540b19520f8259115a90e4b4ffaeac642a30")
 	let walletJson = fs.readFileSync(keystore, 'utf8')
    let wallet = await Wallet.fromEncryptedJson(walletJson, "password")

    let provider = new providers.JsonRpcProvider("http://localhost:8545", "unspecified")

    wallet = wallet.connect(provider)
    
	let RingMixerAbi = path.resolve("./build/RingMixer.abi")
 	let abi = fs.readFileSync(RingMixerAbi, 'utf8')

	let RingMixerBin = path.resolve("./build/RingMixer.bin")
 	let bin = fs.readFileSync(RingMixerBin, 'utf8')

	let RingMixerFactory = new ethers.ContractFactory( abi , bin , wallet )
	let RingMixer = await RingMixerFactory.deploy(size)
	await provider.waitForTransaction(RingMixer.deployTransaction.hash)
	let receipt = await provider.getTransactionReceipt(RingMixer.deployTransaction.hash)
	//console.log("RingMixer deployed")

	let results = path.resolve("./scripts/deployment.txt")
	fs.writeFileSync(results, receipt.contractAddress)

	return RingMixer
}

module.exports = {deployRingVerify, deployRingMixer}
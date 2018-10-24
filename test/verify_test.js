const ethers = require("ethers")
const Wallet = ethers.Wallet
const providers = ethers.providers
const path = require("path")
const fs = require("fs")

const deploy = require("../scripts/deploy.js")

const init = async() => {
	// let RingVerifyAbi = path.resolve("./build/RingVerify.abi")
 // 	let abi = fs.readFileSync(RingVerifyAbi, 'utf8')

	// let keystore = path.resolve("./keystore/UTC--2018-05-17T21-58-52.188632298Z--8f9b540b19520f8259115a90e4b4ffaeac642a30")
 // 	let walletJson = fs.readFileSync(keystore, 'utf8')
 //    let wallet = await Wallet.fromEncryptedJson(walletJson, "password")

 //    let provider = new providers.JsonRpcProvider("http://localhost:8545", "homestead")

	// let ringVerify = new ethers.Contract( "0x0b197606442aFFAE8402F9030Edbe9234c2069fe", abi , provider )
	// ringVerify = ringVerify.connect(wallet)

	let ringVerify = await deploy.deploy()
	let provider = ringVerify.provider

	console.log(ringVerify)
	let tx = await ringVerify.hash()

	console.log(tx)
	let receipt = await provider.getTransactionReceipt(tx.hash)
	console.log(receipt)

}

init()
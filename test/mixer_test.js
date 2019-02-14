const ethers = require("ethers")
const Wallet = ethers.Wallet
const providers = ethers.providers
const utils = ethers.utils
const path = require("path")
const fs = require("fs")
const assert = require("chai").assert
const deploy = require("../scripts/deploy.js")

const pubkeyA = {x: 0, y: 0}
const pubkeyB = {x: 0, y: 0}
const pubkeyC = {x: 0, y: 0}
const pubkeyD = {x: 0, y: 0}
const pubkeyE = {x: 0, y: 0}
const pubkeyF = {x: 0, y: 0}
const pubkeyG = {x: 0, y: 0}
const pubkeyH = {x: 0, y: 0}

let keystore = path.resolve("./keystore/UTC--2018-05-17T21-58-52.188632298Z--8f9b540b19520f8259115a90e4b4ffaeac642a30")
let walletJson = fs.readFileSync(keystore, 'utf8')
let wallet
let provider = new providers.JsonRpcProvider("http://localhost:8545", "unspecified")

let mixer

let size = 3

describe("mixer", () => {
	before(async() => {
	    wallet = await Wallet.fromEncryptedJson(walletJson, "password")
	    wallet = wallet.connect(provider)

	    mixer = await deploy.deployRingMixer(size)
		assert(mixer.interface !== undefined)
	})

	it("should have a ring size of 3", async() => {
		let _size = await mixer.size()
		assert(_size === 3, "did not set correct ring size")
	})

	it("should deposit into the mixer using pubkeyA", async() => {
		let tx = await mixer.deposit(pubkeyA.x, pubkeyA.y, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
	})

	it("should deposit into the mixer using pubkeyB", async() => {
		let tx = await mixer.deposit(pubkeyB.x, pubkeyB.y, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
	})

	it("should deposit into the mixer using pubkeyC", async() => {
		let tx = await mixer.deposit(pubkeyC.x, pubkeyC.y, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
		assert(receipt.logs.length === 2, "did not emit DepositsCompleted event")
	})
}).timeout(100000)
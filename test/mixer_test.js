const ethers = require("ethers")
const Wallet = ethers.Wallet
const providers = ethers.providers
const utils = ethers.utils
const path = require("path")
const fs = require("fs")
const assert = require("chai").assert
const deploy = require("../scripts/deploy.js")

const pubkeyA = '0xa4797dc6fc58c22cfdd5bfb167d2c0577be8979ad9c037507c23d6de5b7cca2d8a2f9ae8ada38cd16196da55d65ab27de4bf1859b75ac4f06c1699b43592b81e'
const pubkeyB = '0x729e005faa250c3d705f1abc9be79c3fe9a186ce4ed4cb5e3fd4e32acf04de2ec4e3a25f2b678a79623fc0900bcf1db706bb5bf189ff3d4d212672929ba604db'
const pubkeyC = '0x028be4cfc48ee6c0487f9de7fa8a0fe3b7a8846a5b180f8a31774a2a714de40a24a4c105b4400f30581880fc179869877845877443dd830daf85460da79f0e32'
 
const addressA = '0x8f9b540b19520f8259115a90e4b4ffaeac642a30'
const addressB = '0x93f6be405daabca8478d0b9df0db00b24d61e0a2'
const addressC = '0xf7f0332b46197d099d4084d7f2ab7fbf340833ef'

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
		let tx = await mixer.deposit(pubkeyA, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
	})

	it("should deposit into the mixer using pubkeyB", async() => {
		let tx = await mixer.deposit(pubkeyB, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
	})

	it("should deposit into the mixer using pubkeyC", async() => {
		let tx = await mixer.deposit(pubkeyC, {value: utils.parseEther('0.1')})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length > 0, "did not deposit into mixer")
		assert(receipt.logs.length === 2, "did not emit DepositsCompleted event")
	})

	it("should withdraw from the mixer using signature secretly signed with pubkeyA", async() => {
		let sig = '0x00000000000000048f9b540b19520f8259115a90e4b4ffaeac642a30000000000000000000000000f06fba646d9ceac96f069b4a0cd0ce956d4da179b16900adbbdcf452e481c60341e42aa994929b039bfee890e815f0190375051a6f0713997557cf2887304c8d729e005faa250c3d705f1abc9be79c3fe9a186ce4ed4cb5e3fd4e32acf04de2ec4e3a25f2b678a79623fc0900bcf1db706bb5bf189ff3d4d212672929ba604db65ad2e7b5d90caa238b6f1d955f0fc2493611fee6691c9e792f8cc2c96788bbc028be4cfc48ee6c0487f9de7fa8a0fe3b7a8846a5b180f8a31774a2a714de40a24a4c105b4400f30581880fc179869877845877443dd830daf85460da79f0e32a354ce8de73c247e344a26cc9797076fcaabe81ad122b4a0f2b47b94a8c7ebbf8953cef67a6ebb6f0fe864bc3c9884cb97a08c026d37dad5b56098b1f633e4149821f6effbbe1ac9a7bc5c6cd1598523f16e39414305d72ea650d346f8ca88de1d43d5757eaf6a65e0eda2cfc5ec35cbe24da3162558a5c8520e84fb39abe338a4797dc6fc58c22cfdd5bfb167d2c0577be8979ad9c037507c23d6de5b7cca2d8a2f9ae8ada38cd16196da55d65ab27de4bf1859b75ac4f06c1699b43592b81e52cbb3df6eb3614c685ce7cd639b9e187607796dcd618e5a6842ab76dcf250a7db0856d32e0c40bd7902cbdc9ec7997388e6369d9e9cd3dc387952467611b289'
		let tx = await mixer.withdraw(addressA, sig)
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length == 1, "did not withdraw from mixer")
		assert((await mixer.images_len()) == 1, "did not add key image")
	})

	it("should not withdraw with the wrong message", async() => {
		try {
			let sig = '0x0000000000000004a3f6be405daabca8478d0b9df0db00b24d61e0a2000000000000000000000000766e6f288552ee0971f360d8c3f94fbb1d8641bc127939fb1e7e12130f1abc63e2b17d12fea90485616330bdfb39d470abcdb395a5701357f7e5770fe998ba51028be4cfc48ee6c0487f9de7fa8a0fe3b7a8846a5b180f8a31774a2a714de40a24a4c105b4400f30581880fc179869877845877443dd830daf85460da79f0e32d5e05337b57730a86a31f98d7c28fad0ce54af6ec6f4375c4f2e738ea43567246afed0a271e12fce0669a9dac75c17ed8db054af0eba6e1b537a1fd5019e10b166579ac31f62146473798b8e4f712d80fc6c744fb4a90f871bd930bf87863d51f8ba7a26011f5b79c2e681ffe16108d3685ff3c0e352e4d5503d7ea97326d4b4a4797dc6fc58c22cfdd5bfb167d2c0577be8979ad9c037507c23d6de5b7cca2d8a2f9ae8ada38cd16196da55d65ab27de4bf1859b75ac4f06c1699b43592b81ed4c278fe929e0d417def6b36edea2bd51275f6d152a40dfe7f31ad0863aef7b1729e005faa250c3d705f1abc9be79c3fe9a186ce4ed4cb5e3fd4e32acf04de2ec4e3a25f2b678a79623fc0900bcf1db706bb5bf189ff3d4d212672929ba604db07f54b599d0d1ff8922b0dc74a68ed2ad3d12a0bde9b35456284db3cd45f8133e35a50a1a5606fe23a2fc7ecbc95e8e500a8123dff7c526a4c6409299d90c044'
			let tx = await mixer.withdraw(addressA, sig)
			await provider.waitForTransaction(tx.hash)
			let receipt = await provider.getTransactionReceipt(tx.hash)
			assert(receipt.logs.length == 0, "did withdraw from mixer")
			assert((await mixer.images_len()) == 1, "did not add key image")		
		} catch (err) {
			assert(err)
		}
	})

	it("should withdraw from the mixer using signature secretly signed with pubkeyB", async() => {
		let sig = '0x000000000000000493f6be405daabca8478d0b9df0db00b24d61e0a2000000000000000000000000766e6f288552ee0971f360d8c3f94fbb1d8641bc127939fb1e7e12130f1abc63e2b17d12fea90485616330bdfb39d470abcdb395a5701357f7e5770fe998ba51028be4cfc48ee6c0487f9de7fa8a0fe3b7a8846a5b180f8a31774a2a714de40a24a4c105b4400f30581880fc179869877845877443dd830daf85460da79f0e32d5e05337b57730a86a31f98d7c28fad0ce54af6ec6f4375c4f2e738ea43567246afed0a271e12fce0669a9dac75c17ed8db054af0eba6e1b537a1fd5019e10b166579ac31f62146473798b8e4f712d80fc6c744fb4a90f871bd930bf87863d51f8ba7a26011f5b79c2e681ffe16108d3685ff3c0e352e4d5503d7ea97326d4b4a4797dc6fc58c22cfdd5bfb167d2c0577be8979ad9c037507c23d6de5b7cca2d8a2f9ae8ada38cd16196da55d65ab27de4bf1859b75ac4f06c1699b43592b81ed4c278fe929e0d417def6b36edea2bd51275f6d152a40dfe7f31ad0863aef7b1729e005faa250c3d705f1abc9be79c3fe9a186ce4ed4cb5e3fd4e32acf04de2ec4e3a25f2b678a79623fc0900bcf1db706bb5bf189ff3d4d212672929ba604db07f54b599d0d1ff8922b0dc74a68ed2ad3d12a0bde9b35456284db3cd45f8133e35a50a1a5606fe23a2fc7ecbc95e8e500a8123dff7c526a4c6409299d90c044'
		let tx = await mixer.withdraw(addressB, sig)
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length == 1, "did not withdraw from mixer")
		assert((await mixer.images_len()) == 2, "did not add key image")
	})

	it("should not prematurely finish the round", async() => {
		try {
			let tx = await mixer.finish_round()
			await provider.waitForTransaction(tx.hash)
			let receipt = await provider.getTransactionReceipt(tx.hash)
			assert(receipt.logs.length == 0, "prematurely finished round")			
		} catch (err) {
			assert(err)
		}
	})

	it("should withdraw from the mixer using signature secretly signed with pubkeyC", async() => {
		let sig = '0x0000000000000004f7f0332b46197d099d4084d7f2ab7fbf340833ef00000000000000000000000051d00bd82d0be03626485d129a2422e486874820288835cf1d051124ac7b1d64211bcd5e7a07d8c6687a765b5a80b620b70db403354b9fee83866be64f16809f028be4cfc48ee6c0487f9de7fa8a0fe3b7a8846a5b180f8a31774a2a714de40a24a4c105b4400f30581880fc179869877845877443dd830daf85460da79f0e320a41ebfb9d712653cc5875e4c078a98f0f0d9f5f4473809ae9dab76faa28cfa8e4e01829ae303f3e14fbef7b2756c897b822eb5d50762736a81e04f6e05474ae0e0a64bc60ab65820af284073b107e513c39e84e070fd5f17b7f575c5ed2ca5ae9a42b2a4517a53d50fa7d3530d320eaedeab94b6e83a01b421679fa385ba564a4797dc6fc58c22cfdd5bfb167d2c0577be8979ad9c037507c23d6de5b7cca2d8a2f9ae8ada38cd16196da55d65ab27de4bf1859b75ac4f06c1699b43592b81e9994e83216db1981f6021187b3d39fb66abcf2715f49e4b56a9d53aac9d573ad729e005faa250c3d705f1abc9be79c3fe9a186ce4ed4cb5e3fd4e32acf04de2ec4e3a25f2b678a79623fc0900bcf1db706bb5bf189ff3d4d212672929ba604dba9655acfe8c56b7060d8d67b0eda767f5ffaf87310c1206fb4a6b2bb985e264da83b1424ae1391b2ed31caa08d7956fc6281f3793ceee805148b85be2750ce53'
		let tx = await mixer.withdraw(addressC, sig, {gasLimit: 6700000})
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length == 1, "did not withdraw from mixer")
		assert(receipt.logs.length == 2, "did not emit WithdrawalsCompleted")
		assert((await mixer.images_len()) == 3, "did not add key image")
	})

	it("should finish the round", async() => {
		let tx = await mixer.finish_round()
		await provider.waitForTransaction(tx.hash)
		let receipt = await provider.getTransactionReceipt(tx.hash)
		assert(receipt.logs.length == 1, "did not finish round")			
	})
}).timeout(100000)
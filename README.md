# ring-mixer [wip]
to eventually be renamed, once I find a good name :)


contracts:
* RingVerify.sol; this contract tests the ring-verify precompile located at address `0x0000000000000000000000000000000000000009`. see github.com/noot/go-ethereum
* RingMixer.sol; this contract performs transaction obfuscation using verification of a ring-signed message.

### dependencies
solc 0.4.25
node 9.10.0

### instructions
```
git clone https://github.com/noot/ring-mixer
npm install
```

compile contracts: 
```
solc --abi contracts/* -o build/ --overwrite
solc --bin contracts/* -o build/ --overwrite
```

run test; you need a local ring-geth testnet running
```
node test/verify_test.js
```

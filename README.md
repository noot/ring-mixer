# ring-mixer [wip]
this is no longer used, I decided to write everything [tests, cli] in Go. see github.com/noot/ring-go

contracts:
* RingVerify.sol; this contract runs the ring-verify precompile located at address `0x0000000000000000000000000000000000000009`. see github.com/noot/go-ethereum
* RingMixer.sol; this contract performs transaction obfuscation using verification of a ring-signed message.

### dependencies
solc 0.4.25
node 9.10.0

### instructions
```
git clone https://github.com/noot/ring-mixer
npm install
```

compile contracts: `chmod +x compile.sh && ./compile.sh`

alternatively,
```
solc --abi contracts/* -o build/ --overwrite
solc --bin contracts/* -o build/ --overwrite
```

run tests; you need a local ring-geth testnet running. see github.com/noot/go-ethereum
```
mocha test/verify_test.js --timeout 20000
```

### details and specifications
see elizabeth.website/report.pdf

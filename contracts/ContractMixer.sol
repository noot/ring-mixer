pragma solidity ^0.5.0;

contract ContractMixer {

	// deploy a contract from within this contract
	function deploy(bytes memory _data) public returns (bool ok) {
		assembly {
			let _addr := create(0, add(_data, 0x20), mload(_data))
			ok := iszero(extcodesize(_addr))
		}
	}
}
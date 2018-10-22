pragma solidity ^0.4.24;

contract RingMixer {

	// point on elliptic curve representing a public key
	struct PublicKey {
		bytes32 X;
		bytes32 Y;
	}

	// mapping of used key images; set to true when used
	mapping (bytes32 => bool) keyImages;

	// mapping of addresses to submitted public key
	// note that this can be overwritten by making another submission
	mapping (address => PublicKey) publicKeys;

	event PublicKeySubmission(address _addr, bytes32 _x, bytes32 _y);
	event Verified(bytes32 _msg, bytes _sig);
	event Transaction(address _to, uint256 _gas, bytes _data);

	function submit(bytes32 _x, bytes32 _y) public {
		require(_onCurve(_x, _y));
		publicKeys[msg.sender].X = _x;
		publicKeys[msg.sender].Y = _y;
		emit PublicKeySubmission(msg.sender, _x, _y);
	}

	function verify(address _to, uint256 _gas, bytes _data, bytes _sig) public returns (bool ok) {
		bytes32 _msg = keccak256(abi.encodePacked(_to, _gas, _data));
		if(_verify(_msg, _sig)) {
			emit Verified(_msg, _sig);
			if(_to != address(0)) {
				ok = _to.call.gas(_gas)(_data);
			} else {
				assembly {
					let _addr := create(0, add(_data, 0x20), mload(_data))
					ok := iszero(extcodesize(_addr))
				}
			}
			if (ok) {
				emit Transaction(_to, _gas, _data);
			}
		}
	}

	// todo: calls the verify precompile
	function _verify(bytes32 _msg, bytes _sig) internal returns (bool) {
		return true;
	}

	// todo: checks if the point is on the curve
	function _onCurve(bytes32 _x, bytes32 _y) internal returns (bool) {
		return true;
	}
}
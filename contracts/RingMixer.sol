pragma solidity ^0.4.24;

contract RingMixer {
	// constant ring size
	uint8 constant SIZE = 12;

	// constant signature length
	uint8 constant SIGLEN = 32 * (SIZE * 3 + 2) + 8;

	// constant ether value
	uint256 constant VAL = 10 ** 17;

	// point on elliptic curve representing a public key
	struct PublicKey {
		bytes32 X;
		bytes32 Y;
		address _addr;
	}

	// array of public keys which are used to form a ring
	PublicKey[] ring;

	// array of hashes of already submitted signatures for the current ring
	bytes[] sigs;

	event PublicKeySubmission(address _addr, bytes32 _x, bytes32 _y);
	event RingFormed();
	event Transaction(address indexed _to, uint256 _value);
	event RoundFinished();

	// round one: ring formation.
	// sender submits their public key to the contract. once the ring size is reached, the RingFormed event is emitted
	// called by the sender
	function submit_key(bytes32 _x, bytes32 _y) public payable {
		require(msg.value == VAL);
		require(_onCurve(_x, _y));
		require(ring.length < SIZE);
		PublicKey memory p = PublicKey(_x, _y, msg.sender);
		ring.push(p);
		emit PublicKeySubmission(msg.sender, _x, _y);

		if(ring.length == SIZE) {
			emit RingFormed();
		}
	}

	// round two: signature submission
	// after a ring is formed, all the members of the ring must submit a ring-signed transaction where the message
	// is keccak256(address _to, uint256 _value). this signature is stored in the contract until withdrawals are completed
	// called by the sender
	function submit_sig(bytes _sig) public {
		require(_sig.length == SIGLEN);
		// todo: add checks to make sure signature was formatted correctly, and that the ring in the signature is in fact 
		// the ring stored in the contract
		sigs.push(_sig);
	}

	// round three: verification and withdrawal
	// verifies that there was in fact a signature submitted to the contract with a message specifying that _value be sent
	// to _to.
	// usually called by the receiver; can actually be called by anyone, assuming they know the _to address and the value.
	function verify(address _to, uint8 i) public returns (bool ok) {
		bytes32 _msg = keccak256(abi.encodePacked(_to, VAL));
		bytes32 sig_msg;
		bytes memory sig = sigs[i];

		assembly {
			sig_msg := mload(add(sig, 0x08))
		}

		require(sig_msg == _msg);

		if(_verify(_msg, sigs[i])) {
			_to.transfer(VAL);
			emit Transaction(_to, VAL);

			delete sigs[i];
		}
	} 

	function finish_round() internal returns (bool) {
		for(uint8 i; i < SIZE; i++) {
			// make sure the 
			require(sigs[i].length == 0);
			delete ring[i];
		}
		emit RoundFinished();
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
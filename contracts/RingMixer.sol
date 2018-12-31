pragma solidity ^0.5.0;

import "./EC.sol";

contract RingMixer {
	// constant ring size
	uint8 constant public SIZE = 5;

	// constant signature length
	uint8 constant public SIGLEN = 32 * (SIZE * 3 + 2) + 8;

	// constant ether value
	uint256 constant public VAL = 0.1 ether;

	// field order of secp256k1
	uint256 constant internal ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

	// b coefficient for curve secp256k1
	uint256 constant internal B = 0x07;

	// point on elliptic curve representing a public key
	struct PublicKey {
		uint256 X;
		uint256 Y;
		address _addr;
	}

	// array of public keys which are used to form a ring
	PublicKey[] ring;

	// array of hashes of already submitted signatures for the current ring
	bytes[] public sigs;

	event PublicKeySubmission(address _addr, uint256 _x, uint256 _y);
	event RingFormed();
	event Transaction(address indexed _to, uint256 _value);
	event RoundFinished();
    event Verify(bool indexed ok);

	// round one: ring formation.
	// sender submits their public key to the contract, as well as 0.1 ether.
	// once the ring size is reached, the RingFormed event is emitted
	// called by the sender
	function submit_key(uint256 _x, uint256 _y) public payable {
		require(msg.value == VAL);
		require(_on_curve(_x, _y));
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
	function submit_sig(bytes memory _sig) public {
		require(_sig.length == SIGLEN);
		// todo: add checks to make sure signature was formatted correctly, and that the ring in the signature is in fact 
		// the ring stored in the contract
		sigs.push(_sig);
	}

	// round three: verification and withdrawal
	// verifies that there was in fact a signature submitted to the contract with a message specifying that _value be sent
	// to _to.
	// usually called by the receiver; can actually be called by anyone, assuming they know the _to address and the value.
	function verify(address payable _to, uint8 i) public returns (bool ok) {
		bytes32 _msg = keccak256(abi.encodePacked(_to, VAL));
		bytes32 sig_msg;
		bytes memory sig = sigs[i];

		assembly {
			sig_msg := mload(add(sig, 0x08))
		}

		require(sig_msg == _msg);

		if(_verify(sigs[i])) {
			_to.transfer(VAL);
			emit Transaction(_to, VAL);

			delete sigs[i];
			return true;
		}

		return false;
	} 

	// called when all the transactions for this round have been sent and the sigs array is empty
	function finish_round() internal returns (bool) {
		for(uint8 i; i < SIZE; i++) {
			// make sure the signature is deleted and the transaction has been sent
			require(sigs[i].length == 0);
			delete ring[i];
		}
		emit RoundFinished();
	}

    function _verify(bytes memory _sig) internal returns (bool) {
        bool ok;

        // precompile for verify located at address 0x09
        address _a = address(9);
        uint256 _len = _sig.length + 32;
        uint256 _gas = 1000;

        assembly {            
            let x := mload(0x40) // get empty storage location

            let ret := call(_gas, 
                _a,
                0, // no wei value passed to function
                _sig, // input
                _len, // input size
                x, // output stored at input location, save space
                0x20 // output size = 32 bytes
            )
                
            ok := mload(x)
            mstore(0x40, add(x,0x20)) // update free memory pointer
        }

        emit Verify(ok);
        return ok;
    }

	// todo: checks if the point is on the curve
	function _on_curve(uint256 _x, uint256 _y) pure internal returns (bool) {
		// uint256 sqred = mulmod(_x, _x, ORDER);
		// uint256 cubed = mulmod(sqred, _x, ORDER);
		// return addmod(sqred, B, ORDER) == mulmod(_y, _y, ORDER);
		return true;
	}
}
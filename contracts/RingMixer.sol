pragma solidity ^0.5.0;

import "./EC.sol";

contract RingMixer {
	// ring size
	uint8 public size;

	// constant signature length
	//uint8 public SIGLEN;

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
		//address _addr;
	}

	// array of public keys which are used to form a ring
	PublicKey[] public ring;

	// array of hashes of already submitted key images for the current ring
	bytes32[] public images;
	mapping(bytes32 => bool) image_used;

	event PublicKeySubmission(address _addr, uint256 _x, uint256 _y);
	event DepositsCompleted();
	event Transaction(address indexed _to, uint256 indexed _value);
	event WithdrawalsCompleted();
	event RoundFinished();
    event Verify(bool indexed ok);

    // optionally pass in ring size
    // if no size passed, set size to 11
    constructor(uint8 _size) public {
    	if (_size == 0) {
    		size = 11;
    	} else  {
    		size = _size;
    	}
    	//SIGLEN = 32 * (size * 3 + 2) + 8;
    }

    function images_len() public view returns (uint256) {
    	return images.length;
    }

	// round one: ring formation.
	// sender submits their public key to the contract, as well as 0.1 ether.
	// once the ring size is reached, the RingFormed event is emitted
	// called by the sender
	function deposit(bytes memory _pubkey) public payable {
		require(msg.value == VAL);
		//require(_on_curve(_x, _y));
		require(ring.length < size);
		// note: do we need to check for duplicate public keys getting submitted? does it reduce anonymity to have
		// the same person included at two points of the ring?

		uint256 _x;
		uint256 _y;

		assembly {
			_x := mload(_pubkey)
			_y := mload(add(_pubkey, 32))
		}

		PublicKey memory p = PublicKey(_x, _y);
		ring.push(p);
		emit PublicKeySubmission(msg.sender, _x, _y);

		if(ring.length == size) {
			emit DepositsCompleted();
		}
	}

	// round two: verification and withdrawal
	// verifies that there was in fact a signature submitted to the contract with a message specifying that _value be sent
	// to _to.
	// usually called by the receiver; can actually be called by anyone, assuming they know the _to address and the value.
	function withdraw(address payable _to, bytes memory _sig) public returns (bool ok) {
		require(images.length < size);
		// todo: check that the ring in the signature is in fact the ring stored in the contract
		// it won't mess up the withdraw if it's not, but will reduce anonymity

		require(ring_verify(_sig));

		bytes20 sig_addr;
		assembly {
			// sig[8:40] is the message
			sig_addr := mload(add(_sig, 0x28))
		}

		// save key image, only need to save image.X since it's a point on the curve
		uint256 siglen = _sig.length;
		bytes32 ix;
		assembly {
			// sig[siglen-64:siglen] is key image
			ix := mload(add(_sig, sub(siglen, 64)))
		}

		require(!image_used[ix]);

		// call ring_verify to verify the signature
		// if it returns true, transfer the ether
		if(address(sig_addr) == _to) {
			_to.transfer(VAL);
			emit Transaction(_to, VAL);

			images.push(ix);
			image_used[ix] = true;
			if (images.length == size) {
				emit WithdrawalsCompleted();
			}
			return true;
		}

		return false;
	} 

	// called when all the transactions for this round have been sent and the sigs array is empty
	function finish_round() public returns (bool) {
		require(images.length == size);
		for(uint8 i; i < size; i++) {
			delete image_used[images[i]];
			delete images[i];
			delete ring[i];
		}
		emit RoundFinished();
	}

	// verify a ring signature
    function ring_verify(bytes memory _sig) internal returns (bool) {
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

        return ok;
    }

	// TODO: checks if the point is on the curve
	// important, if someone submits a point not on the curve then we cannot create a signature
	function _on_curve(uint256 _x, uint256 _y) pure internal returns (bool) {
		// uint256 sqred = mulmod(_x, _x, ORDER);
		// uint256 cubed = mulmod(sqred, _x, ORDER);
		// return addmod(sqred, B, ORDER) == mulmod(_y, _y, ORDER);
		return true;
	}
}
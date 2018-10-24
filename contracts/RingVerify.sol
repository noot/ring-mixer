pragma solidity ^0.4.24;

contract RingVerify{

    event Hash(bytes32 _h);

    event Verify(bool indexed ok);

    function hash(uint256 _data) public returns (bytes32 _h) {
        address _a = address(0x02);

        assembly {            
            let x := mload(0x40) // get empty storage location
            mstore ( x, _data ) 

            let ret := call (gas, 
                _a,
                0, // no wei value passed to function
                x, // input
                0x20, // input size = 32 bytes
                x, // output stored at input location, save space
                0x20 // output size = 32 bytes
            )
                
            _h := mload(x)
            mstore(0x40, add(x,0x20)) // update free memory pointer
        }

        emit Hash(_h);
    }

    function verify(bytes _sig) public returns (bool ok) {
        // precompile for verify located at address 0x09
        address _a = address(0x09);

        assembly {            
            let x := mload(0x40) // get empty storage location
            mstore ( x, _sig ) 

            let ret := call (gas, 
                _a,
                0, // no wei value passed to function
                x, // input
                0x00, // input size
                x, // output stored at input location, save space
                0x20 // output size = 32 bytes
            )
                
            ok := mload(x)
            mstore(0x40, add(x,0x20)) // update free memory pointer
        }

        emit Verify(ok);
    }

}
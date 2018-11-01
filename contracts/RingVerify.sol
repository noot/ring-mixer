pragma solidity ^0.4.24;

contract RingVerify{

    event Hash(bytes32 _h);

    event Verify(bool indexed ok);

    function hash(uint256 _data) public returns (bytes32) {
        address _a = address(0x02);

        bytes32 _h;

        assembly {            
            let x := mload(0x40) // get empty storage location
            mstore ( x, _data ) 

            let ret := call(gas, 
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
        return _h;
    }

    event Input(bytes indexed _sig, uint256 indexed _len);

    function verify(bytes _sig) public returns (bool ok) {
        // precompile for verify located at address 0x09
        address _a = address(0x09);
        uint256 _len = _sig.length;
        uint256 _gas = 21000;
        emit Input(_sig, _len);

        assembly {            
            let x := mload(0x40) // get empty storage location
            mstore ( x, _sig ) 

            let ret := call(_gas, 
                _a,
                0, // no wei value passed to function
                x, // input
                _len, // input size
                x, // output stored at input location, save space
                0x20 // output size = 32 bytes
            )
                
            ok := mload(x)
            mstore(0x40, add(x,0x20)) // update free memory pointer
        }

        emit Verify(ok);
    }

}
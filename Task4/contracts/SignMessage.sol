// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;
import "@openzeppelin/contracts/utils/Strings.sol";

contract SignMessage {
    bytes32 public oldDataHash = 0x5f6174255b44b7ca652c5289d2546de65e4394eb6aa52a40045e01237736d023;
    bytes32 public newDataHash = 0xd0c8707c906a797561008f61c112c70c07c0e57952e0348106ae2b8be92a5d59;
    bytes public encryptedPubKey = "";
    bytes public nonce = hex"1234";

    // function getMessageHash() public view returns (string memory) {
    // function getMessageHash() public view returns (uint256) {
    function getMessageHash() public view returns (bytes32) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n66",
                Strings.toHexString(
                    uint256(keccak256(abi.encodePacked(oldDataHash, newDataHash, encryptedPubKey, nonce))),
                    32
                )
            )
        );

        // return uint256(keccak256(abi.encodePacked(oldDataHash, newDataHash, encryptedPubKey, nonce)));
        // 得到 110495774888502143627357333455136474761911685661411397018444438097589495401136n

        // return
        //     Strings.toHexString(
        //         uint256(keccak256(abi.encodePacked(oldDataHash, newDataHash, encryptedPubKey, nonce))),
        //         32
        //     );
        // 得到 0xf44a646e69ff192a7edeb65c568ccd966ee21b13531cfd37137971441c840ab0

        return messageHash;
        // 得到 0xccf3beecd4cd85a79829ccbb1797ea926bf81f71f98c2f56e27400fd0da8c0f6
    }
}

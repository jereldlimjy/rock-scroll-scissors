use dep::std;

// Move should be either Rock (0), Scroll (1) or Scissors (2)
fn main(move: u8, nonce: u8, hash: pub [u8; 32]) {
    // Validate the move
    assert(move >= 0);
    assert(move <= 2);

    // Get hash of move and nonce
    let computed_hash = std::hash::blake2s([move + nonce]);

    // Check if the computed hash matches the hash provided as public input
    assert(computed_hash == hash, "Hash mismatch!");
}

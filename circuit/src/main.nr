use dep::std;

// Move should be either Rock (0), Scroll (1) or Scissors (2)
fn main(move: u8, nonce: u8, hash: pub [u8; 32]) {
    // Validate the move
    assert(move >= 0);
    assert(move <= 2);

    let mut data = [0; 32];
    data[31] = move + nonce;

    // Get hash of move and nonce
    let computed_hash = std::hash::sha256(data);

    // Check if the computed hash matches the hash provided as public input
    assert(computed_hash == hash, "Hash mismatch!");
}

#[test]
fn test_valid_inputs() {
    let move = 2;
    let nonce = 70;
    let hash = [
        164, 199, 107, 150, 250, 211, 182, 180, 65, 233, 45, 168, 6, 3, 227, 17, 47, 83, 41, 175, 90, 33, 72, 6, 223, 132, 232, 221, 222, 244, 170, 181
    ];

    main(move, nonce, hash);
}

#[test(should_fail)]
fn test_invalid_move() {
    let move = 0;
    let nonce = 70;
    let hash = [
        164, 199, 107, 150, 250, 211, 182, 180, 65, 233, 45, 168, 6, 3, 227, 17, 47, 83, 41, 175, 90, 33, 72, 6, 223, 132, 232, 221, 222, 244, 170, 181
    ];

    main(move, nonce, hash);
}

#[test(should_fail)]
fn test_invalid_nonce() {
    let move = 1;
    let nonce = 300;
    let hash = [
        164, 199, 107, 150, 250, 211, 182, 180, 65, 233, 45, 168, 6, 3, 227, 17, 47, 83, 41, 175, 90, 33, 72, 6, 223, 132, 232, 221, 222, 244, 170, 181
    ];

    main(move, nonce, hash);
}

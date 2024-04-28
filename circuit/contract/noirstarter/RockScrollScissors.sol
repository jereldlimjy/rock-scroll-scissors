// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

contract RockScrollScissors {
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, address indexed opponent);
    event GameJoined(uint256 indexed gameId, address indexed opponent);
    event GameResolved(uint256 indexed gameId, address winner);

    // Enums
    enum Move { NoMove, Rock, Scroll, Scissors }
    enum GameStatus { WaitingForOpponent, WaitingForReveal, Finished }

    // Structs
    struct Game {
        uint256 gameId;
        address creator;
        bytes32 creatorHash;
        address opponent;
        Move opponentMove;
        GameStatus status;
        address winner;
    }

    // Variables
    uint256 public gameCount = 0;
    mapping(uint256 => Game) public games;
    IVerifier public verifier;

    constructor(address _verifierAddress) {
        verifier = IVerifier(_verifierAddress);
    }

    // Create a new game
    function createGame(address _opponent, bytes memory _proof, bytes32 _creatorHash) external {
        require(msg.sender != _opponent, "Cannot play against yourself");

        _verifyProof(_proof, _creatorHash);

        uint256 _gameId = gameCount++;

        games[_gameId] = Game({
            gameId: _gameId,
            creator: msg.sender,
            creatorHash: _creatorHash,
            opponent: _opponent,
            opponentMove: Move.NoMove,
            status: GameStatus.WaitingForOpponent,
            winner: address(0)
        });

        emit GameCreated(_gameId, msg.sender, _opponent);
    }

    // For opponent to submit move
    function joinGame(uint256 gameId, uint256 _move) external {
        Game storage game = games[gameId];
        require(msg.sender == game.opponent, "Invalid opponent");
        require(game.status == GameStatus.WaitingForOpponent, "Unable to submit move");
        require(_move >= uint(Move.Rock) && _move <= uint(Move.Scissors), "Invalid move");

        Move move = Move(_move);
        game.opponentMove = move;
        game.status = GameStatus.WaitingForReveal;

        emit GameJoined(gameId, msg.sender);
    }

    // Game reveal
    function resolveGame(uint256 gameId, uint256 _move, uint256 _nonce) public {
        Game storage game = games[gameId];
        require(msg.sender == game.creator, "Only the game creator can reveal the move.");
        require(game.status == GameStatus.WaitingForReveal, "Game is not in reveal state.");
        require(_move >= uint(Move.Rock) && _move <= uint(Move.Scissors), "Invalid move");

        Move move = Move(_move);

        // Generate the hash of the move and nonce to check against the stored hash
        bytes32 computedHash = sha256(abi.encodePacked(_move + _nonce));
        require(computedHash == game.creatorHash, "Move and nonce do not match the committed hash.");

        // Determine the winner
        address winner = address(0); // default to no winner
        if (move == game.opponentMove) {
            winner = address(0); // Draw
        } else if ((move == Move.Rock && game.opponentMove == Move.Scissors) || (move == Move.Scroll && game.opponentMove == Move.Scissors) || (move == Move.Scissors && game.opponentMove == Move.Rock)) {
            winner = game.opponent;
        } else {
            winner = game.creator;
        }

        game.status = GameStatus.Finished;
        game.winner = winner;
        emit GameResolved(gameId, winner);
    }

    function getGameDetails(uint256 gameId) public view returns (Game memory) {
        return games[gameId];
    }

    function _verifyProof(bytes memory proof, bytes32 creatorHash) internal view {
        // bytes32[] memory publicInputs = new bytes32[](1);
        // publicInputs[0] = creatorHash;

        // require(verifier.verify(proof, publicInputs), "Invalid proof");
    }
}

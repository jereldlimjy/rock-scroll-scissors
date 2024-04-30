// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

contract RockScrollScissors {
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, address indexed opponent,  uint256 betAmount);
    event GameJoined(uint256 indexed gameId, address indexed opponent);
    event GameResolved(uint256 indexed gameId, address winner);
    event Payout(uint256 indexed gameId, address recipient, uint256 amount);

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
        uint256 betAmount;
    }

    // Variables
    IVerifier verifier;
    uint256 public gameCount = 0;
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public gamesByPlayer;

    constructor(address _verifierAddress) {
        verifier = IVerifier(_verifierAddress);
    }

    // Create a new game
    function createGame(address _opponent, uint256 _betAmount, bytes memory _proof, bytes32 _creatorHash, bytes32[] memory publicInput) external payable {
        require(msg.sender != _opponent, "Cannot play against yourself");
        require(msg.value == _betAmount, "Bet amount mismatch");

        _verifyProof(_proof, publicInput);

        uint256 _gameId = gameCount++;

        games[_gameId] = Game({
            gameId: _gameId,
            creator: msg.sender,
            creatorHash: _creatorHash,
            opponent: _opponent,
            opponentMove: Move.NoMove,
            status: GameStatus.WaitingForOpponent,
            winner: address(0),
            betAmount: _betAmount
        });
        gamesByPlayer[msg.sender].push(_gameId);
        gamesByPlayer[_opponent].push(_gameId);

        emit GameCreated(_gameId, msg.sender, _opponent, _betAmount);
    }

    // For opponent to submit move
    function joinGame(uint256 gameId, uint256 _move) external payable {
        Game storage game = games[gameId];
        require(msg.sender == game.opponent, "Invalid opponent");
        require(msg.value == game.betAmount, "Bet amount mismatch");
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
        address _winner = address(0); // default to no winner
        if (move == game.opponentMove) {
            _winner = address(0); // Draw
            (bool successCreator, ) = game.creator.call{ value: game.betAmount }("");
            (bool successOpponent, ) = game.opponent.call{ value: game.betAmount }("");
            require(successCreator);
            require(successOpponent);
        } else if ((move == Move.Rock && game.opponentMove == Move.Scroll) || (move == Move.Scroll && game.opponentMove == Move.Scissors) || (move == Move.Scissors && game.opponentMove == Move.Rock)) {
            _winner = game.opponent;
            (bool successOpponent, ) = game.opponent.call{ value: game.betAmount * 2 }("");
            require(successOpponent);
        } else {
            _winner = game.creator;
            (bool successCreator, ) = game.creator.call{ value: game.betAmount * 2 }("");
            require(successCreator);
        }

        game.status = GameStatus.Finished;
        game.winner = _winner;
        emit GameResolved(gameId, _winner);

        if (_winner != address(0)) {
            emit Payout(gameId, _winner, game.betAmount * 2);
        }
    }

    function getGamesByPlayer(address player) public view returns (uint256[] memory) {
        return gamesByPlayer[player];
    }

    function getGameDetails(uint256 gameId) public view returns (Game memory) {
        return games[gameId];
    }

    function _verifyProof(bytes memory proof, bytes32[] memory publicInput) internal view {
        require(verifier.verify(proof, publicInput), "Invalid proof");
    }
}

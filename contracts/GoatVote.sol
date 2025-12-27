// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract EncuestaDefinitivaGOAT is ReentrancyGuard {

    address public immutable owner;
    IERC20 public immutable usdt;

    uint256 public constant VOTE_PRICE = 1e17; // 0.1 USDT (18 decimales)

    uint256 public pulgaVotes;
    uint256 public bichoVotes;

    bool public paused;

    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter, uint8 option);
    event Withdraw(address indexed to, uint256 amount);
    event Paused(bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Encuesta pausada");
        _;
    }

    constructor(address _usdtAddress) {
        require(_usdtAddress != address(0), "USDT invalido");
        owner = msg.sender;
        usdt = IERC20(_usdtAddress);
    }

    // 1 = PulgaLovers | 2 = BichoLovers
    function vote(uint8 option) external nonReentrant whenNotPaused {
        require(option == 1 || option == 2, "Opcion invalida");
        require(!hasVoted[msg.sender], "Esta wallet ya voto");

        require(
            usdt.transferFrom(msg.sender, address(this), VOTE_PRICE),
            "Fallo pago USDT"
        );

        hasVoted[msg.sender] = true;

        if (option == 1) pulgaVotes++;
        else bichoVotes++;

        emit Voted(msg.sender, option);
    }

    function getResults() external view returns (uint256, uint256) {
        return (pulgaVotes, bichoVotes);
    }

    function pause(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function withdrawUSDT() external onlyOwner nonReentrant {
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "Sin fondos");

        emit Withdraw(owner, balance);

        require(usdt.transfer(owner, balance), "Fallo retiro");
    }
}

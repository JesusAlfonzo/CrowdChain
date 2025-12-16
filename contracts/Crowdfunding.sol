// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Crowdfunding {

    // --- VARIABLES DE ESTADO ---
    address public owner;       // Dueño del contrato
    uint public goal;           // Meta 
    uint public deadline;       // Fecha límite (timestamp)
    uint public collected;      // Dinero recaudado actual
    bool public completed;      // Estado de la campaña (Abierta/Cerrada)

    // --- MAPPING (BASE DE DATOS) ---
    mapping(address => uint) public contributions;

    // --- EVENTOS ---
    event ContributionMade(address donor, uint amount);
    event GoalReached(bool success, uint totalRaised);
    event RefundIssued(address recipient, uint amount);
    // --- CONSTRUCTOR ---
    constructor(uint _goal, uint _deadlineInMinutes) {
        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_deadlineInMinutes * 1 minutes);
        completed = false;
    }

    // --- FUNCIONES ---

    // 1. Donate (DONAR)
    function donate() external payable {
        require(block.timestamp < deadline, "Deadline has passed"); // Tiempo finalizado
        require(!completed, "Campaign is closed");                  // Campaña cerrada
        require(msg.value > 0, "Invalid donation amount");          // Donación inválida
        
        contributions[msg.sender] += msg.value;
        collected += msg.value;

        emit ContributionMade(msg.sender, msg.value);
    }

    // 2. Withdraw (RETIRAR DINERO - SOLO EL DUENO)
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(collected >= goal, "Goal not reached yet");
        require(!completed, "Campaign already closed");

        completed = true;
        
        // --- SEGURIDAD CRÍTICA (Check-Effects-Interactions) ---
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Transfer failed"); // Verificamos si salió bien

        emit GoalReached(true, collected);
    }

    // 3. Refund (DEVOLVER DINERO)
    function refund() external {
        require(block.timestamp >= deadline, "Campaign is still active");
        require(collected < goal, "Goal was reached, no refunds available");
        
        uint amountDonated = contributions[msg.sender];
        require(amountDonated > 0, "No contributions to refund");

        // --- SEGURIDAD CRÍTICA (Check-Effects-Interactions) ---
        // Primero ponemos el saldo a 0 en nuestra base de datos...
        contributions[msg.sender] = 0;

        // LUEGO enviamos el dinero. Esto evita ataques de reentrada.
        (bool success, ) = payable(msg.sender).call{value: amountDonated}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(msg.sender, amountDonated);
    }

    
}
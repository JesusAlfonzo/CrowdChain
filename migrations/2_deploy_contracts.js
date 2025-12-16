const Crowdfunding = artifacts.require("Crowdfunding");

module.exports = function(deployer) {
    // 1. Definimos la meta (Goal): 10 ETH
    const goalInWei = web3.utils.toWei("10", "ether");
    
    // 2. Definimos la duración: 60 minutos
    const durationInMinutes = 2;

    // 3. Desplegamos
    deployer.deploy(Crowdfunding, goalInWei, durationInMinutes);
};
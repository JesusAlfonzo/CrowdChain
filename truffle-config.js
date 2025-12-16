module.exports = {
  networks: {
    developments: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },

  // configuracion del compilador solidity
  compilers: {
    solc: {
      version: "0.8.17",
    },
  },
};

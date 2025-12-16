/**
 * APP.JS - Lógica del Frontend para CrowdChain
 * Principios: Clean Code, ES6+, Async/Await
 */

// =======================================================
// 1. CONFIGURACIÓN Y CONSTANTES
// =======================================================
const CONTRACT_ADDRESS = "0x0573439504882aF6507eB0b0855f34047E57FE36"; // <--- TU DIRECCIÓN
const TARGET_CHAIN_ID = "0x539"; // Ganache (1337 en Hex)

// ABI Minificado para mejor lectura del archivo
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_goal", type: "uint256" },
      { internalType: "uint256", name: "_deadlineInMinutes", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ContributionMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "success", type: "bool" },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRaised",
        type: "uint256",
      },
    ],
    name: "GoalReached",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RefundIssued",
    type: "event",
  },
  {
    inputs: [],
    name: "collected",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "completed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "contributions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "deadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [],
    name: "goal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Estado Global
let web3;
let contract;
let userAccount;
let campaignDeadline;

// =======================================================
// 2. INICIALIZACIÓN
// =======================================================
window.addEventListener("load", initApp);

async function initApp() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    console.log("✅ DApp Iniciada. MetaMask detectado.");
    setupEventListeners();

    // Timer Global (1 segundo)
    setInterval(() => {
      if (campaignDeadline) updateTimerUI();
    }, 1000);
  } else {
    Swal.fire(
      "MetaMask no detectado",
      "Por favor instala MetaMask para usar esta DApp",
      "warning"
    );
  }
}

function setupEventListeners() {
  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);
  document.getElementById("donateBtn").addEventListener("click", handleDonate);
  document
    .getElementById("withdrawBtn")
    .addEventListener("click", handleWithdraw);
  document.getElementById("refundBtn").addEventListener("click", handleRefund);
}

// =======================================================
// 3. CONEXIÓN Y RED
// =======================================================
async function connectWallet() {
  try {
    // 1. Verificar Red (Ganache)
    await checkNetwork();

    // 2. Solicitar Acceso
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    userAccount = accounts[0];

    // 3. Actualizar UI
    updateConnectionUI(userAccount);

    // 4. Cargar Datos
    await loadContractData();
    showMessage("Wallet conectada correctamente", "success");
  } catch (error) {
    console.error(error);
    showMessage("No se pudo conectar la wallet", "error");
  }
}

async function checkNetwork() {
  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (currentChainId !== TARGET_CHAIN_ID) {
      Swal.fire({
        title: "Red Incorrecta",
        text: "Cambiando a Ganache Local...",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_CHAIN_ID }],
      });
    }
  } catch (error) {
    // Error 4902: La red no existe en MetaMask
    if (error.code === 4902) {
      Swal.fire(
        "Red no encontrada",
        "Agrega Ganache (Localhost 7545 - ID 1337) a tu MetaMask",
        "error"
      );
    }
  }
}

function updateConnectionUI(account) {
  document.getElementById("userAccount").innerText = account;
  const btn = document.getElementById("connectWalletBtn");
  btn.innerText = "Conectado";
  btn.classList.add("bg-green-600", "cursor-default");
  btn.disabled = true;
}

// =======================================================
// 4. LECTURA DE DATOS (READ)
// =======================================================
async function loadContractData() {
  try {
    // Llamadas Paralelas para eficiencia
    const [goal, collected, isCompleted, deadlineVal] = await Promise.all([
      contract.methods.goal().call(),
      contract.methods.collected().call(),
      contract.methods.completed().call(),
      contract.methods.deadline().call(),
    ]);

    campaignDeadline = deadlineVal;

    // Guardar en Window para acceso rápido en el timer
    window.currentCollected = collected;
    window.currentGoal = goal;

    // Renderizar UI
    renderDashboard(goal, collected, isCompleted);
    updateTimerUI(); // Actualización inmediata

    // Cargar Historiales
    loadDonationHistory();
    loadWithdrawalHistory();
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function renderDashboard(goalWei, collectedWei, isCompleted) {
  const goalEth = web3.utils.fromWei(goalWei, "ether");
  const collectedEth = web3.utils.fromWei(collectedWei, "ether");

  document.getElementById("goalDisplay").innerText = goalEth;
  document.getElementById("collectedDisplay").innerText = collectedEth;

  // Barra de Progreso
  let percentage = (Number(collectedEth) / Number(goalEth)) * 100;
  if (percentage > 100) percentage = 100;
  document.getElementById("progressBar").style.width = `${percentage}%`;

  // Estado (Badge)
  const statusLabel = document.getElementById("statusDisplay");
  if (isCompleted) {
    statusLabel.innerText = "FINALIZADA";
    statusLabel.className =
      "px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30";
  } else {
    statusLabel.innerText = "ACTIVA";
    statusLabel.className =
      "px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse";
  }
}

function updateTimerUI() {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = campaignDeadline - now;

  const els = {
    timer: document.getElementById("timeLeft"),
    donate: document.getElementById("donateBtn"),
    withdraw: document.getElementById("withdrawBtn"),
    refund: document.getElementById("refundBtn"),
  };

  if (timeLeft > 0) {
    // CAMPAÑA ACTIVA
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    els.timer.innerText = `${m}m ${s}s`;
    els.timer.className = "text-indigo-400 font-bold font-mono";

    els.donate.disabled = false;
    els.donate.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Donar';
    els.withdraw.disabled = true;
    els.refund.disabled = true;
  } else {
    // TIEMPO AGOTADO
    els.timer.innerText = "Tiempo agotado ⌛";
    els.timer.className = "text-red-400 font-bold font-mono";
    els.donate.disabled = true;
    els.donate.innerText = "Campaña Cerrada";

    // Lógica Ganar/Perder
    const collectedBN = BigInt(window.currentCollected || 0);
    const goalBN = BigInt(window.currentGoal || 0);

    if (collectedBN >= goalBN) {
      els.withdraw.disabled = false;
      els.refund.disabled = true;
    } else {
      els.withdraw.disabled = true;
      els.refund.disabled = false;
    }
  }
}

// =======================================================
// 5. TRANSACCIONES (WRITE)
// =======================================================

async function handleDonate() {
  const amountEth = document.getElementById("donationAmount").value;
  if (!amountEth || amountEth <= 0)
    return showMessage("Ingresa una cantidad válida", "error");

  try {
    showMessage("Procesando donación...", "neutral");
    await contract.methods.donate().send({
      from: userAccount,
      value: web3.utils.toWei(amountEth, "ether"),
    });

    showMessage("¡Donación recibida!", "success");
    document.getElementById("donationAmount").value = "";
    loadContractData();
  } catch (error) {
    console.error(error);
    showMessage("Error en la transacción", "error");
  }
}

async function handleWithdraw() {
  try {
    showMessage("Procesando retiro...", "neutral");
    await contract.methods.withdraw().send({ from: userAccount });
    showMessage("Fondos retirados con éxito", "success");
    loadContractData();
  } catch (error) {
    handleTxError(error, "Solo el dueño puede retirar");
  }
}

async function handleRefund() {
  try {
    showMessage("Solicitando reembolso...", "neutral");
    await contract.methods.refund().send({ from: userAccount });
    showMessage("Reembolso enviado", "success");
    loadContractData();
  } catch (error) {
    handleTxError(error, "No tienes saldo para reembolsar");
  }
}

function handleTxError(error, customMsg) {
  console.error(error);
  let msg = "Operación rechazada";
  if (error.message.includes("revert")) msg = customMsg;
  showMessage(msg, "error");
}

// =======================================================
// 6. HISTORIAL DE EVENTOS
// =======================================================

async function loadDonationHistory() {
  const list = document.getElementById("donorsList");
  try {
    const events = await contract.getPastEvents("ContributionMade", {
      fromBlock: 0,
      toBlock: "latest",
    });
    if (events.length === 0) return;

    list.innerHTML = "";
    events
      .slice()
      .reverse()
      .forEach((event) => {
        const { donor, amount } = event.returnValues;
        const amountEth = web3.utils.fromWei(amount, "ether");
        const shortAddr = `${donor.substring(0, 6)}...${donor.substring(38)}`;

        list.innerHTML += createListItem(
          shortAddr,
          "Donante",
          `+ ${amountEth} ETH`,
          "text-green-400",
          "bg-indigo-500/10",
          "ph-user-circle text-indigo-400"
        );
      });
  } catch (e) {
    console.error(e);
  }
}

async function loadWithdrawalHistory() {
  const list = document.getElementById("withdrawalsList");
  try {
    const [withdrawals, refunds] = await Promise.all([
      contract.getPastEvents("GoalReached", {
        fromBlock: 0,
        toBlock: "latest",
      }),
      contract.getPastEvents("RefundIssued", {
        fromBlock: 0,
        toBlock: "latest",
      }),
    ]);

    const all = [...withdrawals, ...refunds].sort(
      (a, b) => b.blockNumber - a.blockNumber
    );
    if (all.length === 0) return;

    list.innerHTML = "";
    all.forEach((event) => {
      const isWithdraw = event.event === "GoalReached";
      const amount = web3.utils.fromWei(
        isWithdraw ? event.returnValues.totalRaised : event.returnValues.amount,
        "ether"
      );
      const title = isWithdraw ? "Retiro de Fondos" : "Reembolso";
      const user = isWithdraw
        ? "Dueño"
        : `${event.returnValues.recipient.substring(0, 6)}...`;
      const color = isWithdraw ? "text-yellow-400" : "text-red-400";
      const icon = isWithdraw
        ? "ph-trophy text-yellow-400"
        : "ph-arrow-u-down-left text-red-400";

      list.innerHTML += createListItem(
        user,
        title,
        `- ${amount} ETH`,
        color,
        "bg-slate-700",
        icon
      );
    });
  } catch (e) {
    console.error(e);
  }
}

// Helper para crear HTML de listas
function createListItem(
  title,
  subtitle,
  amount,
  amountColor,
  bgIcon,
  iconClass
) {
  return `
    <li class="p-4 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
        <div class="flex items-center gap-3">
            <div class="${bgIcon} p-2 rounded-full"><i class="ph-fill ${iconClass} text-xl"></i></div>
            <div class="flex flex-col"><span class="text-sm font-bold text-slate-200">${title}</span><span class="text-xs text-slate-500">${subtitle}</span></div>
        </div>
        <div class="text-right"><span class="block ${amountColor} font-bold text-sm">${amount}</span><span class="text-[10px] text-slate-600 font-mono">Blockchain</span></div>
    </li>`;
}

// =======================================================
// 7. UTILIDADES (UI)
// =======================================================
function showMessage(text, type) {
  const config = {
    background: "#1e293b",
    color: "#fff",
    confirmButtonColor: "#6366f1",
  };

  if (type === "neutral") {
    Swal.fire({
      ...config,
      title: text,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  } else {
    Swal.fire({
      ...config,
      title: type === "success" ? "¡Éxito!" : "Error",
      text: text,
      icon: type,
    });
  }
}

/* =======================
   CHEQUEOS INICIALES
======================= */
if (typeof ethers === "undefined") {
  alert("Ethers no cargó. Revisá conexión o AdBlock.");
  throw new Error("Ethers no disponible");
}

if (!window.ethereum) {
  alert("Necesitás MetaMask para participar");
  throw new Error("MetaMask no detectado");
}

/* =======================
   CONSTANTES
======================= */
const CONTRACT_ADDRESS = "0x356C906c3E0Cc5094081C98A3b03D8A357F310dF";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// ⚠️ Ajustá decimales si tu USDT es 18 (en BSC testnet suele serlo)
const VOTE_PRICE = ethers.utils.parseUnits("0.1", 18);

const CONTRACT_ABI = [
  "function vote(uint8 option)",
  "function getResults() view returns (uint256,uint256)",
  "function hasVoted(address) view returns (bool)"
];

const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const BNB_CHAIN = {
  chainId: "0x38",
  chainName: "BNB Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

/* =======================
   VARIABLES
======================= */
let provider;
let signer;
let contract;
let usdt;
let userAddress;

/* =======================
   HELPERS UI
======================= */
const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connect");
const voteBtns = document.querySelectorAll(".encuesta-btn");

function setStatus(msg, type = "info") {
  statusEl.innerText = msg;
  statusEl.className = `status ${type}`;
}

function disableVotes(disabled = true) {
  voteBtns.forEach(btn => {
    btn.disabled = disabled;
    btn.style.opacity = disabled ? "0.6" : "1";
    btn.style.cursor = disabled ? "not-allowed" : "pointer";
  });
}

/* =======================
   CAMBiO DE RED
======================= */

async function ensureBSCMainnet() {
  try {
    setStatus("Cambiando a BNB Chain…", "info");

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BNB_CHAIN.chainId }]
    });

  } catch (err) {
    if (err.code === 4902) {
      setStatus("Agregando BNB Chain a MetaMask…", "info");

      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BNB_CHAIN]
      });
    } else {
      throw err;
    }
  }
}
if (window.ethereum) {
  ethereum.on("chainChanged", () => {
    setStatus("Red cambiada, reconectando…", "info");

    setTimeout(() => {
      connectWallet();
    }, 1000);
  });
}

/* =======================
   CONECTAR WALLET
======================= */
async function connectWallet() {
  try {
    setStatus("Conectando wallet…", "info");

    await ethereum.request({ method: "eth_requestAccounts" });

    await ensureBSCMainnet();

    // ✅ SIEMPRE recrear después del switch
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    usdt = new ethers.Contract(
      USDT_ADDRESS,
      USDT_ABI,
      signer
    );

    connectBtn.disabled = true;
    connectBtn.innerText = "Wallet conectada";
    connectBtn.classList.add("connected");

    setStatus(
      `Wallet: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      "success"
    );

    // 🔒 Chequeo inmediato de voto
    const voted = await contract.hasVoted(userAddress);
    if (voted) {
      disableVotes(true);
      setStatus("Esta wallet ya votó 🗳️", "warning");
    } else {
      disableVotes(false);
    }

    await loadResults();

  } catch (err) {
    console.error(err);
    setStatus("Error al conectar wallet", "error");
  }
}


/* =======================
   VOTAR
======================= */
async function vote(option) {
  try {
    if (!contract || !signer) {
      setStatus("Conectá la wallet primero", "warning");
      return;
    }

    disableVotes(true);
    setStatus("Verificando estado…", "info");

    // 🔐 Re-chequeo on-chain
    const voted = await contract.hasVoted(userAddress);
    if (voted) {
      setStatus("Esta wallet ya votó", "warning");
      return;
    }

    // 💰 Allowance USDT
    const allowance = await usdt.allowance(userAddress, CONTRACT_ADDRESS);
    if (allowance.lt(VOTE_PRICE)) {
      setStatus("Aprobando USDT en MetaMask…", "info");
      const txApprove = await usdt.approve(CONTRACT_ADDRESS, VOTE_PRICE);
      await txApprove.wait();
    }

    setStatus("Confirmá el voto en MetaMask…", "info");
    const tx = await contract.vote(option);
    await tx.wait();

    setStatus("Voto registrado 🎉", "success");
    disableVotes(true);
    loadResults();

  } catch (err) {
    console.error(err);

    if (err.code === 4001) {
      setStatus("Transacción cancelada por el usuario", "warning");
    } else {
      setStatus("Error al emitir el voto", "error");
    }

    disableVotes(false);
  }
}

/* =======================
   RESULTADOS
======================= */
async function loadResults() {
  try {
    if (!contract) return;

    const res = await contract.getResults();

    // votos (BigNumber -> Number)
    const pulgaVotes = Number(res[0]);
    const bichoVotes = Number(res[1]);

    const totalVotes = pulgaVotes + bichoVotes;

    if (totalVotes === 0) {
      document.getElementById("results").innerText =
        "Todavía no hay votos registrados.";
      return;
    }

    const pulgaPct = ((pulgaVotes / totalVotes) * 100).toFixed(2);
    const bichoPct = ((bichoVotes / totalVotes) * 100).toFixed(2);

    document.getElementById("results").innerText =
      `PulgaLovers: ${pulgaPct}% | BichoLovers: ${bichoPct}%`;

  } catch (err) {
    console.error(err);
  }
}


/* =======================
   LISTENERS
======================= */
ethereum.on("accountsChanged", () => location.reload());
ethereum.on("chainChanged", () => location.reload());


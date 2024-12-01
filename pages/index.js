import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [trees, setTrees] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(1); 
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [plantFunding, setPlantFunding] = useState(1); 
  const [cutFunding, setCutFunding] = useState(1); 
  const [burnStatus, setBurnStatus] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async() => {
    if (atm) {
      const balanceCount = await atm.getBalance();
      const formattedBalance = ethers.utils.formatUnits(balanceCount, 0); // assuming 18 decimals
      setBalance(formattedBalance); // formatted as string, can be converted to number if necessary
    }
  }

  const getTrees = async () => {
    if (atm) {
      const treesCount = await atm.getTrees();
      const formattedTrees = ethers.utils.formatUnits(treesCount, 0);
      setTrees(formattedTrees);  // Update trees state
    }
  };

  const deposit = async () => {
    if (atm && depositAmount > 0) {
      let tx = await atm.deposit(depositAmount.toString());
      await tx.wait();  // Wait for the transaction to be confirmed
      getBalance();     // Update balance
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount > 0) {
      let tx = await atm.withdraw(withdrawAmount.toString());
      await tx.wait();  // Wait for the transaction to be confirmed
      getBalance();     // Update balance
    }
  };

  const plant = async () => {
    if(burnStatus === false){
      if (atm && plantFunding > 0) {
        let tx = await atm.plant(plantFunding.toString());
        await tx.wait();  // Wait for the transaction to be confirmed
        getBalance();     // Update balance
        getTrees();       // Update trees count
      }
    }
    else{
      setTrees(0);
      setBurnStatus(false);
    }  
  };

  const harvestWood = async () => {
    if (atm && cutFunding > 0) {
      let tx = await atm.harvestWood(cutFunding.toString());
      await tx.wait();  // Wait for the transaction to be confirmed
      getBalance();     // Update balance
      getTrees();       // Update trees count
    }
  };

  const burnEverything = async () => {
    if (atm) {
      const balanceCount = await atm.getBalance();
      if (parseInt(balanceCount) > 0 || trees > 0) {
        let tx = await atm.burnEverything();
        await tx.wait(); // Wait for transaction confirmation
        setBurnStatus(true); // Trigger fire rendering
  
        setBalance(0); // Immediately reset balance to 0
  
        // Delay setting trees to 0 by 5 seconds
        setTimeout(() => {
          setTrees(0);
          setBurnStatus(false); // Reset burn status after trees are cleared
        }, 5000);
      } else {
        alert("Nothing to burn!");
      }
    }
  };
  

  const renderIcons = () => {
    const icons = [];
    for (let i = 0; i < trees; i++) {
      icons.push(
        <img
          key={i}
          alt={burnStatus ? "🔥 " : "🌳 "}
          className={burnStatus ? "fire" : "tree"}
        />
      );
    }
    return icons;
  };
  
  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (trees === undefined) {
      getTrees();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <p>Trees Planted: {trees}</p>

        <div>
          <label>Deposit Amount (ETH): </label>
          <input
            type="number"
            min="0"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
        </div>

        <div>
          <label>Withdraw Amount (ETH): </label>
          <input
            type="number"
            min="0"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>

        <div>
          <label>Planting Trees (1 ETH = 10 Trees): </label>
          <input
            type="number"
            min="1"
            value={plantFunding}
            onChange={(e) => setPlantFunding(e.target.value)}
          />
          <button onClick={plant}>Plant Trees</button>
        </div>

        <div>
          <label>ETH(1 ETH cut 5 trees): </label>
          <input
            type="number"
            min="1"
            value={cutFunding}
            onChange={(e) => setCutFunding(e.target.value)}
          />
          <button onClick={harvestWood}>Cut Trees for Profit!</button>
        </div>
        <br />

        <button onClick={burnEverything}>Burn EVERYTHING</button>


        <div className="icon-container">
          {trees > 0 && renderIcons()}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Environmental ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        .tree-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .tree {
          width: 50px;
          height: 50px;
        }
      `}</style>
    </main>
  );
}

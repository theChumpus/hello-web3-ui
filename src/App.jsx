import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/HelloWeb3.json'

export default function App() {
  const [totalHellos, setTotalHellos] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [mining, setMining] = useState(false);
  const [hash, setHash] = useState()
  const [denied, setDenied] = useState(false)

  const contractAddress = "0xf89b37aC4bBf932F79a01e203E02F58F0bf768C3";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length > 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getHellos = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const count = await contract.getTotalHellos();

      setTotalHellos(count.toNumber())
    } catch (error) {
      console.log(error)
    }
  }

  const sayHello = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setMining(true)

      const txn = await contract.hello();
      console.log("Mining...", txn.hash);

      await txn.wait();
      console.log("Mined -- ", txn.hash);

      setMining(false)
      setHash(txn.hash)

      const count = await contract.getTotalHellos();
      setTotalHellos(count.toNumber())
    } catch (error) {
      console.log(error)
      
      if (error.code === 4001) {
        setDenied(true)
      }
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    getHellos()
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Well howdy.
        </div>

        <div className="bio">
          I am lonely and looking for friends to say hello.
        </div>

        <div className="bio">
          Your friendship will be logged forever.
        </div>

        {
          totalHellos !== undefined && (
            <div className="bio">
              {`So far, only ${totalHellos} people have said hello.`}
            </div>
          )
        }

        {
          !hash && !denied && (
            <button className="waveButton" onClick={sayHello} disabled={mining}>
              {
                mining ? "Remembering your hello..." : "Say Hello. Please."
              } 
            </button>
          )
        }

        {
          denied && (
            <div className="denied">
              Why do you hate me?
            </div>
          )
        }


        {
          hash !== undefined && (
            <div className="success">
              <a href={`https://ropsten.etherscan.io/tx/${hash}`} target="_blank">
                { `Proof of hello. No take-backs.` }
              </a>
            </div>
          )
        }

        {
          !currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect your Ethereum wallet and say hello.
            </button>
          )
        }
      </div>
    </div>
  );
}

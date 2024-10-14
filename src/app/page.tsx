'use client';

import Image from "next/image";
import { ConnectButton, MediaRenderer, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";
import TransferModal from "../components/TransferModal";

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = defineChain(sepolia);

  const [quantity, setQuantity] = useState(1);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Replace the address with the address of the deployed contract
  const contractAddress = "0x7276665BD6fF6749613C1CbC4f7c832259bEBC9E";
  const contract = getContract({
    client: client,
    chain: chain,
    address: contractAddress
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract(getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract(getTotalClaimedSupply,
    { contract: contract }
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract(getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }

  const handleClaim = async () => {
    if (!contract || !account) {
      setError("Please connect your wallet first.");
      return;
    }

    setError(null);

    try {
      const tx = await claimTo({
        contract: contract,
        to: account.address,
        quantity: BigInt(quantity),
      });
      console.log(tx);
      alert("NFT Claimed!");
      setIsTransferModalOpen(true);
    } catch (error) {
      console.error("Failed to claim NFT", error);
      setError("Failed to claim NFT. Please try again.");
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton
          client={client}
          chain={chain}
        />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">
                {contractMetadata?.description}
              </p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Supply: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          <button
            onClick={handleClaim}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {`Claim NFT (${getPrice(quantity)} ETH)`}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {isTransferModalOpen && (
          <TransferModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            contractAddress={contractAddress}
            client={client}
          />
        )}
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-row items-center">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        NFT Claim App
      </h1>
    </header>
  );
}

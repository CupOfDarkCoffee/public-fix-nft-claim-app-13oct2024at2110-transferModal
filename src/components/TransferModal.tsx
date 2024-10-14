import { useState } from 'react'
import { useContract, useAddress, Web3Button } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TransferModal({ tokenId }: { tokenId: string }) {
  const [recipient, setRecipient] = useState("")
  const address = useAddress()
  const { contract } = useContract("0x7276665BD6fF6749613C1CbC4f7c832259bEBC9E")

  const handleTransfer = async () => {
    if (!contract || !address) {
      console.error("Contract or address not available")
      return
    }

    try {
      const result = await contract.erc721.transfer(recipient, tokenId)
      console.log("Transfer successful", result)
      // Add any success handling here (e.g., close modal, show success message)
    } catch (error) {
      console.error("Transfer failed:", error)
      // Add any error handling here (e.g., show error message to user)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer NFT</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient address"
              className="col-span-3"
            />
          </div>
        </div>
        <Web3Button
          contractAddress="0x7276665BD6fF6749613C1CbC4f7c832259bEBC9E"
          action={(contract) => contract.erc721.transfer(recipient, tokenId)}
        >
          Confirm Transfer
        </Web3Button>
      </DialogContent>
    </Dialog>
  )
}
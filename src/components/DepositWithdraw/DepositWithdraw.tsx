import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import coboApi from '@/services/coboApi';

interface DepositWithdrawProps {
  isDeposit: boolean;
  isWithdraw: boolean;
  walletId: string;
  tokenId: string;
  closeModal: any;
}

const DepositWithdraw: React.FC<DepositWithdrawProps> = (props) => {
  const { isDeposit, isWithdraw, walletId, tokenId, closeModal = () => { } } = props;
  const [depositAddress, setDepositAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const handleDeposit = async () => {
    setDepositAddress('Loading...');
    try {
      // First, try to list all addresses for the current wallet
      const listAddressesResponse = await coboApi.listAddresses(walletId, tokenId);
      if (listAddressesResponse.status === "success" && listAddressesResponse.data.length > 0) {
        // If addresses exist, use the first one
        setDepositAddress(listAddressesResponse.data[0].address);
      } else {
        // If no addresses exist, create a new one
        const newAddressResponse = await coboApi.newAddress(walletId, tokenId);
        if (newAddressResponse.status === "success") {
          setDepositAddress(newAddressResponse.data.address);
        } else {
          throw new Error("Failed to create new address");
        }
      }
    } catch (error) {
      console.error("Error fetching deposit address:", error);
      setDepositAddress('Failed to fetch deposit address. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    try {
      await coboApi.withdrawFromWallet(walletId, {
        token: tokenId,
        amount: withdrawAmount,
        address: withdrawAddress,
      });
      alert('Withdrawal request submitted successfully');
      closeModal();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert(error);
    }
  };

  useEffect(() => {
    if (isDeposit) {
      handleDeposit();
    }
  }, [isDeposit])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded-lg">
        {isDeposit && (
          <>
            <h3 className="text-xl font-semibold mb-4">Deposit {tokenId}</h3>
            <p>Deposit Address:</p>
            <p className="bg-gray-100 p-2 rounded mt-2 min-w-96">{depositAddress}</p>
            <div className='flex justify-end mt-4'>
              <Button variant="outline" onClick={closeModal}>Close</Button>
            </div>
          </>
        )}

        {isWithdraw && (
          <>
            <h3 className="text-xl font-semibold mb-4">Withdraw {tokenId}</h3>
            <p>Withdraw Address:</p>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="Destination Address"
              className="border border-solid p-2 rounded mt-2 min-w-96"
            />
            <p className='mt-2'>Withdraw Amount:</p>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount"
              className="border border-solid p-2 rounded mt-2 min-w-96"
            />
            <div className='flex justify-end mt-4 space-x-2'>
              <Button variant="outline" onClick={closeModal}>Close</Button>
              <Button onClick={handleWithdraw} className="bg-blue-500 hover:bg-blue-600">Submit</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositWithdraw;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DepositWithdraw from '@/components/DepositWithdraw/DepositWithdraw';
import { Plus, Minus } from "lucide-react";
import coboApi from '@/services/coboApi';

interface TokenBalance {
  token_id: string;
  balance: {
    total: string;
    available: string;
    pending: string;
    locked: string;
  };
}

interface PaginationData {
  before: string;
  after: string;
  total_count: number;
}

interface WalletInfo {
  wallet_id: string;
  wallet_type: string;
  wallet_subtype: string;
  name: string;
  org_id: string;
}


const Wallet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({ before: "", after: "", total_count: 0 });
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>('');

  const fetchTokenBalances = async (cursor?: string, direction: 'before' | 'after' = 'after') => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await coboApi.getWalletBalance(id);
      if (data.status === "success") {
        setTokenBalances(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error("Received unsuccessful status from server");
      }
    } catch (error) {
      console.error("Error fetching token balances:", error);
      setError("Failed to fetch token balances. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletInfo = async () => {
    if (!id) return;

    try {
      const data = await coboApi.getWalletById(id);
      if (data.status === "success") {
        setWalletInfo(data.data);
      } else {
        throw new Error("Received unsuccessful status from server");
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      setError("Failed to fetch wallet information. Please try again later.");
    }
  };

  useEffect(() => {
    fetchWalletInfo();
    fetchTokenBalances();
  }, [id]);

  const handlePrevious = () => {
    if (pagination.before) {
      fetchTokenBalances(pagination.before, 'before');
    }
  };

  const handleNext = () => {
    if (pagination.after) {
      fetchTokenBalances(pagination.after, 'after');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    return (
      <>
        {walletInfo && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-2">Wallet Information</h3>
            <p><strong>Name:</strong> {walletInfo.name}</p>
            <p><strong>Wallet ID:</strong> {walletInfo.wallet_id}</p>
            <p><strong>Organization ID:</strong> {walletInfo.org_id}</p>
            <p><strong>Type:</strong> {walletInfo.wallet_type}</p>
            <p><strong>Subtype:</strong> {walletInfo.wallet_subtype}</p>
          </div>
        )}

        {tokenBalances.length === 0 ? (
          <p>No token balances found for this wallet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Locked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenBalances.map((token) => (
                  <TableRow key={token.token_id}>
                    <TableCell>{token.token_id}</TableCell>
                    <TableCell>{token.balance.total}</TableCell>
                    <TableCell>{token.balance.available}</TableCell>
                    <TableCell>{token.balance.pending}</TableCell>
                    <TableCell>{token.balance.locked}</TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedToken(token.token_id);
                            setIsDepositModalOpen(true);
                          }}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="mr-1 h-4 w-4" /> Deposit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedToken(token.token_id);
                            setIsWithdrawModalOpen(true);
                          }}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Minus className="mr-1 h-4 w-4" /> Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Total records: {pagination.total_count}
          </div>
          <div className="space-x-2">
            <Button
              onClick={handlePrevious}
              disabled={!pagination.before}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!pagination.after}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">Wallet Details</h2>
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
      {(isDepositModalOpen || isWithdrawModalOpen) && (
        <DepositWithdraw
          isDeposit={isDepositModalOpen}
          isWithdraw={isWithdrawModalOpen}
          walletId={id || ''}
          tokenId={selectedToken}
          closeModal={() => {
            setIsDepositModalOpen(false);
            setIsWithdrawModalOpen(false);
          }}
        ></DepositWithdraw>
      )}
    </>
  );
};

export default Wallet;
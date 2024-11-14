import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import coboApi from '@/services/coboApi';

interface PaginationData {
  before: string;
  after: string;
  total_count: number;
}

interface Transaction {
  transaction_id: string;
  type: string;
  token_id: string;
  status: string;
  created_timestamp: number;
  source: {
    source_type: string;
    addresses?: string[];
    wallet_id?: string;
  };
  destination: {
    destination_type: string;
    address?: string;
    wallet_id?: string;
    amount: string;
  };
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({ before: "", after: "", total_count: 0 });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const walletId = searchParams.get('wallet_id');

  const fetchTransactions = async (cursor?: string, direction: 'before' | 'after' = 'after') => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (cursor) {
        params[direction] = cursor;
      }
      if (walletId) {
        params.wallet_ids = walletId;
      }

      const result = await coboApi.listTransactions(params);
      if (result.status === "success") {
        setTransactions(result.data);
        setPagination(result.pagination);
      } else {
        setError('Failed to load transactions');
        setTransactions([]);
      }
    } catch (err) {
      setError('Failed to load transactions. Please try again later.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId]);

  const handlePrevious = () => {
    if (pagination.before) {
      fetchTransactions(pagination.before, 'before');
    }
  };

  const handleNext = () => {
    if (pagination.after) {
      fetchTransactions(pagination.after, 'after');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getFromAddress = (transaction: Transaction) => {
    if (transaction.type === 'Deposit') {
      return transaction.source.addresses?.[0] || 'Unknown';
    } else {
      return transaction.source.wallet_id || 'Unknown';
    }
  };

  const getToAddress = (transaction: Transaction) => {
    if (transaction.type === 'Deposit') {
      return transaction.destination.wallet_id || 'Unknown';
    } else {
      return transaction.destination.address || 'Unknown';
    }
  };

  return (
        <div className="flex-1 p-8">
          <h2 className="text-3xl font-bold mb-6">
            {walletId ? `Transactions for Wallet ${walletId}` : 'All Transactions'}
          </h2>
          {loading && <p>Loading transactions...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              {transactions.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: Transaction) => (
                        <TableRow key={transaction.transaction_id}>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.token_id}</TableCell>
                          <TableCell>{transaction.destination.amount}</TableCell>
                          <TableCell>{transaction.status}</TableCell>
                          <TableCell>{formatDate(transaction.created_timestamp)}</TableCell>
                          <TableCell>{getFromAddress(transaction)}</TableCell>
                          <TableCell>{getToAddress(transaction)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Add Pagination Controls */}
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
              )}
            </>
          )}
        </div>
  );
};

export default Transactions;
import React, { useState, useEffect } from "react";
import { Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import coboApi from '@/services/coboApi';

interface WalletData {
  wallet_id: string;
  name: string;
  wallet_type: string;
  wallet_subtype: string;
}

interface PaginationData {
  before: string;
  after: string;
  total_count: number;
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationData>({ before: "", after: "", total_count: 0 });
  const navigate = useNavigate();

  const fetchWallets = async (tabName: string, cursor?: string, direction: 'before' | 'after' = 'after') => {
    setLoading(true);
    const params: any = {};
    
    if (tabName !== "All") {
      params.wallet_type = tabName;
    }
    if (cursor) {
      params[direction] = cursor;
    }

    try {
      console.log("Fetching wallets with params:", params);
      const data = await coboApi.getWallets(params);
      if (data.status === "success") {
        // Filter out null values and ensure all wallet objects have the required properties
        const validWallets = data.data.filter((wallet: WalletData | null): wallet is WalletData => 
          wallet !== null && 
          typeof wallet === 'object' && 
          'wallet_id' in wallet &&
          'name' in wallet &&
          'wallet_type' in wallet &&
          'wallet_subtype' in wallet
        );
        setWallets(validWallets);
        setPagination(data.pagination);
      } else {
        console.error("Error fetching wallets:", data);
        setWallets([]);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets(activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handlePrevious = () => {
    if (pagination.before) {
      fetchWallets(activeTab, pagination.before, 'before');
    }
  };

  const handleNext = () => {
    if (pagination.after) {
      fetchWallets(activeTab, pagination.after, 'after');
    }
  };

  return (
        <div className="flex-1 p-8">
          <h2 className="text-3xl font-bold mb-6">Wallets</h2>
          <div className="space-y-6">
            {/* Wallet type tabs */}
            <div className="flex space-x-2 mb-4">
              {["All", "Custodial", "MPC", "SmartContract", "Exchange"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>

            {/* Wallet table */}
            {loading ? (
              <p>Loading...</p>
            ) : wallets.length === 0 ? (
              <p>No wallets found.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subtype</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.wallet_id}>
                        <TableCell>{wallet.wallet_id}</TableCell>
                        <TableCell>{wallet.name}</TableCell>
                        <TableCell>{wallet.wallet_type}</TableCell>
                        <TableCell>{wallet.wallet_subtype}</TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => navigate(`/wallet/${wallet.wallet_id}`)}
                            >
                              <Eye className="mr-1 h-4 w-4" /> View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => navigate(`/transactions?wallet_id=${wallet.wallet_id}`)}
                            >
                              <History className="mr-1 h-4 w-4" /> Transaction
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            )}
          </div>
        </div>
  );
};

export default Home;
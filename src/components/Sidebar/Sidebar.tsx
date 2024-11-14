import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { History, PencilRuler, Wallet } from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Wallets');

  const tabs = useMemo(() => {
    return [
      {
        key: 'Wallets',
        path: '/',
        icon: <Wallet className="mr-2 h-4 w-4" />,
      },
      {
        key: 'Transactions',
        path: '/transactions',
        icon: <History className="mr-2 h-4 w-4" />,
      },
      // %if app_type == portal
      {
        key: 'UI Toolkit',
        path: '/toolkit',
        icon: <PencilRuler className="mr-2 h-4 w-4" />,
      },
      // %endif
    ];
  }, []);

  return (
    <div className="w-64 bg-gray-900 text-white p-4 fixed inset-y-0 z-10">
      <h1 className="text-2xl font-bold mb-6">React Template</h1>
      <nav className="space-y-4">
        {
          tabs.map((tab) => {
            return (
              <Button
                key={tab.key}
                variant="ghost"
                className={`w-full justify-start text-white ${activeTab === tab.key ? 'bg-gray-600' : 'hover:bg-gray-800'}`}
                onClick={() => {
                  setActiveTab(tab.key);
                  navigate(tab.path);
                }}
              >
                {tab.icon}{tab.key}
              </Button>
            );
          })
        }
      </nav>
    </div>
  );
};

export default Sidebar;
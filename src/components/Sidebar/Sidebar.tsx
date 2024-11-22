import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { History, PencilRuler, Wallet } from "lucide-react";
// %if app_type == portal
import useAuth from '@/hooks/auth';
import coboApi from '@/services/coboApi';
// %endif

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Wallets');
  // %if app_type == portal
  const { isLoggedIn, accessToken, setDefaultAccessToken } = useAuth();
  const { pathname } = useLocation();
  // %endif

  const tabs = useMemo(() => {
    // %if app_type == portal
    if (pathname === '/auth' && !isLoggedIn) return [];
    // %endif
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
  }, [
    // %if app_type == portal
    pathname, isLoggedIn
    // %endif
  ]);

  // %if app_type == portal
  useEffect(() => {
    if (!isLoggedIn && pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isLoggedIn, navigate, pathname]);

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      coboApi.setAuthToken(accessToken);
    }
  }, [isLoggedIn, accessToken])

  useEffect(() => {
    setDefaultAccessToken();
  }, [setDefaultAccessToken]);
  // %endif

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
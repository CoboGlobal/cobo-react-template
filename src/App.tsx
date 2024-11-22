import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from "@/components/Sidebar/Sidebar";
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import { Provider } from 'jotai';
import { atomStore } from '@/hooks';
import Home from '@/pages/Home';
// %if app_type == portal
import Auth from './pages/Auth';
import Toolkit from './toolkit/Toolkit';
// %endif

function App() {
  return (
    <Provider store={atomStore}>
      <Router>
        <Sidebar />
        <div className="flex min-h-screen bg-white ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/wallet/:id" element={<Wallet />} />
            {/* %if app_type == portal */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/toolkit" element={<Toolkit />} />
            {/* %endif */}
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from "@/components/Sidebar/Sidebar";
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
// %if app_type == portal
import Toolkit from './toolkit/Toolkit';
// %endif

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="flex min-h-screen bg-white ml-64">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet/:id" element={<Wallet />} />
          {/* %if app_type == portal */}
          <Route path="/toolkit" element={<Toolkit />} />
          {/* %endif */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
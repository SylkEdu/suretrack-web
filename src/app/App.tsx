import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Filter,
  Download,
  ArrowRightLeft
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import OperationsTable from './components/OperationsTable';
import CostsTable from './components/CostsTable';

interface User {
  uid: string;
  email: string;
  name?: string;
  bancaInicial?: number;
}

export type Operation = {
  id: string;
  date: string;
  time: string;
  event: string;
  houseA: string;
  houseB: string;
  oddA: number;
  oddB: number;
  betA: number;
  betB: number;
  winner?: 'A' | 'B' | '';
  notes?: string;
};

export type Manuseio = {
  id: string;
  date: string;
  description: string;
  value: number;
};

export type AppData = {
  initialBankroll: number;
  operations: Operation[];
  manuseios: Manuseio[];
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'operations' | 'manuseios'>('dashboard');
  const [data, setData] = useState<AppData>({
    initialBankroll: 10000,
    operations: [],
    manuseios: []
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('surebet_user');
    const storedData = localStorage.getItem('surebet_data');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Migration: Rename 'costs' to 'manuseios' if it exists in old data
      if (parsedData.costs && !parsedData.manuseios) {
        parsedData.manuseios = parsedData.costs;
        delete parsedData.costs;
      }
      
      setData(parsedData);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('surebet_data', JSON.stringify(data));
    }
  }, [data, user]);

  const handleLogin = (newUser: any) => {
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('surebet_user', JSON.stringify(newUser));
      
      // Update bankroll based on user data
      if (newUser.bancaInicial) {
        setData(prev => ({ ...prev, initialBankroll: newUser.bancaInicial }));
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('surebet_user');
  };

  const updateData = (updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'operations', label: 'Operações', icon: TrendingUp },
    { id: 'manuseios', label: 'Manuseio', icon: ArrowRightLeft }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1421] to-[#1a1f35]" style={{ fontFamily: 'Sora, sans-serif' }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative border-b border-white/5 bg-[#0f172a]/50 backdrop-blur-xl"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                SureBet Pro
              </h1>
              <p className="text-xs text-slate-400">Gestão de Arbitragem Esportiva</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Usuário</p>
              <p className="text-sm text-white font-medium">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-[1600px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard data={data} updateData={updateData} />
            </motion.div>
          )}

          {activeTab === 'operations' && (
            <motion.div
              key="operations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OperationsTable data={data} updateData={updateData} />
            </motion.div>
          )}

          {activeTab === 'manuseios' && (
            <motion.div
              key="manuseios"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CostsTable data={data} updateData={updateData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

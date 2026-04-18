import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  BarChart3,
  LogOut,
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
  idToken: string;
}

export type Operation = {
  id: string;
  date: string;
  time: string;
  event: string;
  houseA: string;
  houseB: string;
  houseC?: string;
  oddA: number;
  oddB: number;
  oddC?: number;
  betA: number;
  betB: number;
  betC?: number;
  winner?: 'A' | 'B' | 'C' | '';
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
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Helper: safely parse JSON (avoids crash when API returns HTML error page)
  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Erro do servidor (${res.status}): Verifique as variáveis de ambiente Firebase na Vercel.`);
    }
  };

  // Helper: fetch with auth token
  const authFetch = useCallback(
    (url: string, options: RequestInit = {}) => {
      if (!user?.idToken) throw new Error('Não autenticado');
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.idToken}`,
          ...(options.headers || {}),
        },
      });
    },
    [user]
  );

  // Load operations and manuseios from Firebase when user logs in
  const loadData = useCallback(
    async (token: string, bancaInicial: number) => {
      setIsLoadingData(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [opsRes, expsRes] = await Promise.all([
          fetch('/api/operations/list', { headers }),
          fetch('/api/expenses/list', { headers }),
        ]);

        let ops = [];
        let exps = [];

        if (opsRes.ok) {
          const text = await opsRes.text();
          try { ops = JSON.parse(text); } catch { console.error('Falha ao parsear operações'); }
        } else {
          const text = await opsRes.text();
          console.error('Erro ao carregar operações:', opsRes.status, text.slice(0, 200));
        }

        if (expsRes.ok) {
          const text = await expsRes.text();
          try { exps = JSON.parse(text); } catch { console.error('Falha ao parsear manuseios'); }
        } else {
          const text = await expsRes.text();
          console.error('Erro ao carregar manuseios:', expsRes.status, text.slice(0, 200));
        }

        // Map API fields to frontend Operation shape
        const operations: Operation[] = ops.map((op: any) => ({
          id: op.id,
          date: op.date,
          time: op.time || '',
          event: op.event || '',
          houseA: op.casaA || op.houseA || '',
          houseB: op.casaB || op.houseB || '',
          houseC: op.casaC || op.houseC || '',
          oddA: op.oddA || 0,
          oddB: op.oddB || 0,
          oddC: op.oddC || 0,
          betA: op.apostaA ?? op.betA ?? 0,
          betB: op.apostaB ?? op.betB ?? 0,
          betC: op.apostaC ?? op.betC ?? 0,
          winner: op.winner || '',
          notes: op.notes || '',
        }));

        const manuseios: Manuseio[] = exps.map((m: any) => ({
          id: m.id,
          date: m.date,
          description: m.description || '',
          value: m.value || 0,
        }));

        setData({ initialBankroll: bancaInicial, operations, manuseios });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoadingData(false);
      }
    },
    []
  );

  // Restore session from localStorage (token only)
  useEffect(() => {
    const storedUser = localStorage.getItem('surebet_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        loadData(parsed.idToken, parsed.bancaInicial ?? 10000);
      } catch {
        localStorage.removeItem('surebet_user');
      }
    }
  }, [loadData]);

  const handleLogin = (newUser: any) => {
    if (!newUser) return;
    const userWithToken: User = {
      uid: newUser.uid,
      email: newUser.email,
      name: newUser.name,
      bancaInicial: newUser.bancaInicial ?? 10000,
      idToken: newUser.idToken,
    };
    setUser(userWithToken);
    // Save only auth info (not data) to localStorage
    localStorage.setItem('surebet_user', JSON.stringify(userWithToken));
    loadData(newUser.idToken, newUser.bancaInicial ?? 10000);
  };

  const handleLogout = () => {
    setUser(null);
    setData({ initialBankroll: 10000, operations: [], manuseios: [] });
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
                SureTrack
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

      {/* Loading overlay */}
      {isLoadingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Carregando dados do Firebase...</p>
          </div>
        </div>
      )}

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
              <OperationsTable data={data} updateData={updateData} authFetch={authFetch} />
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
              <CostsTable data={data} updateData={updateData} authFetch={authFetch} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

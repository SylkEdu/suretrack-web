import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Wallet,
  BarChart3,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { AppData, Operation } from '../App';

interface DashboardProps {
  data: AppData;
  updateData: (updates: Partial<AppData>) => void;
}

export default function Dashboard({ data, updateData }: DashboardProps) {
  const [isEditingBankroll, setIsEditingBankroll] = useState(false);
  const [bankrollInput, setBankrollInput] = useState(data.initialBankroll.toString());

  // Calculate metrics
  const calculateMetrics = () => {
    const totalBets = data.operations.reduce((sum, op) => sum + op.betA + op.betB, 0);
    const totalProfits = data.operations.reduce((sum, op) => {
      if (!op.winner) return sum;
      const profitA = (op.oddA * op.betA) - (op.betA + op.betB);
      const profitB = (op.oddB * op.betB) - (op.betA + op.betB);
      return sum + (op.winner === 'A' ? profitA : profitB);
    }, 0);

    const totalManuseios = data.manuseios.reduce((sum, m) => sum + m.value, 0);
    const netProfit = totalProfits; // Lucro líquido puramente das operações
    const currentBankroll = data.initialBankroll + netProfit + totalManuseios; // Banca = Inicial + Lucro das Apostas + Aportes/Saques
    const operationsWithWinner = data.operations.filter(op => op.winner).length;
    const avgProfitPerOperation = operationsWithWinner > 0 ? totalProfits / operationsWithWinner : 0;
    const roi = totalBets > 0 ? (totalProfits / totalBets) * 100 : 0;

    return {
      initialBankroll: data.initialBankroll,
      currentBankroll,
      totalProfits,
      totalManuseios,
      netProfit,
      avgProfitPerOperation,
      roi,
      totalOperations: data.operations.length,
      completedOperations: operationsWithWinner
    };
  };

  const metrics = calculateMetrics();

  // Calculate chart data (evolution over time)
  const getChartData = () => {
    let runningBalance = data.initialBankroll;
    const points: { date: string; balance: number; profit: number }[] = [
      { date: 'Início', balance: data.initialBankroll, profit: 0 }
    ];

    // Combine operations and costs, sort by date
    const events: Array<{ date: string; type: 'operation' | 'cost'; value: number }> = [];

    data.operations.forEach(op => {
      if (op.winner) {
        const profitA = (op.oddA * op.betA) - (op.betA + op.betB);
        const profitB = (op.oddB * op.betB) - (op.betA + op.betB);
        const profit = op.winner === 'A' ? profitA : profitB;
        events.push({ date: op.date, type: 'operation', value: profit });
      }
    });

    data.manuseios.forEach(m => {
      events.push({ date: m.date, type: 'cost', value: m.value });
    });

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    events.forEach(event => {
      runningBalance += event.value;
      const dateObj = new Date(event.date);
      const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
      points.push({
        date: formattedDate,
        balance: runningBalance,
        profit: event.value
      });
    });

    return points.length > 1 ? points : [
      { date: 'Início', balance: data.initialBankroll, profit: 0 },
      { date: 'Atual', balance: data.initialBankroll, profit: 0 }
    ];
  };

  const chartData = getChartData();

  const handleSaveBankroll = () => {
    const value = parseFloat(bankrollInput);
    if (!isNaN(value) && value > 0) {
      updateData({ initialBankroll: value });
      setIsEditingBankroll(false);
    }
  };

  const statCards = [
    {
      label: 'Banca Inicial',
      value: metrics.initialBankroll,
      icon: Wallet,
      color: 'from-blue-500 to-cyan-500',
      editable: true
    },
    {
      label: 'Banca Atual',
      value: metrics.currentBankroll,
      icon: DollarSign,
      color: 'from-indigo-500 to-purple-500',
      change: metrics.netProfit
    },
    {
      label: 'Retorno Total',
      value: metrics.totalProfits,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      positive: true
    },
    {
      label: 'Saldo de Manuseio (Aportes/Saídas)',
      value: metrics.totalManuseios,
      icon: ArrowRightLeft,
      color: metrics.totalManuseios >= 0 ? 'from-emerald-500 to-green-500' : 'from-red-500 to-rose-500',
      positive: metrics.totalManuseios >= 0,
      negative: metrics.totalManuseios < 0
    },
    {
      label: 'Saldo Líquido',
      value: metrics.netProfit,
      icon: Target,
      color: metrics.netProfit >= 0 ? 'from-emerald-500 to-green-500' : 'from-red-500 to-rose-500',
      highlight: true
    },
    {
      label: 'Lucro Médio/Op',
      value: metrics.avgProfitPerOperation,
      icon: BarChart3,
      color: 'from-amber-500 to-orange-500',
      subtitle: `${metrics.completedOperations} ops concluídas`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.value > 0;
          const isNegative = card.value < 0;

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group h-full"
            >
              {/* Glow effect on hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300`} />

              <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {card.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      card.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {card.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {card.change >= 0 ? '+' : ''}R$ {card.change.toFixed(2)}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-1">{card.label}</p>

                {card.editable && isEditingBankroll ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bankrollInput}
                      onChange={(e) => setBankrollInput(e.target.value)}
                      onBlur={handleSaveBankroll}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBankroll()}
                      className="flex-1 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-lg font-bold focus:outline-none focus:border-indigo-500"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    className={`text-2xl font-bold ${
                      card.highlight
                        ? card.value >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                        : 'text-white'
                    }`}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    onClick={() => card.editable && setIsEditingBankroll(true)}
                  >
                    {card.value >= 0 && !card.negative ? '+' : ''}R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}

                <div className="min-h-[20px] mt-1">
                  {card.subtitle && (
                    <p className="text-xs text-slate-500">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ROI Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
        <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">ROI (Return on Investment)</p>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.roi >= 0 ? '+' : ''}{metrics.roi.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Baseado em {metrics.totalOperations} operações ({metrics.completedOperations} concluídas)
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
        <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Evolução do Saldo
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontFamily: 'Sora, sans-serif' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#e8edf5', marginBottom: '4px' }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Saldo'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorBalance)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

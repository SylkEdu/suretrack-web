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
  ArrowRightLeft,
  Calendar,
  Filter,
  ChevronDown
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
  const [selectedMonth, setSelectedMonth] = useState(''); // '' means All Months

  const MONTHS = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Calculate metrics
  const calculateMetrics = () => {
    // Filter operations and manuseios by selected month
    const filteredOps = selectedMonth 
      ? data.operations.filter(op => op.date.split('-')[1] === selectedMonth)
      : data.operations;
    
    const filteredManuseios = selectedMonth
      ? data.manuseios.filter(m => m.date.split('-')[1] === selectedMonth)
      : data.manuseios;

    const totalBets = filteredOps.reduce((sum, op) => sum + op.betA + op.betB, 0);
    const totalProfits = filteredOps.reduce((sum, op) => {
      if (!op.winner) return sum;
      const profitA = (op.oddA * op.betA) - (op.betA + op.betB);
      const profitB = (op.oddB * op.betB) - (op.betA + op.betB);
      return sum + (op.winner === 'A' ? profitA : profitB);
    }, 0);

    const totalManuseios = filteredManuseios.reduce((sum, m) => sum + m.value, 0);
    
    // For "Global" values, we still need the total across all time
    const allTimeProfits = data.operations.reduce((sum, op) => {
      if (!op.winner) return sum;
      const profitA = (op.oddA * op.betA) - (op.betA + op.betB);
      const profitB = (op.oddB * op.betB) - (op.betA + op.betB);
      return sum + (op.winner === 'A' ? profitA : profitB);
    }, 0);
    const allTimeManuseios = data.manuseios.reduce((sum, m) => sum + m.value, 0);

    const netProfit = totalProfits; 
    const currentBankroll = data.initialBankroll + allTimeProfits + allTimeManuseios; 
    
    const operationsWithWinner = filteredOps.filter(op => op.winner).length;
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
      totalOperations: filteredOps.length,
      completedOperations: operationsWithWinner
    };
  };

  const metrics = calculateMetrics();

  // Calculate chart data (evolution over time)
  const getChartData = () => {
    // Combine operations and costs, sort by date
    const allEvents: Array<{ date: string; value: number }> = [];

    data.operations.forEach(op => {
      if (op.winner) {
        const profitA = (op.oddA * op.betA) - (op.betA + op.betB);
        const profitB = (op.oddB * op.betB) - (op.betA + op.betB);
        const profit = op.winner === 'A' ? profitA : profitB;
        allEvents.push({ date: op.date, value: profit });
      }
    });

    data.manuseios.forEach(m => {
      allEvents.push({ date: m.date, value: m.value });
    });

    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = data.initialBankroll;
    
    // If month is selected, find the starting balance for that month
    if (selectedMonth) {
      const eventsBeforeMonth = allEvents.filter(e => e.date.split('-')[1] < selectedMonth);
      const startingBalanceForMonth = data.initialBankroll + eventsBeforeMonth.reduce((sum, e) => sum + e.value, 0);
      
      const monEvents = allEvents.filter(e => e.date.split('-')[1] === selectedMonth);
      
      const points = [{ date: 'Início do Mês', balance: startingBalanceForMonth, profit: 0 }];
      let currentBal = startingBalanceForMonth;
      
      monEvents.forEach(e => {
        currentBal += e.value;
        const d = new Date(e.date);
        points.push({
          date: `${d.getDate()}/${d.getMonth() + 1}`,
          balance: currentBal,
          profit: e.value
        });
      });
      
      return points.length > 1 ? points : [
        { date: 'Sem Dados', balance: startingBalanceForMonth, profit: 0 },
        { date: '-', balance: startingBalanceForMonth, profit: 0 }
      ];
    } else {
      // All time view
      const points = [{ date: 'Início', balance: data.initialBankroll, profit: 0 }];
      allEvents.forEach(e => {
        runningBalance += e.value;
        const d = new Date(e.date);
        points.push({
          date: `${d.getDate()}/${d.getMonth() + 1}`,
          balance: runningBalance,
          profit: e.value
        });
      });
      return points;
    }
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
      {/* Dashboard Header with Month Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Visão Geral
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {selectedMonth ? `Resultados de ${MONTHS.find(m => m.value === selectedMonth)?.label}` : 'Desempenho acumulado de todo o período'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/filter">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-xl blur opacity-0 group-focus-within/filter:opacity-100 transition duration-500" />
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-11 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all font-medium min-w-[180px] cursor-pointer"
              >
                <option value="">Todos os Meses</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

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

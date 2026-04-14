import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { AppData, Operation } from '../App';

const BOOKMAKERS = [
  'Bet-Bra TB', 'Bet7K', 'BetBoom', 'BetEsporte', 'Betano', 'Betfair SB', 
  'Betfast', 'Betnacional', 'Blaze', 'EstrelaBet', 'F12Bet', 'Luvabet', 
  'Novibet', 'Pinnacle', 'Rivalo', 'Sportingbet', 'Sportybet', 'Stake', 
  'Superbet', 'Vaidebet', 'Vbet', 'Vivasorte'
];

interface OperationsTableProps {
  data: AppData;
  updateData: (updates: Partial<AppData>) => void;
}

export default function OperationsTable({ data, updateData }: OperationsTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Operation>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [newOp, setNewOp] = useState<Partial<Operation>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    event: '',
    houseA: '',
    houseB: '',
    oddA: 0,
    oddB: 0,
    betA: 0,
    betB: 0,
    winner: '',
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const calculateOpMetrics = (op: Operation) => {
    const totalBet = op.betA + op.betB;
    const profitA = (op.oddA * op.betA) - totalBet;
    const profitB = (op.oddB * op.betB) - totalBet;
    const actualProfit = !op.winner ? 0 : op.winner === 'A' ? profitA : profitB;
    const roi = totalBet > 0 ? (actualProfit / totalBet) * 100 : 0;

    return { totalBet, profitA, profitB, actualProfit, roi };
  };

  const handleAddOperation = () => {
    if (!newOp.event || !newOp.houseA || !newOp.houseB) return;

    const operation: Operation = {
      id: Date.now().toString(),
      date: newOp.date!,
      time: newOp.time!,
      event: newOp.event!,
      houseA: newOp.houseA!,
      houseB: newOp.houseB!,
      oddA: Number(newOp.oddA) || 0,
      oddB: Number(newOp.oddB) || 0,
      betA: Number(newOp.betA) || 0,
      betB: Number(newOp.betB) || 0,
      winner: (newOp.winner as 'A' | 'B' | '') || '',
      notes: newOp.notes || ''
    };

    updateData({ operations: [...data.operations, operation] });
    setIsAdding(false);
    setNewOp({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      event: '',
      houseA: '',
      houseB: '',
      oddA: 0,
      oddB: 0,
      betA: 0,
      betB: 0,
      winner: '',
      notes: ''
    });
  };

  const handleDeleteOperation = (id: string) => {
    updateData({ operations: data.operations.filter(op => op.id !== id) });
  };

  const handleSort = (field: keyof Operation) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredOperations = data.operations.filter(op => {
    const matchesSearch = !searchQuery || 
                          op.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          op.houseA.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          op.houseB.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (op.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const month = op.date.split('-')[1];
    const matchesMonth = selectedMonth ? month === selectedMonth : true;

    return matchesSearch && matchesMonth;
  });

  const sortedOperations = [...filteredOperations].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return ((aVal as number) - (bVal as number)) * multiplier;
  });

  const SortIcon = ({ field }: { field: keyof Operation }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-[#0f172a]/50 p-6 rounded-xl border border-white/10 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Operações de Arbitragem
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredOperations.length} operações exibidas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar evento, casa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Month Filter */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="">Mês: Todos</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Operação
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
        <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {[
                    { key: 'date', label: 'Data' },
                    { key: 'time', label: 'Hora' },
                    { key: 'event', label: 'Evento' },
                    { key: 'houseA', label: 'Casa A' },
                    { key: 'houseB', label: 'Casa B' },
                    { key: 'oddA', label: 'Odd A' },
                    { key: 'oddB', label: 'Odd B' },
                    { key: 'betA', label: 'Aposta A' },
                    { key: 'betB', label: 'Aposta B' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof Operation)}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <SortIcon field={key as keyof Operation} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Lucro A</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Lucro B</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Vencedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ROI %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Notas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isAdding && (
                  <tr className="bg-indigo-500/5">
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={newOp.date}
                        onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={newOp.time}
                        onChange={(e) => setNewOp({ ...newOp, time: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Time A x Time B"
                        value={newOp.event}
                        onChange={(e) => setNewOp({ ...newOp, event: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newOp.houseA || ''}
                        onChange={(e) => setNewOp({ ...newOp, houseA: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>Selecione...</option>
                        {BOOKMAKERS.map(house => (
                          <option key={house} value={house}>{house}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newOp.houseB || ''}
                        onChange={(e) => setNewOp({ ...newOp, houseB: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled>Selecione...</option>
                        {BOOKMAKERS.map(house => (
                          <option key={house} value={house}>{house}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="1.95"
                        value={newOp.oddA || ''}
                        onChange={(e) => setNewOp({ ...newOp, oddA: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="2.05"
                        value={newOp.oddB || ''}
                        onChange={(e) => setNewOp({ ...newOp, oddB: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="512.82"
                        value={newOp.betA || ''}
                        onChange={(e) => setNewOp({ ...newOp, betA: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="487.18"
                        value={newOp.betB || ''}
                        onChange={(e) => setNewOp({ ...newOp, betB: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {((newOp.betA || 0) + (newOp.betB || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {(((newOp.oddA || 0) * (newOp.betA || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      R$ {(((newOp.oddB || 0) * (newOp.betB || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={newOp.winner || ''}
                        onChange={(e) => setNewOp({ ...newOp, winner: e.target.value as 'A' | 'B' | '' })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-</option>
                        <option value="A">A ({newOp.houseA || 'Casa A'})</option>
                        <option value="B">B ({newOp.houseB || 'Casa B'})</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>-</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Observações..."
                        value={newOp.notes || ''}
                        onChange={(e) => setNewOp({ ...newOp, notes: e.target.value })}
                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddOperation}
                          className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsAdding(false)}
                          className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {sortedOperations.map((op, index) => {
                  const metrics = calculateOpMetrics(op);

                  return (
                    <motion.tr
                      key={op.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-300 text-sm">{new Date(op.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{op.time}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{op.event}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{op.houseA}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{op.houseB}</td>
                      <td className="px-4 py-3 text-amber-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {op.oddA.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-amber-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {op.oddB.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        R$ {op.betA.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        R$ {op.betB.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        R$ {metrics.totalBet.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          metrics.profitA >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                        }`}
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        R$ {metrics.profitA.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          metrics.profitB >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                        }`}
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        R$ {metrics.profitB.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {op.winner ? (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            op.winner === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {op.winner === 'A' ? op.houseA : op.houseB}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Pendente</span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-bold ${
                          metrics.roi >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {op.winner ? `${metrics.roi >= 0 ? '+' : ''}${metrics.roi.toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">
                        {op.notes || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteOperation(op.id)}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}

                {data.operations.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={16} className="px-4 py-12 text-center text-slate-500">
                      Nenhuma operação registrada. Clique em "Nova Operação" para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

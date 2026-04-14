import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Search, Calendar, TrendingUp, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
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
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    time: true,
    event: true,
    houseA: true,
    houseB: true,
    oddA: true,
    oddB: true,
    betA: true,
    betB: true,
    total: true,
    profitA: true,
    profitB: true,
    winner: true,
    roi: true,
    notes: true
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsColumnPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleUpdateWinner = (id: string, winner: 'A' | 'B' | '') => {
    const newOperations = data.operations.map(op => {
      if (op.id === id) {
        return { ...op, winner };
      }
      return op;
    });
    updateData({ operations: newOperations });
  };

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const columnLabels: Record<keyof typeof visibleColumns, string> = {
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    houseA: 'Casa A',
    houseB: 'Casa B',
    oddA: 'Odd A',
    oddB: 'Odd B',
    betA: 'Aposta A',
    betB: 'Aposta B',
    total: 'Total',
    profitA: 'Profit A',
    profitB: 'Profit B',
    winner: 'Vencedor',
    roi: 'ROI',
    notes: 'Notas'
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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-[#0f172a]/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
        <div className="relative">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Operações
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">Arbitragem</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            {filteredOperations.length} registros encontrados no sistema
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative">
          {/* Search */}
          <div className="relative w-full sm:w-72 group/search">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-xl blur opacity-0 group-focus-within/search:opacity-100 transition duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar evento ou casa..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Month Filter */}
          <div className="relative w-full sm:w-auto min-w-[160px]">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-medium"
            >
              <option value="">Todos os Meses</option>
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
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 group ${
                isColumnPickerOpen 
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Colunas</span>
            </button>

            <AnimatePresence>
              {isColumnPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Visibilidade das Colunas</div>
                  <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((col) => (
                      <button
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                          visibleColumns[col] ? 'bg-indigo-500/10 text-white' : 'text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-sm font-medium">{columnLabels[col]}</span>
                        {visibleColumns[col] ? (
                          <Eye className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nova Entrada
          </button>
        </div>
      </div>
 
       {/* Add Operation Form (Expandable Card) */}
       <AnimatePresence>
         {isAdding && (
           <motion.div
             initial={{ height: 0, opacity: 0, marginBottom: 0 }}
             animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
             exit={{ height: 0, opacity: 0, marginBottom: 0 }}
             transition={{ duration: 0.4, ease: "circOut" }}
             className="overflow-hidden"
           >
             <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
               <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                       <Plus className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-white tracking-tight">Nova Operação de Arbitragem</h3>
                       <p className="text-sm text-slate-400">Preencha os dados abaixo para registrar sua entrada</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => setIsAdding(false)}
                     className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all ring-1 ring-white/5 hover:ring-white/20"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {/* Column 1: Event Info */}
                   <div className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/5">
                     <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3 h-3" />
                       Dados do Evento
                     </h4>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Data</label>
                         <input
                           type="date"
                           value={newOp.date}
                           onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Hora</label>
                         <input
                           type="time"
                           value={newOp.time}
                           onChange={(e) => setNewOp({ ...newOp, time: e.target.value })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
                         />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-400">Nome do Evento</label>
                       <input
                         type="text"
                         placeholder="Ex: Flamengo vs Palmeiras"
                         value={newOp.event}
                         onChange={(e) => setNewOp({ ...newOp, event: e.target.value })}
                         className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all font-medium"
                       />
                     </div>
                   </div>
 
                   {/* Column 2: House A */}
                   <div className="space-y-6 bg-blue-500/5 p-6 rounded-xl border border-blue-500/10">
                     <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp className="w-3 h-3" />
                       Lado A (Casa Principal)
                     </h4>
                     <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-400">Casa de Aposta</label>
                       <select
                         value={newOp.houseA || ''}
                         onChange={(e) => setNewOp({ ...newOp, houseA: e.target.value })}
                         className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium appearance-none"
                       >
                         <option value="" disabled>Selecione...</option>
                         {BOOKMAKERS.map(house => (
                           <option key={house} value={house}>{house}</option>
                         ))}
                       </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Odds</label>
                         <input
                           type="number"
                           step="0.01"
                           placeholder="1.95"
                           value={newOp.oddA || ''}
                           onChange={(e) => setNewOp({ ...newOp, oddA: parseFloat(e.target.value) || 0 })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-center font-bold"
                           style={{ fontFamily: 'JetBrains Mono, monospace' }}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Valor da Aposta</label>
                         <input
                           type="number"
                           step="0.01"
                           placeholder="500.00"
                           value={newOp.betA || ''}
                           onChange={(e) => setNewOp({ ...newOp, betA: parseFloat(e.target.value) || 0 })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-center font-bold"
                           style={{ fontFamily: 'JetBrains Mono, monospace' }}
                         />
                       </div>
                     </div>
                   </div>
 
                   {/* Column 3: House B */}
                   <div className="space-y-6 bg-purple-500/5 p-6 rounded-xl border border-purple-500/10">
                     <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                       <TrendingUp className="w-3 h-3" />
                       Lado B (Cobertura)
                     </h4>
                     <div className="space-y-2">
                       <label className="text-xs font-medium text-slate-400">Casa de Aposta</label>
                       <select
                         value={newOp.houseB || ''}
                         onChange={(e) => setNewOp({ ...newOp, houseB: e.target.value })}
                         className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all font-medium appearance-none"
                       >
                         <option value="" disabled>Selecione...</option>
                         {BOOKMAKERS.map(house => (
                           <option key={house} value={house}>{house}</option>
                         ))}
                       </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Odds</label>
                         <input
                           type="number"
                           step="0.01"
                           placeholder="2.05"
                           value={newOp.oddB || ''}
                           onChange={(e) => setNewOp({ ...newOp, oddB: parseFloat(e.target.value) || 0 })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all text-center font-bold"
                           style={{ fontFamily: 'JetBrains Mono, monospace' }}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-medium text-slate-400">Valor da Aposta</label>
                         <input
                           type="number"
                           step="0.01"
                           placeholder="480.00"
                           value={newOp.betB || ''}
                           onChange={(e) => setNewOp({ ...newOp, betB: parseFloat(e.target.value) || 0 })}
                           className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all text-center font-bold"
                           style={{ fontFamily: 'JetBrains Mono, monospace' }}
                         />
                       </div>
                     </div>
                   </div>
                 </div>
 
                 {/* Preview and Actions Summary Row */}
                 <div className="mt-10 pt-10 border-t border-white/5 flex flex-col xl:flex-row items-center justify-between gap-10">
                   <div className="flex flex-wrap items-center gap-8 bg-white/5 px-8 py-5 rounded-2xl border border-white/5 ring-1 ring-white/5">
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Investido</span>
                       <span className="text-xl font-bold text-white font-mono">
                         R$ {((newOp.betA || 0) + (newOp.betB || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </span>
                     </div>
                     <div className="h-10 w-px bg-white/10 hidden sm:block" />
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Retorno (Lado A)</span>
                       <span className={`text-xl font-bold ${(((newOp.oddA || 0) * (newOp.betA || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono`}>
                         R$ {(((newOp.oddA || 0) * (newOp.betA || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </span>
                     </div>
                     <div className="h-10 w-px bg-white/10 hidden sm:block" />
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Retorno (Lado B)</span>
                       <span className={`text-xl font-bold ${(((newOp.oddB || 0) * (newOp.betB || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono`}>
                         R$ {(((newOp.oddB || 0) * (newOp.betB || 0)) - ((newOp.betA || 0) + (newOp.betB || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </span>
                     </div>
                   </div>
 
                   <div className="flex items-center gap-4 w-full xl:w-auto">
                     <div className="flex-1 sm:flex-none">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Notas / Observações</label>
                       <input
                         type="text"
                         placeholder="Ex: Odds flutuando..."
                         value={newOp.notes || ''}
                         onChange={(e) => setNewOp({ ...newOp, notes: e.target.value })}
                         className="w-full sm:w-80 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                       />
                     </div>
                     
                     <div className="flex gap-2 self-end mb-0.5">
                       <button
                         onClick={() => setIsAdding(false)}
                         className="px-6 py-2.5 bg-white/5 text-slate-300 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/5"
                       >
                         Cancelar
                       </button>
                       <button
                         onClick={handleAddOperation}
                         className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/40 transition-all flex items-center gap-2 ring-1 ring-white/10"
                       >
                         <Check className="w-5 h-5" />
                         Salvar Operação
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

      {/* Table */}
    <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
        <div className="relative bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#1e293b]/50 border-b border-white/10">
                <tr>
                  {[
                    { key: 'date', label: 'Data', width: '100px' },
                    { key: 'time', label: 'Hora', width: '80px' },
                    { key: 'event', label: 'Evento', width: '220px' },
                    { key: 'houseA', label: 'Casa A', width: '130px' },
                    { key: 'houseB', label: 'Casa B', width: '130px' },
                    { key: 'oddA', label: 'Odd A', width: '80px' },
                    { key: 'oddB', label: 'Odd B', width: '80px' },
                    { key: 'betA', label: 'Aposta A', width: '130px' },
                    { key: 'betB', label: 'Aposta B', width: '130px' }
                  ].filter(col => visibleColumns[col.key as keyof typeof visibleColumns]).map(({ key, label, width }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof Operation)}
                      className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] cursor-pointer hover:text-white transition-colors"
                      style={{ minWidth: width }}
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        <SortIcon field={key as keyof Operation} />
                      </div>
                    </th>
                  ))}
                  {visibleColumns.total && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Total</th>}
                  {visibleColumns.profitA && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Profit A</th>}
                  {visibleColumns.profitB && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Profit B</th>}
                  {visibleColumns.winner && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Vencedor</th>}
                  {visibleColumns.roi && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">ROI %</th>}
                  {visibleColumns.notes && <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Notas</th>}
                  <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* No 'isAdding' row here, it's now a card above */}

                {sortedOperations.map((op, index) => {
                  const metrics = calculateOpMetrics(op);
 
                  return (
                    <motion.tr
                      key={op.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-indigo-500/5 transition-all group/row"
                    >
                      {visibleColumns.date && <td className="px-6 py-5 text-slate-400 text-sm font-medium">{new Date(op.date).toLocaleDateString('pt-BR')}</td>}
                      {visibleColumns.time && <td className="px-6 py-5 text-slate-500 text-sm">{op.time}</td>}
                      {visibleColumns.event && (
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-white text-sm font-bold tracking-tight">{op.event}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.houseA && (
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-bold border border-blue-500/10">
                            {op.houseA}
                          </span>
                        </td>
                      )}
                      {visibleColumns.houseB && (
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-md text-xs font-bold border border-purple-500/10">
                            {op.houseB}
                          </span>
                        </td>
                      )}
                      {visibleColumns.oddA && (
                        <td className="px-6 py-5 text-amber-500/90 text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {op.oddA.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.oddB && (
                        <td className="px-6 py-5 text-amber-500/90 text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {op.oddB.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.betA && (
                        <td className="px-6 py-5 text-white/90 text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          R$ {op.betA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {visibleColumns.betB && (
                        <td className="px-6 py-5 text-white/90 text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          R$ {op.betB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {visibleColumns.total && (
                        <td className="px-6 py-5 text-white text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          R$ {metrics.totalBet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {visibleColumns.profitA && (
                        <td
                          className={`px-6 py-5 text-sm font-bold ${
                            metrics.profitA >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          R$ {metrics.profitA.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {visibleColumns.profitB && (
                        <td
                          className={`px-6 py-5 text-sm font-bold ${
                            metrics.profitB >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          R$ {metrics.profitB.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {visibleColumns.winner && (
                        <td className="px-6 py-5">
                          <button
                            onClick={() => {
                              const nextWinner = op.winner === '' ? 'A' : op.winner === 'A' ? 'B' : '';
                              handleUpdateWinner(op.id, nextWinner);
                            }}
                            className="group/winner relative"
                          >
                            {op.winner ? (
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                op.winner === 'A' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 hover:bg-blue-500/20' : 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20 hover:bg-purple-500/20'
                              }`}>
                                <Check className="w-3 h-3" />
                                {op.winner === 'A' ? op.houseA : op.houseB}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest ring-1 ring-slate-500/20 hover:bg-slate-500/20 hover:text-slate-400 transition-all">
                                Pendente
                              </div>
                            )}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-[#0f172a] text-[10px] font-bold rounded opacity-0 group-hover/winner:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                              Clique para alterar
                            </div>
                          </button>
                        </td>
                      )}
                      {visibleColumns.roi && (
                        <td
                          className={`px-6 py-5 text-sm font-black ${
                            metrics.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {op.winner ? `${metrics.roi >= 0 ? '+' : ''}${metrics.roi.toFixed(2)}%` : '-'}
                        </td>
                      )}
                      {visibleColumns.notes && (
                        <td className="px-6 py-5">
                           <div className="max-w-[150px] overflow-hidden">
                             <p className="text-slate-500 text-xs italic truncate" title={op.notes}>
                               {op.notes || '—'}
                             </p>
                           </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleDeleteOperation(op.id)}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover/row:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}

                {data.operations.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={16} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                          <TrendingUp className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold mb-1">Nenhuma operação registrada</p>
                          <p className="text-slate-500 text-xs">Clique em "Nova Operação" para começar a lucrar</p>
                        </div>
                      </div>
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

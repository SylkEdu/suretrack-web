import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Check, X, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { AppData, Manuseio } from '../App';

interface CostsTableProps {
  data: AppData;
  updateData: (updates: Partial<AppData>) => void;
}

export default function CostsTable({ data, updateData }: CostsTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [sortField, setSortField] = useState<keyof Manuseio>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [newManuseio, setNewManuseio] = useState<Partial<Manuseio>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: 0
  });

  const handleAddManuseio = () => {
    if (!newManuseio.description || !newManuseio.value) return;

    const manuseio: Manuseio = {
      id: Date.now().toString(),
      date: newManuseio.date!,
      description: newManuseio.description!,
      value: Number(newManuseio.value) || 0
    };

    updateData({ manuseios: [...data.manuseios, manuseio] });
    setIsAdding(false);
    setNewManuseio({
      date: new Date().toISOString().split('T')[0],
      description: '',
      value: 0
    });
  };

  const handleDeleteManuseio = (id: string) => {
    updateData({ manuseios: data.manuseios.filter(m => m.id !== id) });
  };

  const handleSort = (field: keyof Manuseio) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedManuseios = [...data.manuseios].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return ((aVal as number) - (bVal as number)) * multiplier;
  });

  const totalManuseios = data.manuseios.reduce((sum, m) => sum + m.value, 0);

  const SortIcon = ({ field }: { field: keyof Manuseio }) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Manuseios da Banca (Aportes e Saques)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {data.manuseios.length} registros • Saldo de Manuseio: R$ {totalManuseios.toFixed(2)}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Manuseio
        </button>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${totalManuseios >= 0 ? 'from-emerald-500 to-green-500' : 'from-red-500 to-rose-500'} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`} />
        <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Movimentado (Saldo de Manuseio)</p>
              <div className={`text-4xl font-bold ${totalManuseios >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {totalManuseios >= 0 ? '+' : ''}R$ {totalManuseios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Média por manuseio: R$ {data.manuseios.length > 0 ? (totalManuseios / data.manuseios.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${totalManuseios >= 0 ? 'from-emerald-500/20 to-green-500/20' : 'from-red-500/20 to-rose-500/20'} flex items-center justify-center`}>
              <ArrowRightLeft className={`w-8 h-8 ${totalManuseios >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
        <div className="relative bg-[#0f172a]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors w-1/4"
                  >
                    <div className="flex items-center gap-1">
                      Data
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('description')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors w-1/2"
                  >
                    <div className="flex items-center gap-1">
                      Descrição do Manuseio
                      <SortIcon field="description" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('value')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Valor
                      <SortIcon field="value" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isAdding && (
                  <tr className="bg-red-500/5">
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={newManuseio.date}
                        onChange={(e) => setNewManuseio({ ...newManuseio, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Ex: Aporte (+), Retirada (-), Taxa..."
                        value={newManuseio.description}
                        onChange={(e) => setNewManuseio({ ...newManuseio, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="+100 ou -100"
                          value={newManuseio.value || ''}
                          onChange={(e) => setNewManuseio({ ...newManuseio, value: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddManuseio}
                          className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsAdding(false)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {sortedManuseios.map((m, index) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {new Date(m.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.value >= 0 ? 'bg-emerald-500' : 'bg-red-500'} mt-1.5 opacity-50`} />
                        <span className="text-white text-sm font-medium">{m.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 ${m.value >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-lg`}>
                          <span
                            className={`${m.value >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold text-sm`}
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {m.value >= 0 ? '+' : ''} R$ {m.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteManuseio(m.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}

                {data.manuseios.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <ArrowRightLeft className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium mb-1">Nenhum manuseio registrado</p>
                          <p className="text-slate-500 text-sm">Clique em "Novo Manuseio" para registrar um aporte ou saque</p>
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

      {/* Recent manuseios breakdown */}
      {data.manuseios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              label: 'Último 7 dias',
              value: data.manuseios
                .filter(c => {
                  const date = new Date(c.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date >= weekAgo;
                })
                .reduce((sum, c) => sum + c.value, 0)
            },
            {
              label: 'Último 30 dias',
              value: data.manuseios
                .filter(c => {
                  const date = new Date(c.date);
                  const monthAgo = new Date();
                  monthAgo.setDate(monthAgo.getDate() - 30);
                  return date >= monthAgo;
                })
                .reduce((sum, c) => sum + c.value, 0)
            },
            {
              label: 'Média por manuseio',
              value: totalManuseios / data.manuseios.length
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
            >
              <p className="text-xs text-slate-400 mb-2">{stat.label}</p>
              <p
                className={`text-xl font-bold ${stat.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                 {stat.value >= 0 ? '+' : ''}R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

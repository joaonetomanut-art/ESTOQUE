import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MovementType } from '../../types';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { movements, products, users } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      // Search
      const matchesSearch =
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Type
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;

      // User
      if (userFilter !== 'all' && m.userId !== userFilter) return false;

      // Date range
      if (startDate && m.createdAt < startDate) return false;
      if (endDate && m.createdAt > `${endDate}T23:59:59Z`) return false;

      return true;
    });
  }, [movements, searchTerm, typeFilter, userFilter, startDate, endDate]);

  const handleExportCSV = () => {
    const headers = [
      'Data/Hora',
      'Código',
      'Produto',
      'Lote',
      'Tipo',
      'Caixas',
      'Pacotes',
      'Saldo Anterior (cx)',
      'Novo Saldo (cx)',
      'Motivo / Justificativa',
      'Destino / Fornecedor',
      'Usuário',
      'Perfil',
    ];

    const rows = filteredMovements.map((m) => [
      `"${new Date(m.createdAt).toLocaleString('pt-BR')}"`,
      `"${m.productCode}"`,
      `"${m.productName}"`,
      `"${m.batchNumber || ''}"`,
      `"${m.type}"`,
      m.quantityBoxes,
      m.quantityPackages,
      m.previousQuantityBoxes,
      m.newQuantityBoxes,
      `"${m.reason}"`,
      `"${m.destination || m.supplier || ''}"`,
      `"${m.userName}"`,
      `"${m.userRole}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_estoque_salgados_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#D50000]" />
            Histórico & Auditoria de Movimentações
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Trilha imutável de todas as transações, produções, entradas, saídas e ajustes de salgados.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#DDDDDD] space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto, lote, motivo..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800 focus:outline-none focus:border-[#D50000]"
            >
              <option value="all">Todos os Tipos</option>
              <option value="PRODUCAO">⚡ Produção</option>
              <option value="ENTRADA">📥 Entrada / Compra</option>
              <option value="SAIDA">📤 Saída / Expedição</option>
              <option value="PERDA">✕ Perda / Descarte</option>
              <option value="AJUSTE">⚙ Ajuste Manual</option>
              <option value="INVENTARIO">📋 Inventário Físico</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800 focus:outline-none focus:border-[#D50000]"
            >
              <option value="all">Todos os Usuários</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800"
              placeholder="Data Inicial"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800"
              placeholder="Data Final"
            />
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Data & Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Salgado & Lote</th>
                <th className="py-3 px-4 text-center">Movimentação</th>
                <th className="py-3 px-4 text-center">Saldo Anterior → Novo</th>
                <th className="py-3 px-4">Motivo / Destino</th>
                <th className="py-3 px-4">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                    Nenhum registro de movimentação encontrado.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isPos = mov.quantityBoxes > 0;
                  const isProd = mov.type === 'PRODUCAO';
                  const isExit = mov.type === 'SAIDA';
                  const isLoss = mov.type === 'PERDA';

                  return (
                    <tr key={mov.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900">
                          {new Date(mov.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(mov.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            isProd
                              ? 'bg-emerald-100 text-[#2E7D32]'
                              : isExit
                              ? 'bg-red-100 text-[#D50000]'
                              : isLoss
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {mov.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{mov.productName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Lote: {mov.batchNumber || 'N/A'} • Cód: {mov.productCode}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <p
                          className={`font-black text-sm ${
                            isPos ? 'text-[#2E7D32]' : 'text-[#C62828]'
                          }`}
                        >
                          {isPos ? `+${mov.quantityBoxes}` : mov.quantityBoxes} cx
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {Math.abs(mov.quantityPackages)} pct
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-gray-600">
                        {mov.previousQuantityBoxes} cx →{' '}
                        <strong className="text-gray-900">{mov.newQuantityBoxes} cx</strong>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{mov.reason}</p>
                        {mov.destination && (
                          <p className="text-[10px] text-gray-500">Dest: {mov.destination}</p>
                        )}
                        {mov.supplier && (
                          <p className="text-[10px] text-gray-500">Forn: {mov.supplier}</p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-bold text-gray-800">{mov.userName}</p>
                        <p className="text-[10px] text-gray-400">{mov.userRole}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

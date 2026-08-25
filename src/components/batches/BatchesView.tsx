import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Batch } from '../../types';
import {
  Tags,
  Search,
  Filter,
  Calendar,
  Warehouse,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const BatchesView: React.FC = () => {
  const { batches, products, locations, setActiveTab, setSelectedProductId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'critical' | 'expired'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const today = useMemo(() => new Date(), []);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches
      .filter((b) => b.quantityBoxes > 0)
      .filter((b) => {
        const product = products.find((p) => p.id === b.productId);
        const prodName = product ? product.name.toLowerCase() : '';
        const prodCode = product ? product.code.toLowerCase() : '';
        const batchNum = b.batchNumber.toLowerCase();

        const matchesSearch =
          batchNum.includes(searchTerm.toLowerCase()) ||
          prodName.includes(searchTerm.toLowerCase()) ||
          prodCode.includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (selectedLocation !== 'all' && b.locationId !== selectedLocation) return false;

        return true;
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  }, [batches, products, searchTerm, statusFilter, selectedLocation]);

  // Statistics
  const expiringWithin7Days = batches.filter((b) => b.quantityBoxes > 0 && b.status === 'critical').length;
  const expiringWithin30Days = batches.filter((b) => b.quantityBoxes > 0 && b.status === 'warning').length;
  const expiredCount = batches.filter((b) => b.quantityBoxes > 0 && b.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-[#D50000]" />
            Controle de Lotes & Validade (FEFO)
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Rastreabilidade completa de cada lote de salgados congelados, com monitoramento de validade e alertas de quarentena.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('production')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D50000] text-white font-bold text-xs uppercase hover:bg-[#B00000] transition-colors self-start sm:self-auto"
        >
          + Produzir Novo Lote
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Lotes Ativos com Saldo
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {batches.filter((b) => b.quantityBoxes > 0).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 border-l-4 border-l-[#C62828] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C62828]">
            Vencendo em até 7 dias
          </span>
          <p className="text-2xl font-black text-[#C62828] mt-1">{expiringWithin7Days} lotes</p>
          <p className="text-[10px] text-gray-500">Expedição urgente prioritária</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 border-l-4 border-l-[#F9A825] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Vencendo em 8 a 30 dias
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">{expiringWithin30Days} lotes</p>
          <p className="text-[10px] text-gray-500">Monitoramento FEFO ativo</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-300 border-l-4 border-l-gray-900 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
            Lotes Vencidos
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">{expiredCount} lotes</p>
          <p className="text-[10px] text-gray-500">Bloqueados para expedição</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#DDDDDD] space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar lote ou salgado..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DDDDDD] focus:outline-none focus:border-[#D50000]"
            />
          </div>

          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800 focus:outline-none focus:border-[#D50000]"
            >
              <option value="all">Todas as Câmaras & Freezers</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'normal', label: '🟢 Normal' },
              { id: 'warning', label: '🟡 &lt;30 dias' },
              { id: 'critical', label: '🔴 &lt;7 dias' },
              { id: 'expired', label: '⚫ Vencido' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#D50000] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Lote</th>
              <th className="py-3 px-4">Produto</th>
              <th className="py-3 px-4 text-center">Saldo em Estoque</th>
              <th className="py-3 px-4">Fabricação</th>
              <th className="py-3 px-4">Validade / Dias Restantes</th>
              <th className="py-3 px-4">Localização</th>
              <th className="py-3 px-4 text-center">Status FEFO</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 font-medium">
                  Nenhum lote encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const product = products.find((p) => p.id === b.productId);
                const location = locations.find((l) => l.id === b.locationId);

                const exp = new Date(b.expirationDate);
                const diffDays = Math.ceil(
                  (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                const isExpired = diffDays <= 0;
                const isCritical = diffDays > 0 && diffDays <= 7;
                const isWarning = diffDays > 7 && diffDays <= 30;

                return (
                  <tr key={b.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono font-black text-xs text-[#D50000]">
                      {b.batchNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span>{product?.icon || '🥟'}</span>
                        <div>
                          <p>{product?.name || 'Salgado'}</p>
                          <p className="text-[10px] text-gray-400 font-normal">Cód: {product?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <p className="font-extrabold text-sm text-gray-900">{b.quantityBoxes} cx</p>
                      <p className="text-[10px] text-[#D50000] font-semibold">{b.quantityPackages} pct</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(b.manufacturingDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">
                        {new Date(b.expirationDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p
                        className={`text-[10px] font-bold ${
                          isExpired
                            ? 'text-red-700'
                            : isCritical
                            ? 'text-[#C62828]'
                            : isWarning
                            ? 'text-amber-800'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isExpired
                          ? `Venceu há ${Math.abs(diffDays)} dia(s)`
                          : `Restam ${diffDays} dia(s)`}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <p className="truncate max-w-[180px] font-medium">{location?.name || 'Câmara Padrão'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isExpired
                            ? 'bg-black text-white'
                            : isCritical
                            ? 'bg-red-100 text-[#C62828] border border-red-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-[#2E7D32] border border-emerald-200'
                        }`}
                      >
                        {isExpired
                          ? 'VENCIDO'
                          : isCritical
                          ? 'URGENTE (<7d)'
                          : isWarning
                          ? 'FEFO (<30d)'
                          : 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (product) setSelectedProductId(product.id);
                          setActiveTab('stock');
                        }}
                        className="text-xs font-bold text-[#D50000] hover:underline"
                      >
                        Ver Salgado →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

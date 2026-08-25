import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockOverviewItem } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductFormModal } from './ProductFormModal';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Boxes,
  Zap,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const StockView: React.FC = () => {
  const {
    stockOverview,
    categories,
    selectedProductId,
    setSelectedProductId,
    setActiveTab,
    canAccess,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'normal' | 'low' | 'critical' | 'expiring' | 'expired'
  >('all');
  const [sortBy, setSortBy] = useState<'name' | 'highestStock' | 'lowestStock' | 'nearestExpiry'>(
    'highestStock'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter and sort items
  const filteredOverview = useMemo(() => {
    return stockOverview.filter((item) => {
      // Search
      const matchesSearch =
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'all' && item.product.categoryId !== selectedCategory) {
        return false;
      }

      // Status
      if (statusFilter === 'normal' && item.status !== 'normal' && item.status !== 'excess') return false;
      if (statusFilter === 'low' && item.status !== 'low') return false;
      if (statusFilter === 'critical' && item.status !== 'critical') return false;
      if (
        statusFilter === 'expiring' &&
        (!item.daysToNearestExpiration || item.daysToNearestExpiration > 30 || item.daysToNearestExpiration <= 0)
      ) {
        return false;
      }
      if (statusFilter === 'expired' && (!item.daysToNearestExpiration || item.daysToNearestExpiration > 0)) {
        return false;
      }

      return true;
    });
  }, [stockOverview, searchTerm, selectedCategory, statusFilter]);

  const sortedOverview = useMemo(() => {
    return [...filteredOverview].sort((a, b) => {
      if (sortBy === 'name') {
        return a.product.name.localeCompare(b.product.name);
      }
      if (sortBy === 'highestStock') {
        return b.totalBoxes - a.totalBoxes;
      }
      if (sortBy === 'lowestStock') {
        return a.totalBoxes - b.totalBoxes;
      }
      if (sortBy === 'nearestExpiry') {
        const daysA = a.daysToNearestExpiration ?? 9999;
        const daysB = b.daysToNearestExpiration ?? 9999;
        return daysA - daysB;
      }
      return 0;
    });
  }, [filteredOverview, sortBy]);

  const handleOpenDetail = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleCloseDetail = () => {
    setSelectedProductId(null);
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProductId(null);
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight">Estoque de Salgados</h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Gerenciamento físico de caixas, pacotes, lotes e validade por câmara fria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAccess(['Administrador', 'Gestor']) && (
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D50000] hover:bg-[#B00000] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Novo Salgado
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#DDDDDD] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produto ou código..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800 focus:outline-none focus:border-[#D50000]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white text-gray-800 focus:outline-none focus:border-[#D50000]"
            >
              <option value="highestStock">Maior Estoque (Caixas)</option>
              <option value="lowestStock">Menor Estoque</option>
              <option value="nearestExpiry">Validade Mais Próxima (FEFO)</option>
              <option value="name">Nome (A - Z)</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-bold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>

          {[
            { id: 'all', label: 'Todos' },
            { id: 'normal', label: '🟢 Normal' },
            { id: 'low', label: '🟡 Estoque Baixo' },
            { id: 'critical', label: '🔴 Estoque Crítico' },
            { id: 'expiring', label: '🟠 Vencendo (<30d)' },
            { id: 'expired', label: '⚫ Vencidos' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id as any)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                statusFilter === chip.id
                  ? 'bg-[#D50000] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedOverview.map((item) => {
            const isCritical = item.status === 'critical';
            const isLow = item.status === 'low';

            return (
              <div
                key={item.product.id}
                className={`bg-white rounded-xl p-4 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isCritical
                    ? 'border-red-300 ring-1 ring-red-100'
                    : isLow
                    ? 'border-amber-300'
                    : 'border-[#DDDDDD]'
                }`}
              >
                <div>
                  {/* Top row: Icon & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl shadow-inner">
                      {item.product.icon}
                    </div>
                    <div className="text-right">
                      {isCritical ? (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-[#C62828] border border-red-200">
                          🔴 Crítico
                        </span>
                      ) : isLow ? (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          🟡 Baixo
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32] border border-emerald-200">
                          🟢 Normal
                        </span>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">Cód: {item.product.code}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-[#222222] text-sm leading-snug line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.categoryName}</p>

                  {/* Big metrics */}
                  <div className="my-3 p-2.5 rounded-lg bg-gray-50/80 border border-gray-200/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-[#222222]">
                        {item.totalBoxes}{' '}
                        <span className="text-xs font-normal text-gray-500">caixas</span>
                      </span>
                      <span className="text-xs font-bold text-[#D50000]">
                        {item.totalPackages} pct
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-200">
                      <span>Mínimo: {item.product.minimumStock} cx</span>
                      <span>{item.product.packagesPerBox} pct/cx</span>
                    </div>
                  </div>

                  {/* Batch & Expiration info */}
                  <div className="space-y-1 text-[11px] text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lote Ativo:</span>
                      <span className="font-mono font-bold text-gray-800">
                        {item.nearestBatchNumber || 'Sem lote'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Validade Próxima:</span>
                      <span
                        className={`font-semibold ${
                          item.daysToNearestExpiration !== undefined && item.daysToNearestExpiration <= 7
                            ? 'text-[#C62828] font-bold'
                            : item.daysToNearestExpiration !== undefined && item.daysToNearestExpiration <= 30
                            ? 'text-amber-800 font-bold'
                            : 'text-gray-800'
                        }`}
                      >
                        {item.nearestExpiration
                          ? new Date(item.nearestExpiration).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => handleOpenDetail(item.product.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-100 hover:bg-[#D50000] hover:text-white text-gray-800 text-xs font-bold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver Detalhes
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Código / Salgado</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Caixas</th>
                <th className="py-3 px-4 text-center">Pacotes</th>
                <th className="py-3 px-4 text-center">Mínimo</th>
                <th className="py-3 px-4">Lote Ativo / Validade</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedOverview.map((item) => (
                <tr key={item.product.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-gray-900">
                    <span className="text-xl">{item.product.icon}</span>
                    <div>
                      <p>{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 font-normal">Cód: {item.product.code}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.categoryName}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-[#222222] text-sm">
                    {item.totalBoxes} cx
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#D50000]">
                    {item.totalPackages} pct
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">
                    {item.product.minimumStock} cx
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-gray-800 text-[11px]">
                      {item.nearestBatchNumber || '—'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {item.nearestExpiration
                        ? new Date(item.nearestExpiration).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'critical' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#C62828]">
                        Crítico
                      </span>
                    ) : item.status === 'low' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Baixo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(item.product.id)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#D50000] hover:text-white font-bold text-xs transition-colors"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={handleCloseDetail}
          onOpenEdit={handleOpenEdit}
        />
      )}

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

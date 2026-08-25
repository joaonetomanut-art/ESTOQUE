import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Batch } from '../../types';
import {
  X,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Calendar,
  Warehouse,
  Tags,
  AlertTriangle,
  Clock,
  Edit,
  Boxes,
} from 'lucide-react';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
  onOpenEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  onClose,
  onOpenEdit,
}) => {
  const {
    products,
    categories,
    locations,
    batches,
    movements,
    setActiveTab,
    adjustStock,
    canAccess,
  } = useApp();

  const product = products.find((p) => p.id === productId);
  const [adjustBatchId, setAdjustBatchId] = useState<string | null>(null);
  const [adjustNewQty, setAdjustNewQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Contagem física de rotina');

  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);
  const location = locations.find((l) => l.id === product.defaultLocationId);
  const productBatches = batches.filter((b) => b.productId === product.id && b.quantityBoxes > 0);
  const totalBoxes = productBatches.reduce((acc, b) => acc + b.quantityBoxes, 0);
  const totalPackages = totalBoxes * product.packagesPerBox;

  const productMovements = movements
    .filter((m) => m.productId === product.id)
    .slice(0, 5);

  const handleExecuteAdjustment = (batch: Batch) => {
    const result = adjustStock(product.id, batch.id, adjustNewQty, adjustReason);
    if (result.success) {
      setAdjustBatchId(null);
    }
  };

  const getStatusBadge = () => {
    if (totalBoxes <= product.minimumStock / 2) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-black border border-red-200">
          🔴 Estoque Crítico
        </span>
      );
    }
    if (totalBoxes <= product.minimumStock) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
          🟡 Estoque Baixo
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#2E7D32] text-xs font-black border border-emerald-200">
        🟢 Estoque Normal
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DDDDDD] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#D50000] text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/20 p-2 rounded-xl">{product.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">{product.name}</h3>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  Cód: {product.code}
                </span>
              </div>
              <p className="text-xs text-white/80">{category?.name || 'Salgado Congelado'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-[#222222]">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Estoque Atual</span>
              <p className="text-xl font-black text-[#D50000] mt-0.5">{totalBoxes} cx</p>
              <p className="text-[10px] text-gray-500">{totalPackages} pacotes</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Estoque Mínimo</span>
              <p className="text-xl font-black text-gray-800 mt-0.5">{product.minimumStock} cx</p>
              <p className="text-[10px] text-gray-500">Ponto de reposição</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Pacotes / Caixa</span>
              <p className="text-xl font-black text-gray-800 mt-0.5">{product.packagesPerBox} pct</p>
              <p className="text-[10px] text-gray-500">Unidade padrão</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-500 font-bold uppercase text-[10px]">Status Geral</span>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px] text-gray-600">
              <div>
                <strong>Localização:</strong> {location?.name || 'Não definida'}
              </div>
              <div>
                <strong>Temperatura:</strong> {product.storageTemperature}
              </div>
              <div>
                <strong>Validade Padrão:</strong> {product.shelfLifeDays} dias
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                setActiveTab('production');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D50000] text-white font-bold text-xs uppercase hover:bg-[#B00000] transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Produzir
            </button>

            <button
              onClick={() => {
                onClose();
                setActiveTab('entries');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Entrada
            </button>

            <button
              onClick={() => {
                onClose();
                setActiveTab('exits');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600" /> Saída FEFO
            </button>

            {canAccess(['Administrador', 'Gestor']) && (
              <button
                onClick={() => {
                  onOpenEdit(product);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors ml-auto"
              >
                <Edit className="w-3.5 h-3.5" /> Editar Cadastro
              </button>
            )}
          </div>

          {/* Batches breakdown list */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Tags className="w-4 h-4 text-[#D50000]" />
              Lotes em Estoque ({productBatches.length})
            </h4>

            {productBatches.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 border border-gray-200">
                Nenhum lote ativo com saldo em estoque para este produto.
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Lote</th>
                      <th className="py-2.5 px-3">Fabricação</th>
                      <th className="py-2.5 px-3">Validade</th>
                      <th className="py-2.5 px-3 text-center">Caixas</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productBatches.map((b) => {
                      const isExpired = b.status === 'expired';
                      const isCritical = b.status === 'critical';
                      const isWarning = b.status === 'warning';

                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#D50000]">
                            {b.batchNumber}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">
                            {new Date(b.manufacturingDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-800">
                            {new Date(b.expirationDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold">
                            {b.quantityBoxes} cx ({b.quantityPackages} pct)
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isExpired
                                  ? 'bg-red-100 text-[#C62828]'
                                  : isCritical
                                  ? 'bg-orange-100 text-orange-800'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-[#2E7D32]'
                              }`}
                            >
                              {isExpired
                                ? 'Vencido'
                                : isCritical
                                ? 'Vence <7d'
                                : isWarning
                                ? 'Vence <30d'
                                : 'Normal'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {canAccess(['Administrador', 'Gestor']) && (
                              <button
                                onClick={() => {
                                  setAdjustBatchId(b.id);
                                  setAdjustNewQty(b.quantityBoxes);
                                }}
                                className="text-[11px] text-blue-700 hover:underline font-bold"
                              >
                                Ajustar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Adjustment Panel */}
          {adjustBatchId && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Ajuste Manual de Estoque (Auditoria)
                </h5>
                <button
                  onClick={() => setAdjustBatchId(null)}
                  className="text-amber-800 hover:text-black text-xs font-bold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Nova Quantidade em Caixas</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustNewQty}
                    onChange={(e) => setAdjustNewQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 text-xs font-bold rounded-lg border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Justificativa Obrigatória</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {(() => {
                  const targetB = batches.find((b) => b.id === adjustBatchId);
                  if (!targetB) return null;
                  return (
                    <button
                      onClick={() => handleExecuteAdjustment(targetB)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                    >
                      Salvar Ajuste de Estoque
                    </button>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Recent movements history for product */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-500" />
              Últimas Movimentações deste Salgado
            </h4>
            <div className="space-y-1.5">
              {productMovements.length === 0 ? (
                <p className="text-gray-400 italic">Nenhuma movimentação recente.</p>
              ) : (
                productMovements.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div>
                      <span className="font-bold text-gray-900">{m.reason}</span>
                      <p className="text-[10px] text-gray-500">
                        {new Date(m.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(m.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • por {m.userName}
                      </p>
                    </div>
                    <span
                      className={`font-black text-xs ${
                        m.quantityBoxes > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'
                      }`}
                    >
                      {m.quantityBoxes > 0 ? `+${m.quantityBoxes}` : m.quantityBoxes} cx
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

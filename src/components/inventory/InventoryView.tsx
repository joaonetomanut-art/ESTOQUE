import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryCount } from '../../types';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Calendar,
  Warehouse,
  AlertCircle,
  Save,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventoryCounts,
    createInventory,
    updateInventoryItem,
    finalizeInventory,
    categories,
    locations,
    canAccess,
    currentUser,
  } = useApp();

  const [activeInventoryId, setActiveInventoryId] = useState<string | null>(() => {
    const openInv = inventoryCounts.find((i) => i.status === 'EM_ANDAMENTO');
    return openInv ? openInv.id : null;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newLocationId, setNewLocationId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeInventory = inventoryCounts.find((i) => i.id === activeInventoryId);

  const handleStartNewInventory = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createInventory(newTitle, newCategoryId || undefined, newLocationId || undefined);
    setActiveInventoryId(created.id);
    setIsCreating(false);
    setNewTitle('');
  };

  const handleFinalize = () => {
    if (!activeInventoryId) return;
    setErrorMessage(null);
    const res = finalizeInventory(activeInventoryId);
    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao homologar inventário.');
    }
  };

  const isAllowed = canAccess(['Administrador', 'Gestor']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#D50000]" />
            Inventário Físico & Reconciliação
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Conferência cega e contagem física periódica de salgados congelados com justificativa de divergência.
          </p>
        </div>

        {isAllowed && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D50000] text-white font-bold text-xs uppercase hover:bg-[#B00000] transition-colors self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Novo Inventário
          </button>
        )}
      </div>

      {/* Modal / Panel: Create Inventory */}
      {isCreating && (
        <form
          onSubmit={handleStartNewInventory}
          className="bg-white p-5 rounded-xl border-2 border-[#D50000] shadow-md space-y-4 text-xs text-[#222222] animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-sm text-[#D50000] uppercase">
              Iniciar Nova Sessão de Contagem Física
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-gray-400 hover:text-black font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-gray-700">Título / Descrição da Contagem</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Inventário Mensal - Câmara Fria 01"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold mt-1"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700">Filtrar por Categoria (Opcional)</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold mt-1"
              >
                <option value="">Todas as Categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700">Filtrar por Câmara / Freezer (Opcional)</label>
              <select
                value={newLocationId}
                onChange={(e) => setNewLocationId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold mt-1"
              >
                <option value="">Todas as Câmaras</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#D50000] text-white font-bold uppercase text-xs hover:bg-[#B00000] shadow-sm"
            >
              Iniciar Contagem Agora
            </button>
          </div>
        </form>
      )}

      {/* Active Inventory Worksheet */}
      {activeInventory ? (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeInventory.status === 'CONCLUIDO'
                      ? 'bg-emerald-100 text-[#2E7D32]'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeInventory.status}
                </span>
                <h3 className="text-base font-black text-[#222222]">{activeInventory.title}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Iniciado em {new Date(activeInventory.createdAt).toLocaleDateString('pt-BR')} por{' '}
                <strong>{activeInventory.userName}</strong> • {activeInventory.items.length} itens listados
              </p>
            </div>

            {activeInventory.status === 'EM_ANDAMENTO' && isAllowed && (
              <button
                onClick={handleFinalize}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-emerald-800 text-white font-bold text-xs uppercase shadow-sm transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Homologar e Ajustar Estoque
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#C62828] flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Items count sheet */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Código / Salgado</th>
                  <th className="py-3 px-3 text-center">Estoque Sistema</th>
                  <th className="py-3 px-3 text-center">Contagem Física (cx)</th>
                  <th className="py-3 px-3 text-center">Divergência</th>
                  <th className="py-3 px-3">Justificativa da Divergência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeInventory.items.map((item) => {
                  const diff = item.differenceBoxes;
                  const isDiff = diff !== 0;

                  return (
                    <tr
                      key={item.productId}
                      className={isDiff ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50'}
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">{item.productName}</span>
                        <p className="text-[10px] text-gray-400 font-mono">Cód: {item.productCode}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-700 text-sm">
                        {item.systemBoxes} cx
                      </td>
                      <td className="py-3 px-3 text-center">
                        {activeInventory.status === 'EM_ANDAMENTO' ? (
                          <input
                            type="number"
                            min="0"
                            value={item.physicalBoxes}
                            onChange={(e) =>
                              updateInventoryItem(
                                activeInventory.id,
                                item.productId,
                                Math.max(0, parseInt(e.target.value) || 0),
                                item.justification
                              )
                            }
                            className="w-20 p-1.5 text-center font-black text-sm rounded border border-gray-300 bg-white focus:border-[#D50000]"
                          />
                        ) : (
                          <span className="font-black text-sm text-gray-900">{item.physicalBoxes} cx</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isDiff ? (
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-full ${
                              diff > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff} cx
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">0 (OK)</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isDiff && activeInventory.status === 'EM_ANDAMENTO' ? (
                          <input
                            type="text"
                            value={item.justification || ''}
                            onChange={(e) =>
                              updateInventoryItem(
                                activeInventory.id,
                                item.productId,
                                item.physicalBoxes,
                                e.target.value
                              )
                            }
                            placeholder="Obrigatório: motivo da divergência..."
                            className={`w-full p-1.5 rounded text-xs border ${
                              !item.justification ? 'border-red-300 bg-red-50/50' : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <span className="text-gray-500 italic">{item.justification || '—'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl border border-[#DDDDDD] text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Nenhum Inventário em Andamento</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Inicie uma nova contagem física para auditar saldos de caixas e pacotes nas câmaras frigoríficas.
          </p>
        </div>
      )}

      {/* Historic Inventory Sessions */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-3">
        <h3 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
          Sessões de Inventário Realizadas ({inventoryCounts.length})
        </h3>

        {inventoryCounts.length === 0 ? (
          <p className="text-xs text-gray-400">Nenhum inventário registrado ainda.</p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {inventoryCounts.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setActiveInventoryId(inv.id)}
                className={`py-3 px-2 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${
                  inv.id === activeInventoryId ? 'bg-red-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{inv.title}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        inv.status === 'CONCLUIDO'
                          ? 'bg-emerald-100 text-[#2E7D32]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Data: {new Date(inv.createdAt).toLocaleDateString('pt-BR')} • Responsável: {inv.userName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#D50000]">
                    {inv.totalDifferences} divergência(s)
                  </span>
                  <p className="text-[10px] text-gray-400">Clique para inspecionar</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MovementType } from '../../types';
import {
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Truck,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';

export const ExitsView: React.FC = () => {
  const {
    products,
    batches,
    getFEFOSuggestion,
    registerExit,
    canAccess,
    currentUser,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [boxes, setBoxes] = useState<number>(5);
  const [exitType, setExitType] = useState<MovementType>('SAIDA');
  const [reason, setReason] = useState<string>('Venda / Expedição Comercial');
  const [destination, setDestination] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Active batches for this product
  const activeBatches = batches.filter(
    (b) => b.productId === selectedProductId && b.quantityBoxes > 0
  );

  const totalProductStockBoxes = activeBatches.reduce(
    (sum, b) => sum + b.quantityBoxes,
    0
  );

  // Auto FEFO selection on product change
  useEffect(() => {
    if (selectedProductId) {
      const fefo = getFEFOSuggestion(selectedProductId);
      if (fefo) {
        setSelectedBatchId(fefo.id);
        setIsManualOverride(false);
      } else if (activeBatches.length > 0) {
        setSelectedBatchId(activeBatches[0].id);
      } else {
        setSelectedBatchId('');
      }
    }
  }, [selectedProductId, batches]);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const fefoSuggestedBatch = selectedProductId ? getFEFOSuggestion(selectedProductId) : null;
  const isFEFOSuggested = fefoSuggestedBatch?.id === selectedBatchId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProduct) {
      setErrorMessage('Selecione um produto.');
      return;
    }
    if (!selectedBatch) {
      setErrorMessage('Selecione um lote disponível.');
      return;
    }
    if (boxes <= 0) {
      setErrorMessage('A quantidade de saída deve ser maior que zero.');
      return;
    }
    if (boxes > selectedBatch.quantityBoxes) {
      setErrorMessage(
        `Estoque insuficiente no lote ${selectedBatch.batchNumber}. Saldo atual do lote: ${selectedBatch.quantityBoxes} caixas.`
      );
      return;
    }

    const res = registerExit(
      selectedProduct.id,
      selectedBatch.id,
      boxes,
      exitType,
      reason,
      destination,
      notes
    );

    if (res.success) {
      setBoxes(5);
      setDestination('');
      setNotes('');
    } else {
      setErrorMessage(res.error || 'Erro ao registrar saída.');
    }
  };

  const isAllowed = canAccess(['Administrador', 'Gestor', 'Estoquista']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-[#D50000]" />
          Saída de Estoque & Expedição (FEFO)
        </h2>
        <p className="text-sm text-[#666666] mt-0.5">
          Rastreabilidade First-Expire, First-Out: o sistema sugere o lote com vencimento mais próximo para expedição.
        </p>
      </div>

      {!isAllowed ? (
        <div className="bg-white p-8 rounded-xl border border-[#DDDDDD] text-center">
          <AlertCircle className="w-8 h-8 text-[#C62828] mx-auto mb-2" />
          <h3 className="font-bold text-gray-900">Acesso Restrito</h3>
          <p className="text-xs text-gray-600 mt-1">
            Seu perfil ({currentUser.role}) não possui permissão para registrar saídas.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-xs border border-[#DDDDDD] space-y-5 text-xs text-[#222222]"
        >
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#C62828] flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product & Exit Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700">Selecione o Salgado *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold text-xs focus:outline-none focus:border-[#D50000] mt-1"
              >
                {products
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name} (Cód: {p.code})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Tipo & Motivo da Saída *</label>
              <select
                value={reason}
                onChange={(e) => {
                  const val = e.target.value;
                  setReason(val);
                  if (val.includes('Perda') || val.includes('Vencimento') || val.includes('Avaria')) {
                    setExitType('PERDA');
                  } else {
                    setExitType('SAIDA');
                  }
                }}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold text-xs focus:outline-none focus:border-[#D50000] mt-1"
              >
                <option value="Venda / Expedição Comercial">Venda / Expedição Comercial</option>
                <option value="Transferência para Filial / Loja">Transferência para Filial / Loja</option>
                <option value="Consumo Interno / Degustação">Consumo Interno / Degustação</option>
                <option value="Perda por Avaria / Embalagem">Perda por Avaria / Embalagem Danificada</option>
                <option value="Descarte por Validade Vencida">Descarte por Validade Vencida</option>
                <option value="Ajuste de Saída">Ajuste de Saída</option>
              </select>
            </div>
          </div>

          {/* FEFO Smart Recommendation Box */}
          {fefoSuggestedBatch && (
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#D50000] text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#D50000] uppercase tracking-wide">
                    Sugestão Automática FEFO (First Expire, First Out)
                  </h4>
                  <p className="text-xs text-gray-800 font-semibold mt-0.5">
                    Lote <span className="font-mono font-black">{fefoSuggestedBatch.batchNumber}</span> (Validade:{' '}
                    <strong>{new Date(fefoSuggestedBatch.expirationDate).toLocaleDateString('pt-BR')}</strong>) •{' '}
                    {fefoSuggestedBatch.quantityBoxes} caixas disponíveis.
                  </p>
                </div>
              </div>

              {!isFEFOSuggested && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBatchId(fefoSuggestedBatch.id);
                    setIsManualOverride(false);
                  }}
                  className="text-xs font-bold text-[#D50000] hover:underline shrink-0"
                >
                  Usar Sugestão FEFO
                </button>
              )}
            </div>
          )}

          {/* Batch Selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Lote para Baixa *</span>
              <span className="text-[10px] text-gray-500">
                {activeBatches.length} lote(s) com saldo para este produto
              </span>
            </label>

            {activeBatches.length === 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[#C62828] font-bold mt-1">
                Não há lotes com saldo disponível para este produto!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {activeBatches.map((b) => {
                  const isSelected = b.id === selectedBatchId;
                  const isExpired = b.status === 'expired';

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBatchId(b.id);
                        if (b.id !== fefoSuggestedBatch?.id) setIsManualOverride(true);
                      }}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D50000] bg-red-50/50 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-gray-900">{b.batchNumber}</span>
                          {b.id === fefoSuggestedBatch?.id && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#D50000] text-white rounded">
                              FEFO
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-black text-white rounded">
                              VENCIDO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Vencimento: <strong>{new Date(b.expirationDate).toLocaleDateString('pt-BR')}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-sm text-gray-900">{b.quantityBoxes} cx</p>
                        <p className="text-[10px] text-gray-400">{b.quantityPackages} pct</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Math / Simulation Calculation Banner */}
          {selectedBatch && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-300 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Estoque no Lote</p>
                <p className="text-base font-black text-gray-800 mt-0.5">
                  {selectedBatch.quantityBoxes} <span className="text-xs font-normal">cx</span>
                </p>
              </div>

              <div className="border-x border-gray-200 px-2">
                <p className="text-[10px] font-bold text-[#D50000] uppercase">Saída Solicitada</p>
                <p className="text-base font-black text-[#D50000] mt-0.5">
                  -{boxes} <span className="text-xs font-normal">cx</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Saldo Posterior</p>
                <p
                  className={`text-base font-black mt-0.5 ${
                    selectedBatch.quantityBoxes - boxes < 0 ? 'text-[#C62828]' : 'text-[#2E7D32]'
                  }`}
                >
                  {selectedBatch.quantityBoxes - boxes} <span className="text-xs font-normal">cx</span>
                </p>
              </div>
            </div>
          )}

          {/* Quantity and Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Quantidade de Caixas *</label>
              <input
                type="number"
                min="1"
                max={selectedBatch?.quantityBoxes || 999}
                required
                value={boxes}
                onChange={(e) => setBoxes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-black text-center text-sm mt-1 focus:border-[#D50000]"
              />
              <p className="text-[10px] text-gray-500 mt-1 text-center">
                Equivale a {selectedProduct ? boxes * selectedProduct.packagesPerBox : 0} pacotes
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Destino / Cliente / Pedido</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Supermercados Estrela - Pedido #8912"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white mt-1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-gray-700">Observações da Expedição</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Carregamento caminhão refrigerado placa ABC-1234"
              className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white mt-1"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              type="submit"
              disabled={!selectedBatch || selectedBatch.quantityBoxes < boxes}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#D50000] hover:bg-[#B00000] disabled:bg-gray-300 text-white font-bold uppercase shadow-sm transition-all active:scale-95 text-xs tracking-wide"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Saída do Estoque
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

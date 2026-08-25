import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowDownLeft,
  Plus,
  Calendar,
  Warehouse,
  Truck,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const EntriesView: React.FC = () => {
  const { products, locations, registerEntry, canAccess, currentUser } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [boxes, setBoxes] = useState<number>(10);
  const [reason, setReason] = useState<string>('Compra de Fornecedor');
  const [supplier, setSupplier] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>(() => {
    const code = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `ENT-${code}-${Math.floor(100 + Math.random() * 900)}`;
  });
  const [mfgDate, setMfgDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 180);
    return d.toISOString().split('T')[0];
  });
  const [locationId, setLocationId] = useState<string>(locations[0]?.id || '');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const packagesCount = selectedProduct ? boxes * selectedProduct.packagesPerBox : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProduct) {
      setErrorMessage('Selecione um produto.');
      return;
    }
    if (boxes <= 0) {
      setErrorMessage('A quantidade de caixas deve ser maior que zero.');
      return;
    }
    if (!batchNumber.trim()) {
      setErrorMessage('O número do lote é obrigatório.');
      return;
    }
    if (new Date(expDate) <= new Date(mfgDate)) {
      setErrorMessage('A data de validade deve ser posterior à data de fabricação.');
      return;
    }

    const res = registerEntry(
      selectedProduct.id,
      boxes,
      batchNumber.trim(),
      mfgDate,
      expDate,
      locationId,
      reason,
      supplier,
      notes
    );

    if (res.success) {
      // Reset form
      setBoxes(10);
      setSupplier('');
      setNotes('');
      const code = new Date().toISOString().split('T')[0].replace(/-/g, '');
      setBatchNumber(`ENT-${code}-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      setErrorMessage(res.error || 'Erro ao registrar entrada.');
    }
  };

  const isAllowed = canAccess(['Administrador', 'Gestor', 'Estoquista']);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
          <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
          Entrada de Estoque
        </h2>
        <p className="text-sm text-[#666666] mt-0.5">
          Registro de compras, transferências recebidas, devoluções e entradas avulsas com geração de lote.
        </p>
      </div>

      {!isAllowed ? (
        <div className="bg-white p-8 rounded-xl border border-[#DDDDDD] text-center">
          <AlertCircle className="w-8 h-8 text-[#C62828] mx-auto mb-2" />
          <h3 className="font-bold text-gray-900">Acesso Restrito</h3>
          <p className="text-xs text-gray-600 mt-1">
            Seu perfil ({currentUser.role}) não tem permissão para lançar entradas de estoque.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-xs border border-[#DDDDDD] space-y-5 text-xs text-[#222222]">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Product Selection */}
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
                      {p.icon} {p.name} (Cód: {p.code}) - {p.packagesPerBox} pct/cx
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Tipo / Motivo da Entrada *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold text-xs focus:outline-none focus:border-[#D50000] mt-1"
              >
                <option value="Compra de Fornecedor">Compra de Fornecedor / Terceiro</option>
                <option value="Transferência entre Câmaras">Transferência entre Câmaras / Filiais</option>
                <option value="Devolução de Cliente">Devolução de Cliente</option>
                <option value="Ajuste de Saldo Autorizado">Ajuste de Saldo Autorizado</option>
                <option value="Produção Externa">Produção Externa / Parceiro</option>
              </select>
            </div>
          </div>

          {/* Quantity math */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Quantidade em Caixas *</label>
              <input
                type="number"
                min="1"
                required
                value={boxes}
                onChange={(e) => setBoxes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 text-sm font-black text-center rounded-lg border border-gray-300 bg-white mt-1 focus:border-[#D50000]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Pacotes / Caixa</label>
              <div className="p-2 text-sm font-bold text-center bg-white border border-gray-200 rounded-lg text-gray-600 mt-1">
                {selectedProduct?.packagesPerBox || 13} pacotes
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Total Calculado</label>
              <div className="p-2 text-sm font-black text-center bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 mt-1">
                {packagesCount} pacotes
              </div>
            </div>
          </div>

          {/* Batch & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Número do Lote *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-mono font-bold mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Data de Fabricação *</label>
              <input
                type="date"
                required
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Data de Validade *</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold mt-1"
              />
            </div>
          </div>

          {/* Location & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Local de Armazenamento</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold mt-1"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.temperature})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Fornecedor / Origem (Opcional)</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Fornecedor Alimentos Congelados Ltda"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white mt-1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-gray-700">Observações / Nota Fiscal</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: NF-e 49102 / Lote recebido lacrado em temperatura de -19°C"
              className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white mt-1"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2E7D32] hover:bg-emerald-800 text-white font-bold uppercase shadow-sm transition-all active:scale-95 text-xs tracking-wide"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Entrada de Estoque
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductionItem, Product } from '../../types';
import {
  Zap,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Calendar,
  Warehouse,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Search,
} from 'lucide-react';

export const ProductionWizard: React.FC = () => {
  const {
    products,
    locations,
    registerProduction,
    currentUser,
    canAccess,
    setActiveTab,
  } = useApp();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Item form state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const activeProds = products.filter((p) => p.active);
    return activeProds.length > 0 ? activeProds[0] : null;
  });
  const [packagesPerBox, setPackagesPerBox] = useState<number>(13);
  const [boxesCount, setBoxesCount] = useState<number>(2);

  // Multi-item production list
  const [productionList, setProductionList] = useState<ProductionItem[]>([]);

  // Step 2: Batch metadata state
  const todayFormatted = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultBatchNumber = useMemo(() => {
    const dateCode = todayFormatted.replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `PROD-${dateCode}-${randomSuffix}`;
  }, [todayFormatted]);

  const [batchNumber, setBatchNumber] = useState<string>(defaultBatchNumber);
  const [manufacturingDate, setManufacturingDate] = useState<string>(todayFormatted);

  // Compute default expiration based on selected products (min shelf life or default 180 days)
  const defaultExpDate = useMemo(() => {
    const minDays =
      productionList.length > 0
        ? Math.min(
            ...productionList.map((item) => {
              const p = products.find((prod) => prod.id === item.productId);
              return p ? p.shelfLifeDays : 180;
            })
          )
        : 180;

    const mfg = new Date(manufacturingDate || todayFormatted);
    mfg.setDate(mfg.getDate() + minDays);
    return mfg.toISOString().split('T')[0];
  }, [manufacturingDate, productionList, products, todayFormatted]);

  const [expirationDate, setExpirationDate] = useState<string>(defaultExpDate);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => {
    return locations.length > 0 ? locations[0].id : '';
  });
  const [notes, setNotes] = useState<string>('');

  // Step 3: Success record state
  const [confirmedData, setConfirmedData] = useState<{
    batchNumber: string;
    totalBoxes: number;
    totalPackages: number;
    items: ProductionItem[];
    locationName: string;
    createdAt: string;
  } | null>(null);

  // Safety confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Keep packagesPerBox in sync when user selects a different product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPackagesPerBox(product.packagesPerBox);
  };

  // Add current item to production cart
  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (boxesCount <= 0) return;

    const totalPackages = boxesCount * packagesPerBox;

    // Check if already in list
    const existingIndex = productionList.findIndex((item) => item.productId === selectedProduct.id);
    if (existingIndex >= 0) {
      const updated = [...productionList];
      updated[existingIndex].quantityBoxes += boxesCount;
      updated[existingIndex].packagesPerBox = packagesPerBox;
      updated[existingIndex].totalPackages =
        updated[existingIndex].quantityBoxes * packagesPerBox;
      setProductionList(updated);
    } else {
      const newItem: ProductionItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        productIcon: selectedProduct.icon,
        packagesPerBox,
        quantityBoxes: boxesCount,
        totalPackages,
      };
      setProductionList([...productionList, newItem]);
    }

    // Reset boxes counter for next item
    setBoxesCount(2);
  };

  const handleRemoveItem = (index: number) => {
    const updated = productionList.filter((_, i) => i !== index);
    setProductionList(updated);
  };

  const handleProceedToStep2 = () => {
    // If user has not added the current product to list yet, auto-add if list is empty
    if (productionList.length === 0 && selectedProduct && boxesCount > 0) {
      const totalPackages = boxesCount * packagesPerBox;
      const newItem: ProductionItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        productIcon: selectedProduct.icon,
        packagesPerBox,
        quantityBoxes: boxesCount,
        totalPackages,
      };
      setProductionList([newItem]);
    }
    setExpirationDate(defaultExpDate);
    setCurrentStep(2);
  };

  // Final confirmation execution
  const handleExecuteConfirmation = () => {
    const result = registerProduction(
      productionList,
      batchNumber,
      manufacturingDate,
      expirationDate,
      selectedLocationId,
      notes
    );

    if (result.success) {
      const loc = locations.find((l) => l.id === selectedLocationId);
      const totalBoxes = productionList.reduce((s, i) => s + i.quantityBoxes, 0);
      const totalPackages = productionList.reduce((s, i) => s + i.totalPackages, 0);

      setConfirmedData({
        batchNumber,
        totalBoxes,
        totalPackages,
        items: [...productionList],
        locationName: loc?.name || 'Câmara Fria Principal',
        createdAt: new Date().toISOString(),
      });

      setShowConfirmModal(false);
      setCurrentStep(3);
    }
  };

  const handleStartNewProduction = () => {
    const dateCode = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setBatchNumber(`PROD-${dateCode}-${randomSuffix}`);
    setProductionList([]);
    setBoxesCount(2);
    setNotes('');
    setConfirmedData(null);
    setCurrentStep(1);
  };

  // Filter products for search
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.active)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm]);

  // Aggregate totals
  const totalBoxesInList = productionList.reduce((acc, item) => acc + item.quantityBoxes, 0);
  const totalPackagesInList = productionList.reduce((acc, item) => acc + item.totalPackages, 0);

  const isAllowed = canAccess(['Administrador', 'Gestor', 'Produção']);

  if (!isAllowed) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-[#DDDDDD] max-w-lg mx-auto my-12">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C62828]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-sm text-gray-600 mt-2">
          Seu perfil ({currentUser.role}) possui permissão apenas para consulta. Alterne para o perfil
          de Administrador, Gestor ou Produção no menu do topo para registrar apontamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Step Header */}
      <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-[#DDDDDD]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDDDDD] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#D50000]">
              <Zap className="w-5 h-5 fill-current" />
              <h2 className="text-xl font-black uppercase tracking-tight">Apontamento de Produção</h2>
            </div>
            <p className="text-xs md:text-sm text-[#666666] mt-0.5">
              Fluxo ágil de entrada de salgados congelados com rastreamento por lote.
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-2 self-center sm:self-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-[#D50000] text-white ring-4 ring-red-100'
                    : currentStep > 1
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span
                className={`text-xs font-bold hidden md:inline ${
                  currentStep === 1 ? 'text-[#D50000]' : 'text-gray-500'
                }`}
              >
                Produção
              </span>
            </div>

            <div className={`h-[2px] w-6 md:w-10 ${currentStep >= 2 ? 'bg-[#2E7D32]' : 'bg-[#DDDDDD]'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-[#D50000] text-white ring-4 ring-red-100'
                    : currentStep > 2
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span
                className={`text-xs font-bold hidden md:inline ${
                  currentStep === 2 ? 'text-[#D50000]' : 'text-gray-500'
                }`}
              >
                Resumo
              </span>
            </div>

            <div className={`h-[2px] w-6 md:w-10 ${currentStep >= 3 ? 'bg-[#2E7D32]' : 'bg-[#DDDDDD]'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-100'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-bold hidden md:inline ${
                  currentStep === 3 ? 'text-[#2E7D32]' : 'text-gray-500'
                }`}
              >
                Confirmar
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: SELECT PRODUCT & QUANTITIES                 */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="mt-6 space-y-6">
            {/* 1. Select savory */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-sm font-bold text-[#222222]">
                  1. Selecione o salgado:
                </label>
                {/* Quick search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar salgado ou cód..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DDDDDD] focus:outline-none focus:border-[#D50000] focus:ring-1 focus:ring-[#D50000]"
                  />
                </div>
              </div>

              {/* Product cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all select-none relative ${
                        isSelected
                          ? 'border-[#D50000] bg-[#D50000]/5 shadow-xs scale-[1.02]'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {/* Selection badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#D50000] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                          ✓
                        </div>
                      )}

                      <div className="mx-auto mb-2 h-14 w-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-3xl shadow-inner">
                        {p.icon}
                      </div>
                      <p className="text-xs font-bold text-[#222222] line-clamp-1 leading-tight">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-[#666666] mt-0.5 font-medium">Cód: {p.code}</p>
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-gray-200/80 rounded text-gray-700 font-semibold">
                        {p.packagesPerBox} pct/cx
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity inputs row */}
            {selectedProduct && (
              <div className="p-4 rounded-xl bg-gray-50/80 border border-[#DDDDDD] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 pb-2 border-b border-gray-200">
                  <span>Configurar Apontamento de:</span>
                  <span className="text-[#D50000] font-extrabold text-sm">{selectedProduct.name}</span>
                  <span className="text-gray-400">({selectedProduct.code})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. Packages per box */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-bold text-[#222222]">
                      2. Informe a quantidade de pacotes por caixa
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPackagesPerBox((prev) => Math.max(1, prev - 1))}
                        className="h-11 w-11 rounded-lg border border-[#DDDDDD] bg-white font-black text-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-xs"
                      >
                        -
                      </button>
                      <div className="flex-1 rounded-lg border border-[#DDDDDD] bg-white py-2.5 text-center font-black text-lg text-[#222222] shadow-xs">
                        {packagesPerBox}{' '}
                        <span className="text-xs font-normal text-gray-500">pacotes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPackagesPerBox((prev) => prev + 1)}
                        className="h-11 w-11 rounded-lg border border-[#DDDDDD] bg-white font-black text-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-xs"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-[11px] text-[#666666] italic">
                      Uma caixa contém {packagesPerBox} pacotes (Padrão: {selectedProduct.packagesPerBox} pct).
                    </p>
                  </div>

                  {/* 3. Produced boxes count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-sm font-bold text-[#222222]">
                      3. Informe a quantidade de caixas produzidas
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setBoxesCount((prev) => Math.max(1, prev - 1))}
                        className="h-11 w-11 rounded-lg border border-[#DDDDDD] bg-white font-black text-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={boxesCount}
                        onChange={(e) => setBoxesCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-lg border border-[#DDDDDD] bg-white py-2.5 text-center font-black text-lg text-[#222222] shadow-xs focus:outline-none focus:border-[#D50000]"
                      />
                      <button
                        type="button"
                        onClick={() => setBoxesCount((prev) => prev + 1)}
                        className="h-11 w-11 rounded-lg border border-[#DDDDDD] bg-white font-black text-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Dynamic math computation */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-bold text-[#D50000]">
                        {boxesCount} caixas × {packagesPerBox} pacotes ={' '}
                        <span className="text-sm underline">{boxesCount * packagesPerBox} pacotes</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar à produção +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Added production items cart list */}
            {productionList.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Itens Prontos para este Lote ({productionList.length})
                  </span>
                  <span className="text-xs font-extrabold text-[#D50000]">
                    Total: {totalBoxesInList} caixas | {totalPackagesInList} pacotes
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {productionList.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.productIcon}</span>
                        <div>
                          <p className="font-bold text-gray-900">{item.productName}</p>
                          <p className="text-[10px] text-gray-500">
                            Cód: {item.productCode} • {item.packagesPerBox} pct/cx
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-extrabold text-[#222222] text-sm">
                            {item.quantityBoxes} <span className="text-xs font-normal text-gray-500">cx</span>
                          </p>
                          <p className="text-[11px] font-semibold text-[#D50000]">
                            {item.totalPackages} pacotes
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom action button */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DDDDDD]">
              <div className="text-xs text-gray-500">
                {productionList.length === 0 ? (
                  <span>
                    Será adicionado:{' '}
                    <strong>
                      {selectedProduct?.name} ({boxesCount} caixas)
                    </strong>
                  </span>
                ) : (
                  <span>
                    {productionList.length} produto(s) pronto(s) para conferência.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex items-center gap-2 rounded-xl bg-[#D50000] hover:bg-[#B00000] px-6 py-3 font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide"
              >
                Avançar para Resumo →
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: SUMMARY & BATCH SPECIFICATION                */}
        {/* ---------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Itens adicionados à produção
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Confira abaixo os itens informados neste apontamento e defina os dados de rastreabilidade (lote e validade).
                </p>
              </div>
            </div>

            {/* Production Items Table */}
            <div className="rounded-xl border border-[#DDDDDD] bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4 text-center">Pacotes / Caixa</th>
                    <th className="py-3 px-4 text-center">Caixas Produzidas</th>
                    <th className="py-3 px-4 text-right">Total de Pacotes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productionList.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-gray-900">
                        <span className="text-xl">{item.productIcon}</span>
                        <div>
                          <p>{item.productName}</p>
                          <p className="text-[10px] text-gray-400 font-normal">Cód: {item.productCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-700">
                        {item.packagesPerBox} pct
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-gray-900 text-sm">
                        {item.quantityBoxes} cx
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#D50000] text-sm">
                        {item.totalPackages} pct
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50/50 border-t-2 border-red-200 font-extrabold text-xs text-gray-900">
                  <tr>
                    <td className="py-3 px-4 uppercase text-[#D50000]" colSpan={2}>
                      Total Geral deste Apontamento
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-[#D50000]">
                      {totalBoxesInList} caixas
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-[#D50000]">
                      {totalPackagesInList} pacotes
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Batch & Expiration Configuration */}
            <div className="rounded-xl border border-[#DDDDDD] p-5 bg-gray-50/60 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D50000]" />
                Dados do Lote & Armazenamento
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Batch Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Número do Lote</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                    placeholder="Ex: PROD-20260825-001"
                    className="w-full p-2.5 text-xs font-mono font-bold rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
                  />
                  <p className="text-[10px] text-gray-500">Gerado automaticamente pelo sistema.</p>
                </div>

                {/* Manufacturing Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Data de Fabricação</label>
                  <input
                    type="date"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
                  />
                </div>

                {/* Expiration Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Data de Validade</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
                  />
                  <p className="text-[10px] text-gray-500">Calculada conforme prazo de validade.</p>
                </div>

                {/* Cold storage location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Local de Armazenamento</label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.temperature})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-gray-700">Observações da Linha / Turno (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Turno manhã - Linha 01 operando em capacidade nominal"
                  className="w-full p-2 text-xs rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
                />
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DDDDDD]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-colors text-xs uppercase"
              >
                ← Voltar e Editar Itens
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#2E7D32] hover:bg-emerald-800 px-7 py-3 font-extrabold text-white shadow-md hover:shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide"
              >
                Confirmar Produção ✓
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: FINAL SUCCESS CONFIRMATION                   */}
        {/* ---------------------------------------------------- */}
        {currentStep === 3 && confirmedData && (
          <div className="mt-6 text-center py-8 space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#2E7D32] ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Produção Registrada com Sucesso!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                O estoque foi atualizado automaticamente e o novo lote foi alocado na câmara fria.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 border border-[#DDDDDD] rounded-xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-extrabold text-[#D50000] text-sm">Lote: {confirmedData.batchNumber}</span>
                <span className="text-gray-500 font-mono">
                  {new Date(confirmedData.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(confirmedData.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="text-gray-400">Total Produzido:</span>{' '}
                  <strong>{confirmedData.totalBoxes} caixas</strong> ({confirmedData.totalPackages} pacotes)
                </div>
                <div>
                  <span className="text-gray-400">Local Alocado:</span>{' '}
                  <strong>{confirmedData.locationName}</strong>
                </div>
                <div>
                  <span className="text-gray-400">Operador:</span>{' '}
                  <strong>{currentUser.name}</strong>
                </div>
                <div>
                  <span className="text-gray-400">Validade:</span>{' '}
                  <strong>
                    {new Date(expirationDate).toLocaleDateString('pt-BR')}
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 mb-1">Itens incluídos:</p>
                <div className="space-y-1">
                  {confirmedData.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-gray-800">
                      <span>
                        {it.productIcon} {it.productName}
                      </span>
                      <span className="font-bold">
                        {it.quantityBoxes} cx ({it.totalPackages} pct)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartNewProduction}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D50000] text-white font-bold hover:bg-[#B00000] transition-all text-xs uppercase shadow-xs"
              >
                <Plus className="w-4 h-4" /> Novo Apontamento
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 hover:bg-gray-50 transition-all text-xs uppercase"
              >
                Ver Estoque Atualizado →
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 hover:bg-gray-50 transition-all text-xs uppercase"
              >
                Consultar Auditoria
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDDDDD] space-y-4">
            <div className="flex items-center gap-3 text-[#D50000]">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar Produção?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Você está prestes a registrar a entrada de{' '}
              <strong className="text-gray-900">{totalBoxesInList} caixas ({totalPackagesInList} pacotes)</strong> no lote{' '}
              <strong className="text-[#D50000]">{batchNumber}</strong>.
            </p>

            <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              Após confirmar, o estoque será atualizado imediatamente no sistema e registrado no log de auditoria.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmation}
                className="px-5 py-2 text-xs font-bold text-white bg-[#D50000] hover:bg-[#B00000] rounded-lg shadow-sm transition-colors"
              >
                Sim, Confirmar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
}

const AVAILABLE_ICONS = ['🥟', '🧀', '🧆', '🌭', '✨', '🥧', '🥨', '🥐', '🍗', '🥪'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose }) => {
  const { categories, locations, createProduct, updateProduct } = useApp();

  const isEditing = !!product;

  const [code, setCode] = useState(product?.code || '');
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [description, setDescription] = useState(product?.description || '');
  const [icon, setIcon] = useState(product?.icon || '🥟');
  const [packagesPerBox, setPackagesPerBox] = useState(product?.packagesPerBox || 13);
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock || 40);
  const [maximumStock, setMaximumStock] = useState(product?.maximumStock || 250);
  const [shelfLifeDays, setShelfLifeDays] = useState(product?.shelfLifeDays || 180);
  const [storageTemperature, setStorageTemperature] = useState(product?.storageTemperature || '-18°C');
  const [defaultLocationId, setDefaultLocationId] = useState(
    product?.defaultLocationId || (locations[0]?.id || '')
  );
  const [active, setActive] = useState(product ? product.active : true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage('O código do produto é obrigatório.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('O nome do produto é obrigatório.');
      return;
    }
    if (packagesPerBox <= 0) {
      setErrorMessage('A quantidade de pacotes por caixa deve ser maior que zero.');
      return;
    }
    if (minimumStock < 0) {
      setErrorMessage('O estoque mínimo não pode ser negativo.');
      return;
    }

    if (isEditing && product) {
      const res = updateProduct(product.id, {
        code: code.trim(),
        name: name.trim(),
        categoryId,
        description: description.trim(),
        icon,
        packagesPerBox,
        minimumStock,
        maximumStock,
        shelfLifeDays,
        storageTemperature,
        defaultLocationId,
        active,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao atualizar.');
        return;
      }
    } else {
      const res = createProduct({
        code: code.trim(),
        name: name.trim(),
        categoryId,
        description: description.trim(),
        icon,
        packagesPerBox,
        minimumStock,
        maximumStock,
        shelfLifeDays,
        storageTemperature,
        defaultLocationId,
        active,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao criar produto.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DDDDDD] flex flex-col">
        {/* Header */}
        <div className="bg-[#D50000] text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-base font-black tracking-tight">
              {isEditing ? 'Editar Cadastro de Salgado' : 'Novo Cadastro de Salgado'}
            </h3>
            <p className="text-xs text-white/80">Configure unidades, estoque mínimo e validade</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-[#222222]">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Code */}
            <div>
              <label className="text-[11px] font-bold text-gray-700">Código do Produto *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: 001, 009"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-mono font-bold focus:outline-none focus:border-[#D50000]"
              />
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700">Nome do Salgado *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Coxinha de Frango com Catupiry"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold focus:outline-none focus:border-[#D50000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-gray-700">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold focus:outline-none focus:border-[#D50000]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-[11px] font-bold text-gray-700">Ícone / Emblema</label>
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-gray-50 rounded-lg border border-[#DDDDDD]">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`h-8 w-8 rounded text-lg flex items-center justify-center shrink-0 transition-all ${
                      icon === ic ? 'bg-[#D50000] text-white shadow-xs scale-110' : 'hover:bg-gray-200'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-gray-700">Descrição / Ingredientes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do recheio, massa e especificações de preparo."
              className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white focus:outline-none focus:border-[#D50000]"
            />
          </div>

          {/* Box parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-[#DDDDDD]">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Pacotes / Caixa *</label>
              <input
                type="number"
                min="1"
                required
                value={packagesPerBox}
                onChange={(e) => setPackagesPerBox(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 rounded-lg border border-[#DDDDDD] bg-white font-bold text-center"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-center">Unidades por cx</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Estoque Mínimo (cx) *</label>
              <input
                type="number"
                min="0"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2 rounded-lg border border-[#DDDDDD] bg-white font-bold text-center"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-center">Alerta de reposição</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Estoque Máximo (cx)</label>
              <input
                type="number"
                min="1"
                value={maximumStock}
                onChange={(e) => setMaximumStock(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 rounded-lg border border-[#DDDDDD] bg-white font-bold text-center"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-center">Limite de câmara</p>
            </div>
          </div>

          {/* Storage specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-700">Prazo de Validade (dias)</label>
              <input
                type="number"
                min="1"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">Ex: 180 dias (6 meses)</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Temperatura Alvo</label>
              <input
                type="text"
                value={storageTemperature}
                onChange={(e) => setStorageTemperature(e.target.value)}
                placeholder="-18°C"
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700">Local Padrão</label>
              <select
                value={defaultLocationId}
                onChange={(e) => setDefaultLocationId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-semibold"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D50000] hover:bg-[#B00000] text-white font-bold shadow-md transition-all uppercase"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Salgado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

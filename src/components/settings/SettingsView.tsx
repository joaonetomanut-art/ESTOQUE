import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Warehouse,
  BellRing,
  RotateCcw,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { locations, resetAllData, showToast } = useApp();

  const [notificationDaysWarning, setNotificationDaysWarning] = useState<number>(30);
  const [notificationDaysCritical, setNotificationDaysCritical] = useState<number>(7);
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(false);
  const [enforceFEFOStrictly, setEnforceFEFOStrictly] = useState<boolean>(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configurações salvas com sucesso!', 'success');
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar os dados de demonstração originais? Todas as alterações manuais serão resetadas.'
      )
    ) {
      resetAllData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#222222] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#D50000]" />
          Configurações do Sistema
        </h2>
        <p className="text-sm text-[#666666] mt-0.5">
          Parâmetros de câmara fria, regras de negócio de estoque, alertas de validade e manutenção.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Cold storage locations */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-[#D50000]" />
            Câmaras Frigoríficas & Locais Cadastrados ({locations.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{loc.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Temperatura: <strong>{loc.temperature}</strong>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Zona: <strong>{loc.zone}</strong>
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#2E7D32] self-start">
                  Ativa & Operacional
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Rules & Alerts */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4 text-xs text-[#222222]">
          <h3 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-[#D50000]" />
            Regras de Estoque & Alertas de Validade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700">Dias para Alerta de Atenção (Amarelo)</label>
              <input
                type="number"
                min="1"
                value={notificationDaysWarning}
                onChange={(e) => setNotificationDaysWarning(parseInt(e.target.value) || 30)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold mt-1"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Lotes com menos de {notificationDaysWarning} dias serão sinalizados para saída prioritária.
              </p>
            </div>

            <div>
              <label className="font-bold text-gray-700">Dias para Alerta Crítico (Vermelho)</label>
              <input
                type="number"
                min="1"
                value={notificationDaysCritical}
                onChange={(e) => setNotificationDaysCritical(parseInt(e.target.value) || 7)}
                className="w-full p-2.5 rounded-lg border border-[#DDDDDD] bg-white font-bold mt-1"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Lotes com menos de {notificationDaysCritical} dias geram notificações urgentes no topo do sistema.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceFEFOStrictly}
                onChange={(e) => setEnforceFEFOStrictly(e.target.checked)}
                className="h-4 w-4 text-[#D50000] rounded focus:ring-[#D50000]"
              />
              <div>
                <span className="font-bold text-gray-900">Exigir validação FEFO rigorosa nas saídas</span>
                <p className="text-[11px] text-gray-500">
                  Bloqueia expedições de lotes mais novos enquanto houver lotes antigos em estoque.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegativeStock}
                onChange={(e) => setAllowNegativeStock(e.target.checked)}
                className="h-4 w-4 text-[#D50000] rounded focus:ring-[#D50000]"
              />
              <div>
                <span className="font-bold text-gray-900">Permitir estoque negativo em saídas de emergência</span>
                <p className="text-[11px] text-gray-500">
                  Desativado por padrão para garantir precisão e evitar erros físicos de contagem.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D50000] text-white font-bold uppercase text-xs hover:bg-[#B00000] shadow-sm"
            >
              <Save className="w-4 h-4" />
              Salvar Parâmetros
            </button>
          </div>
        </div>
      </form>

      {/* Demo data management */}
      <div className="bg-red-50/50 rounded-xl p-5 border border-red-200 space-y-3">
        <h3 className="text-xs font-extrabold uppercase text-[#C62828] tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" />
          Manutenção & Dados de Demonstração
        </h3>
        <p className="text-xs text-gray-600">
          Você pode restaurar o banco de dados simulado para o estado inicial com os 10 salgados e lotes de teste preenchidos.
        </p>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-300 text-[#C62828] font-bold text-xs hover:bg-red-50 shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar Dados de Fábrica / Demonstração
        </button>
      </div>
    </div>
  );
};

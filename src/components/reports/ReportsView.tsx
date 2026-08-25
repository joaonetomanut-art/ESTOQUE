import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Package,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { movements, stockOverview, products, batches } = useApp();

  const [reportType, setReportType] = useState<
    'stock_position' | 'production_summary' | 'sales_exits' | 'losses' | 'turnover'
  >('stock_position');

  const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  // Filter movements by period
  const filteredMovements = useMemo(() => {
    if (period === 'all') return movements;
    const now = new Date().getTime();
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return movements.filter((m) => new Date(m.createdAt).getTime() >= cutoff);
  }, [movements, period]);

  // Aggregate metrics
  const productionMovements = filteredMovements.filter((m) => m.type === 'PRODUCAO');
  const totalProducedBoxes = productionMovements.reduce((acc, m) => acc + m.quantityBoxes, 0);

  const exitMovements = filteredMovements.filter((m) => m.type === 'SAIDA');
  const totalExitedBoxes = exitMovements.reduce((acc, m) => acc + Math.abs(m.quantityBoxes), 0);

  const lossMovements = filteredMovements.filter((m) => m.type === 'PERDA');
  const totalLostBoxes = lossMovements.reduce((acc, m) => acc + Math.abs(m.quantityBoxes), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'stock_position') {
      headers = ['Código', 'Salgado', 'Categoria', 'Estoque (cx)', 'Pacotes', 'Mínimo (cx)', 'Status'];
      rows = stockOverview.map((item) => [
        `"${item.product.code}"`,
        `"${item.product.name}"`,
        `"${item.categoryName}"`,
        item.totalBoxes,
        item.totalPackages,
        item.product.minimumStock,
        `"${item.status}"`,
      ]);
    } else {
      headers = ['Data', 'Tipo', 'Código', 'Produto', 'Lote', 'Caixas', 'Motivo', 'Usuário'];
      rows = filteredMovements.map((m) => [
        `"${new Date(m.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${m.type}"`,
        `"${m.productCode}"`,
        `"${m.productName}"`,
        `"${m.batchNumber || ''}"`,
        m.quantityBoxes,
        `"${m.reason}"`,
        `"${m.userName}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${reportType}_${Date.now()}.csv`);
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
            <BarChart3 className="w-6 h-6 text-[#D50000]" />
            Relatórios Gerenciais & Indicadores
          </h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Análises consolidadas de produção, saídas, perdas, cobertura de estoque e giro de salgados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DDDDDD] text-gray-700 font-bold text-xs hover:bg-gray-50 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs uppercase hover:bg-black shadow-xs"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Top summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-gray-500">Volume Produzido no Período</span>
          <p className="text-2xl font-black text-[#2E7D32] mt-1">{totalProducedBoxes} cx</p>
          <p className="text-[10px] text-gray-500">{productionMovements.length} ordens finalizadas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-gray-500">Expedição / Saídas</span>
          <p className="text-2xl font-black text-[#D50000] mt-1">{totalExitedBoxes} cx</p>
          <p className="text-[10px] text-gray-500">{exitMovements.length} entregas realizadas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-gray-500">Perdas / Avarias</span>
          <p className="text-2xl font-black text-[#C62828] mt-1">{totalLostBoxes} cx</p>
          <p className="text-[10px] text-gray-500">
            Índice de perda:{' '}
            {totalProducedBoxes > 0
              ? ((totalLostBoxes / totalProducedBoxes) * 100).toFixed(1)
              : '0.0'}
            %
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs">
          <span className="text-[10px] font-bold uppercase text-gray-500">Posição Atual do Estoque</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {stockOverview.reduce((acc, s) => acc + s.totalBoxes, 0)} cx
          </p>
          <p className="text-[10px] text-gray-500">
            {stockOverview.reduce((acc, s) => acc + s.totalPackages, 0)} pacotes congelados
          </p>
        </div>
      </div>

      {/* Report Switcher & Period Selector */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#DDDDDD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'stock_position', label: '📦 Posição de Estoque' },
            { id: 'production_summary', label: '⚡ Produção Realizada' },
            { id: 'sales_exits', label: '📤 Saídas & Expedição' },
            { id: 'losses', label: '⚠️ Perdas & Descarte' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                reportType === tab.id
                  ? 'bg-[#D50000] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 text-[11px]">Período:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="p-1.5 rounded-lg border border-[#DDDDDD] bg-white font-bold text-xs"
          >
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="all">Todo o Histórico</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden shadow-xs">
        {reportType === 'stock_position' ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Código / Salgado</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Saldo em Caixas</th>
                <th className="py-3 px-4 text-center">Saldo em Pacotes</th>
                <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockOverview.map((item) => (
                <tr key={item.product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">{item.product.icon}</span>
                    <div>
                      <p>{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Cód: {item.product.code}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.categoryName}</td>
                  <td className="py-3 px-4 text-center font-black text-sm text-gray-900">
                    {item.totalBoxes} cx
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#D50000]">
                    {item.totalPackages} pct
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {item.product.minimumStock} cx
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'critical'
                          ? 'bg-red-100 text-[#C62828]'
                          : item.status === 'low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-[#2E7D32]'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#DDDDDD] text-gray-600 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Salgado</th>
                <th className="py-3 px-4">Lote</th>
                <th className="py-3 px-4 text-center">Caixas</th>
                <th className="py-3 px-4">Motivo / Destino</th>
                <th className="py-3 px-4">Usuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements
                .filter((m) => {
                  if (reportType === 'production_summary') return m.type === 'PRODUCAO';
                  if (reportType === 'sales_exits') return m.type === 'SAIDA';
                  if (reportType === 'losses') return m.type === 'PERDA';
                  return true;
                })
                .map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                      {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{m.productName}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{m.batchNumber || '—'}</td>
                    <td className="py-3 px-4 text-center font-black text-sm text-[#D50000]">
                      {Math.abs(m.quantityBoxes)} cx
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {m.reason} {m.destination ? `(${m.destination})` : ''}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{m.userName}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

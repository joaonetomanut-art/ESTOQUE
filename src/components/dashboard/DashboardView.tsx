import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Zap,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Calendar,
  Layers,
  ArrowDownLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    stockOverview,
    totalBoxes,
    totalPackages,
    productionTodayBoxes,
    exitsTodayBoxes,
    lowStockCount,
    criticalStockCount,
    expiringBatchesCount,
    expiredBatchesCount,
    batches,
    movements,
    setActiveTab,
    setSelectedProductId,
  } = useApp();

  const [productionChartRange, setProductionChartRange] = useState<'hoje' | '7d' | '30d' | '90d'>('7d');

  // Calculate status counts
  const normalStockCount = stockOverview.filter((s) => s.status === 'normal' || s.status === 'excess').length;

  // Chart data calculation for production
  const productionChartData = useMemo(() => {
    const daysCount = productionChartRange === 'hoje' ? 1 : productionChartRange === '7d' ? 7 : productionChartRange === '30d' ? 30 : 90;
    const result: { label: string; dateStr: string; boxes: number }[] = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: daysCount > 7 ? '2-digit' : 'short',
      });

      const dayProducedBoxes = movements
        .filter((m) => m.type === 'PRODUCAO' && m.createdAt.startsWith(dateStr))
        .reduce((sum, m) => sum + m.quantityBoxes, 0);

      result.push({
        label: dayLabel,
        dateStr,
        boxes: dayProducedBoxes,
      });
    }
    return result;
  }, [movements, productionChartRange]);

  const maxChartBoxes = useMemo(() => {
    const maxVal = Math.max(...productionChartData.map((d) => d.boxes), 10);
    return Math.ceil(maxVal * 1.15);
  }, [productionChartData]);

  // Top stock products
  const topStockProducts = useMemo(() => {
    return [...stockOverview]
      .sort((a, b) => b.totalBoxes - a.totalBoxes)
      .slice(0, 5);
  }, [stockOverview]);

  const maxProductBoxes = useMemo(() => {
    const max = Math.max(...topStockProducts.map((p) => p.totalBoxes), 1);
    return max;
  }, [topStockProducts]);

  // Critical alerts list
  const criticalAlerts = useMemo(() => {
    const alerts: {
      id: string;
      type: 'critical' | 'warning' | 'expired';
      title: string;
      description: string;
      productId?: string;
      batchId?: string;
    }[] = [];

    // Critical stock
    stockOverview.forEach((item) => {
      if (item.status === 'critical') {
        alerts.push({
          id: `crit-stock-${item.product.id}`,
          type: 'critical',
          title: `Estoque Crítico: ${item.product.name}`,
          description: `Apenas ${item.totalBoxes} caixas disponíveis (mínimo de segurança: ${item.product.minimumStock} cx).`,
          productId: item.product.id,
        });
      } else if (item.status === 'low') {
        alerts.push({
          id: `low-stock-${item.product.id}`,
          type: 'warning',
          title: `Estoque Baixo: ${item.product.name}`,
          description: `${item.totalBoxes} caixas em estoque (abaixo do mínimo de ${item.product.minimumStock} cx).`,
          productId: item.product.id,
        });
      }
    });

    // Expired or expiring batches
    batches
      .filter((b) => b.quantityBoxes > 0)
      .forEach((b) => {
        const prod = stockOverview.find((s) => s.product.id === b.productId);
        const prodName = prod ? prod.product.name : 'Produto';

        if (b.status === 'expired') {
          alerts.push({
            id: `exp-${b.id}`,
            type: 'expired',
            title: `Lote Vencido: ${b.batchNumber}`,
            description: `${b.quantityBoxes} caixas de ${prodName} venceram em ${new Date(
              b.expirationDate
            ).toLocaleDateString('pt-BR')}. Requer descarte/avaria.`,
            productId: b.productId,
            batchId: b.id,
          });
        } else if (b.status === 'critical') {
          alerts.push({
            id: `crit-exp-${b.id}`,
            type: 'critical',
            title: `Validade Urgente: Lote ${b.batchNumber}`,
            description: `${prodName} possui ${b.quantityBoxes} cx vencendo em ${new Date(
              b.expirationDate
            ).toLocaleDateString('pt-BR')}. Saída FEFO prioritária.`,
            productId: b.productId,
            batchId: b.id,
          });
        }
      });

    return alerts.slice(0, 5);
  }, [stockOverview, batches]);

  // Recent movements
  const recentMovements = useMemo(() => {
    return [...movements].slice(0, 6);
  }, [movements]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight">Visão Geral do Estoque</h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Acompanhe a situação do estoque e da produção em tempo real.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('production')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D50000] hover:bg-[#B00000] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            + Apontar Produção
          </button>
          <button
            onClick={() => setActiveTab('exits')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-[#DDDDDD] shadow-xs transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-red-600" />
            Saída FEFO
          </button>
        </div>
      </div>

      {/* 4/5 Principal KPI Cards (matching reference) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Estoque Total */}
        <div
          onClick={() => setActiveTab('stock')}
          className="cursor-pointer rounded-xl border-l-4 border-[#D50000] bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Estoque Total</p>
          <p className="mt-1 text-2xl font-black text-[#222222]">
            {totalBoxes.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-[#666666]">cx</span>
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
            {totalPackages.toLocaleString('pt-BR')} pacotes
          </p>
        </div>

        {/* Produção Hoje */}
        <div
          onClick={() => setActiveTab('production')}
          className="cursor-pointer rounded-xl border-l-4 border-[#2E7D32] bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Produção Hoje</p>
          <p className="mt-1 text-2xl font-black text-[#222222]">
            {productionTodayBoxes.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-[#666666]">cx</span>
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]"></span> Turno atual
          </p>
        </div>

        {/* Saídas Hoje */}
        <div
          onClick={() => setActiveTab('exits')}
          className="cursor-pointer rounded-xl border-l-4 border-[#B00000] bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Saídas Hoje</p>
          <p className="mt-1 text-2xl font-black text-[#222222]">
            {exitsTodayBoxes.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-[#666666]">cx</span>
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Expedição & Vendas</p>
        </div>

        {/* Estoque Baixo */}
        <div
          onClick={() => setActiveTab('stock')}
          className="cursor-pointer rounded-xl border-l-4 border-[#F9A825] bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Estoque Baixo</p>
          <p className="mt-1 text-2xl font-black text-[#F9A825]">
            {lowStockCount}{' '}
            <span className="text-xs font-normal text-[#666666]">produtos</span>
          </p>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Abaixo do mínimo</p>
        </div>

        {/* Próximos do Vencimento */}
        <div
          onClick={() => setActiveTab('batches')}
          className="cursor-pointer rounded-xl border-l-4 border-[#C62828] bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Validade &lt; 30d</p>
          <p className="mt-1 text-2xl font-black text-[#C62828]">
            {expiringBatchesCount}{' '}
            <span className="text-xs font-normal text-[#666666]">lotes</span>
          </p>
          <p className="text-[10px] text-red-700 font-semibold mt-0.5">Atenção FEFO</p>
        </div>

        {/* Lotes Vencidos */}
        <div
          onClick={() => setActiveTab('batches')}
          className="cursor-pointer rounded-xl border-l-4 border-gray-900 bg-white p-4 shadow-xs border-y border-r border-[#DDDDDD] hover:shadow-md transition-all"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Lotes Vencidos</p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {expiredBatchesCount}{' '}
            <span className="text-xs font-normal text-[#666666]">lotes</span>
          </p>
          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Bloqueados para venda</p>
        </div>
      </div>

      {/* Main Grid: Charts & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Production Chart & Top Stock */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Trend Bar Chart */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-50 text-[#D50000]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#222222] uppercase tracking-wide">
                    Produção Diária (Caixas)
                  </h3>
                  <p className="text-[11px] text-gray-500">Volume de caixas apontadas por dia</p>
                </div>
              </div>

              {/* Chart range buttons */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto text-xs">
                {(['hoje', '7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setProductionChartRange(range)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors ${
                      productionChartRange === range
                        ? 'bg-white text-[#D50000] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === 'hoje' ? 'Hoje' : range === '7d' ? '7 Dias' : range === '30d' ? '30 Dias' : '90 Dias'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-44 w-full flex items-end justify-between gap-2 px-2 pb-2 border-b border-gray-200">
                {productionChartData.map((d, index) => {
                  const heightPercent = maxChartBoxes > 0 ? (d.boxes / maxChartBoxes) * 100 : 0;
                  const isToday = index === productionChartData.length - 1;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 text-white text-[10px] py-0.5 px-2 rounded font-mono pointer-events-none z-10 whitespace-nowrap shadow-lg">
                        {d.boxes} caixas
                      </div>

                      <div
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                        className={`w-full max-w-[32px] rounded-t-md transition-all ${
                          isToday
                            ? 'bg-[#D50000] hover:bg-[#B00000]'
                            : d.boxes > 0
                            ? 'bg-red-300 hover:bg-red-400'
                            : 'bg-gray-100'
                        }`}
                      />
                      <span className="text-[10px] text-gray-500 font-medium mt-1 truncate max-w-[40px]">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ranking: Top Products in Stock */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#222222] uppercase tracking-wide">
                    Estoque por Produto
                  </h3>
                  <p className="text-[11px] text-gray-500">Produtos com maior volume em caixas</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('stock')}
                className="text-xs font-bold text-[#D50000] hover:underline flex items-center gap-1"
              >
                Ver todos ({stockOverview.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topStockProducts.map((item) => {
                const percent = Math.min(100, (item.totalBoxes / maxProductBoxes) * 100);
                const isLow = item.status === 'low' || item.status === 'critical';

                return (
                  <div key={item.product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <span>{item.product.icon}</span>
                        <span>{item.product.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({item.product.code})</span>
                      </div>
                      <div className="font-extrabold text-[#222222]">
                        {item.totalBoxes} <span className="text-[10px] font-normal text-gray-500">cx</span>{' '}
                        <span className="text-[10px] text-gray-400">({item.totalPackages} pct)</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all ${
                          isLow ? 'bg-[#F9A825]' : 'bg-[#D50000]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Critical Alerts & Latest Movements */}
        <div className="space-y-6">
          {/* Critical Alerts Section */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase text-[#222222] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D50000]" />
                Alertas do Estoque
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#D50000]">
                {criticalAlerts.length} ativos
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalAlerts.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-1 text-emerald-500 opacity-60" />
                  <p className="text-xs font-semibold text-gray-600">Nenhum alerta crítico</p>
                  <p className="text-[10px] text-gray-400">Estoque e validades sob controle.</p>
                </div>
              ) : (
                criticalAlerts.map((al) => (
                  <div
                    key={al.id}
                    className={`flex flex-col gap-1 p-3 rounded-lg border-l-4 text-xs transition-colors ${
                      al.type === 'expired'
                        ? 'border-gray-900 bg-gray-100/90'
                        : al.type === 'critical'
                        ? 'border-[#C62828] bg-red-50/80'
                        : 'border-[#F9A825] bg-amber-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-bold ${
                          al.type === 'expired'
                            ? 'text-gray-900'
                            : al.type === 'critical'
                            ? 'text-[#C62828]'
                            : 'text-amber-800'
                        }`}
                      >
                        {al.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-snug">{al.description}</p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          if (al.productId) setSelectedProductId(al.productId);
                          if (al.type === 'expired' || al.batchId) setActiveTab('batches');
                          else setActiveTab('stock');
                        }}
                        className="text-[10px] font-bold text-[#D50000] hover:underline flex items-center gap-0.5"
                      >
                        Ver produto →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Movements Timeline (matching reference) */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-[#DDDDDD] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-extrabold uppercase text-[#222222] flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Últimas Movimentações
              </h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-[11px] font-bold text-[#D50000] hover:underline"
              >
                Auditoria Completa
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {recentMovements.map((mov) => {
                const isPos = mov.quantityBoxes > 0;
                const isProd = mov.type === 'PRODUCAO';
                const isExit = mov.type === 'SAIDA';
                const isLoss = mov.type === 'PERDA';

                return (
                  <div key={mov.id} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-xs ${
                        isProd
                          ? 'bg-emerald-100 text-emerald-800'
                          : isExit
                          ? 'bg-red-100 text-red-700'
                          : isLoss
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isProd ? '+' : isExit ? '-' : isLoss ? '✕' : '⚙'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 truncate">
                          {isProd ? 'Produção Registrada' : isExit ? 'Saída de Expedição' : mov.reason}
                        </p>
                        <span
                          className={`font-black text-xs ${
                            isPos ? 'text-[#2E7D32]' : 'text-[#C62828]'
                          }`}
                        >
                          {isPos ? `+${mov.quantityBoxes}` : mov.quantityBoxes} cx
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] truncate mt-0.5">
                        {mov.productName} ({mov.quantityPackages} pct)
                      </p>
                      <p className="text-[10px] text-gray-400 italic mt-0.5">
                        {new Date(mov.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        por {mov.userName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

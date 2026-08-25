import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Tags,
  ClipboardList,
  History,
  BarChart3,
  UtensilsCrossed,
  Users,
  Settings,
  AlertTriangle,
  LogOut,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, lowStockCount, expiringBatchesCount, currentUser, logout, canAccess } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, roles: ['Administrador', 'Gestor', 'Estoquista', 'Produção', 'Consulta'] },
    {
      id: 'stock',
      label: 'Estoque de Salgados',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-[#F9A825] text-white',
      roles: ['Administrador', 'Gestor', 'Estoquista', 'Produção', 'Consulta'],
    },
    { id: 'production', label: 'Apontamento Produção', icon: Zap, highlight: true, roles: ['Administrador', 'Gestor', 'Produção'] },
    { id: 'entries', label: 'Entradas', icon: ArrowDownLeft, badge: null, roles: ['Administrador', 'Gestor', 'Estoquista'] },
    { id: 'exits', label: 'Saídas & Expedição (FEFO)', icon: ArrowUpRight, badge: null, roles: ['Administrador', 'Gestor', 'Estoquista'] },
    {
      id: 'batches',
      label: 'Lotes & Validade',
      icon: Tags,
      badge: expiringBatchesCount > 0 ? `${expiringBatchesCount}` : null,
      badgeColor: 'bg-[#C62828] text-white',
      roles: ['Administrador', 'Gestor', 'Estoquista', 'Produção', 'Consulta'],
    },
    { id: 'inventory', label: 'Inventário Físico', icon: ClipboardList, badge: null, roles: ['Administrador', 'Gestor', 'Estoquista', 'Produção'] },
    { id: 'history', label: 'Histórico & Auditoria', icon: History, badge: null, roles: ['Administrador', 'Gestor', 'Consulta'] },
    { id: 'reports', label: 'Relatórios Gerenciais', icon: BarChart3, badge: null, roles: ['Administrador', 'Gestor', 'Consulta'] },
    { id: 'users', label: 'Usuários & Permissões', icon: Users, badge: null, roles: ['Administrador', 'Gestor'] },
    { id: 'settings', label: 'Configurações', icon: Settings, badge: null, roles: ['Administrador'] },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Gestor':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Estoquista':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Produção':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-[#DDDDDD] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Navegação Principal
          </p>

          <nav className="space-y-1">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(currentUser.role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#D50000]/10 text-[#D50000] font-bold shadow-xs'
                        : 'text-[#666666] hover:bg-gray-100/80 hover:text-[#222222]'
                    } ${item.highlight && !isActive ? 'border-l-2 border-[#D50000] text-gray-800' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#D50000]' : item.highlight ? 'text-[#D50000]' : 'text-gray-500'
                        }`}
                      />
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-200 text-gray-700'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer with logged-in user profile & Logout */}
        <div className="p-3 border-t border-[#DDDDDD] bg-gray-50/90 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#D50000] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate text-xs leading-tight">{currentUser.name}</p>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-gray-500 text-[10px] font-medium pt-1 border-t border-gray-200/60">
            <span>Sistema v1.2</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

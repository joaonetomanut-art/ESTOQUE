import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Menu,
  ChevronDown,
  UserCheck,
  Package,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    unreadNotificationsCount,
    setIsNotificationOpen,
    resetAllData,
    showToast,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
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
    <header className="flex h-16 w-full items-center justify-between bg-[#D50000] px-4 md:px-6 text-white shadow-md select-none sticky top-0 z-30">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          title="Menu de navegação"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-extrabold leading-tight tracking-wide flex items-center gap-1.5">
            <span>GESTÃO DE ESTOQUE</span>
          </h1>
          <p className="text-[11px] md:text-xs text-white/90 font-medium">Salgados Congelados</p>
        </div>
      </div>

      {/* Right: Notifications, User Profile & Fast Switcher */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 rounded-full hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          title="Central de Alertas e Notificações"
          aria-label="Ver notificações"
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-white text-[10px] md:text-xs font-black text-[#D50000] shadow-sm animate-pulse">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Info & Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 border-l border-white/20 pl-3 md:pl-5 py-1 rounded hover:bg-white/10 transition-colors focus:outline-none"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-white/80 uppercase font-semibold tracking-wider">
                {currentUser.role}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.avatar}
            </div>
            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>

          {/* User Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-[#222222] shadow-2xl border border-[#DDDDDD] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuário Ativo
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <div className="mt-2">
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    Perfil: {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Fast switch profile */}
              <div className="px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
                  Simular / Trocar Perfil:
                </p>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-[#D50000]/10 text-[#D50000] font-bold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 text-[10px] flex items-center justify-center font-bold">
                          {u.avatar}
                        </span>
                        <span className="truncate max-w-[140px] text-left">{u.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 px-3 pt-2 mt-1 space-y-1">
                <button
                  onClick={() => {
                    if (confirm('Deseja restaurar os dados padrão demonstrativos?')) {
                      resetAllData();
                      setUserDropdownOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restaurar Dados Padrão (Demo)
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Encerrar Sessão (Logout)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 hidden sm:flex items-center gap-1.5 text-xs font-bold"
          title="Encerrar Sessão"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

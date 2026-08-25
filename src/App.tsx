import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Toast } from './components/common/Toast';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StockView } from './components/stock/StockView';
import { ProductionWizard } from './components/production/ProductionWizard';
import { EntriesView } from './components/entries/EntriesView';
import { ExitsView } from './components/exits/ExitsView';
import { BatchesView } from './components/batches/BatchesView';
import { InventoryView } from './components/inventory/InventoryView';
import { HistoryView } from './components/history/HistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedNotice: React.FC<{ roleName: string }> = ({ roleName }) => {
  const { setActiveTab } = useApp();
  return (
    <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-sm my-12 space-y-4">
      <div className="h-16 w-16 rounded-full bg-red-100 text-[#D50000] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black text-gray-900">Acesso Restrito</h3>
      <p className="text-sm text-gray-600">
        Seu perfil atual (<strong>{roleName}</strong>) não possui permissão para acessar este módulo administrativo.
      </p>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="px-6 py-2.5 bg-[#D50000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B71C1C] transition-all"
      >
        Voltar ao Painel Principal
      </button>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { activeTab, isAuthenticated, currentUser, canAccess } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <Toast />
        <LoginView />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'stock':
        return <StockView />;
      case 'production':
        return <ProductionWizard />;
      case 'entries':
        return <EntriesView />;
      case 'exits':
        return <ExitsView />;
      case 'batches':
        return <BatchesView />;
      case 'inventory':
        return <InventoryView />;
      case 'history':
        return <HistoryView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        if (!canAccess(['Administrador', 'Gestor'])) {
          return <UnauthorizedNotice roleName={currentUser.role} />;
        }
        return <UsersView />;
      case 'settings':
        if (!canAccess(['Administrador'])) {
          return <UnauthorizedNotice roleName={currentUser.role} />;
        }
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F5F5] font-sans antialiased text-[#222222] overflow-hidden select-none">
      {/* Toast Notification Container */}
      <Toast />

      {/* Global Notifications Drawer */}
      <NotificationDrawer />

      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

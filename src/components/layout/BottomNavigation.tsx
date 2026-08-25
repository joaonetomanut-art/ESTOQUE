import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Boxes, Zap, History, Settings } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const mobileItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Estoque', icon: Boxes },
    { id: 'production', label: 'Produção', icon: Zap },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Config.', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#DDDDDD] flex items-center justify-around px-2 z-30 shadow-lg">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-[#D50000]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div
              className={`p-1 rounded-full transition-all ${
                isActive ? 'bg-[#D50000]/10 scale-110' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#D50000] stroke-[2.5]' : 'stroke-[1.75]'}`} />
            </div>
            <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold text-[#D50000]' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

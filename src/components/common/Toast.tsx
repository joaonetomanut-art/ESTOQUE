import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const getStyle = () => {
    switch (toastMessage.type) {
      case 'success':
        return 'bg-emerald-800 text-white border-emerald-900';
      case 'error':
        return 'bg-[#C62828] text-white border-red-900';
      case 'warning':
        return 'bg-[#F9A825] text-gray-950 border-amber-600';
      default:
        return 'bg-slate-800 text-white border-slate-900';
    }
  };

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 shrink-0 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 shrink-0 text-gray-950" />;
      default:
        return <Info className="w-5 h-5 shrink-0 text-blue-200" />;
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${getStyle()}`}
      >
        {getIcon()}
        <p className="text-xs sm:text-sm font-semibold leading-snug">{toastMessage.text}</p>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    setSelectedProductId,
  } = useApp();

  if (!isNotificationOpen) return null;

  const handleActionClick = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    setIsNotificationOpen(false);

    if (notif.category === 'stock' && notif.productId) {
      setSelectedProductId(notif.productId);
      setActiveTab('stock');
    } else if (notif.category === 'expiration') {
      setActiveTab('batches');
    } else if (notif.category === 'production') {
      setActiveTab('history');
    } else if (notif.category === 'inventory') {
      setActiveTab('inventory');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#DDDDDD] animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="bg-[#D50000] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5" />
              <h2 className="text-base font-bold">Central de Alertas & Notificações</h2>
            </div>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action toolbar */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              {notifications.filter((n) => !n.read).length} não lidas
            </span>
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 text-[#D50000] hover:text-[#B00000] font-semibold transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-500" />
                <p className="text-sm font-semibold">Nenhuma notificação</p>
                <p className="text-xs text-gray-500 mt-1">Tudo calmo no estoque de salgados.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isCritical = notif.type === 'critical';
                const isWarning = notif.type === 'warning';
                const isSuccess = notif.type === 'success';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.read
                        ? 'bg-white border-gray-200 opacity-75'
                        : isCritical
                        ? 'bg-red-50/80 border-red-200 shadow-xs'
                        : isWarning
                        ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                        : isSuccess
                        ? 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                        : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isCritical && <AlertOctagon className="w-5 h-5 text-[#C62828]" />}
                        {isWarning && <AlertTriangle className="w-5 h-5 text-[#F9A825]" />}
                        {isSuccess && <CheckCircle className="w-5 h-5 text-[#2E7D32]" />}
                        {!isCritical && !isWarning && !isSuccess && (
                          <Info className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-bold ${
                              isCritical
                                ? 'text-[#C62828]'
                                : isWarning
                                ? 'text-amber-900'
                                : isSuccess
                                ? 'text-emerald-900'
                                : 'text-blue-900'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notif.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed">{notif.message}</p>

                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-black/5">
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="text-[11px] font-bold text-[#D50000] hover:text-[#B00000] flex items-center gap-1"
                          >
                            Ver detalhes <ArrowRight className="w-3 h-3" />
                          </button>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              className="text-[10px] text-gray-500 hover:text-gray-800"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

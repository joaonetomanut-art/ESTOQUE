import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ThermometerSnowflake,
  Boxes,
  Users,
  X,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, showToast } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestRole, setRequestRole] = useState('Estoquista');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    }, 250);
  };

  const handleRequestAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim() || !requestEmail.trim()) {
      showToast('Preencha seu nome e e-mail para solicitar o acesso.', 'warning');
      return;
    }
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setShowRequestAccessModal(false);
      setRequestName('');
      setRequestEmail('');
      showToast('Solicitação de acesso enviada ao Administrador Geral!', 'success');
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] flex flex-col justify-between text-[#222222] antialiased select-none font-sans">
      {/* Top Brand Bar */}
      <header className="w-full bg-[#D50000] text-white py-3.5 px-4 sm:px-8 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white text-[#D50000] flex items-center justify-center font-black text-lg shadow-sm">
            🥟
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide leading-tight">
              SALGADOS CONGELADOS
            </h1>
            <p className="text-[11px] text-white/90 font-medium">
              Controle de Estoque, Produção & Validade FEFO
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-lg">
          <ThermometerSnowflake className="w-4 h-4 text-white" />
          <span>Câmara Fria: -18°C a -20°C</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 max-w-lg mx-auto w-full">
        <div className="w-full flex flex-col items-center">
          {/* Centered Login Card */}
          <div className="w-full bg-white rounded-2xl border border-[#DDDDDD] shadow-xl p-6 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#D50000] text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ambiente Autenticado</span>
              </div>
              <h2 className="text-2xl font-black text-[#222222] tracking-tight">
                Acessar Sistema
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Entre com suas credenciais de usuário e senha corporativa.
              </p>
            </div>

            {/* Error alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Acesso não autorizado</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: seu.usuario ou e-mail..."
                    required
                    autoFocus
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-[#DDDDDD] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000] focus:border-[#D50000] transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs text-[#D50000] hover:underline font-semibold"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-[#DDDDDD] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000] focus:border-[#D50000] transition-colors font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#D50000] focus:ring-[#D50000]"
                  />
                  <span>Lembrar usuário</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ajuda</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#D50000] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Novo colaborador?</span>
              <button
                type="button"
                onClick={() => setShowRequestAccessModal(true)}
                className="font-bold text-[#D50000] hover:underline"
              >
                Solicitar Acesso ao ADM
              </button>
            </div>
          </div>

          {/* Bottom Security Highlights */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl border border-[#DDDDDD] p-3 text-center">
              <Boxes className="w-4 h-4 text-[#D50000] mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-900">Rastreio FEFO</p>
              <p className="text-[10px] text-gray-500">Controle rigoroso de validade</p>
            </div>

            <div className="bg-white/80 rounded-xl border border-[#DDDDDD] p-3 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-900">Acesso Seguro</p>
              <p className="text-[10px] text-gray-500">Permissões e auditoria por usuário</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-[#DDDDDD] bg-white text-center text-xs text-gray-500 px-4">
        <p>
          Sistema de Gestão de Salgados Congelados • © 2026 • Todos os direitos reservados.
        </p>
      </footer>

      {/* Modal: Ajuda com Credenciais */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DDDDDD] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#D50000] mb-3">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Ajuda com Acesso e Credenciais</h3>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              O sistema utiliza autenticação individual por usuário e senha. Se você esqueceu sua senha ou não possui credenciais, solicite o reset ou cadastro ao Administrador Geral da sua unidade.
            </p>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D50000]" />
                Boas Práticas de Segurança:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500">
                <li>Nunca compartilhe seu usuário e senha com terceiros.</li>
                <li>Encerre a sessão (Logout) ao deixar o terminal de trabalho.</li>
                <li>Operações de estoque e expedição ficam registradas no seu histórico.</li>
              </ul>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  setShowRequestAccessModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                Solicitar Novo Acesso
              </button>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-[#D50000] text-white font-bold text-xs hover:bg-[#B71C1C] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Solicitar Novo Acesso */}
      {showRequestAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDDDDD] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowRequestAccessModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D50000] mb-2">
              <Users className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Solicitar Cadastro de Acesso</h3>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Informe seus dados para que o Administrador configure seu login e senha no sistema.
            </p>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-gray-900">Solicitação Enviada!</h4>
                <p className="text-xs text-gray-500">
                  O Administrador foi notificado e entrará em contato com sua senha de primeiro acesso.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestAccessSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    required
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Perfil Desejado
                  </label>
                  <select
                    value={requestRole}
                    onChange={(e) => setRequestRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  >
                    <option value="Estoquista">Operacional - Estoque & Expedição</option>
                    <option value="Produção">Operacional - Fábrica & Produção</option>
                    <option value="Gestor">Perfil Gerencial / Qualidade</option>
                    <option value="Consulta">Perfil Consulta / Auditoria</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestAccessModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#D50000] text-white hover:bg-[#B71C1C]"
                  >
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

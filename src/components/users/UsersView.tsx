import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserPermissions } from '../../types';
import { getDefaultPermissions } from '../../services/storage';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  History,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  X,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const {
    users,
    currentUser,
    accessLogs,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    toggleUserStatus,
    switchUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'permissions'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states for Create User
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    department: 'Estoque & Expedição',
    role: 'Estoquista' as UserRole,
    active: true,
  });

  // Custom permissions state for Create/Edit
  const [customPerms, setCustomPerms] = useState<UserPermissions>(getDefaultPermissions('Estoquista'));
  const [customPermsOpen, setCustomPermsOpen] = useState(false);

  // Form states for Change Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.active) ||
        (statusFilter === 'INACTIVE' && !u.active);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers for Modals
  const handleOpenCreate = () => {
    const defaultRole: UserRole = 'Estoquista';
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      department: 'Estoque & Expedição',
      role: defaultRole,
      active: true,
    });
    setCustomPerms(getDefaultPermissions(defaultRole));
    setCustomPermsOpen(false);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username || '',
      email: user.email,
      password: '',
      department: user.department || 'Geral',
      role: user.role,
      active: user.active !== false,
    });
    setCustomPerms(user.permissions || getDefaultPermissions(user.role));
    setCustomPermsOpen(false);
    setShowEditModal(true);
  };

  const handleOpenChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleRoleChangeInForm = (newRole: UserRole) => {
    setFormData((prev) => ({ ...prev, role: newRole }));
    setCustomPerms(getDefaultPermissions(newRole));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createUser({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      role: formData.role,
      permissions: customPerms,
      active: formData.active,
    });

    if (res.success) {
      setShowCreateModal(false);
    } else {
      showToast(res.error || 'Erro ao criar usuário.', 'error');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = updateUser(selectedUser.id, {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      department: formData.department,
      role: formData.role,
      permissions: customPerms,
      active: formData.active,
    });

    if (res.success) {
      setShowEditModal(false);
    } else {
      showToast(res.error || 'Erro ao atualizar usuário.', 'error');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newPassword !== confirmPassword) {
      showToast('As senhas digitadas não coincidem.', 'error');
      return;
    }

    const res = changePassword(selectedUser.id, newPassword);
    if (res.success) {
      setShowPasswordModal(false);
    } else {
      showToast(res.error || 'Erro ao alterar senha.', 'error');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Administrador':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Gestor':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Estoquista':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Produção':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Consulta':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const permissionLabels: Record<keyof UserPermissions, string> = {
    dashboard: 'Visualizar Dashboard Principal',
    stockView: 'Visualizar Estoque & Posição de Câmaras',
    stockMovement: 'Lançar Entradas / Movimentações',
    production: 'Apontar Produção & Gerar Etiquetas',
    fefoExit: 'Realizar Saída & Expedição (FEFO)',
    batches: 'Gestão e Consulta de Lotes & Validade',
    inventory: 'Realizar Contagens de Inventário Físico',
    inventoryApprove: 'Homologar & Ajustar Divergências de Inventário',
    reports: 'Visualizar Relatórios Gerenciais & Financeiros',
    productsManage: 'Cadastrar e Editar Produtos / Salgados',
    usersManage: 'Gerenciar Usuários, Senhas & Permissões',
    settingsManage: 'Acessar Parâmetros & Configurações Globais',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D50000]" />
            <span>Gestão de Usuários & Permissões</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Gerenciamento de contas, credenciais de login/senha e controle granular de acessos (RBAC).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D50000] hover:bg-[#B71C1C] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[#D50000] text-[#D50000]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários Ativos ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'permissions'
              ? 'border-[#D50000] text-[#D50000]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriz de Cargos</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-[#D50000] text-[#D50000]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Auditoria de Acessos ({accessLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS LIST & MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters and search */}
          <div className="bg-white p-4 rounded-xl border border-[#DDDDDD] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, login, e-mail ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">Perfil:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
              >
                <option value="ALL">Todos os Cargos</option>
                <option value="Administrador">👑 Administrador</option>
                <option value="Gestor">📊 Perfil Gerencial</option>
                <option value="Estoquista">⚡ Operacional Estoque</option>
                <option value="Produção">🥟 Operacional Produção</option>
                <option value="Consulta">👁️ Perfil Consulta</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ACTIVE">Apenas Ativos</option>
                <option value="INACTIVE">Apenas Inativos</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isCurrent = user.id === currentUser.id;
              const isMasterAdmin = user.username === 'admin';

              return (
                <div
                  key={user.id}
                  className={`bg-white rounded-xl border transition-all flex flex-col justify-between p-4 shadow-xs hover:shadow-md ${
                    isCurrent
                      ? 'border-[#D50000] ring-2 ring-red-100'
                      : !user.active
                      ? 'border-gray-200 bg-gray-50/70 opacity-75'
                      : 'border-[#DDDDDD]'
                  }`}
                >
                  <div>
                    {/* Top User Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-gray-900 leading-tight">
                              {user.name}
                            </h3>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-[#D50000]">
                                Você
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* Meta info & login details */}
                    <div className="mt-3.5 space-y-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 font-medium">Login:</span>
                        <span className="font-mono font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {user.username || user.email.split('@')[0]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 font-medium">Setor / Dep.:</span>
                        <span className="font-medium text-gray-700">{user.department || 'Operações'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 font-medium">Status:</span>
                        <span
                          className={`font-bold flex items-center gap-1 text-[11px] ${
                            user.active ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {user.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-600" /> Inativo
                            </>
                          )}
                        </span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center justify-between text-gray-500 text-[10px] pt-1 border-t border-gray-200/60">
                          <span>Último Acesso:</span>
                          <span>{new Date(user.lastLogin).toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        title="Editar Usuário"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenChangePassword(user)}
                        title="Alterar Senha"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {!isMasterAdmin && (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          title={user.active ? 'Inativar Usuário' : 'Ativar Usuário'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.active
                              ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.active ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {!isMasterAdmin && !isCurrent && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o usuário "${user.name}"?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          title="Excluir Usuário"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {!isCurrent && user.active && (
                      <button
                        onClick={() => switchUser(user)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#D50000] hover:text-white text-gray-700 text-[11px] font-bold rounded-lg transition-colors"
                      >
                        Trocar Perfil
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-xl p-6 border border-[#DDDDDD] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D50000]" />
                <span>Matriz de Permissões Padrão por Perfil</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Resumo dos privilégios de acesso concedidos a cada função operacional do sistema.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Funcionalidade / Módulo</th>
                  <th className="py-3 px-3 text-center bg-amber-50/80 text-amber-900 border-x border-amber-200">
                    👑 Administrador
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/80 text-blue-900 border-r border-blue-200">
                    📊 Gestor
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/80 text-purple-900 border-r border-purple-200">
                    ⚡ Estoquista
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/80 text-emerald-900 border-r border-emerald-200">
                    🥟 Produção
                  </th>
                  <th className="py-3 px-3 text-center bg-gray-50 text-gray-800">
                    👁️ Consulta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((key) => {
                  const adminVal = getDefaultPermissions('Administrador')[key];
                  const gestorVal = getDefaultPermissions('Gestor')[key];
                  const estoqueVal = getDefaultPermissions('Estoquista')[key];
                  const prodVal = getDefaultPermissions('Produção')[key];
                  const consultaVal = getDefaultPermissions('Consulta')[key];

                  return (
                    <tr key={key} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-3.5 font-bold text-gray-800">
                        {permissionLabels[key]}
                      </td>
                      <td className="py-2.5 px-3 text-center border-x border-amber-100 bg-amber-50/30">
                        {adminVal ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-blue-100 bg-blue-50/30">
                        {gestorVal ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-purple-100 bg-purple-50/30">
                        {estoqueVal ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-emerald-100 bg-emerald-50/30">
                        {prodVal ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {consultaVal ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS & AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl p-6 border border-[#DDDDDD] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#D50000]" />
                <span>Trilha de Auditoria & Tentativas de Login</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Registro detalhado de autenticações, alterações de senhas e bloqueios de segurança.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg self-start sm:self-auto">
              Total: {accessLogs.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Perfil</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dispositivo / Origem</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accessLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Nenhum registro de acesso registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  accessLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80">
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-3 font-bold text-gray-900">
                        {log.userName}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRoleBadge(log.userRole)}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-700">
                        {log.action === 'LOGIN' && '🔑 Login Efetuado'}
                        {log.action === 'LOGOUT' && '🚪 Logout / Saída'}
                        {log.action === 'FAILED_LOGIN' && '⚠️ Falha de Login'}
                        {log.action === 'PASSWORD_CHANGE' && '🔒 Alteração de Senha'}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status === 'SUCCESS' ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-[11px] whitespace-nowrap">
                        {log.device || 'Navegador Web'}
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs truncate max-w-xs">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#DDDDDD] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D50000] mb-4">
              <UserPlus className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Cadastrar Novo Usuário</h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome de Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ex: joao.silva"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@salgados.com.br"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Perfil / Cargo *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  >
                    <option value="Administrador">👑 Administrador (Acesso Total)</option>
                    <option value="Gestor">📊 Perfil Gerencial / Supervisão</option>
                    <option value="Estoquista">⚡ Operacional - Estoque & Expedição</option>
                    <option value="Produção">🥟 Operacional - Fábrica & Produção</option>
                    <option value="Consulta">👁️ Perfil Consulta (Apenas Leitura)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Departamento / Setor
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ex: Câmara Fria, Expedição..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>
              </div>

              {/* Custom permissions toggle */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setCustomPermsOpen(!customPermsOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D50000]" />
                    <span>Personalizar Permissões Específicas ({Object.values(customPerms).filter(Boolean).length} ativas)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${customPermsOpen ? 'rotate-180' : ''}`} />
                </button>

                {customPermsOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((permKey) => (
                      <label key={permKey} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input
                          type="checkbox"
                          checked={!!customPerms[permKey]}
                          onChange={(e) =>
                            setCustomPerms({ ...customPerms, [permKey]: e.target.checked })
                          }
                          className="rounded text-[#D50000] focus:ring-[#D50000]"
                        />
                        <span className="text-gray-700">{permissionLabels[permKey]}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#D50000] hover:bg-[#B71C1C] text-white rounded-xl shadow-md"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#DDDDDD] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D50000] mb-4">
              <Edit2 className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Editar Usuário: {selectedUser.name}</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Login de Usuário *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={selectedUser.username === 'admin'}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000] disabled:bg-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Departamento / Setor
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Perfil / Cargo *
                </label>
                <select
                  disabled={selectedUser.username === 'admin'}
                  value={formData.role}
                  onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000] disabled:bg-gray-200"
                >
                  <option value="Administrador">👑 Administrador (Acesso Total)</option>
                  <option value="Gestor">📊 Perfil Gerencial / Supervisão</option>
                  <option value="Estoquista">⚡ Operacional - Estoque & Expedição</option>
                  <option value="Produção">🥟 Operacional - Fábrica & Produção</option>
                  <option value="Consulta">👁️ Perfil Consulta (Apenas Leitura)</option>
                </select>
              </div>

              {/* Custom permissions toggle */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setCustomPermsOpen(!customPermsOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D50000]" />
                    <span>Permissões Granulares ({Object.values(customPerms).filter(Boolean).length} ativas)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${customPermsOpen ? 'rotate-180' : ''}`} />
                </button>

                {customPermsOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((permKey) => (
                      <label key={permKey} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded">
                        <input
                          type="checkbox"
                          checked={!!customPerms[permKey]}
                          onChange={(e) =>
                            setCustomPerms({ ...customPerms, [permKey]: e.target.checked })
                          }
                          className="rounded text-[#D50000] focus:ring-[#D50000]"
                        />
                        <span className="text-gray-700">{permissionLabels[permKey]}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#D50000] hover:bg-[#B71C1C] text-white rounded-xl shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDDDDD] shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Alterar Senha</h3>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Defina uma nova senha para o usuário <strong>{selectedUser.name}</strong> ({selectedUser.username}).
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D50000]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

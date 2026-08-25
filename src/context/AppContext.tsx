import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  StorageLocation,
  Batch,
  StockMovement,
  ProductionRecord,
  InventoryCount,
  InventoryItemCount,
  SystemNotification,
  User,
  UserRole,
  UserPermissions,
  AccessLog,
  StockOverviewItem,
  StockStatus,
  ProductionItem,
  MovementType,
} from '../types';
import { storageService, computeBatchStatus, getDefaultPermissions } from '../services/storage';

interface AppContextType {
  // Auth & Session
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  accessLogs: AccessLog[];

  // Data
  products: Product[];
  categories: Category[];
  locations: StorageLocation[];
  batches: Batch[];
  movements: StockMovement[];
  productionRecords: ProductionRecord[];
  inventoryCounts: InventoryCount[];
  notifications: SystemNotification[];
  users: User[];
  currentUser: User;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // Calculated aggregates
  stockOverview: StockOverviewItem[];
  totalBoxes: number;
  totalPackages: number;
  productionTodayBoxes: number;
  exitsTodayBoxes: number;
  lowStockCount: number;
  criticalStockCount: number;
  expiringBatchesCount: number;
  expiredBatchesCount: number;
  unreadNotificationsCount: number;

  // Permissions & User Management
  canAccess: (minRole: UserRole[]) => boolean;
  hasPermission: (permissionKey: keyof UserPermissions) => boolean;
  switchUser: (user: User) => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'avatar'> & { avatar?: string }) => {
    success: boolean;
    error?: string;
  };
  updateUser: (id: string, userData: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  changePassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  toggleUserStatus: (userId: string) => { success: boolean; error?: string };

  // Actions
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  updateProduct: (id: string, product: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };

  registerProduction: (
    items: ProductionItem[],
    batchNumber: string,
    manufacturingDate: string,
    expirationDate: string,
    locationId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  registerEntry: (
    productId: string,
    boxes: number,
    batchNumber: string,
    manufacturingDate: string,
    expirationDate: string,
    locationId: string,
    reason: string,
    supplier?: string,
    notes?: string
  ) => { success: boolean; error?: string };

  registerExit: (
    productId: string,
    batchId: string,
    boxes: number,
    type: MovementType,
    reason: string,
    destination?: string,
    notes?: string
  ) => { success: boolean; error?: string };

  getFEFOSuggestion: (productId: string) => Batch | null;

  adjustStock: (
    productId: string,
    batchId: string,
    newBoxesCount: number,
    reason: string,
    notes?: string
  ) => { success: boolean; error?: string };

  createInventory: (title: string, categoryId?: string, locationId?: string) => InventoryCount;
  updateInventoryItem: (inventoryId: string, productId: string, physicalBoxes: number, justification?: string) => void;
  finalizeInventory: (inventoryId: string) => { success: boolean; error?: string };

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [locations, setLocations] = useState<StorageLocation[]>(() => storageService.getLocations());
  const [batches, setBatches] = useState<Batch[]>(() => storageService.getBatches());
  const [movements, setMovements] = useState<StockMovement[]>(() => storageService.getMovements());
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() => storageService.getProductionRecords());
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>(() => storageService.getInventoryCounts());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => storageService.getNotifications());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.getAuthState());
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => storageService.getAccessLogs());

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Sync to storage on updates
  useEffect(() => {
    storageService.setProducts(products);
  }, [products]);

  useEffect(() => {
    storageService.setCategories(categories);
  }, [categories]);

  useEffect(() => {
    storageService.setLocations(locations);
  }, [locations]);

  useEffect(() => {
    storageService.setBatches(batches);
  }, [batches]);

  useEffect(() => {
    storageService.setMovements(movements);
  }, [movements]);

  useEffect(() => {
    storageService.setProductionRecords(productionRecords);
  }, [productionRecords]);

  useEffect(() => {
    storageService.setInventoryCounts(inventoryCounts);
  }, [inventoryCounts]);

  useEffect(() => {
    storageService.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storageService.setUsers(users);
  }, [users]);

  useEffect(() => {
    storageService.setCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.setAuthState(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    storageService.setAccessLogs(accessLogs);
  }, [accessLogs]);

  // Auth & Permissions Handlers
  const login = (identifier: string, password: string): { success: boolean; error?: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedId) {
      return { success: false, error: 'Por favor, informe seu usuário ou e-mail corporativo.' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Por favor, digite sua senha de acesso.' };
    }

    const foundUser = users.find(
      (u) =>
        (u.username?.toLowerCase() === trimmedId || u.email?.toLowerCase() === trimmedId)
    );

    if (!foundUser) {
      // Log failed attempt
      storageService.addAccessLog({
        userId: 'anonymous',
        userName: trimmedId,
        userRole: 'Consulta',
        action: 'FAILED_LOGIN',
        status: 'FAILED',
        device: 'Web Client',
        details: `Tentativa de login com usuário inexistente: ${trimmedId}`,
      });
      setAccessLogs(storageService.getAccessLogs());
      return { success: false, error: 'Usuário ou e-mail não encontrado no sistema.' };
    }

    if (!foundUser.active) {
      return {
        success: false,
        error: 'Este usuário está inativado no sistema. Entre em contato com o Administrador.',
      };
    }

    // Check password (supports default users without set password as matching)
    if (foundUser.password && foundUser.password !== trimmedPass) {
      storageService.addAccessLog({
        userId: foundUser.id,
        userName: foundUser.name,
        userRole: foundUser.role,
        action: 'FAILED_LOGIN',
        status: 'FAILED',
        device: 'Web Client',
        details: 'Tentativa de login com senha incorreta',
      });
      setAccessLogs(storageService.getAccessLogs());
      return { success: false, error: 'Senha incorreta para este usuário.' };
    }

    // Success login
    const updatedUser: User = {
      ...foundUser,
      lastLogin: new Date().toISOString(),
    };

    const updatedUsers = users.map((u) => (u.id === foundUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);

    storageService.addAccessLog({
      userId: foundUser.id,
      userName: foundUser.name,
      userRole: foundUser.role,
      action: 'LOGIN',
      status: 'SUCCESS',
      device: 'Web Client / Dashboard',
      details: 'Login efetuado com sucesso',
    });
    setAccessLogs(storageService.getAccessLogs());

    showToast(`Bem-vindo, ${foundUser.name}! Acesso liberado como ${foundUser.role}.`, 'success');
    return { success: true };
  };

  const logout = () => {
    storageService.addAccessLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'LOGOUT',
      status: 'SUCCESS',
      device: 'Web Client',
      details: 'Sessão encerrada pelo usuário',
    });
    setAccessLogs(storageService.getAccessLogs());
    setIsAuthenticated(false);
    showToast('Você encerrou a sessão com segurança.', 'info');
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Administrador') return true;
    return allowedRoles.includes(currentUser.role);
  };

  const hasPermission = (permissionKey: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Administrador') return true;
    if (currentUser.permissions && typeof currentUser.permissions[permissionKey] === 'boolean') {
      return !!currentUser.permissions[permissionKey];
    }
    const defaultPerms = getDefaultPermissions(currentUser.role);
    return !!defaultPerms[permissionKey];
  };

  const switchUser = (user: User) => {
    if (!user.active) {
      showToast('Não é possível alternar para um usuário inativo.', 'error');
      return;
    }
    setCurrentUser(user);
    storageService.addAccessLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      status: 'SUCCESS',
      device: 'Troca Rápida de Perfil',
      details: `Alternado para perfil ${user.role}`,
    });
    setAccessLogs(storageService.getAccessLogs());
    showToast(`Perfil alterado para ${user.name} (${user.role})`, 'info');
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    if (!userData.name.trim()) return { success: false, error: 'O nome completo é obrigatório.' };
    if (!userData.username.trim()) return { success: false, error: 'O nome de usuário (login) é obrigatório.' };
    if (!userData.password || userData.password.length < 4) {
      return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
    }

    const cleanUsername = userData.username.trim().toLowerCase();
    const existing = users.find(
      (u) => u.username?.toLowerCase() === cleanUsername || u.email?.toLowerCase() === userData.email.trim().toLowerCase()
    );

    if (existing) {
      return { success: false, error: 'Já existe um usuário cadastrado com este login ou e-mail.' };
    }

    const initials = userData.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'US';

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      email: userData.email.trim().toLowerCase(),
      avatar: initials,
      permissions: userData.permissions || getDefaultPermissions(userData.role),
      createdAt: new Date().toISOString(),
      active: userData.active !== undefined ? userData.active : true,
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`Usuário "${newUser.name}" criado com sucesso! Perfil: ${newUser.role}`);
    return { success: true };
  };

  const updateUser = (id: string, userData: Partial<User>): { success: boolean; error?: string } => {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return { success: false, error: 'Usuário não encontrado.' };

    const targetUser = users[userIndex];

    // Protect primary admin from losing admin status
    if (targetUser.username === 'admin' && userData.role && userData.role !== 'Administrador') {
      return { success: false, error: 'O usuário administrador mestre não pode ter seu cargo alterado.' };
    }

    // Check duplicate username/email if changed
    if (userData.username && userData.username.toLowerCase() !== targetUser.username.toLowerCase()) {
      const dup = users.find((u) => u.id !== id && u.username.toLowerCase() === userData.username!.toLowerCase());
      if (dup) return { success: false, error: 'Este nome de usuário já está em uso.' };
    }

    const updated: User = {
      ...targetUser,
      ...userData,
      permissions: userData.role && userData.role !== targetUser.role
        ? (userData.permissions || getDefaultPermissions(userData.role))
        : (userData.permissions || targetUser.permissions || getDefaultPermissions(targetUser.role)),
    };

    const newUsers = [...users];
    newUsers[userIndex] = updated;
    setUsers(newUsers);

    if (currentUser.id === id) {
      setCurrentUser(updated);
    }

    showToast(`Usuário "${updated.name}" atualizado com sucesso!`);
    return { success: true };
  };

  const changePassword = (userId: string, newPassword: string): { success: boolean; error?: string } => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'A nova senha deve possuir ao menos 4 caracteres.' };
    }

    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));
    setUsers(updatedUsers);

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, password: newPassword }));
    }

    storageService.addAccessLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      device: 'Web Client / Painel de Usuários',
      details: 'Senha alterada com sucesso',
    });
    setAccessLogs(storageService.getAccessLogs());

    showToast(`Senha do usuário ${user.name} atualizada com sucesso!`);
    return { success: true };
  };

  const toggleUserStatus = (userId: string): { success: boolean; error?: string } => {
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };

    if (user.id === currentUser.id) {
      return { success: false, error: 'Você não pode inativar seu próprio usuário conectado.' };
    }

    if (user.username === 'admin') {
      return { success: false, error: 'O Administrador Geral não pode ser inativado.' };
    }

    const updatedStatus = !user.active;
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, active: updatedStatus } : u));
    setUsers(updatedUsers);

    showToast(
      `Usuário "${user.name}" ${updatedStatus ? 'ativado' : 'inativado'} com sucesso!`,
      updatedStatus ? 'success' : 'warning'
    );
    return { success: true };
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    const user = users.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };

    if (user.id === currentUser.id) {
      return { success: false, error: 'Você não pode excluir sua própria conta enquanto estiver logado.' };
    }

    if (user.username === 'admin' || user.id === 'user-admin') {
      return { success: false, error: 'A conta de Administrador Geral é protegida e não pode ser excluída.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast(`Usuário "${user.name}" excluído com sucesso.`, 'info');
    return { success: true };
  };

  // Stock Overview Calculation
  const stockOverview = useMemo<StockOverviewItem[]>(() => {
    const today = new Date();

    return products
      .filter((p) => p.active)
      .map((product) => {
        const productBatches = batches.filter((b) => b.productId === product.id && b.quantityBoxes > 0);
        const totalBoxes = productBatches.reduce((acc, b) => acc + b.quantityBoxes, 0);
        const totalPackages = productBatches.reduce((acc, b) => acc + b.quantityPackages, 0);
        const category = categories.find((c) => c.id === product.categoryId);
        const location = locations.find((l) => l.id === product.defaultLocationId);

        // Find nearest expiration batch
        let nearestBatch: Batch | undefined;
        let daysToNearest: number | undefined;

        if (productBatches.length > 0) {
          const sorted = [...productBatches].sort(
            (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
          );
          nearestBatch = sorted[0];
          const expDate = new Date(nearestBatch.expirationDate);
          daysToNearest = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Determine stock status
        let status: StockStatus = 'normal';
        if (totalBoxes <= product.minimumStock / 2) {
          status = 'critical';
        } else if (totalBoxes <= product.minimumStock) {
          status = 'low';
        } else if (product.maximumStock && totalBoxes > product.maximumStock) {
          status = 'excess';
        }

        return {
          product,
          categoryName: category?.name || 'Sem Categoria',
          totalBoxes,
          totalPackages,
          batchesCount: productBatches.length,
          status,
          nearestExpiration: nearestBatch?.expirationDate,
          nearestBatchNumber: nearestBatch?.batchNumber,
          daysToNearestExpiration: daysToNearest,
          locationName: location?.name || 'Não definida',
        };
      });
  }, [products, batches, categories, locations]);

  // Aggregate stats
  const totalBoxes = useMemo(() => {
    return batches.reduce((sum, b) => sum + (b.quantityBoxes > 0 ? b.quantityBoxes : 0), 0);
  }, [batches]);

  const totalPackages = useMemo(() => {
    return batches.reduce((sum, b) => sum + (b.quantityPackages > 0 ? b.quantityPackages : 0), 0);
  }, [batches]);

  const productionTodayBoxes = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return movements
      .filter((m) => m.type === 'PRODUCAO' && m.createdAt.startsWith(todayStr))
      .reduce((sum, m) => sum + m.quantityBoxes, 0);
  }, [movements]);

  const exitsTodayBoxes = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return movements
      .filter((m) => (m.type === 'SAIDA' || m.type === 'PERDA') && m.createdAt.startsWith(todayStr))
      .reduce((sum, m) => sum + Math.abs(m.quantityBoxes), 0);
  }, [movements]);

  const lowStockCount = useMemo(() => {
    return stockOverview.filter((item) => item.status === 'low' || item.status === 'critical').length;
  }, [stockOverview]);

  const criticalStockCount = useMemo(() => {
    return stockOverview.filter((item) => item.status === 'critical').length;
  }, [stockOverview]);

  const expiringBatchesCount = useMemo(() => {
    return batches.filter((b) => b.quantityBoxes > 0 && (b.status === 'warning' || b.status === 'critical')).length;
  }, [batches]);

  const expiredBatchesCount = useMemo(() => {
    return batches.filter((b) => b.quantityBoxes > 0 && b.status === 'expired').length;
  }, [batches]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Action: Create Product
  const createProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canAccess(['Administrador', 'Gestor'])) {
      return { success: false, error: 'Acesso negado. Apenas Administrador e Gestor podem cadastrar produtos.' };
    }

    if (products.some((p) => p.code.toLowerCase() === data.code.trim().toLowerCase())) {
      return { success: false, error: `Já existe um produto com o código ${data.code}.` };
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Produto "${newProduct.name}" cadastrado com sucesso!`);
    return { success: true };
  };

  // Action: Update Product
  const updateProduct = (id: string, data: Partial<Product>) => {
    if (!canAccess(['Administrador', 'Gestor'])) {
      return { success: false, error: 'Acesso negado.' };
    }

    if (data.code && products.some((p) => p.id !== id && p.code.toLowerCase() === data.code?.trim().toLowerCase())) {
      return { success: false, error: `Já existe outro produto com o código ${data.code}.` };
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Produto atualizado com sucesso!');
    return { success: true };
  };

  // Action: Delete/Deactivate Product
  const deleteProduct = (id: string) => {
    if (!canAccess(['Administrador'])) {
      return { success: false, error: 'Apenas o Administrador pode inativar ou excluir produtos.' };
    }

    const hasStock = batches.some((b) => b.productId === id && b.quantityBoxes > 0);
    if (hasStock) {
      // Deactivate instead of hard delete to preserve historical integrity
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
      showToast('Produto inativado pois possui estoque ou histórico.', 'info');
      return { success: true };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Produto removido com sucesso!');
    return { success: true };
  };

  // Action: Register Production (Multi-item Wizard)
  const registerProduction = (
    items: ProductionItem[],
    batchNumber: string,
    manufacturingDate: string,
    expirationDate: string,
    locationId: string,
    notes?: string
  ) => {
    if (!canAccess(['Administrador', 'Gestor', 'Produção'])) {
      return { success: false, error: 'Acesso negado para apontar produção.' };
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'Adicione pelo menos um item à produção.' };
    }

    const loc = locations.find((l) => l.id === locationId);
    const locationName = loc ? loc.name : 'Câmara Fria Principal';
    const now = new Date().toISOString();

    const newBatches: Batch[] = [];
    const newMovements: StockMovement[] = [];

    items.forEach((item, index) => {
      const specificBatchNum = items.length > 1 ? `${batchNumber}-${String.fromCharCode(65 + index)}` : batchNumber;
      const batchId = `batch-${Date.now()}-${index}`;

      const batch: Batch = {
        id: batchId,
        productId: item.productId,
        batchNumber: specificBatchNum,
        manufacturingDate,
        expirationDate,
        quantityBoxes: item.quantityBoxes,
        quantityPackages: item.totalPackages,
        locationId,
        status: computeBatchStatus(expirationDate),
        createdAt: now,
        notes,
      };
      newBatches.push(batch);

      // Previous stock for product
      const currentStockBoxes = batches
        .filter((b) => b.productId === item.productId)
        .reduce((sum, b) => sum + b.quantityBoxes, 0);

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${index}`,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        batchId: batchId,
        batchNumber: specificBatchNum,
        type: 'PRODUCAO',
        quantityBoxes: item.quantityBoxes,
        quantityPackages: item.totalPackages,
        previousQuantityBoxes: currentStockBoxes,
        newQuantityBoxes: currentStockBoxes + item.quantityBoxes,
        reason: 'Apontamento de Produção',
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        createdAt: now,
        notes: notes || `Produção finalizada em ${locationName}`,
      };
      newMovements.push(movement);
    });

    const totalBoxesProduced = items.reduce((sum, i) => sum + i.quantityBoxes, 0);
    const totalPackagesProduced = items.reduce((sum, i) => sum + i.totalPackages, 0);

    const record: ProductionRecord = {
      id: `prod-rec-${Date.now()}`,
      batchNumber,
      manufacturingDate,
      expirationDate,
      locationId,
      locationName,
      items,
      totalBoxes: totalBoxesProduced,
      totalPackages: totalPackagesProduced,
      notes,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: now,
    };

    setBatches((prev) => [...newBatches, ...prev]);
    setMovements((prev) => [...newMovements, ...prev]);
    setProductionRecords((prev) => [record, ...prev]);

    // Check if notification is needed
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Produção Concluída',
      message: `Produção de ${totalBoxesProduced} caixas (${totalPackagesProduced} pct) registrada com sucesso sob lote ${batchNumber}.`,
      type: 'success',
      category: 'production',
      date: now,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Produção de ${totalBoxesProduced} caixas confirmada com sucesso!`);
    return { success: true };
  };

  // Action: Register Entry (Purchase, return, manual)
  const registerEntry = (
    productId: string,
    boxes: number,
    batchNumber: string,
    manufacturingDate: string,
    expirationDate: string,
    locationId: string,
    reason: string,
    supplier?: string,
    notes?: string
  ) => {
    if (!canAccess(['Administrador', 'Gestor', 'Estoquista'])) {
      return { success: false, error: 'Acesso negado para registrar entradas.' };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Produto não encontrado.' };

    const now = new Date().toISOString();
    const batchId = `batch-${Date.now()}`;
    const packages = boxes * product.packagesPerBox;

    const newBatch: Batch = {
      id: batchId,
      productId,
      batchNumber,
      manufacturingDate,
      expirationDate,
      quantityBoxes: boxes,
      quantityPackages: packages,
      locationId,
      status: computeBatchStatus(expirationDate),
      createdAt: now,
      notes: notes || `Entrada: ${reason}`,
    };

    const currentStockBoxes = batches
      .filter((b) => b.productId === productId)
      .reduce((sum, b) => sum + b.quantityBoxes, 0);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      productCode: product.code,
      batchId,
      batchNumber,
      type: 'ENTRADA',
      quantityBoxes: boxes,
      quantityPackages: packages,
      previousQuantityBoxes: currentStockBoxes,
      newQuantityBoxes: currentStockBoxes + boxes,
      reason,
      supplier,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: now,
      notes,
    };

    setBatches((prev) => [newBatch, ...prev]);
    setMovements((prev) => [movement, ...prev]);
    showToast(`Entrada de ${boxes} caixas de ${product.name} registrada!`);
    return { success: true };
  };

  // Action: FEFO suggestion (First Expire First Out)
  const getFEFOSuggestion = (productId: string): Batch | null => {
    const activeBatches = batches.filter((b) => b.productId === productId && b.quantityBoxes > 0);
    if (activeBatches.length === 0) return null;

    // Filter out already expired batches for standard exits unless specifically handled
    const validBatches = activeBatches.filter((b) => b.status !== 'expired');
    const targetPool = validBatches.length > 0 ? validBatches : activeBatches;

    // Sort by expiration date ascending
    const sorted = [...targetPool].sort(
      (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );

    return sorted[0] || null;
  };

  // Action: Register Exit / Dispatch / Loss with FEFO
  const registerExit = (
    productId: string,
    batchId: string,
    boxes: number,
    type: MovementType = 'SAIDA',
    reason: string,
    destination?: string,
    notes?: string
  ) => {
    if (!canAccess(['Administrador', 'Gestor', 'Estoquista'])) {
      return { success: false, error: 'Acesso negado para registrar saídas.' };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Produto não encontrado.' };

    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return { success: false, error: 'Lote selecionado não encontrado.' };

    if (batch.quantityBoxes < boxes) {
      return {
        success: false,
        error: `Estoque insuficiente no lote ${batch.batchNumber}. Disponível: ${batch.quantityBoxes} caixas.`,
      };
    }

    // Safety rule: Expired products cannot be dispatched as normal sale, only as loss/discard
    if (batch.status === 'expired' && type === 'SAIDA') {
      return {
        success: false,
        error: 'Este lote está VENCIDO! Saídas normais estão bloqueadas. Utilize o motivo de Descarte/Perda.',
      };
    }

    const now = new Date().toISOString();
    const packages = boxes * product.packagesPerBox;

    // Update batch quantity
    const updatedBatches = batches.map((b) => {
      if (b.id === batchId) {
        const remainingBoxes = b.quantityBoxes - boxes;
        return {
          ...b,
          quantityBoxes: remainingBoxes,
          quantityPackages: remainingBoxes * product.packagesPerBox,
        };
      }
      return b;
    });

    const currentStockBoxes = batches
      .filter((b) => b.productId === productId)
      .reduce((sum, b) => sum + b.quantityBoxes, 0);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      productCode: product.code,
      batchId,
      batchNumber: batch.batchNumber,
      type,
      quantityBoxes: -boxes,
      quantityPackages: -packages,
      previousQuantityBoxes: currentStockBoxes,
      newQuantityBoxes: currentStockBoxes - boxes,
      reason,
      destination,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: now,
      notes,
    };

    setBatches(updatedBatches);
    setMovements((prev) => [movement, ...prev]);

    // Check if product went below minimum
    const remainingTotalBoxes = currentStockBoxes - boxes;
    if (remainingTotalBoxes <= product.minimumStock) {
      const alertNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: remainingTotalBoxes <= product.minimumStock / 2 ? 'Estoque Crítico' : 'Estoque Baixo',
        message: `${product.name} atingiu ${remainingTotalBoxes} caixas (Mínimo: ${product.minimumStock}).`,
        type: remainingTotalBoxes <= product.minimumStock / 2 ? 'critical' : 'warning',
        category: 'stock',
        productId: product.id,
        date: now,
        read: false,
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    showToast(`Saída de ${boxes} caixas de ${product.name} confirmada!`);
    return { success: true };
  };

  // Action: Adjust Stock (Audit correction)
  const adjustStock = (
    productId: string,
    batchId: string,
    newBoxesCount: number,
    reason: string,
    notes?: string
  ) => {
    if (!canAccess(['Administrador', 'Gestor'])) {
      return { success: false, error: 'Apenas Administradores e Gestores podem realizar ajustes manuais.' };
    }

    const product = products.find((p) => p.id === productId);
    const batch = batches.find((b) => b.id === batchId);
    if (!product || !batch) return { success: false, error: 'Produto ou lote não encontrado.' };

    const diffBoxes = newBoxesCount - batch.quantityBoxes;
    if (diffBoxes === 0) return { success: false, error: 'A nova quantidade é idêntica à atual.' };

    const now = new Date().toISOString();
    const diffPackages = diffBoxes * product.packagesPerBox;

    const currentTotalBoxes = batches
      .filter((b) => b.productId === productId)
      .reduce((sum, b) => sum + b.quantityBoxes, 0);

    const updatedBatches = batches.map((b) => {
      if (b.id === batchId) {
        return {
          ...b,
          quantityBoxes: newBoxesCount,
          quantityPackages: newBoxesCount * product.packagesPerBox,
        };
      }
      return b;
    });

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      productCode: product.code,
      batchId,
      batchNumber: batch.batchNumber,
      type: 'AJUSTE',
      quantityBoxes: diffBoxes,
      quantityPackages: diffPackages,
      previousQuantityBoxes: currentTotalBoxes,
      newQuantityBoxes: currentTotalBoxes + diffBoxes,
      reason: `Ajuste manual: ${reason}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: now,
      notes,
    };

    setBatches(updatedBatches);
    setMovements((prev) => [movement, ...prev]);
    showToast(`Estoque ajustado: ${diffBoxes > 0 ? '+' : ''}${diffBoxes} caixas.`);
    return { success: true };
  };

  // Action: Inventory Management
  const createInventory = (title: string, categoryId?: string, locationId?: string) => {
    const now = new Date().toISOString();
    const filteredProducts = products.filter((p) => {
      if (!p.active) return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      if (locationId && p.defaultLocationId !== locationId) return false;
      return true;
    });

    const items: InventoryItemCount[] = filteredProducts.map((p) => {
      const currentBoxes = batches
        .filter((b) => b.productId === p.id)
        .reduce((sum, b) => sum + b.quantityBoxes, 0);

      return {
        productId: p.id,
        productName: p.name,
        productCode: p.code,
        systemBoxes: currentBoxes,
        physicalBoxes: currentBoxes, // default same, user edits
        differenceBoxes: 0,
        status: 'pending',
      };
    });

    const newInventory: InventoryCount = {
      id: `inv-${Date.now()}`,
      title: title || `Inventário Físico - ${new Date().toLocaleDateString('pt-BR')}`,
      date: now.split('T')[0],
      categoryId,
      locationId,
      status: 'EM_ANDAMENTO',
      items,
      totalDifferences: 0,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: now,
    };

    setInventoryCounts((prev) => [newInventory, ...prev]);
    showToast(`Inventário "${newInventory.title}" iniciado.`);
    return newInventory;
  };

  const updateInventoryItem = (
    inventoryId: string,
    productId: string,
    physicalBoxes: number,
    justification?: string
  ) => {
    setInventoryCounts((prev) =>
      prev.map((inv) => {
        if (inv.id !== inventoryId) return inv;
        const updatedItems = inv.items.map((item) => {
          if (item.productId !== productId) return item;
          const diff = physicalBoxes - item.systemBoxes;
          return {
            ...item,
            physicalBoxes,
            differenceBoxes: diff,
            justification: justification || item.justification,
            status: 'counted' as const,
          };
        });

        const totalDiffs = updatedItems.filter((i) => i.differenceBoxes !== 0).length;
        return { ...inv, items: updatedItems, totalDifferences: totalDiffs };
      })
    );
  };

  const finalizeInventory = (inventoryId: string) => {
    if (!canAccess(['Administrador', 'Gestor'])) {
      return { success: false, error: 'Apenas Administrador e Gestor podem homologar o inventário.' };
    }

    const inventory = inventoryCounts.find((i) => i.id === inventoryId);
    if (!inventory) return { success: false, error: 'Inventário não encontrado.' };

    const itemsWithDiff = inventory.items.filter((i) => i.differenceBoxes !== 0);
    const missingJustification = itemsWithDiff.some((i) => !i.justification || i.justification.trim() === '');

    if (missingJustification) {
      return { success: false, error: 'Todos os itens com divergência precisam de justificativa.' };
    }

    const now = new Date().toISOString();
    const newMovements: StockMovement[] = [];
    let updatedBatches = [...batches];

    itemsWithDiff.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      const productBatches = updatedBatches.filter((b) => b.productId === item.productId && b.quantityBoxes > 0);
      const targetBatch = productBatches[0];

      if (targetBatch) {
        const newBatchQty = Math.max(0, targetBatch.quantityBoxes + item.differenceBoxes);
        updatedBatches = updatedBatches.map((b) =>
          b.id === targetBatch.id
            ? { ...b, quantityBoxes: newBatchQty, quantityPackages: newBatchQty * product.packagesPerBox }
            : b
        );
      }

      const movement: StockMovement = {
        id: `mov-inv-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        batchNumber: targetBatch?.batchNumber || 'AJUSTE-INV',
        type: 'INVENTARIO',
        quantityBoxes: item.differenceBoxes,
        quantityPackages: item.differenceBoxes * product.packagesPerBox,
        previousQuantityBoxes: item.systemBoxes,
        newQuantityBoxes: item.physicalBoxes,
        reason: `Homologação de Inventário: ${item.justification || 'Contagem física'}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        createdAt: now,
      };
      newMovements.push(movement);
    });

    setBatches(updatedBatches);
    setMovements((prev) => [...newMovements, ...prev]);

    setInventoryCounts((prev) =>
      prev.map((inv) =>
        inv.id === inventoryId
          ? {
              ...inv,
              status: 'CONCLUIDO',
              completedAt: now,
              items: inv.items.map((i) => ({ ...i, status: 'adjusted' })),
            }
          : inv
      )
    );

    showToast('Inventário finalizado e estoque ajustado com sucesso!');
    return { success: true };
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações foram marcadas como lidas.');
  };

  // Action: Reset data
  const resetAllData = () => {
    storageService.resetToDefault();
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
    setLocations(storageService.getLocations());
    setBatches(storageService.getBatches());
    setMovements(storageService.getMovements());
    setProductionRecords(storageService.getProductionRecords());
    setInventoryCounts(storageService.getInventoryCounts());
    setNotifications(storageService.getNotifications());
    setUsers(storageService.getUsers());
    setCurrentUser(storageService.getCurrentUser());
    showToast('Sistema restaurado para dados padrão demonstrativos com sucesso!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        accessLogs,
        products,
        categories,
        locations,
        batches,
        movements,
        productionRecords,
        inventoryCounts,
        notifications,
        users,
        currentUser,
        activeTab,
        setActiveTab,
        selectedProductId,
        setSelectedProductId,
        isNotificationOpen,
        setIsNotificationOpen,
        toastMessage,
        showToast,
        stockOverview,
        totalBoxes,
        totalPackages,
        productionTodayBoxes,
        exitsTodayBoxes,
        lowStockCount,
        criticalStockCount,
        expiringBatchesCount,
        expiredBatchesCount,
        unreadNotificationsCount,
        canAccess,
        hasPermission,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        changePassword,
        toggleUserStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        registerProduction,
        registerEntry,
        registerExit,
        getFEFOSuggestion,
        adjustStock,
        createInventory,
        updateInventoryItem,
        finalizeInventory,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

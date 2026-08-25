import {
  Product,
  Category,
  StorageLocation,
  Batch,
  StockMovement,
  ProductionRecord,
  InventoryCount,
  SystemNotification,
  User,
  UserRole,
  UserPermissions,
  AccessLog,
  BatchStatus,
  StockStatus
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'salgados_products_v1',
  CATEGORIES: 'salgados_categories_v1',
  LOCATIONS: 'salgados_locations_v1',
  BATCHES: 'salgados_batches_v1',
  MOVEMENTS: 'salgados_movements_v1',
  PRODUCTION: 'salgados_production_v1',
  INVENTORY: 'salgados_inventory_v1',
  NOTIFICATIONS: 'salgados_notifications_v1',
  USERS: 'salgados_users_v2',
  CURRENT_USER: 'salgados_current_user_v2',
  IS_AUTHENTICATED: 'salgados_is_auth_v2',
  ACCESS_LOGS: 'salgados_access_logs_v1',
};

// Default Permissions helper by Role
export const getDefaultPermissions = (role: UserRole) => {
  switch (role) {
    case 'Administrador':
      return {
        dashboard: true,
        stockView: true,
        stockMovement: true,
        production: true,
        fefoExit: true,
        batches: true,
        inventory: true,
        inventoryApprove: true,
        reports: true,
        productsManage: true,
        usersManage: true,
        settingsManage: true,
      };
    case 'Gestor':
      return {
        dashboard: true,
        stockView: true,
        stockMovement: true,
        production: true,
        fefoExit: true,
        batches: true,
        inventory: true,
        inventoryApprove: true,
        reports: true,
        productsManage: true,
        usersManage: false,
        settingsManage: false,
      };
    case 'Estoquista':
      return {
        dashboard: true,
        stockView: true,
        stockMovement: true,
        production: false,
        fefoExit: true,
        batches: true,
        inventory: true,
        inventoryApprove: false,
        reports: false,
        productsManage: false,
        usersManage: false,
        settingsManage: false,
      };
    case 'Produção':
      return {
        dashboard: true,
        stockView: true,
        stockMovement: false,
        production: true,
        fefoExit: false,
        batches: true,
        inventory: true,
        inventoryApprove: false,
        reports: false,
        productsManage: false,
        usersManage: false,
        settingsManage: false,
      };
    case 'Consulta':
      return {
        dashboard: true,
        stockView: true,
        stockMovement: false,
        production: false,
        fefoExit: false,
        batches: true,
        inventory: false,
        inventoryApprove: false,
        reports: true,
        productsManage: false,
        usersManage: false,
        settingsManage: false,
      };
    default:
      return {
        dashboard: true,
        stockView: true,
        stockMovement: false,
        production: false,
        fefoExit: false,
        batches: false,
        inventory: false,
        inventoryApprove: false,
        reports: false,
        productsManage: false,
        usersManage: false,
        settingsManage: false,
      };
  }
};

// Initial Seed Categories
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Fritos Tradicionais', description: 'Coxinhas, kibes, risoles e bolinhas fritas', active: true },
  { id: 'cat-2', name: 'Assados & Forno', description: 'Esfirras, empadas e folhados assados', active: true },
  { id: 'cat-3', name: 'Mini Salgados / Festa', description: 'Tamanhos festa para buffet e eventos', active: true },
  { id: 'cat-4', name: 'Salgados Especiais', description: 'Receitas gourmet, camarão e queijos nobres', active: true },
  { id: 'cat-5', name: 'Doces & Sobremesas', description: 'Mini churros, bolinhos de brigadeiro e doces', active: true },
];

// Initial Locations
export const INITIAL_LOCATIONS: StorageLocation[] = [
  { id: 'loc-1', name: 'Câmara Fria 01 - Corredor A / Prateleira 01', zone: 'Câmara Fria 01', temperature: '-18°C' },
  { id: 'loc-2', name: 'Câmara Fria 01 - Corredor A / Prateleira 02', zone: 'Câmara Fria 01', temperature: '-18°C' },
  { id: 'loc-3', name: 'Câmara Fria 01 - Corredor B / Prateleira 01', zone: 'Câmara Fria 01', temperature: '-18°C' },
  { id: 'loc-4', name: 'Câmara Fria 02 - Setor Expedição', zone: 'Câmara Fria 02', temperature: '-20°C' },
  { id: 'loc-5', name: 'Freezer Industrial 03 - Reserva', zone: 'Freezer 03', temperature: '-18°C' },
];

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administrador Geral',
    username: 'admin',
    email: 'admin@salgados.com.br',
    password: 'admin',
    role: 'Administrador',
    avatar: 'AD',
    department: 'Diretoria & T.I.',
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-08-25T08:30:00Z',
    permissions: getDefaultPermissions('Administrador'),
  },
  {
    id: 'user-gestor',
    name: 'Maria Oliveira (Gerente)',
    username: 'gerente',
    email: 'gerente@salgados.com.br',
    password: 'gerente123',
    role: 'Gestor',
    avatar: 'MO',
    department: 'Gerência Operacional & Qualidade',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    lastLogin: '2026-08-25T07:15:00Z',
    permissions: getDefaultPermissions('Gestor'),
  },
  {
    id: 'user-estoque',
    name: 'Carlos Santos (Operador Estoque)',
    username: 'operador',
    email: 'operador@salgados.com.br',
    password: 'operador123',
    role: 'Estoquista',
    avatar: 'CS',
    department: 'Câmara Fria & Expedição',
    active: true,
    createdAt: '2026-01-15T08:00:00Z',
    lastLogin: '2026-08-25T06:00:00Z',
    permissions: getDefaultPermissions('Estoquista'),
  },
  {
    id: 'user-prod',
    name: 'Ana Paula (Operador Produção)',
    username: 'producao',
    email: 'producao@salgados.com.br',
    password: 'producao123',
    role: 'Produção',
    avatar: 'AP',
    department: 'Linha de Congelamento & Embalagem',
    active: true,
    createdAt: '2026-02-01T08:00:00Z',
    lastLogin: '2026-08-24T18:40:00Z',
    permissions: getDefaultPermissions('Produção'),
  },
  {
    id: 'user-consulta',
    name: 'Lucas Auditor (Consulta)',
    username: 'consulta',
    email: 'consulta@salgados.com.br',
    password: 'consulta123',
    role: 'Consulta',
    avatar: 'LA',
    department: 'Auditoria & Compliance',
    active: true,
    createdAt: '2026-02-15T08:00:00Z',
    lastLogin: '2026-08-23T14:20:00Z',
    permissions: getDefaultPermissions('Consulta'),
  },
];

// Initial Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    code: '001',
    name: 'Coxinha de Frango',
    categoryId: 'cat-1',
    description: 'Coxinha artesanal com massa de batata especial e recheio cremoso de frango desfiado temperado.',
    icon: '🥟',
    packagesPerBox: 13,
    minimumStock: 50,
    maximumStock: 300,
    shelfLifeDays: 180,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-1',
    unitWeightGrams: 80,
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-002',
    code: '002',
    name: 'Bolinha de Queijo',
    categoryId: 'cat-1',
    description: 'Bolinha recheada com queijo muçarela e orégano, empanamento crocante.',
    icon: '🧀',
    packagesPerBox: 13,
    minimumStock: 40,
    maximumStock: 250,
    shelfLifeDays: 180,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-1',
    unitWeightGrams: 75,
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-003',
    code: '003',
    name: 'Kibe Tradicional',
    categoryId: 'cat-1',
    description: 'Kibe de carne bovina moída com trigo especial, hortelã fresca e tempero árabe.',
    icon: '🧆',
    packagesPerBox: 13,
    minimumStock: 40,
    maximumStock: 200,
    shelfLifeDays: 150,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-2',
    unitWeightGrams: 85,
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-004',
    code: '004',
    name: 'Risole de Presunto e Queijo',
    categoryId: 'cat-1',
    description: 'Risole macio e crocante com presunto cozido de primeira qualidade e queijo derretido.',
    icon: '🥟',
    packagesPerBox: 13,
    minimumStock: 35,
    maximumStock: 200,
    shelfLifeDays: 180,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-2',
    unitWeightGrams: 80,
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-005',
    code: '005',
    name: 'Enroladinho de Salsicha',
    categoryId: 'cat-1',
    description: 'Massa leve empanada envolvendo salsicha premium selecionada.',
    icon: '🌭',
    packagesPerBox: 13,
    minimumStock: 30,
    maximumStock: 180,
    shelfLifeDays: 120,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-3',
    unitWeightGrams: 90,
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-006',
    code: '006',
    name: 'Mini Coxinha Festa',
    categoryId: 'cat-3',
    description: 'Mini coxinhas de 20g ideais para buffets, festas e eventos com 100 unidades por pacote.',
    icon: '✨',
    packagesPerBox: 20,
    minimumStock: 60,
    maximumStock: 400,
    shelfLifeDays: 180,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-3',
    unitWeightGrams: 20,
    active: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-007',
    code: '007',
    name: 'Esfirra de Carne Assada',
    categoryId: 'cat-2',
    description: 'Esfirra aberta com massa fofinha e recheio temperado com limão e cebola.',
    icon: '🥧',
    packagesPerBox: 12,
    minimumStock: 40,
    maximumStock: 220,
    shelfLifeDays: 120,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-4',
    unitWeightGrams: 100,
    active: true,
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
  {
    id: 'prod-008',
    code: '008',
    name: 'Mini Churros Doce de Leite',
    categoryId: 'cat-5',
    description: 'Mini churros congelados recheados com doce de leite cremoso artesanal.',
    icon: '🥨',
    packagesPerBox: 15,
    minimumStock: 25,
    maximumStock: 150,
    shelfLifeDays: 180,
    storageTemperature: '-18°C',
    defaultLocationId: 'loc-5',
    unitWeightGrams: 30,
    active: true,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z',
  },
];

// Helper to compute batch status given expiration date (current demo reference is Aug 2026)
export function computeBatchStatus(expirationDate: string): BatchStatus {
  const now = new Date();
  const exp = new Date(expirationDate);
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'expired';
  if (diffDays <= 7) return 'critical';
  if (diffDays <= 30) return 'warning';
  return 'normal';
}

// Initial Batches with deliberate variations to demonstrate FEFO and alert flags
export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-001',
    productId: 'prod-001',
    batchNumber: 'CF20260715A',
    manufacturingDate: '2026-07-15',
    expirationDate: '2026-09-10', // ~16 days left
    quantityBoxes: 35,
    quantityPackages: 35 * 13,
    locationId: 'loc-1',
    status: 'warning',
    createdAt: '2026-07-15T10:00:00Z',
    notes: 'Produção turno manhã lote padrão',
  },
  {
    id: 'batch-002',
    productId: 'prod-001',
    batchNumber: 'CF20260820B',
    manufacturingDate: '2026-08-20',
    expirationDate: '2027-02-16', // normal
    quantityBoxes: 85,
    quantityPackages: 85 * 13,
    locationId: 'loc-1',
    status: 'normal',
    createdAt: '2026-08-20T14:30:00Z',
    notes: 'Lote produção alta demanda',
  },
  {
    id: 'batch-003',
    productId: 'prod-002',
    batchNumber: 'BQ20260810A',
    manufacturingDate: '2026-08-10',
    expirationDate: '2027-02-06',
    quantityBoxes: 85,
    quantityPackages: 85 * 13,
    locationId: 'loc-1',
    status: 'normal',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'batch-004',
    productId: 'prod-003',
    batchNumber: 'KF20260515A',
    manufacturingDate: '2026-05-15',
    expirationDate: '2026-08-30', // ~5 days left - CRITICAL
    quantityBoxes: 24,
    quantityPackages: 24 * 13,
    locationId: 'loc-2',
    status: 'critical',
    createdAt: '2026-05-15T11:00:00Z',
    notes: 'Prioridade de expedição FEFO urgente',
  },
  {
    id: 'batch-005',
    productId: 'prod-003',
    batchNumber: 'KF20260818A',
    manufacturingDate: '2026-08-18',
    expirationDate: '2027-01-15',
    quantityBoxes: 50,
    quantityPackages: 50 * 13,
    locationId: 'loc-2',
    status: 'normal',
    createdAt: '2026-08-18T08:30:00Z',
  },
  {
    id: 'batch-006',
    productId: 'prod-004',
    batchNumber: 'RPQ20260812A',
    manufacturingDate: '2026-08-12',
    expirationDate: '2027-02-08',
    quantityBoxes: 62,
    quantityPackages: 62 * 13,
    locationId: 'loc-2',
    status: 'normal',
    createdAt: '2026-08-12T15:00:00Z',
  },
  {
    id: 'batch-007',
    productId: 'prod-005',
    batchNumber: 'ES20260815A',
    manufacturingDate: '2026-08-15',
    expirationDate: '2026-12-13',
    quantityBoxes: 48,
    quantityPackages: 48 * 13,
    locationId: 'loc-3',
    status: 'normal',
    createdAt: '2026-08-15T09:45:00Z',
  },
  {
    id: 'batch-008',
    productId: 'prod-006',
    batchNumber: 'MCF20260822A',
    manufacturingDate: '2026-08-22',
    expirationDate: '2027-02-18',
    quantityBoxes: 120,
    quantityPackages: 120 * 20,
    locationId: 'loc-3',
    status: 'normal',
    createdAt: '2026-08-22T10:00:00Z',
  },
  {
    id: 'batch-009',
    productId: 'prod-007',
    batchNumber: 'ECA20260601A',
    manufacturingDate: '2026-06-01',
    expirationDate: '2026-08-20', // Expired recently
    quantityBoxes: 8,
    quantityPackages: 8 * 12,
    locationId: 'loc-4',
    status: 'expired',
    createdAt: '2026-06-01T08:00:00Z',
    notes: 'Lote retido para descarte / avaria',
  },
  {
    id: 'batch-010',
    productId: 'prod-008',
    batchNumber: 'MCD20260805A',
    manufacturingDate: '2026-08-05',
    expirationDate: '2027-02-01',
    quantityBoxes: 20,
    quantityPackages: 20 * 15,
    locationId: 'loc-5',
    status: 'normal',
    createdAt: '2026-08-05T13:00:00Z',
  },
];

// Initial Movements
export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-002',
    productName: 'Bolinha de Queijo',
    productCode: '002',
    batchId: 'batch-003',
    batchNumber: 'BQ20260810A',
    type: 'PRODUCAO',
    quantityBoxes: 45,
    quantityPackages: 45 * 13,
    previousQuantityBoxes: 40,
    newQuantityBoxes: 85,
    reason: 'Apontamento de Produção Linha 1',
    userId: 'user-prod',
    userName: 'Ana Paula Produção',
    userRole: 'Produção',
    createdAt: '2026-08-25T08:45:00Z',
    notes: 'Turno da manhã - Lote OK',
  },
  {
    id: 'mov-2',
    productId: 'prod-001',
    productName: 'Coxinha de Frango',
    productCode: '001',
    batchId: 'batch-001',
    batchNumber: 'CF20260715A',
    type: 'SAIDA',
    quantityBoxes: -20,
    quantityPackages: -20 * 13,
    previousQuantityBoxes: 140,
    newQuantityBoxes: 120,
    reason: 'Expedição Pedido Distribuidor SP #8841',
    destination: 'Supermercados Estrela',
    userId: 'user-estoque',
    userName: 'Carlos Santos',
    userRole: 'Estoquista',
    createdAt: '2026-08-25T07:30:00Z',
    notes: 'Saída FEFO lote mais antigo',
  },
  {
    id: 'mov-3',
    productId: 'prod-005',
    productName: 'Enroladinho de Salsicha',
    productCode: '005',
    batchId: 'batch-007',
    batchNumber: 'ES20260815A',
    type: 'AJUSTE',
    quantityBoxes: -2,
    quantityPackages: -2 * 13,
    previousQuantityBoxes: 50,
    newQuantityBoxes: 48,
    reason: 'Ajuste após contagem física periódica',
    userId: 'user-admin',
    userName: 'João Silva (Admin)',
    userRole: 'Administrador',
    createdAt: '2026-08-25T06:15:00Z',
    notes: 'Divergência menor em caixa danificada',
  },
  {
    id: 'mov-4',
    productId: 'prod-001',
    productName: 'Coxinha de Frango',
    productCode: '001',
    batchId: 'batch-002',
    batchNumber: 'CF20260820B',
    type: 'PRODUCAO',
    quantityBoxes: 85,
    quantityPackages: 85 * 13,
    previousQuantityBoxes: 55,
    newQuantityBoxes: 140,
    reason: 'Produção Diária Programada',
    userId: 'user-prod',
    userName: 'Ana Paula Produção',
    userRole: 'Produção',
    createdAt: '2026-08-24T16:00:00Z',
  },
  {
    id: 'mov-5',
    productId: 'prod-003',
    productName: 'Kibe Tradicional',
    productCode: '003',
    batchId: 'batch-005',
    batchNumber: 'KF20260818A',
    type: 'ENTRADA',
    quantityBoxes: 50,
    quantityPackages: 50 * 13,
    previousQuantityBoxes: 24,
    newQuantityBoxes: 74,
    reason: 'Entrada de lote finalizado câmara de choque',
    userId: 'user-estoque',
    userName: 'Carlos Santos',
    userRole: 'Estoquista',
    createdAt: '2026-08-24T11:20:00Z',
  },
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Estoque Crítico',
    message: 'Mini Churros Doce de Leite (Cód: 008) está abaixo do estoque mínimo (20/25 cx).',
    type: 'warning',
    category: 'stock',
    productId: 'prod-008',
    date: '2026-08-25T08:00:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Lote Vencendo em 5 dias',
    message: 'Lote KF20260515A (Kibe Tradicional) vence em 30/08/2026. Priorize a expedição FEFO!',
    type: 'critical',
    category: 'expiration',
    batchId: 'batch-004',
    productId: 'prod-003',
    date: '2026-08-25T07:15:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Lote Vencido Bloqueado',
    message: 'Lote ECA20260601A (Esfirra Assada) venceu em 20/08/2026. Saídas regulares foram bloqueadas.',
    type: 'critical',
    category: 'expiration',
    batchId: 'batch-009',
    productId: 'prod-007',
    date: '2026-08-24T18:00:00Z',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Inventário Periódico Sugerido',
    message: 'A Câmara Fria 01 atingiu 30 dias desde a última conferência física.',
    type: 'info',
    category: 'inventory',
    date: '2026-08-24T09:00:00Z',
    read: true,
  },
];

// Storage Helper Functions
export const storageService = {
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.setProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  setProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.setCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  setCategories(cats: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },

  getLocations(): StorageLocation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!raw) {
      this.setLocations(INITIAL_LOCATIONS);
      return INITIAL_LOCATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOCATIONS;
    }
  },

  setLocations(locs: StorageLocation[]): void {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locs));
  },

  getBatches(): Batch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      this.setBatches(INITIAL_BATCHES);
      return INITIAL_BATCHES;
    }
    try {
      const parsed: Batch[] = JSON.parse(raw);
      // dynamically ensure status is up to date based on date
      return parsed.map((b) => ({
        ...b,
        status: computeBatchStatus(b.expirationDate),
      }));
    } catch {
      return INITIAL_BATCHES;
    }
  },

  setBatches(batches: Batch[]): void {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  },

  getMovements(): StockMovement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      this.setMovements(INITIAL_MOVEMENTS);
      return INITIAL_MOVEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOVEMENTS;
    }
  },

  setMovements(movements: StockMovement[]): void {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  },

  getProductionRecords(): ProductionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTION);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  setProductionRecords(records: ProductionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(records));
  },

  getInventoryCounts(): InventoryCount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  setInventoryCounts(counts: InventoryCount[]): void {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(counts));
  },

  getNotifications(): SystemNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      this.setNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  setNotifications(notifs: SystemNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.setUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      const def = INITIAL_USERS[0];
      this.setCurrentUser(def);
      return def;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getAuthState(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    if (raw === null) return true; // Default to authenticated for demo convenience, but can be logged out
    return raw === 'true';
  },

  setAuthState(isAuth: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(isAuth));
  },

  getAccessLogs(): AccessLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCESS_LOGS);
    if (!raw) {
      const initialLogs: AccessLog[] = [
        {
          id: 'log-1',
          userId: 'user-admin',
          userName: 'Administrador Geral',
          userRole: 'Administrador',
          timestamp: '2026-08-25T08:30:00Z',
          action: 'LOGIN',
          ipAddress: '192.168.1.10',
          device: 'Desktop / Chrome 128 (Windows)',
          status: 'SUCCESS',
          details: 'Autenticação bem-sucedida via formulário',
        },
        {
          id: 'log-2',
          userId: 'user-gestor',
          userName: 'Maria Oliveira (Gerente)',
          userRole: 'Gestor',
          timestamp: '2026-08-25T07:15:00Z',
          action: 'LOGIN',
          ipAddress: '192.168.1.25',
          device: 'Tablet / iPadOS (Safari)',
          status: 'SUCCESS',
          details: 'Sessão iniciada na câmara de produção',
        },
        {
          id: 'log-3',
          userId: 'user-estoque',
          userName: 'Carlos Santos (Operador Estoque)',
          userRole: 'Estoquista',
          timestamp: '2026-08-25T06:00:00Z',
          action: 'LOGIN',
          ipAddress: '192.168.1.42',
          device: 'Smartphone Coletor / Android (Chrome)',
          status: 'SUCCESS',
          details: 'Acesso rápido para expedição FEFO',
        },
      ];
      this.setAccessLogs(initialLogs);
      return initialLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  setAccessLogs(logs: AccessLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
  },

  addAccessLog(log: Omit<AccessLog, 'id' | 'timestamp'>): void {
    const logs = this.getAccessLogs();
    const newLog: AccessLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.setAccessLogs([newLog, ...logs]);
  },

  resetToDefault(): void {
    localStorage.clear();
    this.setProducts(INITIAL_PRODUCTS);
    this.setCategories(INITIAL_CATEGORIES);
    this.setLocations(INITIAL_LOCATIONS);
    this.setBatches(INITIAL_BATCHES);
    this.setMovements(INITIAL_MOVEMENTS);
    this.setNotifications(INITIAL_NOTIFICATIONS);
    this.setUsers(INITIAL_USERS);
    this.setCurrentUser(INITIAL_USERS[0]);
    this.setAuthState(true);
  },
};

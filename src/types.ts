export type UserRole = 'Administrador' | 'Gestor' | 'Estoquista' | 'Produção' | 'Consulta';

export interface UserPermissions {
  dashboard: boolean;
  stockView: boolean;
  stockMovement: boolean; // Entradas e Saídas manuais
  production: boolean; // Apontamento e emissão de etiquetas
  fefoExit: boolean; // Expedição com regra FEFO
  batches: boolean; // Gestão e edição de lotes
  inventory: boolean; // Contagem física
  inventoryApprove: boolean; // Homologação e ajuste de inventário
  reports: boolean; // Relatórios e custos
  productsManage: boolean; // Cadastrar/Editar produtos
  usersManage: boolean; // Gestão de usuários e senhas
  settingsManage: boolean; // Configurações do sistema
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  department?: string;
  active: boolean;
  lastLogin?: string;
  createdAt?: string;
  permissions?: Partial<UserPermissions>;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'FAILED_LOGIN';
  ipAddress?: string;
  device?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
}

export interface StorageLocation {
  id: string;
  name: string; // e.g., "Câmara Fria 01 - Setor A / Prateleira 2"
  zone: string; // "Câmara Fria 01", "Freezer 02", etc.
  temperature: string; // "-18°C"
  description?: string;
}

export type StockStatus = 'normal' | 'low' | 'critical' | 'excess';
export type BatchStatus = 'normal' | 'warning' | 'critical' | 'expired';

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl?: string;
  icon: string;
  packagesPerBox: number;
  minimumStock: number; // in boxes
  maximumStock: number; // in boxes
  shelfLifeDays: number; // e.g. 180 days (6 months)
  storageTemperature: string; // e.g. "-18°C"
  defaultLocationId: string;
  unitWeightGrams?: number; // e.g. 20g, 100g per savory item
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturingDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  quantityBoxes: number;
  quantityPackages: number;
  locationId: string;
  status: BatchStatus;
  createdAt: string;
  notes?: string;
}

export type MovementType = 'PRODUCAO' | 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA' | 'INVENTARIO';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  batchId?: string;
  batchNumber?: string;
  type: MovementType;
  quantityBoxes: number; // positive or negative
  quantityPackages: number;
  previousQuantityBoxes: number;
  newQuantityBoxes: number;
  reason: string; // "Venda", "Produção", "Ajuste de inventário", "Descarte por validade", etc.
  destination?: string;
  supplier?: string;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  notes?: string;
}

export interface ProductionItem {
  productId: string;
  productName: string;
  productCode: string;
  productIcon: string;
  packagesPerBox: number;
  quantityBoxes: number;
  totalPackages: number;
}

export interface ProductionRecord {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  locationId: string;
  locationName: string;
  items: ProductionItem[];
  totalBoxes: number;
  totalPackages: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface InventoryItemCount {
  productId: string;
  productName: string;
  productCode: string;
  systemBoxes: number;
  physicalBoxes: number;
  differenceBoxes: number;
  justification?: string;
  status: 'pending' | 'counted' | 'adjusted';
}

export interface InventoryCount {
  id: string;
  title: string;
  date: string;
  categoryId?: string;
  locationId?: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  items: InventoryItemCount[];
  totalDifferences: number;
  userId: string;
  userName: string;
  createdAt: string;
  completedAt?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'stock' | 'expiration' | 'production' | 'inventory';
  productId?: string;
  batchId?: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface StockOverviewItem {
  product: Product;
  categoryName: string;
  totalBoxes: number;
  totalPackages: number;
  batchesCount: number;
  status: StockStatus;
  nearestExpiration?: string;
  nearestBatchNumber?: string;
  daysToNearestExpiration?: number;
  locationName: string;
}

export type DealStatus = 'new' | 'contact' | 'negotiation' | 'contract' | 'shooting' | 'editing' | 'delivery' | 'completed' | 'lost';

export interface DealLink {
  url: string;
  description: string;
}

export interface StageHistoryEntry {
  status: DealStatus;
  enteredAt: Date;
  exitedAt?: Date;
  daysInStage?: number;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  status: DealStatus | string;
  contactId?: string;
  responsibleId: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  phone?: string;
  email?: string;
  links?: DealLink[];
  stageHistory?: StageHistoryEntry[];
  tags: string[];
  albumPrice?: number;
  childrenCount?: number;
  printCost?: number; // стоимость печати за 1 альбом
  fixedExpenses?: number;
  schoolPaymentType?: 'percent' | 'fixed';
  schoolPercent?: number;
  schoolFixed?: number;
  photographerPaymentType?: 'percent' | 'fixed';
  photographerPercent?: number;
  photographerFixed?: number;
  retoucherPaymentType?: 'percent' | 'fixed';
  retoucherPercent?: number;
  retoucherFixed?: number;
  layoutPaymentType?: 'percent' | 'fixed';
  layoutPercent?: number;
  layoutFixed?: number;
  taxBase?: 'revenue' | 'net_profit';
  taxPercent?: number; // налог всегда в процентах
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  description?: string;
  companyId?: string;
  responsibleId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  responsibleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  responsibleId: string;
  dealId?: string;
  contactId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  dealId?: string;
  contactId?: string;
  companyId?: string;
  userId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'observer';
}

export interface Statistics {
  activeDeals: number; // заказов в работе
  totalRevenue: number;
  profit: number;
  loss: number;
  totalTax: number;
  averageDealSize: number;
  conversionRate: number;
}

export interface DateFilter {
  type: 'current_month' | 'last_month' | 'from_year_start' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface TaxCalculation {
  albumPrice: number;
  childrenCount: number;
  printCost: number; // за 1 штуку
  fixedExpenses: number;
  schoolPaymentType: 'percent' | 'fixed';
  schoolPercent?: number;
  schoolFixed?: number;
  photographerPaymentType: 'percent' | 'fixed';
  photographerPercent?: number;
  photographerFixed?: number;
  retoucherPaymentType: 'percent' | 'fixed';
  retoucherPercent?: number;
  retoucherFixed?: number;
  layoutPaymentType: 'percent' | 'fixed';
  layoutPercent?: number;
  layoutFixed?: number;
  taxBase: 'revenue' | 'net_profit';
  taxPercent: number; // всегда процент
  totalRevenue: number;
  totalCosts: number;
  totalPrintCost: number;
  grossProfit: number;
  netProfit: number;
  taxAmount: number;
  schoolPayment: number;
  photographerPayment: number;
  retoucherPayment: number;
  layoutPayment: number;
}

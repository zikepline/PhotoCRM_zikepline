import { TaxCalculation, Deal, DateFilter } from '@/types/crm';

export const calculateTax = (params: Omit<TaxCalculation, 'totalRevenue' | 'totalCosts' | 'totalPrintCost' | 'grossProfit' | 'netProfit' | 'taxAmount' | 'schoolPayment' | 'photographerPayment' | 'retoucherPayment' | 'layoutPayment'>): TaxCalculation => {
  const {
    albumPrice,
    childrenCount,
    printCost,
    fixedExpenses,
    schoolPaymentType,
    schoolPercent,
    schoolFixed,
    photographerPaymentType,
    photographerPercent,
    photographerFixed,
    retoucherPaymentType,
    retoucherPercent,
    retoucherFixed,
    layoutPaymentType,
    layoutPercent,
    layoutFixed,
    taxBase,
    taxPercent,
  } = params;

  const totalRevenue = albumPrice * childrenCount;
  const totalPrintCost = printCost * childrenCount; // стоимость печати умножается на количество детей
  
  // Расчет оплаты школе
  let schoolPayment = 0;
  if (schoolPaymentType === 'percent') {
    schoolPayment = (totalRevenue * (schoolPercent || 0)) / 100;
  } else {
    schoolPayment = schoolFixed || 0;
  }
  
  // Расчет оплаты фотографу
  let photographerPayment = 0;
  if (photographerPaymentType === 'percent') {
    photographerPayment = (totalRevenue * (photographerPercent || 0)) / 100;
  } else {
    photographerPayment = photographerFixed || 0;
  }
  
  // Расчет оплаты ретушеру
  let retoucherPayment = 0;
  if (retoucherPaymentType === 'percent') {
    retoucherPayment = (totalRevenue * (retoucherPercent || 0)) / 100;
  } else {
    retoucherPayment = retoucherFixed || 0;
  }
  
  // Расчет оплаты верстальщику
  let layoutPayment = 0;
  if (layoutPaymentType === 'percent') {
    layoutPayment = (totalRevenue * (layoutPercent || 0)) / 100;
  } else {
    layoutPayment = layoutFixed || 0;
  }
  
  const totalCosts = totalPrintCost + fixedExpenses + schoolPayment + photographerPayment + retoucherPayment + layoutPayment;
  const grossProfit = totalRevenue - totalCosts;

  const taxableBase = taxBase === 'revenue' ? totalRevenue : grossProfit;
  const taxAmount = (taxableBase * taxPercent) / 100;

  const netProfit = grossProfit - taxAmount;

  return {
    ...params,
    totalRevenue,
    totalCosts,
    totalPrintCost,
    grossProfit,
    netProfit,
    taxAmount,
    schoolPayment,
    photographerPayment,
    retoucherPayment,
    layoutPayment,
  };
};

export const filterDealsByDate = (deals: Deal[], filter: DateFilter): Deal[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (filter.type) {
    case 'current_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    
    case 'from_year_start':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    
    case 'custom':
      if (!filter.startDate || !filter.endDate) return deals;
      startDate = filter.startDate;
      endDate = filter.endDate;
      break;
    
    default:
      return deals;
  }

  return deals.filter(deal => {
    const dealDate = new Date(deal.createdAt);
    return dealDate >= startDate && dealDate <= endDate;
  });
};

export const calculateStatistics = (deals: Deal[]) => {
  const completedDeals = deals.filter(d => d.status === 'completed');
  const activeDeals = deals.filter(d => d.status !== 'completed' && d.status !== 'new' && d.status !== 'lost');
  const totalRevenue = completedDeals.reduce((sum, deal) => sum + deal.amount, 0);
  
  // Calculate profit/loss and tax
  let profit = 0;
  let loss = 0;
  let totalTax = 0;

  completedDeals.forEach(deal => {
    const revenue = deal.amount;
    const totalPrintCost = (deal.printCost || 0) * (deal.childrenCount || 1);
    
    // Расчет оплаты школе
    let schoolPayment = 0;
    if (deal.schoolPaymentType === 'percent') {
      schoolPayment = (revenue * (deal.schoolPercent || 0)) / 100;
    } else if (deal.schoolPaymentType === 'fixed') {
      schoolPayment = deal.schoolFixed || 0;
    } else if (deal.schoolPercent) {
      // Для старых записей без типа
      schoolPayment = (revenue * deal.schoolPercent) / 100;
    }
    
    // Расчет оплаты фотографу
    let photographerPayment = 0;
    if (deal.photographerPaymentType === 'percent') {
      photographerPayment = (revenue * (deal.photographerPercent || 0)) / 100;
    } else if (deal.photographerPaymentType === 'fixed') {
      photographerPayment = deal.photographerFixed || 0;
    } else if (deal.photographerPercent) {
      // Для старых записей без типа
      photographerPayment = (revenue * deal.photographerPercent) / 100;
    }
    
    // Расчет оплаты ретушеру
    let retoucherPayment = 0;
    if (deal.retoucherPaymentType === 'percent') {
      retoucherPayment = (revenue * (deal.retoucherPercent || 0)) / 100;
    } else if (deal.retoucherPaymentType === 'fixed') {
      retoucherPayment = deal.retoucherFixed || 0;
    } else if (deal.retoucherPercent) {
      // Для старых записей без типа
      retoucherPayment = (revenue * deal.retoucherPercent) / 100;
    }
    
    // Расчет оплаты верстальщику
    let layoutPayment = 0;
    if (deal.layoutPaymentType === 'percent') {
      layoutPayment = (revenue * (deal.layoutPercent || 0)) / 100;
    } else if (deal.layoutPaymentType === 'fixed') {
      layoutPayment = deal.layoutFixed || 0;
    } else if (deal.layoutPercent) {
      // Для старых записей без типа
      layoutPayment = (revenue * deal.layoutPercent) / 100;
    }
    
    const totalCosts = totalPrintCost + (deal.fixedExpenses || 0) + schoolPayment + photographerPayment + retoucherPayment + layoutPayment;
    const grossProfit = revenue - totalCosts;
    
    // Расчет налога в зависимости от налогооблагаемой базы
    const taxPercent = deal.taxPercent || 0;
    const taxBase = deal.taxBase || 'net_profit'; // По умолчанию от чистой прибыли
    const taxableAmount = taxBase === 'revenue' ? revenue : grossProfit;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    totalTax += taxAmount;
    
    const dealNetProfit = grossProfit - taxAmount;
    
    if (dealNetProfit > 0) {
      profit += dealNetProfit;
    } else {
      loss += Math.abs(dealNetProfit);
    }
  });

  const averageDealSize = totalRevenue / (completedDeals.length || 1);
  const conversionRate = (completedDeals.length / (deals.length || 1)) * 100;

  return {
    activeDeals: activeDeals.length,
    totalRevenue,
    profit,
    loss,
    totalTax,
    averageDealSize,
    conversionRate,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

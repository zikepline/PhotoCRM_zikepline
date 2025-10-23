import { Deal, Contact, Company, Task, Note, User } from '@/types/crm';

const STORAGE_KEYS = {
  DEALS: 'crm_deals',
  CONTACTS: 'crm_contacts',
  COMPANIES: 'crm_companies',
  TASKS: 'crm_tasks',
  NOTES: 'crm_notes',
  USERS: 'crm_users',
  CURRENT_USER: 'crm_current_user',
} as const;

// Generic storage functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data, (key, value) => {
      // Convert date strings back to Date objects
      if (key.includes('Date') || key.includes('At')) {
        return value ? new Date(value) : value;
      }
      return value;
    }) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Deals
export const getDeals = (): Deal[] => getFromStorage<Deal>(STORAGE_KEYS.DEALS);

export const saveDeal = (deal: Deal): void => {
  const deals = getDeals();
  const existingIndex = deals.findIndex(d => d.id === deal.id);
  
  if (existingIndex >= 0) {
    deals[existingIndex] = { ...deal, updatedAt: new Date() };
  } else {
    deals.push(deal);
  }
  
  saveToStorage(STORAGE_KEYS.DEALS, deals);
};

export const deleteDeal = (id: string): void => {
  const deals = getDeals().filter(d => d.id !== id);
  saveToStorage(STORAGE_KEYS.DEALS, deals);
};

// Contacts
export const getContacts = (): Contact[] => getFromStorage<Contact>(STORAGE_KEYS.CONTACTS);

export const saveContact = (contact: Contact): void => {
  const contacts = getContacts();
  const existingIndex = contacts.findIndex(c => c.id === contact.id);
  
  if (existingIndex >= 0) {
    contacts[existingIndex] = { ...contact, updatedAt: new Date() };
  } else {
    contacts.push(contact);
  }
  
  saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
};

export const deleteContact = (id: string): void => {
  const contacts = getContacts().filter(c => c.id !== id);
  saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
};

// Companies
export const getCompanies = (): Company[] => getFromStorage<Company>(STORAGE_KEYS.COMPANIES);

export const saveCompany = (company: Company): void => {
  const companies = getCompanies();
  const existingIndex = companies.findIndex(c => c.id === company.id);
  
  if (existingIndex >= 0) {
    companies[existingIndex] = { ...company, updatedAt: new Date() };
  } else {
    companies.push(company);
  }
  
  saveToStorage(STORAGE_KEYS.COMPANIES, companies);
};

// Tasks
export const getTasks = (): Task[] => getFromStorage<Task>(STORAGE_KEYS.TASKS);

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  const existingIndex = tasks.findIndex(t => t.id === task.id);
  
  if (existingIndex >= 0) {
    tasks[existingIndex] = { ...task, updatedAt: new Date() };
  } else {
    tasks.push(task);
  }
  
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
};

// Notes
export const getNotes = (): Note[] => getFromStorage<Note>(STORAGE_KEYS.NOTES);

export const saveNote = (note: Note): void => {
  const notes = getNotes();
  notes.push(note);
  saveToStorage(STORAGE_KEYS.NOTES, notes);
};

// Users
export const getUsers = (): User[] => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  
  // Initialize with default user if empty
  if (users.length === 0) {
    const defaultUser: User = {
      id: '1',
      name: 'Администратор',
      email: 'admin@crm.ru',
      role: 'admin',
    };
    saveToStorage(STORAGE_KEYS.USERS, [defaultUser]);
    return [defaultUser];
  }
  
  return users;
};

export const getCurrentUser = (): User => {
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  const users = getUsers();
  return users.find(u => u.id === userId) || users[0];
};

// Initialize demo data
export const initializeDemoData = (): void => {
  const deals = getDeals();
  
  if (deals.length === 0) {
    const currentUser = getCurrentUser();
    const demoDeals: Deal[] = [
      {
        id: '1',
        title: 'Школьная фотосессия - Лицей №1',
        amount: 150000,
        status: 'negotiation',
        responsibleId: currentUser.id,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        description: 'Фотосессия выпускных классов',
        tags: ['школа', 'выпускной'],
        albumPrice: 500,
        childrenCount: 100,
        printCost: 15000,
        fixedExpenses: 10000,
        schoolPercent: 15,
        photographerPercent: 25,
      },
      {
        id: '2',
        title: 'Детский сад "Солнышко"',
        amount: 80000,
        status: 'shooting',
        responsibleId: currentUser.id,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-18'),
        description: 'Индивидуальные портреты',
        tags: ['детский сад'],
        albumPrice: 400,
        childrenCount: 60,
      },
      {
        id: '3',
        title: 'Школа №45 - Начальные классы',
        amount: 120000,
        status: 'new',
        responsibleId: currentUser.id,
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20'),
        description: 'Портфолио учеников',
        tags: ['школа', 'портфолио'],
      },
      {
        id: '4',
        title: 'Гимназия №7 - Выпускники',
        amount: 200000,
        status: 'completed',
        responsibleId: currentUser.id,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-05'),
        description: 'Выпускной альбом 11 класс',
        tags: ['выпускной', 'альбом'],
      },
    ];
    
    saveToStorage(STORAGE_KEYS.DEALS, demoDeals);
  }
};

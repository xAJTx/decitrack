import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/utils/storage';
import { Entry } from '@/utils/time';

export type Employee = {
  id: string;
  name: string;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  createdAt: string;
};

type AppStoreContextValue = {
  employees: Employee[];
  companies: Company[];
  entries: Entry[];
  selectedEmployeeId: string | null;
  addEmployee: (name: string) => void;
  removeEmployee: (id: string) => void;
  addCompany: (name: string) => void;
  removeCompany: (id: string) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (id: string, entry: Entry) => void;
  removeEntry: (id: string) => void;
  selectEmployee: (id: string | null) => void;
  getEmployeeName: (id: string) => string;
  getCompanyName: (id?: string) => string;
  ready: boolean;
};

const EMPLOYEES_KEY = 'decitrack:employees';
const COMPANIES_KEY = 'decitrack:companies';
const ENTRIES_KEY = 'decitrack:entries';
const SELECTED_EMPLOYEE_KEY = 'decitrack:selectedEmployeeId';

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    (async () => {
      const emps = await storage.getItem<Employee[]>(EMPLOYEES_KEY, []);
      const comps = await storage.getItem<Company[]>(COMPANIES_KEY, []);
      const ents = await storage.getItem<Entry[]>(ENTRIES_KEY, []);
      const selected = await storage.getItem<string | null>(SELECTED_EMPLOYEE_KEY, null);

      setEmployees(emps || []);
      setCompanies(comps || []);
      setEntries(ents || []);
      setSelectedEmployeeId(selected);
      setReady(true);
    })();
  }, []);

  const addEmployee = (name: string) => {
    const emp: Employee = {
      id: Math.random().toString(36).slice(2),
      name,
      createdAt: new Date().toISOString(),
    };
    const updated = [...employees, emp];
    setEmployees(updated);
    storage.setItem(EMPLOYEES_KEY, updated);
  };

  const removeEmployee = (id: string) => {
    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    storage.setItem(EMPLOYEES_KEY, updated);
    if (selectedEmployeeId === id) {
      setSelectedEmployeeId(null);
      storage.removeItem(SELECTED_EMPLOYEE_KEY);
    }
  };

  const addCompany = (name: string) => {
    const comp: Company = {
      id: Math.random().toString(36).slice(2),
      name,
      createdAt: new Date().toISOString(),
    };
    const updated = [...companies, comp];
    setCompanies(updated);
    storage.setItem(COMPANIES_KEY, updated);
  };

  const removeCompany = (id: string) => {
    const updated = companies.filter((c) => c.id !== id);
    setCompanies(updated);
    storage.setItem(COMPANIES_KEY, updated);
    // Remove companyId from affected entries
    const updatedEntries = entries.map((e) => (e.companyId === id ? { ...e, companyId: undefined } : e));
    setEntries(updatedEntries);
    storage.setItem(ENTRIES_KEY, updatedEntries);
  };

  const addEntry = (entry: Entry) => {
    const updated = [...entries, entry];
    setEntries(updated);
    storage.setItem(ENTRIES_KEY, updated);
  };

  const updateEntry = (id: string, entry: Entry) => {
    const updated = entries.map((e) => (e.id === id ? entry : e));
    setEntries(updated);
    storage.setItem(ENTRIES_KEY, updated);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    storage.setItem(ENTRIES_KEY, updated);
  };

  const selectEmployee = (id: string | null) => {
    setSelectedEmployeeId(id);
    if (id) {
      storage.setItem(SELECTED_EMPLOYEE_KEY, id);
    } else {
      storage.removeItem(SELECTED_EMPLOYEE_KEY);
    }
  };

  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.name || 'Unknown';
  };

  const getCompanyName = (id?: string) => {
    if (!id) return '';
    return companies.find((c) => c.id === id)?.name || '';
  };

  return (
    <AppStoreContext.Provider
      value={{
        employees,
        companies,
        entries,
        selectedEmployeeId,
        addEmployee,
        removeEmployee,
        addCompany,
        removeCompany,
        addEntry,
        updateEntry,
        removeEntry,
        selectEmployee,
        getEmployeeName,
        getCompanyName,
        ready,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

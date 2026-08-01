import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { Entry } from "@/src/utils/time";

export type Employee = {
  id: string;
  name: string;
  createdAt: string;
};

const EMP_KEY = "decitrack:employees";
const ENTRIES_KEY = "decitrack:entries";
const SELECTED_KEY = "decitrack:selectedEmployee";

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

type StoreValue = {
  ready: boolean;
  employees: Employee[];
  entries: Entry[];
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  addEmployee: (name: string) => Employee;
  removeEmployee: (id: string) => void;
  renameEmployee: (id: string, name: string) => void;
  upsertEntry: (entry: Omit<Entry, "id" | "createdAt"> & { id?: string }) => void;
  deleteEntry: (id: string) => void;
  getEntry: (employeeId: string, date: string) => Entry | undefined;
  entriesForMonth: (employeeId: string, monthKey: string) => Entry[];
};

const StoreContext = createContext<StoreValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState<
    string | null
  >(null);

  useEffect(() => {
    (async () => {
      const [emp, ent, sel] = await Promise.all([
        storage.getItem<Employee[]>(EMP_KEY, []),
        storage.getItem<Entry[]>(ENTRIES_KEY, []),
        storage.getItem<string | null>(SELECTED_KEY, null),
      ]);
      const empList = emp ?? [];
      setEmployees(empList);
      setEntries(ent ?? []);
      setSelectedEmployeeIdState(
        sel && empList.some((e) => e.id === sel)
          ? sel
          : empList[0]?.id ?? null,
      );
      setReady(true);
    })();
  }, []);

  const persistEmployees = useCallback((next: Employee[]) => {
    setEmployees(next);
    storage.setItem(EMP_KEY, next);
  }, []);

  const persistEntries = useCallback((next: Entry[]) => {
    setEntries(next);
    storage.setItem(ENTRIES_KEY, next);
  }, []);

  const setSelectedEmployeeId = useCallback((id: string | null) => {
    setSelectedEmployeeIdState(id);
    storage.setItem(SELECTED_KEY, id);
  }, []);

  const addEmployee = useCallback(
    (name: string) => {
      const emp: Employee = {
        id: uid(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [...employees, emp];
      persistEmployees(next);
      if (!selectedEmployeeId) setSelectedEmployeeId(emp.id);
      return emp;
    },
    [employees, persistEmployees, selectedEmployeeId, setSelectedEmployeeId],
  );

  const removeEmployee = useCallback(
    (id: string) => {
      const next = employees.filter((e) => e.id !== id);
      persistEmployees(next);
      persistEntries(entries.filter((e) => e.employeeId !== id));
      if (selectedEmployeeId === id) {
        setSelectedEmployeeId(next[0]?.id ?? null);
      }
    },
    [
      employees,
      entries,
      persistEmployees,
      persistEntries,
      selectedEmployeeId,
      setSelectedEmployeeId,
    ],
  );

  const renameEmployee = useCallback(
    (id: string, name: string) => {
      persistEmployees(
        employees.map((e) => (e.id === id ? { ...e, name: name.trim() } : e)),
      );
    },
    [employees, persistEmployees],
  );

  const upsertEntry = useCallback<StoreValue["upsertEntry"]>(
    (entry) => {
      const existing = entries.find(
        (e) => e.employeeId === entry.employeeId && e.date === entry.date,
      );
      if (existing) {
        persistEntries(
          entries.map((e) =>
            e.id === existing.id
              ? { ...existing, ...entry, id: existing.id }
              : e,
          ),
        );
      } else {
        const full: Entry = {
          ...entry,
          id: entry.id ?? uid(),
          createdAt: new Date().toISOString(),
        };
        persistEntries([...entries, full]);
      }
    },
    [entries, persistEntries],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persistEntries(entries.filter((e) => e.id !== id));
    },
    [entries, persistEntries],
  );

  const getEntry = useCallback(
    (employeeId: string, date: string) =>
      entries.find((e) => e.employeeId === employeeId && e.date === date),
    [entries],
  );

  const entriesForMonth = useCallback(
    (employeeId: string, monthKey: string) =>
      entries
        .filter(
          (e) =>
            e.employeeId === employeeId && e.date.startsWith(monthKey),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      employees,
      entries,
      selectedEmployeeId,
      setSelectedEmployeeId,
      addEmployee,
      removeEmployee,
      renameEmployee,
      upsertEntry,
      deleteEntry,
      getEntry,
      entriesForMonth,
    }),
    [
      ready,
      employees,
      entries,
      selectedEmployeeId,
      setSelectedEmployeeId,
      addEmployee,
      removeEmployee,
      renameEmployee,
      upsertEntry,
      deleteEntry,
      getEntry,
      entriesForMonth,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

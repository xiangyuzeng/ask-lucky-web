import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { DepartmentId } from "../types/department";
import { getDepartmentContext } from "../data/departmentContexts";

interface DepartmentContextType {
  department: DepartmentId;
  setDepartment: (dept: DepartmentId) => void;
  resetDepartment: () => void;
  getContextBlock: () => string;
}

const STORAGE_KEY = "luckin-ops-department";

const DepartmentContext = createContext<DepartmentContextType | undefined>(
  undefined,
);

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [department, setDepartmentState] = useState<DepartmentId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidDepartment(stored)) {
      return stored as DepartmentId;
    }
    return "general";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, department);
  }, [department]);

  const setDepartment = useCallback((dept: DepartmentId) => {
    setDepartmentState(dept);
  }, []);

  const resetDepartment = useCallback(() => {
    setDepartmentState("general");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getContextBlock = useCallback(() => {
    return getDepartmentContext(department);
  }, [department]);

  return (
    <DepartmentContext.Provider
      value={{
        department,
        setDepartment,
        resetDepartment,
        getContextBlock,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return context;
}

function isValidDepartment(value: string): value is DepartmentId {
  return [
    "general",
    "marketing",
    "accounting",
    "devops",
    "product",
    "supplyChain",
    "executive",
  ].includes(value);
}

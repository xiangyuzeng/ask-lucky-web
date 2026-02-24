import type { DepartmentId, Department } from "../types/department";

export const departments: Record<DepartmentId, Department> = {
  general: {
    id: "general",
    icon: "💬",
    color: "#0A3A7A",
    bgClass: "",
  },
  marketing: {
    id: "marketing",
    icon: "📊",
    color: "#E53E3E",
    bgClass: "dept-marketing",
  },
  accounting: {
    id: "accounting",
    icon: "💰",
    color: "#38A169",
    bgClass: "dept-accounting",
  },
  devops: {
    id: "devops",
    icon: "🖥️",
    color: "#805AD5",
    bgClass: "dept-devops",
  },
  product: {
    id: "product",
    icon: "🎯",
    color: "#3182CE",
    bgClass: "dept-product",
  },
  supplyChain: {
    id: "supplyChain",
    icon: "📦",
    color: "#DD6B20",
    bgClass: "dept-supply-chain",
  },
  executive: {
    id: "executive",
    icon: "👔",
    color: "#C8A96E",
    bgClass: "dept-executive",
  },
};

export const departmentList: DepartmentId[] = [
  "marketing",
  "accounting",
  "devops",
  "product",
  "supplyChain",
  "executive",
];

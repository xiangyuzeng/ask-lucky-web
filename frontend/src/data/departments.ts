import {
  MessageSquare,
  TrendingUp,
  Wallet,
  Server,
  Target,
  Package,
  Crown,
} from "lucide-react";
import type { DepartmentId, Department } from "../types/department";

export const departments: Record<DepartmentId, Department> = {
  general: {
    id: "general",
    icon: MessageSquare,
    color: "#182D71",
    bgClass: "",
  },
  marketing: {
    id: "marketing",
    icon: TrendingUp,
    color: "#E53E3E",
    bgClass: "dept-marketing",
  },
  accounting: {
    id: "accounting",
    icon: Wallet,
    color: "#38A169",
    bgClass: "dept-accounting",
  },
  devops: {
    id: "devops",
    icon: Server,
    color: "#805AD5",
    bgClass: "dept-devops",
  },
  product: {
    id: "product",
    icon: Target,
    color: "#3182CE",
    bgClass: "dept-product",
  },
  supplyChain: {
    id: "supplyChain",
    icon: Package,
    color: "#DD6B20",
    bgClass: "dept-supply-chain",
  },
  executive: {
    id: "executive",
    icon: Crown,
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

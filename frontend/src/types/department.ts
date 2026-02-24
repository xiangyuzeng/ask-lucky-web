import type { ComponentType, CSSProperties } from "react";

export type DepartmentId =
  | "general"
  | "marketing"
  | "accounting"
  | "devops"
  | "product"
  | "supplyChain"
  | "executive";

export interface Department {
  id: DepartmentId;
  icon: ComponentType<{
    className?: string;
    size?: number;
    style?: CSSProperties;
  }>;
  color: string;
  bgClass: string;
}

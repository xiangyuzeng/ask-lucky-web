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
  icon: string;
  color: string;
  bgClass: string;
}

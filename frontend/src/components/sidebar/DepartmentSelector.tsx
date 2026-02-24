import { useDepartment } from "../../contexts/DepartmentContext";
import { departments, departmentList } from "../../data/departments";
import { useTranslation } from "../../i18n";
import type { DepartmentId } from "../../types/department";

export function DepartmentSelector() {
  const { department, setDepartment } = useDepartment();
  const { t } = useTranslation();

  const allDepartments: DepartmentId[] = ["general", ...departmentList];

  return (
    <div className="relative">
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value as DepartmentId)}
        className="appearance-none px-4 py-2 pr-8 text-sm font-medium rounded-lg
          bg-luckin-surface border border-luckin
          hover:border-[var(--luckin-primary)] transition-luckin
          focus-luckin cursor-pointer"
        aria-label={t("welcome.selectDepartment")}
      >
        {allDepartments.map((deptId) => (
          <option key={deptId} value={deptId}>
            {departments[deptId].icon} {t(`departments.${deptId}.name`)}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-luckin-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

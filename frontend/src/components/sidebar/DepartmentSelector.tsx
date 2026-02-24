import { ChevronDown } from "lucide-react";
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
      <div
        className="flex items-center gap-2 px-4 py-2 pr-8 text-sm font-medium rounded-lg
        bg-white/5 border border-white/10 text-white/80
        hover:border-white/20 transition-all duration-200
        cursor-pointer"
      >
        {(() => {
          const dept = departments[department];
          const DeptIcon = dept.icon;
          return <DeptIcon size={16} />;
        })()}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value as DepartmentId)}
          className="appearance-none bg-transparent border-none text-white/80 text-sm font-medium
            focus:outline-none cursor-pointer absolute inset-0 opacity-0 w-full"
          aria-label={t("welcome.selectDepartment")}
        >
          {allDepartments.map((deptId) => (
            <option key={deptId} value={deptId}>
              {t(`departments.${deptId}.name`)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none">
          {t(`departments.${department}.name`)}
        </span>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={14} className="text-white/40" />
      </div>
    </div>
  );
}

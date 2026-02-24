import type { DepartmentId } from "../../types/department";
import { departments } from "../../data/departments";
import { useTranslation } from "../../i18n";

interface DepartmentTileProps {
  departmentId: DepartmentId;
  onClick: (departmentId: DepartmentId) => void;
}

export function DepartmentTile({ departmentId, onClick }: DepartmentTileProps) {
  const { t } = useTranslation();
  const dept = departments[departmentId];

  return (
    <button
      onClick={() => onClick(departmentId)}
      className={`
        group relative p-6 rounded-xl
        bg-luckin-surface border border-luckin
        hover:border-[var(--luckin-primary)] hover:shadow-luckin-md
        transition-luckin cursor-pointer
        flex flex-col items-center text-center
        focus-luckin
      `}
      style={{ "--dept-accent": dept.color } as React.CSSProperties}
    >
      <span className="text-4xl mb-3" role="img" aria-hidden="true">
        {dept.icon}
      </span>
      <h3 className="font-semibold text-luckin-primary mb-1">
        {t(`departments.${departmentId}.name`)}
      </h3>
      <p className="text-sm text-luckin-muted line-clamp-2">
        {t(`departments.${departmentId}.description`)}
      </p>
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-luckin"
        style={{ backgroundColor: dept.color }}
      />
    </button>
  );
}

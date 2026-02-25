import type { DepartmentId } from "../../types/department";
import { departments } from "../../data/departments";
import { useTranslation } from "../../i18n";

interface DepartmentTileProps {
  departmentId: DepartmentId;
  onClick: (departmentId: DepartmentId) => void;
  index?: number;
}

export function DepartmentTile({
  departmentId,
  onClick,
  index = 0,
}: DepartmentTileProps) {
  const { t } = useTranslation();
  const dept = departments[departmentId];
  const IconComponent = dept.icon;

  return (
    <button
      onClick={() => onClick(departmentId)}
      className={`
        group relative p-6
        rounded-[var(--luckin-radius-2xl)]
        hover-lift press-effect
        cursor-pointer
        flex flex-col items-center text-center
        focus-luckin
        animate-fade-slide-up
      `}
      style={
        {
          animationDelay: `${index * 80}ms`,
          opacity: 0,
          "--dept-accent": dept.color,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(232,240,254,0.7) 100%)",
          border: "1px solid rgba(24, 45, 113, 0.1)",
          boxShadow:
            "0 2px 8px rgba(24, 45, 113, 0.08), 0 1px 3px rgba(24, 45, 113, 0.04)",
        } as React.CSSProperties
      }
    >
      {/* Top gradient border line */}
      <div
        className="absolute top-0 left-4 right-4 h-[4px] rounded-full"
        style={{
          background: `linear-gradient(90deg, ${dept.color}, ${dept.color}88)`,
        }}
      />

      {/* Icon badge */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
        style={{
          background: `${dept.color}26`,
        }}
      >
        <IconComponent
          className="transition-colors duration-200"
          style={{ color: dept.color }}
          size={24}
        />
      </div>

      {/* Department name */}
      <h3 className="font-semibold text-[var(--luckin-text-primary)] mb-1">
        {t(`departments.${departmentId}.name`)}
      </h3>

      {/* Department description */}
      <p className="text-sm text-luckin-muted line-clamp-2">
        {t(`departments.${departmentId}.description`)}
      </p>
    </button>
  );
}

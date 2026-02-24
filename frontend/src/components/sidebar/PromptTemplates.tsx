import { useMemo } from "react";
import { useDepartment } from "../../contexts/DepartmentContext";
import { useTranslation } from "../../i18n";
import { getTemplatesByDepartment } from "../../data/promptTemplates";
import { departments } from "../../data/departments";

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

export function PromptTemplates({ onSelect }: PromptTemplatesProps) {
  const { department } = useDepartment();
  const { t } = useTranslation();

  const templates = useMemo(
    () => getTemplatesByDepartment(department),
    [department],
  );

  // Group templates by department for general view
  const groupedTemplates = useMemo(() => {
    if (department !== "general") {
      return { [department]: templates };
    }

    const groups: Record<string, typeof templates> = {};
    templates.forEach((template) => {
      if (!groups[template.department]) {
        groups[template.department] = [];
      }
      groups[template.department].push(template);
    });
    return groups;
  }, [department, templates]);

  return (
    <div className="py-2">
      {Object.entries(groupedTemplates).map(([deptId, deptTemplates]) => (
        <div key={deptId} className="mb-4">
          {department === "general" && (
            <div className="px-4 py-2 text-xs font-semibold text-luckin-muted uppercase tracking-wider flex items-center gap-2">
              <span>
                {departments[deptId as keyof typeof departments]?.icon}
              </span>
              <span>{t(`departments.${deptId}.name`)}</span>
            </div>
          )}
          <ul>
            {deptTemplates.map((template) => (
              <li key={template.id}>
                <button
                  onClick={() => onSelect(template.prompt)}
                  className="w-full px-4 py-3 text-left hover:bg-luckin-sky transition-luckin group"
                >
                  <div className="font-medium text-sm text-luckin-primary group-hover:text-[var(--luckin-primary-hover)]">
                    {template.titleKey}
                  </div>
                  <div className="text-xs text-luckin-muted mt-1 line-clamp-2">
                    {template.prompt}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

import { DepartmentTile } from "./DepartmentTile";
import { departmentList } from "../../data/departments";
import { useTranslation } from "../../i18n";
import type { DepartmentId } from "../../types/department";

interface WelcomePageProps {
  onDepartmentSelect: (departmentId: DepartmentId) => void;
}

export function WelcomePage({ onDepartmentSelect }: WelcomePageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-luckin-bg">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-luckin-primary mb-2">
            {t("welcome.greeting")}
          </h1>
          <p className="text-luckin-secondary">{t("welcome.subtitle")}</p>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {departmentList.map((deptId) => (
            <DepartmentTile
              key={deptId}
              departmentId={deptId}
              onClick={onDepartmentSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { DepartmentTile } from "./DepartmentTile";
import { AnimatedBackground } from "./AnimatedBackground";
import { LuckinLogo } from "../common/LuckinLogo";
import { departmentList } from "../../data/departments";
import { useTranslation } from "../../i18n";
import type { DepartmentId } from "../../types/department";

interface WelcomePageProps {
  onDepartmentSelect: (departmentId: DepartmentId) => void;
}

export function WelcomePage({ onDepartmentSelect }: WelcomePageProps) {
  const { t } = useTranslation();

  return (
    <AnimatedBackground>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-slide-up">
            <div className="flex justify-center mb-4">
              <LuckinLogo size={64} showPulse />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-luckin-gradient mb-2">
              {t("app.title")}
            </h1>
            <p className="text-luckin-muted text-lg">{t("app.subtitle")}</p>
          </div>

          {/* Animated divider */}
          <div className="flex justify-center mb-8 animate-fade-slide-up stagger-2">
            <div className="w-64 h-px overflow-hidden">
              <div
                className="h-full bg-luckin-gradient"
                style={{
                  animation: "expandWidth 1s ease-out 0.3s forwards",
                  width: 0,
                }}
              />
            </div>
          </div>

          {/* "Powered by AI" shimmer badge */}
          <div className="flex justify-center mb-10 animate-fade-slide-up stagger-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--luckin-sky)] text-[var(--luckin-primary)] text-sm font-medium animate-shimmer">
              {t("welcome.poweredBy")}
            </span>
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {departmentList.map((deptId, index) => (
              <DepartmentTile
                key={deptId}
                departmentId={deptId}
                onClick={onDepartmentSelect}
                index={index}
              />
            ))}
          </div>

          {/* Footer */}
          <div
            className="text-center animate-fade-slide-up"
            style={{ animationDelay: "600ms", opacity: 0 }}
          >
            <p className="text-xs text-luckin-muted">{t("welcome.footer")}</p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}

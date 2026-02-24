import { PanelLeft, Plus, Home } from "lucide-react";
import { DepartmentSelector } from "../sidebar/DepartmentSelector";
import { useTranslation } from "../../i18n";
import { HistoryButton } from "../chat/HistoryButton";
import { useDepartment } from "../../contexts/DepartmentContext";
import { departments } from "../../data/departments";
import { LuckinLogo } from "../common/LuckinLogo";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onHistoryClick?: () => void;
  onLogoClick?: () => void;
  onHomeClick?: () => void;
  onNewConversation?: () => void;
  showSidebarToggle?: boolean;
  showDepartmentBadge?: boolean;
}

export function AppHeader({
  onToggleSidebar,
  onHistoryClick,
  onLogoClick,
  onHomeClick,
  onNewConversation,
  showSidebarToggle = true,
  showDepartmentBadge = true,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const { department } = useDepartment();

  const currentDept = departments[department];
  const showBadge = showDepartmentBadge && department !== "general";
  const DeptIcon = currentDept.icon;

  return (
    <header className="header-frosted relative flex items-center justify-between px-4 py-3">
      {/* Gradient bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--luckin-primary), transparent)",
        }}
      />

      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-luckin-sky transition-luckin focus-luckin"
            aria-label={t("navigation.toggleSidebar")}
          >
            <PanelLeft size={20} className="text-luckin-secondary" />
          </button>
        )}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label={t("app.title")}
        >
          <LuckinLogo size={24} />
          <span className="font-semibold text-luckin-primary">
            {t("app.title")}
          </span>
        </button>

        {/* Department Badge */}
        {showBadge && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${currentDept.color}15`,
              color: currentDept.color,
              border: `1px solid ${currentDept.color}30`,
            }}
          >
            <DeptIcon size={14} />
            <span className="hidden sm:inline">
              {t(`departments.${department}.name`)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Home Button */}
        {onHomeClick && (
          <button
            onClick={onHomeClick}
            className="p-2 rounded-lg hover:bg-luckin-sky transition-luckin focus-luckin"
            aria-label={t("navigation.home")}
            title={t("navigation.home")}
          >
            <Home size={20} className="text-luckin-secondary" />
          </button>
        )}
        {/* New Conversation Button */}
        {onNewConversation && (
          <button
            onClick={onNewConversation}
            className="p-2 rounded-lg hover:bg-luckin-sky transition-luckin focus-luckin"
            aria-label={t("navigation.newConversation")}
            title={t("navigation.newConversation")}
          >
            <Plus size={20} className="text-luckin-secondary" />
          </button>
        )}
        <DepartmentSelector />
        {onHistoryClick && <HistoryButton onClick={onHistoryClick} />}
      </div>
    </header>
  );
}

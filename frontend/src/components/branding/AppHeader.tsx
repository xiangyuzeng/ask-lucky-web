import { DepartmentSelector } from "../sidebar/DepartmentSelector";
import { LanguageToggle } from "../sidebar/LanguageToggle";
import { useTranslation } from "../../i18n";
import { ThemeToggle } from "../common/ThemeToggle";
import { HistoryButton } from "../chat/HistoryButton";
import { SettingsButton } from "../SettingsButton";
import { useDepartment } from "../../contexts/DepartmentContext";
import { departments } from "../../data/departments";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
  onNewConversation?: () => void;
  showSidebarToggle?: boolean;
  showDepartmentBadge?: boolean;
}

export function AppHeader({
  onToggleSidebar,
  onHistoryClick,
  onSettingsClick,
  onLogoClick,
  onNewConversation,
  showSidebarToggle = true,
  showDepartmentBadge = true,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const { department } = useDepartment();

  const currentDept = departments[department];
  const showBadge = showDepartmentBadge && department !== "general";

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-luckin-surface border-b border-luckin">
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-luckin-sky transition-luckin focus-luckin"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-luckin-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label={t("navigation.home")}
        >
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
            <span>{currentDept.icon}</span>
            <span className="hidden sm:inline">
              {t(`departments.${department}.name`)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* New Conversation Button */}
        {onNewConversation && (
          <button
            onClick={onNewConversation}
            className="p-2 rounded-lg hover:bg-luckin-sky transition-luckin focus-luckin"
            aria-label={t("navigation.newConversation")}
            title={t("navigation.newConversation")}
          >
            <svg
              className="w-5 h-5 text-luckin-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
        <DepartmentSelector />
        <LanguageToggle />
        {onHistoryClick && <HistoryButton onClick={onHistoryClick} />}
        {onSettingsClick && <SettingsButton onClick={onSettingsClick} />}
        <ThemeToggle />
      </div>
    </header>
  );
}

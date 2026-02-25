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
    <header className="relative flex items-center justify-between px-4 py-3 bg-[#182D71] shadow-md">
      {/* Subtle bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, #3B82F6, #C8A96E, #3B82F6)",
        }}
      />

      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 transition-luckin focus-luckin"
            aria-label={t("navigation.toggleSidebar")}
          >
            <PanelLeft size={20} className="text-white/80" />
          </button>
        )}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label={t("app.title")}
        >
          <LuckinLogo size={24} />
          <span className="font-semibold text-white">{t("app.title")}</span>
        </button>

        {/* Department Badge */}
        {showBadge && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/20">
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
            className="p-2 rounded-lg hover:bg-white/10 transition-luckin focus-luckin"
            aria-label={t("navigation.home")}
            title={t("navigation.home")}
          >
            <Home size={20} className="text-white/80" />
          </button>
        )}
        {/* New Conversation Button */}
        {onNewConversation && (
          <button
            onClick={onNewConversation}
            className="p-2 rounded-lg hover:bg-white/10 transition-luckin focus-luckin"
            aria-label={t("navigation.newConversation")}
            title={t("navigation.newConversation")}
          >
            <Plus size={20} className="text-white/80" />
          </button>
        )}
        <DepartmentSelector />
        {onHistoryClick && <HistoryButton onClick={onHistoryClick} />}
      </div>
    </header>
  );
}

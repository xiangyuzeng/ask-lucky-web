import { Terminal } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { useTranslation } from "../../i18n";

export function GeneralSettings() {
  const { enterBehavior, toggleEnterBehavior } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" className="sr-only" id="settings-announcements">
        {enterBehavior === "send"
          ? t("settings.srSend")
          : t("settings.srNewline")}
        .
      </div>

      <div>
        <h3 className="text-lg font-medium text-[var(--luckin-text-primary)] mb-4">
          {t("settings.general")}
        </h3>

        <div className="space-y-4">
          {/* Enter Behavior Setting */}
          <div>
            <label className="text-sm font-medium text-[var(--luckin-text-secondary)] mb-2 block">
              {t("settings.enterKeyBehavior")}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleEnterBehavior}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--luckin-bg)] border border-[var(--luckin-border)] rounded-lg hover:bg-[var(--luckin-surface-hover)] transition-all duration-200 text-left flex-1"
                role="switch"
                aria-checked={enterBehavior === "send"}
                aria-label={`${t("settings.enterKeyBehavior")} - ${enterBehavior === "send" ? t("settings.enterToSend") : t("settings.enterToNewline")}`}
              >
                <Terminal className="w-5 h-5 text-[var(--luckin-primary)]" />
                <div>
                  <div className="text-sm font-medium text-[var(--luckin-text-primary)]">
                    {enterBehavior === "send"
                      ? t("settings.enterToSend")
                      : t("settings.enterToNewline")}
                  </div>
                  <div className="text-xs text-[var(--luckin-text-muted)]">
                    {enterBehavior === "send"
                      ? t("settings.enterToSendDesc")
                      : t("settings.enterToNewlineDesc")}
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-2 text-xs text-[var(--luckin-text-muted)]">
              {t("settings.enterBehaviorHelp")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

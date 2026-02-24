import { AlertTriangle } from "lucide-react";
import type { JSX } from "react";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n";

// Helper function to extract command name from pattern like "Bash(ls:*)" -> "ls"
function extractCommandName(pattern: string): string {
  if (!pattern) return "Unknown";
  const match = pattern.match(/Bash\(([^:]+):/);
  return match ? match[1] : pattern;
}

// Helper function to render permission content based on patterns
function renderPermissionContent(
  patterns: string[],
  t: (key: string, params?: Record<string, string | number>) => string,
): JSX.Element {
  // Handle empty patterns array
  if (patterns.length === 0) {
    return (
      <p className="text-[var(--luckin-text-secondary)] mb-3">
        {t("permission.luckyWantsBash")}
      </p>
    );
  }

  const isMultipleCommands = patterns.length > 1;

  if (isMultipleCommands) {
    // Extract command names from patterns like "Bash(ls:*)" -> "ls"
    const commandNames = patterns.map(extractCommandName);

    return (
      <>
        <p className="text-[var(--luckin-text-secondary)] mb-2">
          {t("permission.luckyWantsCommands")}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {commandNames.map((cmd, index) => (
            <span
              key={index}
              className="font-mono bg-[var(--luckin-bg)] px-2 py-1 rounded text-sm"
            >
              {cmd}
            </span>
          ))}
        </div>
      </>
    );
  } else {
    const commandName = extractCommandName(patterns[0]);
    return (
      <p className="text-[var(--luckin-text-secondary)] mb-3">
        {t("permission.luckyWantsCommand")}{" "}
        <span className="font-mono bg-[var(--luckin-bg)] px-2 py-1 rounded text-sm">
          {commandName}
        </span>{" "}
        {t("permission.commandSuffix")}
      </p>
    );
  }
}

// Helper function to render button text for permanent permission
function renderPermanentButtonText(
  patterns: string[],
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  // Handle empty patterns array
  if (patterns.length === 0) {
    return t("permission.yesDontAskBash");
  }

  const isMultipleCommands = patterns.length > 1;
  const commandNames = patterns.map(extractCommandName);

  if (isMultipleCommands) {
    return t("permission.yesDontAskMultiple", {
      commands: commandNames.join(" & "),
    });
  } else {
    return t("permission.yesDontAskSingle", { command: commandNames[0] });
  }
}

interface PermissionInputPanelProps {
  patterns: string[];
  onAllow: () => void;
  onAllowPermanent: () => void;
  onDeny: () => void;
  // Optional extension point for custom button styling (e.g., demo effects)
  getButtonClassName?: (
    buttonType: "allow" | "allowPermanent" | "deny",
    defaultClassName: string,
  ) => string;
  // Optional callback for demo automation to control selection state
  onSelectionChange?: (selection: "allow" | "allowPermanent" | "deny") => void;
  // Optional external control for demo automation (overrides internal state)
  externalSelectedOption?: "allow" | "allowPermanent" | "deny" | null;
}

export function PermissionInputPanel({
  patterns,
  onAllow,
  onAllowPermanent,
  onDeny,
  getButtonClassName = (_, defaultClassName) => defaultClassName, // Default: no modification
  onSelectionChange, // Optional callback for demo automation
  externalSelectedOption, // Optional external control for demo automation
}: PermissionInputPanelProps) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<
    "allow" | "allowPermanent" | "deny" | null
  >("allow");

  // Check if component is externally controlled (for demo mode)
  const isExternallyControlled = externalSelectedOption !== undefined;

  // Use external selection if provided (for demo), otherwise use internal state
  const effectiveSelectedOption = externalSelectedOption ?? selectedOption;

  // Update selection state based on external changes (for demo automation)
  const updateSelectedOption = useCallback(
    (option: "allow" | "allowPermanent" | "deny") => {
      // Only update internal state if not controlled externally
      if (externalSelectedOption === undefined) {
        setSelectedOption(option);
      }
      onSelectionChange?.(option);
    },
    [onSelectionChange, externalSelectedOption],
  );

  // Handle keyboard navigation
  useEffect(() => {
    // Skip keyboard navigation if controlled externally (demo mode)
    if (externalSelectedOption !== undefined) return;

    // Define options array inside useEffect to avoid unnecessary re-renders
    const options = ["allow", "allowPermanent", "deny"] as const;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = options.indexOf(effectiveSelectedOption!);
        const nextIndex = (currentIndex + 1) % options.length;
        updateSelectedOption(options[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = options.indexOf(effectiveSelectedOption!);
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        updateSelectedOption(options[prevIndex]);
      } else if (e.key === "Enter" && effectiveSelectedOption) {
        e.preventDefault();
        // Execute the currently selected option
        if (effectiveSelectedOption === "allow") {
          onAllow();
        } else if (effectiveSelectedOption === "allowPermanent") {
          onAllowPermanent();
        } else if (effectiveSelectedOption === "deny") {
          onDeny();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onDeny(); // "Deny" option when ESC is pressed
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    effectiveSelectedOption,
    onAllow,
    onAllowPermanent,
    onDeny,
    updateSelectedOption,
    externalSelectedOption,
  ]);

  return (
    <div className="flex-shrink-0 px-4 py-4 bg-[var(--luckin-surface)] border border-[var(--luckin-border)] rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[var(--luckin-warning-bg)] rounded-lg">
          <AlertTriangle className="w-5 h-5 text-[var(--luckin-warning)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--luckin-text-primary)]">
          {t("permission.title")}
        </h3>
      </div>

      {/* Content */}
      <div className="mb-4">
        {renderPermissionContent(patterns, t)}
        <p className="text-sm text-[var(--luckin-text-muted)]">
          {t("permission.proceed")}
        </p>
      </div>

      {/* Direct-click permission options with selection state */}
      <div className="space-y-2">
        <button
          onClick={() => {
            updateSelectedOption("allow");
            onAllow();
          }}
          onFocus={() => updateSelectedOption("allow")}
          onBlur={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          onMouseEnter={() => updateSelectedOption("allow")}
          onMouseLeave={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          className={getButtonClassName(
            "allow",
            `w-full p-3 rounded-lg cursor-pointer transition-all duration-200 text-left focus:outline-none ${
              effectiveSelectedOption === "allow"
                ? "bg-luckin-sky border-2 border-[var(--luckin-primary)] shadow-sm"
                : "border-2 border-transparent"
            }`,
          )}
        >
          <span
            className={`text-sm font-medium ${
              effectiveSelectedOption === "allow"
                ? "text-[var(--luckin-primary)]"
                : "text-[var(--luckin-text-secondary)]"
            }`}
          >
            {t("permission.yes")}
          </span>
        </button>

        <button
          onClick={() => {
            updateSelectedOption("allowPermanent");
            onAllowPermanent();
          }}
          onFocus={() => updateSelectedOption("allowPermanent")}
          onBlur={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          onMouseEnter={() => updateSelectedOption("allowPermanent")}
          onMouseLeave={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          className={getButtonClassName(
            "allowPermanent",
            `w-full p-3 rounded-lg cursor-pointer transition-all duration-200 text-left focus:outline-none ${
              effectiveSelectedOption === "allowPermanent"
                ? "bg-[var(--luckin-success-bg)] border-2 border-[var(--luckin-success)] shadow-sm"
                : "border-2 border-transparent"
            }`,
          )}
        >
          <span
            className={`text-sm font-medium ${
              effectiveSelectedOption === "allowPermanent"
                ? "text-[var(--luckin-success)]"
                : "text-[var(--luckin-text-secondary)]"
            }`}
          >
            {renderPermanentButtonText(patterns, t)}
          </span>
        </button>

        <button
          onClick={() => {
            updateSelectedOption("deny");
            onDeny();
          }}
          onFocus={() => updateSelectedOption("deny")}
          onBlur={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          onMouseEnter={() => updateSelectedOption("deny")}
          onMouseLeave={() => {
            if (!isExternallyControlled) {
              setSelectedOption(null);
            }
          }}
          className={getButtonClassName(
            "deny",
            `w-full p-3 rounded-lg cursor-pointer transition-all duration-200 text-left focus:outline-none ${
              effectiveSelectedOption === "deny"
                ? "bg-[var(--luckin-bg)] border-2 border-[var(--luckin-text-muted)] shadow-sm"
                : "border-2 border-transparent"
            }`,
          )}
        >
          <span
            className={`text-sm font-medium ${
              effectiveSelectedOption === "deny"
                ? "text-[var(--luckin-text-primary)]"
                : "text-[var(--luckin-text-secondary)]"
            }`}
          >
            {t("permission.no")}
          </span>
        </button>
      </div>
    </div>
  );
}

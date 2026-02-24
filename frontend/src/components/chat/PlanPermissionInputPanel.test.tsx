import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlanPermissionInputPanel } from "./PlanPermissionInputPanel";
import { LanguageProvider } from "../../i18n";

// Helper to wrap component in LanguageProvider
function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("PlanPermissionInputPanel", () => {
  const mockOnAcceptWithEdits = vi.fn();
  const mockOnAcceptDefault = vi.fn();
  const mockOnKeepPlanning = vi.fn();
  const mockOnSelectionChange = vi.fn();

  // Chinese text from zh.json (default language)
  const TEXT_ACCEPT_WITH_EDITS = "是，自动接受编辑";
  const TEXT_ACCEPT_DEFAULT = "是，手动审批编辑";
  const TEXT_KEEP_PLANNING = "否，继续规划";
  const TEXT_HELPER = "选择如何继续（按 ESC 继续规划）";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener("keydown", vi.fn());
  });

  describe("Basic Rendering", () => {
    it("should render all three permission options", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      expect(screen.getByText(TEXT_ACCEPT_WITH_EDITS)).toBeInTheDocument();
      expect(screen.getByText(TEXT_ACCEPT_DEFAULT)).toBeInTheDocument();
      expect(screen.getByText(TEXT_KEEP_PLANNING)).toBeInTheDocument();
    });

    it("should render helper text", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      expect(screen.getByText(TEXT_HELPER)).toBeInTheDocument();
    });

    it("should initially select 'acceptWithEdits' option", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      const acceptWithEditsButton = screen
        .getByText(TEXT_ACCEPT_WITH_EDITS)
        .closest("button")!;
      expect(acceptWithEditsButton).toHaveClass(
        "bg-[var(--luckin-success-bg)]",
        "border-[var(--luckin-success)]",
      );
    });
  });

  describe("Mouse Interactions", () => {
    it("should call onAcceptWithEdits when accept with edits button is clicked", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      fireEvent.click(screen.getByText(TEXT_ACCEPT_WITH_EDITS));
      expect(mockOnAcceptWithEdits).toHaveBeenCalledTimes(1);
    });

    it("should call onAcceptDefault when accept default button is clicked", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      fireEvent.click(screen.getByText(TEXT_ACCEPT_DEFAULT));
      expect(mockOnAcceptDefault).toHaveBeenCalledTimes(1);
    });

    it("should call onKeepPlanning when keep planning button is clicked", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      fireEvent.click(screen.getByText(TEXT_KEEP_PLANNING));
      expect(mockOnKeepPlanning).toHaveBeenCalledTimes(1);
    });

    it("should update selection on mouse enter", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;
      fireEvent.mouseEnter(acceptDefaultButton);

      expect(mockOnSelectionChange).toHaveBeenCalledWith("acceptDefault");
      expect(acceptDefaultButton).toHaveClass(
        "bg-luckin-sky",
        "border-[var(--luckin-primary)]",
      );
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      // Initially acceptWithEdits is selected
      fireEvent.keyDown(document, { key: "ArrowDown" });

      expect(mockOnSelectionChange).toHaveBeenCalledWith("acceptDefault");
    });

    it("should navigate up with ArrowUp key", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      // Initially acceptWithEdits is selected, going up should go to keepPlanning (wrapping)
      fireEvent.keyDown(document, { key: "ArrowUp" });

      expect(mockOnSelectionChange).toHaveBeenCalledWith("keepPlanning");
    });

    it("should cycle through options with multiple ArrowDown presses", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      fireEvent.keyDown(document, { key: "ArrowDown" }); // acceptWithEdits -> acceptDefault
      fireEvent.keyDown(document, { key: "ArrowDown" }); // acceptDefault -> keepPlanning
      fireEvent.keyDown(document, { key: "ArrowDown" }); // keepPlanning -> acceptWithEdits (wrapping)

      expect(mockOnSelectionChange).toHaveBeenCalledTimes(3);
      expect(mockOnSelectionChange).toHaveBeenNthCalledWith(1, "acceptDefault");
      expect(mockOnSelectionChange).toHaveBeenNthCalledWith(2, "keepPlanning");
      expect(mockOnSelectionChange).toHaveBeenNthCalledWith(
        3,
        "acceptWithEdits",
      );
    });

    it("should execute selected option with Enter key", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      // Initially acceptWithEdits is selected
      fireEvent.keyDown(document, { key: "Enter" });
      expect(mockOnAcceptWithEdits).toHaveBeenCalledTimes(1);

      // Navigate to acceptDefault and press Enter
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyDown(document, { key: "Enter" });
      expect(mockOnAcceptDefault).toHaveBeenCalledTimes(1);

      // Navigate to keepPlanning and press Enter
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyDown(document, { key: "Enter" });
      expect(mockOnKeepPlanning).toHaveBeenCalledTimes(1);
    });

    it("should call onKeepPlanning when Escape key is pressed", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnKeepPlanning).toHaveBeenCalledTimes(1);
    });
  });

  describe("External Control Mode (Demo Automation)", () => {
    it("should use external selection when provided", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          externalSelectedOption="acceptDefault"
        />,
      );

      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;
      expect(acceptDefaultButton).toHaveClass(
        "bg-luckin-sky",
        "border-[var(--luckin-primary)]",
      );
    });

    it("should not respond to keyboard navigation when externally controlled", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          externalSelectedOption="acceptDefault"
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      // Keyboard navigation should be disabled
      fireEvent.keyDown(document, { key: "ArrowDown" });

      // onSelectionChange should not be called for keyboard events in external mode
      expect(mockOnSelectionChange).not.toHaveBeenCalled();

      // Selection should remain on acceptDefault
      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;
      expect(acceptDefaultButton).toHaveClass(
        "bg-luckin-sky",
        "border-[var(--luckin-primary)]",
      );
    });

    it("should not reset selection on mouse leave when externally controlled", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          externalSelectedOption="acceptDefault"
        />,
      );

      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;

      fireEvent.mouseLeave(acceptDefaultButton);

      // Selection should remain unchanged in external control mode
      expect(acceptDefaultButton).toHaveClass(
        "bg-luckin-sky",
        "border-[var(--luckin-primary)]",
      );
    });

    it("should handle external selection change", () => {
      const { rerender } = render(
        <LanguageProvider>
          <PlanPermissionInputPanel
            onAcceptWithEdits={mockOnAcceptWithEdits}
            onAcceptDefault={mockOnAcceptDefault}
            onKeepPlanning={mockOnKeepPlanning}
            externalSelectedOption="acceptDefault"
          />
        </LanguageProvider>,
      );

      // Change external selection
      rerender(
        <LanguageProvider>
          <PlanPermissionInputPanel
            onAcceptWithEdits={mockOnAcceptWithEdits}
            onAcceptDefault={mockOnAcceptDefault}
            onKeepPlanning={mockOnKeepPlanning}
            externalSelectedOption="keepPlanning"
          />
        </LanguageProvider>,
      );

      const keepPlanningButton = screen
        .getByText(TEXT_KEEP_PLANNING)
        .closest("button")!;
      expect(keepPlanningButton).toHaveClass(
        "bg-[var(--luckin-bg)]",
        "border-[var(--luckin-text-muted)]",
      );
    });
  });

  describe("Custom Button Styling", () => {
    it("should apply custom button class names", () => {
      const mockGetButtonClassName = vi.fn(
        (buttonType, defaultClassName) =>
          `${defaultClassName} custom-${buttonType}`,
      );

      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          getButtonClassName={mockGetButtonClassName}
        />,
      );

      expect(mockGetButtonClassName).toHaveBeenCalledWith(
        "acceptWithEdits",
        expect.any(String),
      );
      expect(mockGetButtonClassName).toHaveBeenCalledWith(
        "acceptDefault",
        expect.any(String),
      );
      expect(mockGetButtonClassName).toHaveBeenCalledWith(
        "keepPlanning",
        expect.any(String),
      );

      const acceptWithEditsButton = screen
        .getByText(TEXT_ACCEPT_WITH_EDITS)
        .closest("button")!;
      expect(acceptWithEditsButton).toHaveClass("custom-acceptWithEdits");
    });
  });

  describe("Focus Management", () => {
    it("should update selection on focus", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
          onSelectionChange={mockOnSelectionChange}
        />,
      );

      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;
      fireEvent.focus(acceptDefaultButton);

      expect(mockOnSelectionChange).toHaveBeenCalledWith("acceptDefault");
    });

    it("should clear selection on blur when not externally controlled", () => {
      renderWithProviders(
        <PlanPermissionInputPanel
          onAcceptWithEdits={mockOnAcceptWithEdits}
          onAcceptDefault={mockOnAcceptDefault}
          onKeepPlanning={mockOnKeepPlanning}
        />,
      );

      const acceptDefaultButton = screen
        .getByText(TEXT_ACCEPT_DEFAULT)
        .closest("button")!;

      fireEvent.focus(acceptDefaultButton);
      fireEvent.blur(acceptDefaultButton);

      // After blur, no button should have selected styling
      expect(acceptDefaultButton).not.toHaveClass(
        "bg-luckin-sky",
        "border-[var(--luckin-primary)]",
      );
    });
  });
});

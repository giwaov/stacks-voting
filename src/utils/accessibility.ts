/**
 * Accessibility utilities for the Stacks Voting application
 * Provides helpers for ARIA labels, keyboard navigation, and screen reader support
 */

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Keyboard event handler for button-like elements
 * Allows activation via Enter or Space key
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

/**
 * Focus trap utilities for modal dialogs
 */
export function createFocusTrap(containerRef: HTMLElement | null): {
  activate: () => void;
  deactivate: () => void;
} {
  let previousActiveElement: Element | null = null;

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef) return [];
    return Array.from(
      containerRef.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  };

  const activate = () => {
    previousActiveElement = document.activeElement;
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    containerRef?.addEventListener("keydown", handleKeyDown);
  };

  const deactivate = () => {
    containerRef?.removeEventListener("keydown", handleKeyDown);
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return { activate, deactivate };
}

/**
 * Screen reader announcement utility
 * Creates a live region for dynamic content updates
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * ARIA attributes for poll options
 */
export function getPollOptionAriaProps(
  optionLabel: string,
  voteCount: number,
  percentage: number,
  isSelected: boolean
): Record<string, string | boolean> {
  return {
    role: "radio",
    "aria-checked": isSelected,
    "aria-label": `${optionLabel}: ${voteCount} votes, ${percentage.toFixed(1)} percent`,
  };
}

/**
 * Skip navigation link styles (visually hidden but focusable)
 */
export const skipLinkStyles = `
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  
  &:focus {
    position: fixed;
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    padding: 1rem;
    background: #1a1a2e;
    color: white;
    z-index: 9999;
    outline: 2px solid #9333ea;
  }
`;

/**
 * Color contrast checker (WCAG AA compliance)
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!rgb) return 0;
    
    const [r, g, b] = [
      parseInt(rgb[1], 16) / 255,
      parseInt(rgb[2], 16) / 255,
      parseInt(rgb[3], 16) / 255,
    ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

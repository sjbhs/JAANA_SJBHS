import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export function handleRovingTabKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
  const tablist = event.currentTarget.closest('[role="tablist"]');

  if (!tablist) {
    return;
  }

  const tabs = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
    (tab) => !tab.hasAttribute("disabled") && tab.getAttribute("aria-disabled") !== "true"
  );
  const currentIndex = tabs.indexOf(event.currentTarget);

  if (currentIndex === -1) {
    return;
  }

  const activateTab = (nextIndex: number) => {
    const nextTab = tabs[nextIndex];

    if (!nextTab) {
      return;
    }

    event.preventDefault();
    nextTab.focus();
    nextTab.click();
  };

  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      activateTab((currentIndex + 1) % tabs.length);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      activateTab((currentIndex - 1 + tabs.length) % tabs.length);
      break;
    case "Home":
      activateTab(0);
      break;
    case "End":
      activateTab(tabs.length - 1);
      break;
    default:
      break;
  }
}

import type { KeyboardEvent } from "react";

/** Keyboard activation for clickable table rows. */
export function rowActivateProps(onActivate: () => void) {
  return {
    tabIndex: 0,
    role: "button" as const,
    onClick: onActivate,
    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    },
  };
}

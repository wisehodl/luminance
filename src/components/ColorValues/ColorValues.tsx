import { useRef } from "react";
import type { KeyboardEvent } from "react";

import * as colorlib from "colorlib";

import type { ColorActions } from "@/hooks/color";

import styles from "./ColorValues.module.css";
import SpaceEditor from "./SpaceEditor";
import { HexEditor } from "./ValueEditor";

function ColorValues({
  color,
  actions,
}: {
  color: colorlib.Color;
  actions: ColorActions;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Cycle through inputs on Enter / Shift+Enter
    if (e.key === "Enter") {
      e.preventDefault();

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const inputs = Array.from(wrapper.querySelectorAll("input"));
      const currentIndex = inputs.indexOf(e.target as HTMLInputElement);

      if (currentIndex === -1) return;

      if (e.shiftKey) {
        // Go to previous input
        const prevIndex = (currentIndex - 1 + inputs.length) % inputs.length;
        inputs[prevIndex]?.focus();
      } else {
        // Go to next input
        const nextIndex = (currentIndex + 1) % inputs.length;
        inputs[nextIndex]?.focus();
      }
    }
  };

  return (
    <div className={styles.colorValuesWrapper} ref={wrapperRef}>
      <SpaceEditor
        space="HCL"
        color={color.hcl}
        actions={actions.hcl}
        onKeyDown={handleKeyDown}
      />
      <SpaceEditor
        space="HSV"
        color={color.hsv}
        actions={actions.hsv}
        onKeyDown={handleKeyDown}
      />
      <SpaceEditor
        space="RGB"
        color={color.rgb}
        actions={actions.rgb}
        onKeyDown={handleKeyDown}
      />
      <HexEditor
        color={color.hex}
        actions={actions.hex}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default ColorValues;

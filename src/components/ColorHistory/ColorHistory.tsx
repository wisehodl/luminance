import { useEffect, useState } from "react";

import { Color } from "colorlib";
import { motion } from "motion/react";

import type { Timeout } from "@/types";
import { formatCssRgb } from "@/util";

import styles from "./ColorHistory.module.css";

function ColorHistory({
  color,
  setColor,
  disabled,
}: {
  color: Color;
  setColor: (newColor: Color) => void;
  disabled: boolean;
}) {
  const [history, setHistory] = useState<Color[]>([]);
  const maxItems = 50;

  useEffect(() => {
    if (disabled) return;

    const timer: Timeout = setTimeout(() => {
      setHistory((prev) => {
        if (prev.length > 0 && prev[0].hex.to_code() === color.hex.to_code())
          return prev;

        const newHistory = [color, ...prev];
        return newHistory.slice(0, maxItems);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [color, disabled]);

  const handleClick = (historyColor: Color) => {
    setColor(historyColor);
  };

  // Manage motion props for testing
  const isTestEnvironment =
    typeof window !== "undefined" && window.framerMotionTestOverride === true;

  const getAnimationProps = (isFirst: boolean) => {
    return isTestEnvironment
      ? {
          initial: false,
          animate: {},
          exit: {},
          ease: null,
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: isFirst ? 0 : 1, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0 },
          ease: "easeInOut",
          transition: { duration: 0.3 },
        };
  };
  return (
    <div data-cy="color-history" className={styles.colorHistory}>
      {history.map((historyColor, index) => (
        <motion.div
          key={`${historyColor.hex.to_code()}-${index}`}
          data-cy={`history-color-${index}`}
          className={styles.historyColor}
          style={{ backgroundColor: formatCssRgb(historyColor.hex) }}
          onClick={() => handleClick(historyColor)}
          {...getAnimationProps(index === 0)}
        ></motion.div>
      ))}
    </div>
  );
}

export default ColorHistory;

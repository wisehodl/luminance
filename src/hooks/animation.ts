import { useCallback, useRef } from "react";

export function useSmoothAnimation() {
  const animationRef = useRef<number | null>(null);

  const smoothAnimation = useCallback((callback: () => void) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(callback);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return smoothAnimation;
}

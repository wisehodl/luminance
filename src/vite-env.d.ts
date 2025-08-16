/// <reference types="vite/client" />

interface Window {
  framerMotionTestOverride?: boolean;
  originalRequestAnimationFrame?: typeof requestAnimationFrame;
}

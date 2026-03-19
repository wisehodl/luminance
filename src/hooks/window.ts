export function onResize(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

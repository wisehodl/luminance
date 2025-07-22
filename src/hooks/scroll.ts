export function handleScroll(
  prevLength: number,
  scrollDelta: number,
  handleIncrement: () => void,
  handleDecrement: () => void,
) {
  const newLength = prevLength + scrollDelta;

  if (Math.abs(newLength) > 50) {
    if (newLength > 0) {
      handleIncrement();
    } else if (newLength < 0) {
      handleDecrement();
    }

    return 0;
  }

  return newLength;
}

export function minmax(number: number, min: number, max: number) {
  return Math.min(max, Math.max(min, number));
}

export function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event;
}

export function isLeftMouseButton(buttonsValue: number) {
  return buttonsValue === 1;
}

export function extractEventCoordinates(event: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if (isTouchEvent(event)) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  }
  return {
    clientX: event.clientX,
    clientY: event.clientY,
  };
}

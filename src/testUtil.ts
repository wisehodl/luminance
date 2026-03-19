import { Color, HCL, HSV, Hex, RGB } from "colorlib";
import { expect } from "vitest";

export const mockUseReducer = <T extends object, U>(
  reducer: (state: T, action: U) => T,
  initialArg: T,
): [T, (value: U) => void] => {
  let currentState = initialArg;

  const state = new Proxy({} as T, {
    get: (_, prop) => currentState[prop as keyof T],
  });

  const dispatch = (value: U) => {
    const nextState = reducer(currentState, value);
    currentState = nextState;
  };
  return [state, dispatch];
};

export const expectEqualColor = <T extends { equals(other: T): boolean }>(
  value: T,
  expected: T,
) => {
  if (!value.equals(expected)) {
    if (value instanceof Color && expected instanceof Color) {
      expect(value.hex.to_code()).toBe(expected.hex.to_code());
    } else if (value instanceof HCL && expected instanceof HCL) {
      expect(value.h).toBe(expected.h);
      expect(value.c).toBe(expected.c);
      expect(value.l).toBe(expected.l);
    } else if (value instanceof HSV && expected instanceof HSV) {
      expect(value.h).toBe(expected.h);
      expect(value.s).toBe(expected.s);
      expect(value.v).toBe(expected.v);
    } else if (
      (value instanceof RGB && expected instanceof RGB) ||
      (value instanceof Hex && expected instanceof Hex)
    ) {
      expect(value.r).toBe(expected.r);
      expect(value.g).toBe(expected.g);
      expect(value.b).toBe(expected.b);
    }
  }
  expect(value.equals(expected)).toBe(true);
};

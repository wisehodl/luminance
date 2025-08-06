import * as colorlib from "colorlib";
import { beforeEach, describe, expect, test } from "vitest";

import { colorReducer, createColorActions } from "../color";
import type { ColorAction, ColorActions, ColorState } from "../color";

const mockUseReducer = <T extends object, U>(
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

const expectRGB = (value: colorlib.RGB, expected: colorlib.RGB) => {
  expect(value.r).toBe(expected.r);
  expect(value.g).toBe(expected.g);
  expect(value.b).toBe(expected.b);
};

const expectHSV = (value: colorlib.HSV, expected: colorlib.HSV) => {
  expect(value.h).toBe(expected.h);
  expect(value.s).toBe(expected.s);
  expect(value.v).toBe(expected.v);
};

const expectHCL = (value: colorlib.HCL, expected: colorlib.HCL) => {
  expect(value.h).toBe(expected.h);
  expect(value.c).toBe(expected.c);
  expect(value.l).toBe(expected.l);
};

describe("color reducer", () => {
  const initialState = { color: colorlib.Color.from_hex("000") };

  describe("set by color", () => {
    test("set color", () => {
      const nextColor = colorlib.Color.from_hex("F00");
      const nextState = colorReducer(initialState, {
        type: "SET_COLOR",
        payload: nextColor,
      });
      expect(nextState.color.hex.to_code()).toBe(nextColor.hex.to_code());
    });
  });

  describe("set by color space", () => {
    test("set rgb", () => {
      const nextColor = colorlib.RGB.new(1, 2, 3);
      const nextState = colorReducer(initialState, {
        type: "SET_RGB",
        payload: nextColor,
      });

      expectRGB(nextState.color.rgb, nextColor);
    });

    test("set hsv", () => {
      const nextColor = colorlib.HSV.new(1, 2, 3);
      const nextState = colorReducer(initialState, {
        type: "SET_HSV",
        payload: nextColor,
      });

      expectHSV(nextState.color.hsv, nextColor);
    });

    test("set hcl", () => {
      const nextColor = colorlib.HCL.new(1, 2, 3);
      const nextState = colorReducer(initialState, {
        type: "SET_HCL",
        payload: nextColor,
      });

      expectHCL(nextState.color.hcl, nextColor);
    });

    test("set hex", () => {
      const nextColor = colorlib.Hex.new(1, 2, 3);
      const nextState = colorReducer(initialState, {
        type: "SET_HEX",
        payload: nextColor,
      });

      expect(nextState.color.hex.to_code()).toBe(nextColor.to_code());
    });
  });

  describe("set by component", () => {
    describe("rgb", () => {
      test("set rgb r", () => {
        const nextColor = colorlib.RGB.new(100, 0, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_R,
          payload: nextColor.r,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });

      test("set rgb g", () => {
        const nextColor = colorlib.RGB.new(0, 100, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_G,
          payload: nextColor.g,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });

      test("set rgb b", () => {
        const nextColor = colorlib.RGB.new(0, 0, 100);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_B,
          payload: nextColor.b,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });
    });

    describe("hsv", () => {
      test("set hsv h", () => {
        const nextColor = colorlib.HSV.new(100, 0, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_H,
          payload: nextColor.h,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });

      test("set hsv s", () => {
        const nextColor = colorlib.HSV.new(0, 0.5, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_S,
          payload: nextColor.s,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });

      test("set hsv v", () => {
        const nextColor = colorlib.HSV.new(0, 0, 0.5);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_V,
          payload: nextColor.v,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });
    });

    describe("hcl", () => {
      test("set hcl h", () => {
        const nextColor = colorlib.HCL.new(100, 0, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_H,
          payload: nextColor.h,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });

      test("set hcl c", () => {
        const nextColor = colorlib.HCL.new(0, 0.5, 0);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_C,
          payload: nextColor.c,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });

      test("set hcl l", () => {
        const nextColor = colorlib.HCL.new(0, 0, 0.5);
        const nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_L,
          payload: nextColor.l,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });
    });
  });

  describe("adjust by component", () => {
    describe("rgb", () => {
      test("adjust rgb r", () => {
        let nextColor = colorlib.RGB.new(100, 0, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_R,
          payload: (prev) => prev + 100,
        });
        expectRGB(nextState.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(50, 0, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_R,
          payload: (prev) => prev - 50,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });

      test("adjust rgb g", () => {
        let nextColor = colorlib.RGB.new(0, 100, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_G,
          payload: (prev) => prev + 100,
        });
        expectRGB(nextState.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(0, 50, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_G,
          payload: (prev) => prev - 50,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });

      test("adjust rgb b", () => {
        let nextColor = colorlib.RGB.new(0, 0, 100);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_B,
          payload: (prev) => prev + 100,
        });
        expectRGB(nextState.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(0, 0, 50);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.RGB_B,
          payload: (prev) => prev - 50,
        });
        expectRGB(nextState.color.rgb, nextColor);
      });
    });

    describe("hsv", () => {
      test("adjust hsv h", () => {
        let nextColor = colorlib.HSV.new(100, 0, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_H,
          payload: (prev) => prev + 100,
        });
        expectHSV(nextState.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(50, 0, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_H,
          payload: (prev) => prev - 50,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });

      test("adjust hsv s", () => {
        let nextColor = colorlib.HSV.new(0, 1, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_S,
          payload: (prev) => prev + 1,
        });
        expectHSV(nextState.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(0, 0.5, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_S,
          payload: (prev) => prev - 0.5,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });

      test("adjust hsv v", () => {
        let nextColor = colorlib.HSV.new(0, 0, 1);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_V,
          payload: (prev) => prev + 1,
        });
        expectHSV(nextState.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(0, 0, 0.5);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HSV_V,
          payload: (prev) => prev - 0.5,
        });
        expectHSV(nextState.color.hsv, nextColor);
      });
    });

    describe("hcl", () => {
      test("adjust hcl h", () => {
        let nextColor = colorlib.HCL.new(100, 0, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_H,
          payload: (prev) => prev + 100,
        });
        expectHCL(nextState.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(50, 0, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_H,
          payload: (prev) => prev - 50,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });

      test("adjust hcl c", () => {
        let nextColor = colorlib.HCL.new(0, 1, 0);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_C,
          payload: (prev) => prev + 1,
        });
        expectHCL(nextState.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(0, 0.5, 0);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_C,
          payload: (prev) => prev - 0.5,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });

      test("adjust hcl l", () => {
        let nextColor = colorlib.HCL.new(0, 0, 1);
        let nextState = colorReducer(initialState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_L,
          payload: (prev) => prev + 1,
        });
        expectHCL(nextState.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(0, 0, 0.5);
        nextState = colorReducer(nextState, {
          type: "SET_VALUE",
          component: colorlib.Component.HCL_L,
          payload: (prev) => prev - 0.5,
        });
        expectHCL(nextState.color.hcl, nextColor);
      });
    });
  });
});

describe("color actions", () => {
  const initialState = { color: colorlib.Color.from_hex("000") };

  let state: ColorState;
  let dispatch: (value: ColorAction) => void;
  let actions: ColorActions;

  beforeEach(() => {
    [state, dispatch] = mockUseReducer(colorReducer, initialState);
    actions = createColorActions(dispatch);
  });

  describe("set by color", () => {
    test("set color", () => {
      const nextColor = colorlib.Color.from_hex("FF0000");
      actions.common.setColor(nextColor);
      expect(state.color.hex.to_code()).toBe(nextColor.hex.to_code());
    });
  });

  describe("set by color space", () => {
    test("set rgb", () => {
      const nextColor = colorlib.RGB.new(1, 2, 3);
      actions.rgb.setRGB(nextColor);
      expectRGB(state.color.rgb, nextColor);
    });

    test("set hsv", () => {
      const nextColor = colorlib.HSV.new(1, 2, 3);
      actions.hsv.setHSV(nextColor);
      expectHSV(state.color.hsv, nextColor);
    });

    test("set hcl", () => {
      const nextColor = colorlib.HCL.new(1, 2, 3);
      actions.hcl.setHCL(nextColor);
      expectHCL(state.color.hcl, nextColor);
    });

    test("set hex", () => {
      const nextColor = colorlib.Hex.from_code("FF0000");
      actions.hex.setHex(nextColor);
      expect(state.color.hex.to_code()).toBe(nextColor.to_code());
    });
  });

  describe("set by component", () => {
    describe("rgb", () => {
      test("set rgb r", () => {
        const nextColor = colorlib.RGB.new(100, 0, 0);
        actions.rgb.setR(nextColor.r);
        expectRGB(state.color.rgb, nextColor);
      });

      test("set rgb g", () => {
        const nextColor = colorlib.RGB.new(0, 100, 0);
        actions.rgb.setG(nextColor.g);
        expectRGB(state.color.rgb, nextColor);
      });

      test("set rgb b", () => {
        const nextColor = colorlib.RGB.new(0, 0, 100);
        actions.rgb.setB(nextColor.b);
        expectRGB(state.color.rgb, nextColor);
      });
    });

    describe("hsv", () => {
      test("set hsv h", () => {
        const nextColor = colorlib.HSV.new(100, 0, 0);
        actions.hsv.setH(nextColor.h);
        expectHSV(state.color.hsv, nextColor);
      });

      test("set hsv s", () => {
        const nextColor = colorlib.HSV.new(0, 0.5, 0);
        actions.hsv.setS(nextColor.s);
        expectHSV(state.color.hsv, nextColor);
      });

      test("set hsv v", () => {
        const nextColor = colorlib.HSV.new(0, 0, 0.5);
        actions.hsv.setV(nextColor.v);
        expectHSV(state.color.hsv, nextColor);
      });
    });

    describe("hcl", () => {
      test("set hcl h", () => {
        const nextColor = colorlib.HCL.new(100, 0, 0);
        actions.hcl.setH(nextColor.h);
        expectHCL(state.color.hcl, nextColor);
      });

      test("set hcl c", () => {
        const nextColor = colorlib.HCL.new(0, 0.5, 0);
        actions.hcl.setC(nextColor.c);
        expectHCL(state.color.hcl, nextColor);
      });

      test("set hcl l", () => {
        const nextColor = colorlib.HCL.new(0, 0, 0.5);
        actions.hcl.setL(nextColor.l);
        expectHCL(state.color.hcl, nextColor);
      });
    });
  });

  describe("adjust by component", () => {
    describe("rgb", () => {
      test("adjust rgb r", () => {
        let nextColor = colorlib.RGB.new(100, 0, 0);
        actions.rgb.setR((prev) => prev + 100);
        expectRGB(state.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(50, 0, 0);
        actions.rgb.setR((prev) => prev - 50);
        expectRGB(state.color.rgb, nextColor);
      });

      test("adjust rgb g", () => {
        let nextColor = colorlib.RGB.new(0, 100, 0);
        actions.rgb.setG((prev) => prev + 100);
        expectRGB(state.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(0, 50, 0);
        actions.rgb.setG((prev) => prev - 50);
        expectRGB(state.color.rgb, nextColor);
      });

      test("adjust rgb b", () => {
        let nextColor = colorlib.RGB.new(0, 0, 100);
        actions.rgb.setB((prev) => prev + 100);
        expectRGB(state.color.rgb, nextColor);

        nextColor = colorlib.RGB.new(0, 0, 50);
        actions.rgb.setB((prev) => prev - 50);
        expectRGB(state.color.rgb, nextColor);
      });
    });

    describe("hsv", () => {
      test("adjust hsv h", () => {
        let nextColor = colorlib.HSV.new(100, 0, 0);
        actions.hsv.setH((prev) => prev + 100);
        expectHSV(state.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(50, 0, 0);
        actions.hsv.setH((prev) => prev - 50);
        expectHSV(state.color.hsv, nextColor);
      });

      test("adjust hsv s", () => {
        let nextColor = colorlib.HSV.new(0, 1, 0);
        actions.hsv.setS((prev) => prev + 1);
        expectHSV(state.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(0, 0.5, 0);
        actions.hsv.setS((prev) => prev - 0.5);
        expectHSV(state.color.hsv, nextColor);
      });

      test("adjust hsv v", () => {
        let nextColor = colorlib.HSV.new(0, 0, 1);
        actions.hsv.setV((prev) => prev + 1);
        expectHSV(state.color.hsv, nextColor);

        nextColor = colorlib.HSV.new(0, 0, 0.5);
        actions.hsv.setV((prev) => prev - 0.5);
        expectHSV(state.color.hsv, nextColor);
      });
    });

    describe("hcl", () => {
      test("adjust hcl h", () => {
        let nextColor = colorlib.HCL.new(100, 0, 0);
        actions.hcl.setH((prev) => prev + 100);
        expectHCL(state.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(50, 0, 0);
        actions.hcl.setH((prev) => prev - 50);
        expectHCL(state.color.hcl, nextColor);
      });

      test("adjust hcl c", () => {
        let nextColor = colorlib.HCL.new(0, 1, 0);
        actions.hcl.setC((prev) => prev + 1);
        expectHCL(state.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(0, 0.5, 0);
        actions.hcl.setC((prev) => prev - 0.5);
        expectHCL(state.color.hcl, nextColor);
      });

      test("adjust hcl l", () => {
        let nextColor = colorlib.HCL.new(0, 0, 1);
        actions.hcl.setL((prev) => prev + 1);
        expectHCL(state.color.hcl, nextColor);

        nextColor = colorlib.HCL.new(0, 0, 0.5);
        actions.hcl.setL((prev) => prev - 0.5);
        expectHCL(state.color.hcl, nextColor);
      });
    });
  });
});

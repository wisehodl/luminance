import type { Dispatch } from "react";

import * as colorlib from "colorlib";

import type { SetterValueOrCallback } from "@/types";

export interface ColorState {
  color: colorlib.Color;
}

export type ColorAction =
  | { type: "SET_COLOR"; payload: colorlib.Color }
  | { type: "SET_RGB"; payload: colorlib.RGB }
  | { type: "SET_HSV"; payload: colorlib.HSV }
  | { type: "SET_HCL"; payload: colorlib.HCL }
  | { type: "SET_HEX"; payload: colorlib.Hex }
  | {
      type: "SET_VALUE";
      component: colorlib.Component;
      payload: SetterValueOrCallback<number>;
    };

export function colorReducer(
  state: ColorState,
  action: ColorAction,
): ColorState {
  let comp;

  switch (action.type) {
    case "SET_COLOR":
      return { ...state, color: action.payload };

    case "SET_RGB":
      let rgb = action.payload;
      return { ...state, color: colorlib.Color.from_rgb(rgb.r, rgb.g, rgb.b) };

    case "SET_HSV":
      let hsv = action.payload;
      return { ...state, color: colorlib.Color.from_hsv(hsv.h, hsv.s, hsv.v) };

    case "SET_HCL":
      let hcl = action.payload;
      return { ...state, color: colorlib.Color.from_hcl(hcl.h, hcl.c, hcl.l) };

    case "SET_HEX":
      let hex = action.payload;
      return { ...state, color: colorlib.Color.from_hex(hex.to_code()) };

    case "SET_VALUE":
      comp = action.component;
      let valOrFn = action.payload;

      if (typeof valOrFn === "function") {
        let prev = state.color.get(comp);
        return { ...state, color: state.color.update(comp, valOrFn(prev)) };
      } else {
        return { ...state, color: state.color.update(comp, valOrFn) };
      }

    default:
      return state;
  }
}

export type Setter = (valOrCallback: SetterValueOrCallback<number>) => void;

export interface CommonColorActions {
  setColor: (color: colorlib.Color) => void;
}

export interface RGBColorActions {
  setRGB: (rgb: colorlib.RGB) => void;
  setR: Setter;
  setG: Setter;
  setB: Setter;
}

export interface HSVColorActions {
  setHSV: (hsv: colorlib.HSV) => void;
  setH: Setter;
  setS: Setter;
  setV: Setter;
}

export interface HCLColorActions {
  setHCL: (hcl: colorlib.HCL) => void;
  setH: Setter;
  setC: Setter;
  setL: Setter;
}

export interface HexColorActions {
  setHex: (hex: colorlib.Hex) => void;
}

export interface ColorActions {
  common: CommonColorActions;
  rgb: RGBColorActions;
  hsv: HSVColorActions;
  hcl: HCLColorActions;
  hex: HexColorActions;
}

export function createColorActions(
  dispatch: Dispatch<ColorAction>,
): ColorActions {
  const Comp = colorlib.Component;
  const setValue = (
    comp: colorlib.Component,
    payload: SetterValueOrCallback<number>,
  ) => dispatch({ type: "SET_VALUE", component: comp, payload });

  return {
    common: {
      setColor: (payload) => dispatch({ type: "SET_COLOR", payload }),
    },

    rgb: {
      setRGB: (rgb) => dispatch({ type: "SET_RGB", payload: rgb }),
      setR: (val) => setValue(Comp.RGB_R, val),
      setG: (val) => setValue(Comp.RGB_G, val),
      setB: (val) => setValue(Comp.RGB_B, val),
    },

    hsv: {
      setHSV: (hsv) => dispatch({ type: "SET_HSV", payload: hsv }),
      setH: (val) => setValue(Comp.HSV_H, val),
      setS: (val) => setValue(Comp.HSV_S, val),
      setV: (val) => setValue(Comp.HSV_V, val),
    },

    hcl: {
      setHCL: (hcl) => dispatch({ type: "SET_HCL", payload: hcl }),
      setH: (val) => setValue(Comp.HCL_H, val),
      setC: (val) => setValue(Comp.HCL_C, val),
      setL: (val) => setValue(Comp.HCL_L, val),
    },

    hex: {
      setHex: (hex) => dispatch({ type: "SET_HEX", payload: hex }),
    },
  };
}

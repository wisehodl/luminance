import * as colorlib from "colorlib";

import type {
  HCLColorActions,
  HSVColorActions,
  RGBColorActions,
} from "@hooks/color";

import styles from "./SpaceEditor.module.css";
import ValueEditor from "./ValueEditor";

type SpaceEditorProps =
  | { space: "RGB"; color: colorlib.RGB; actions: RGBColorActions }
  | { space: "HSV"; color: colorlib.HSV; actions: HSVColorActions }
  | { space: "HCL"; color: colorlib.HCL; actions: HCLColorActions };

function SpaceEditor({ space, color, actions }: SpaceEditorProps) {
  switch (space) {
    case "RGB":
      return <RGBSpaceEditor color={color} actions={actions} />;

    case "HSV":
      return <HSVSpaceEditor color={color} actions={actions} />;

    case "HCL":
      return <HCLSpaceEditor color={color} actions={actions} />;

    default:
      return <></>;
  }
}

const COLOR_SPACES = {
  RGB: {
    symbols: { r: "R", g: "G", b: "B" },
    ranges: {
      r: { min: 0, max: 255 },
      g: { min: 0, max: 255 },
      b: { min: 0, max: 255 },
    },
  },
  HSV: {
    symbols: { h: "H", s: "S", v: "V" },
    ranges: {
      h: { min: 0, max: 359 },
      s: { min: 0, max: 1 },
      v: { min: 0, max: 1 },
    },
    scales: {
      s: 100,
      v: 100,
    },
  },
  HCL: {
    symbols: { h: "H", c: "C", l: "L" },
    ranges: {
      h: { min: 0, max: 359 },
      c: { min: 0, max: 1 },
      l: { min: 0, max: 1 },
    },
    scales: {
      c: 100,
      l: 100,
    },
  },
};

function RGBSpaceEditor({
  color,
  actions,
}: {
  color: colorlib.RGB;
  actions: RGBColorActions;
}) {
  return (
    <div data-cy="RGB-editor" className={styles.spaceWrapper}>
      <ValueEditor
        componentSymbol={COLOR_SPACES.RGB.symbols.r}
        valueRange={COLOR_SPACES.RGB.ranges.r}
        value={color.r}
        setValue={actions.setR}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.RGB.symbols.g}
        valueRange={COLOR_SPACES.RGB.ranges.g}
        value={color.g}
        setValue={actions.setG}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.RGB.symbols.b}
        valueRange={COLOR_SPACES.RGB.ranges.b}
        value={color.b}
        setValue={actions.setB}
      />
    </div>
  );
}

function HSVSpaceEditor({
  color,
  actions,
}: {
  color: colorlib.HSV;
  actions: HSVColorActions;
}) {
  return (
    <div data-cy="HSV-editor" className={styles.spaceWrapper}>
      <ValueEditor
        componentSymbol={COLOR_SPACES.HSV.symbols.h}
        valueRange={COLOR_SPACES.HSV.ranges.h}
        value={color.h}
        setValue={actions.setH}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.HSV.symbols.s}
        valueRange={COLOR_SPACES.HSV.ranges.s}
        value={color.s}
        setValue={actions.setS}
        scale={COLOR_SPACES.HSV.scales.s}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.HSV.symbols.v}
        valueRange={COLOR_SPACES.HSV.ranges.v}
        value={color.v}
        setValue={actions.setV}
        scale={COLOR_SPACES.HSV.scales.v}
      />
    </div>
  );
}

function HCLSpaceEditor({
  color,
  actions,
}: {
  color: colorlib.HCL;
  actions: HCLColorActions;
}) {
  return (
    <div data-cy="HCL-editor" className={styles.spaceWrapper}>
      <ValueEditor
        componentSymbol={COLOR_SPACES.HCL.symbols.h}
        valueRange={COLOR_SPACES.HCL.ranges.h}
        value={color.h}
        setValue={actions.setH}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.HCL.symbols.c}
        valueRange={COLOR_SPACES.HCL.ranges.c}
        value={color.c}
        setValue={actions.setC}
        scale={COLOR_SPACES.HCL.scales.c}
      />
      <ValueEditor
        componentSymbol={COLOR_SPACES.HCL.symbols.l}
        valueRange={COLOR_SPACES.HCL.ranges.l}
        value={color.l}
        setValue={actions.setL}
        scale={COLOR_SPACES.HCL.scales.l}
      />
    </div>
  );
}

export default SpaceEditor;

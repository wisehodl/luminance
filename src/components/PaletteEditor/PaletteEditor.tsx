import { Hex as HexColor } from "colorlib";

import styles from "./PaletteEditor.module.css";

function PaletteEditor({
  pickerColor,
  setPickerColor,
}: {
  pickerColor: HexColor;
  setPickerColor: (hex: HexColor) => void;
}) {
  return (
    <div className={styles.paletteEditor} data-cy="palette-editor">
      <ActionBar />
      <PaletteCard />
    </div>
  );
}

function ActionBar() {
  return <div className={styles.actionBar}>actions</div>;
}

function PaletteCard() {
  return (
    <div className={styles.cardWrapper}>
      <CardHeader />
      <PickerColor />
      <PaletteColor />
      <Palette />
    </div>
  );
}

function CardHeader() {
  return <div className={styles.cardHeader}>header</div>;
}

function PickerColor() {
  return <div className={styles.pickerColor}>picker color</div>;
}

function PaletteColor() {
  return <div className={styles.paletteColor}>palette color</div>;
}

function Palette() {
  return <div className={styles.palette}>palette</div>;
}

export default PaletteEditor;

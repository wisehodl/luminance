import { useMemo } from "react";

import { Color } from "colorlib";

import ColorHistory from "@/components/ColorHistory/ColorHistory";
import ColorPicker from "@/components/ColorPicker/ColorPicker";
import ColorValues from "@/components/ColorValues/ColorValues";
import { useSelectedColor } from "@/providers/hooks";

import styles from "./App.module.css";
import PaletteEditor from "./components/PaletteEditor/PaletteEditor";
import { deserializeCard, loadActiveCardId, loadCards } from "./hooks/storage";
import { formatCssRgb } from "./util";

function App() {
  const lum = 0.75;
  const chr = 0.8;
  const steps = 8;

  const colors = useMemo(
    () =>
      Array.from({ length: steps }, (_, index) => {
        const hue = (index * 360) / (steps - 1);
        return Color.from_hcl(hue, chr, lum);
      }),
    [],
  );

  const colorGradient = useMemo(
    () =>
      colors
        .map((color, index) => {
          const colorString = formatCssRgb(color.hex);
          const percentage = (index / (colors.length - 1)) * 100;
          return `${colorString} ${percentage}%`;
        })
        .join(", "),
    [],
  );

  return (
    <div
      className={styles.background}
      style={{
        background: `linear-gradient(180deg, ${colorGradient})`,
      }}
    >
      <div className={styles.appWrapper} role="application">
        <DesktopContent />
      </div>
    </div>
  );
}

function DesktopContent() {
  return (
    <div className={styles.mainLayout}>
      <header className={styles.appHeader}>
        <span className={styles.title}>LUMINANCE</span>
        <span className={styles.subtitle}>A color picker for humans.</span>
      </header>
      <FirstZone />
      <SecondZone />
    </div>
  );
}

function FirstZone() {
  const { selectedColor, selectedColorActions } = useSelectedColor();

  return (
    <section className={styles.firstZone} aria-label="Color tools">
      <div className={styles.colorPickerWrapper} aria-label="Color picker">
        <ColorPicker color={selectedColor} actions={selectedColorActions} />
      </div>
      <div className={styles.colorValuesWrapper} aria-label="Color values">
        <ColorValues color={selectedColor} actions={selectedColorActions} />
      </div>
    </section>
  );
}

function SecondZone() {
  const { selectedColor, selectedColorActions } = useSelectedColor();

  const initialCardState = useMemo(() => {
    const id = loadActiveCardId();
    const cards = loadCards();
    const saved = id ? cards[id] : null;
    console.log(id, cards);
    return saved
      ? { present: deserializeCard(saved), history: [], future: [] }
      : undefined;
  }, []);

  return (
    <section className={styles.secondZone} aria-label="Palette tools">
      <div className={styles.colorHistoryWrapper} aria-label="Color History">
        <ColorHistory
          color={selectedColor}
          setColor={selectedColorActions.common.setColor}
          disabled={false}
        />
      </div>
      <div className={styles.paletteEditorWrapper} aria-label="Palette editor">
        <PaletteEditor
          pickerColor={selectedColor.hex}
          setPickerColor={selectedColorActions.hex.setHex}
          initialCardState={initialCardState}
        />
      </div>
      <div
        className={styles.paletteLibraryWrapper}
        aria-label="Palette library"
      ></div>
    </section>
  );
}

export default App;

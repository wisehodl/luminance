import { useState } from "react";
import styles from "./App.module.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import ColorValues from "./components/ColorValues/ColorValues";
import clsx from "clsx";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const MenuButton = () => (
    <button className={styles.menuButton} onClick={toggleMenu}>
      ☰
    </button>
  );

  return (
    <div className={styles.appContainer}>
      <div className={styles.mobileContent}>
        <div className={styles.mobileTopNav}>
          <MenuButton />
        </div>
        <div className={styles.mobileLeftNav}></div>
        <div className={styles.mobileAlphaZone}>
          <div className={styles.tabbedContainer}>
            <div className={clsx(styles.tab, styles.colorPickerContainer)}>
              <ColorPicker />
            </div>
            <div className={clsx(styles.tab, styles.colorValuesContainer)}>
              <ColorValues />
            </div>
          </div>
        </div>
        <div className={styles.mobileBetaZone}>
          <div className={styles.paletteEditorContainer}></div>
        </div>
        <div className={styles.mobileRightNav}>
          <MenuButton />
        </div>
      </div>

      <div className={clsx(styles.mobileMenu, { [styles.open]: menuOpen })}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          ×
        </button>
        <div className={styles.paletteLibraryContainer}>Palette Library</div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.alphaZone}>
          <div className={styles.colorPickerContainer}>
            <ColorPicker />
          </div>
          <div className={styles.colorValuesContainer}>
            <ColorValues />
          </div>
        </div>
        <div className={styles.betaZone}>
          <div className={styles.paletteEditorContainer}></div>
          <div className={styles.paletteLibraryContainer}></div>
        </div>
      </div>
    </div>
  );
}

export default App;

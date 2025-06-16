import { useState } from "react";
import styles from "./App.module.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import ColorValues from "./components/ColorValues/ColorValues";
import clsx from "clsx";

function App() {
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);

  const toggleRightMenu = () => setRightMenuOpen(!rightMenuOpen);
  const toggleLeftMenu = () => setLeftMenuOpen(!leftMenuOpen);

  const RightMenuButton = () => (
    <button className={styles.rightMenuButton} onClick={toggleRightMenu}>
      ☰
    </button>
  );
  const LeftMenuButton = () => (
    <button className={styles.leftMenuButton} onClick={toggleLeftMenu}>
      ☰
    </button>
  );

  return (
    <div className={styles.appContainer}>
      <div className={styles.mobileContent}>
        <div className={styles.mobileTopNav}>
          <LeftMenuButton />
          <RightMenuButton />
        </div>
        <div className={styles.mobileLeftNav}>
          <LeftMenuButton />
        </div>
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
          <RightMenuButton />
        </div>
      </div>

      <div
        className={clsx(styles.leftMobileMenu, {
          [styles.open]: leftMenuOpen,
        })}
      >
        <div className={styles.leftMenuWrapper}>
          <div className={styles.topNav}>
            <button className={styles.closeButton} onClick={toggleLeftMenu}>
              ×
            </button>
          </div>
          <div className={styles.paletteLibraryContainer}>User Info</div>
        </div>
      </div>

      <div
        className={clsx(styles.rightMobileMenu, {
          [styles.open]: rightMenuOpen,
        })}
      >
        <div className={styles.rightMenuWrapper}>
          <div className={styles.topNav}>
            <button className={styles.closeButton} onClick={toggleRightMenu}>
              ×
            </button>
          </div>
          <div className={styles.paletteLibraryContainer}>Palette Library</div>
        </div>
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

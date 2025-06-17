import { useState } from "react";
import styles from "./App.module.css";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import ColorValues from "./components/ColorValues/ColorValues";
import { LeftMenu, RightMenu } from "./components/SideMenu";
import clsx from "clsx";

function App() {
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  const toggleRightMenu = () => setIsRightMenuOpen(!isRightMenuOpen);
  const toggleLeftMenu = () => setIsLeftMenuOpen(!isLeftMenuOpen);

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

        <LeftMenu
          isOpen={isLeftMenuOpen}
          onClose={() => setIsLeftMenuOpen(false)}
        >
          <div>User Info</div>
        </LeftMenu>

        <RightMenu
          isOpen={isRightMenuOpen}
          onClose={() => setIsRightMenuOpen(false)}
        >
          <div className={styles.paletteLibraryContainer}>Palette Library</div>
        </RightMenu>
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
